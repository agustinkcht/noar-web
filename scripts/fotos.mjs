/**
 * Prepara las fotos del catálogo para la web. Corre solo antes de `build` y de `dev`.
 *
 * Para cada foto que figura en src/data/catalogo.ts:
 *  1. La baja de Google Drive (la carpeta tiene que estar compartida con el vínculo).
 *  2. Si tiene fondo blanco: recorta el blanco sobrante y centra el producto en un
 *     cuadrado blanco, con aire alrededor. Si tiene otro fondo (fotos de ambiente),
 *     la recorta al cuadrado.
 *  3. La guarda comprimida en WebP en /public/fotos, en 480 px y 1200 px.
 *
 * Las fotos ya procesadas quedan en caché (.next/cache), así que cada build solo
 * baja las nuevas. Si una foto no se puede bajar, el sitio la muestra desde Drive.
 *
 * Opcional: FOTOS_LOCAL_DIR=/ruta lee las fotos de esa carpeta (<ID>.jpg/.png/.jpeg)
 * en vez de bajarlas.
 */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const VERSION = "v1"; // cambiar para regenerar todas las fotos
const CANVAS = 1200;
const FILL = 0.84; // cuánto del cuadrado ocupa el producto
const SIZES = [480, 1200];
const CONCURRENCY = 6;

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "fotos");
const CACHE = path.join(ROOT, ".next", "cache", "noire-fotos", VERSION);
const MANIFEST = path.join(ROOT, "src", "data", "fotos.json");
const LOCAL_DIR = process.env.FOTOS_LOCAL_DIR;

async function photoIds() {
  const src = await fs.readFile(path.join(ROOT, "src", "data", "catalogo.ts"), "utf8");
  // Los IDs de Drive de este catálogo empiezan con "1" y tienen 33 caracteres.
  return [...new Set([...src.matchAll(/"(1[A-Za-z0-9_-]{30,40})"/g)].map((m) => m[1]))];
}

async function readSource(id) {
  if (LOCAL_DIR) {
    for (const ext of ["jpg", "jpeg", "png", "webp"]) {
      const p = path.join(LOCAL_DIR, `${id}.${ext}`);
      if (existsSync(p)) return fs.readFile(p);
    }
    throw new Error("no está en FOTOS_LOCAL_DIR");
  }
  const urls = [
    `https://drive.google.com/thumbnail?id=${id}&sz=w2400`,
    `https://lh3.googleusercontent.com/d/${id}=w2400`,
  ];
  let last = "sin respuesta";
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "Mozilla/5.0 (NOIRE build)" },
        signal: AbortSignal.timeout(30000),
      });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.startsWith("image/")) return Buffer.from(await res.arrayBuffer());
      last = `HTTP ${res.status} ${type}`;
    } catch (e) {
      last = e.message;
    }
  }
  throw new Error(last);
}

/** Color de fondo: blanco si la mayoría del borde es blanco; si no, la mediana del borde. */
async function borderColor(buf) {
  const { data, info } = await sharp(buf).resize(48, 48, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const px = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (x > 1 && x < W - 2 && y > 1 && y < H - 2) continue;
      const i = (y * W + x) * C;
      px.push([data[i], data[i + 1], data[i + 2]]);
    }
  const whites = px.filter(([r, g, b]) => r > 228 && g > 228 && b > 228).length;
  if (whites / px.length >= 0.4) return { white: true, color: { r: 255, g: 255, b: 255 } };
  const med = (k) => px.map((p) => p[k]).sort((a, b) => a - b)[px.length >> 1];
  return { white: false, color: { r: med(0), g: med(1), b: med(2) } };
}

async function processPhoto(input) {
  const base = await sharp(input).rotate().flatten({ background: "#ffffff" }).png().toBuffer();
  const { white } = await borderColor(base);

  let square;
  if (white) {
    let product = base;
    try {
      const trimmed = await sharp(base).trim({ background: "#ffffff", threshold: 28 }).png().toBuffer({ resolveWithObject: true });
      if (trimmed.info.width > 40 && trimmed.info.height > 40) product = trimmed.data;
    } catch {
      /* sin bordes para recortar */
    }
    const inner = Math.round(CANVAS * FILL);
    const fitted = await sharp(product).resize(inner, inner, { fit: "inside" }).png().toBuffer({ resolveWithObject: true });
    square = await sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" } })
      .composite([
        {
          input: fitted.data,
          left: Math.round((CANVAS - fitted.info.width) / 2),
          top: Math.round((CANVAS - fitted.info.height) / 2),
        },
      ])
      .png()
      .toBuffer();
  } else {
    square = await sharp(base).resize(CANVAS, CANVAS, { fit: "cover", position: "attention" }).png().toBuffer();
  }

  return Promise.all(
    SIZES.map(async (size) => ({
      size,
      data: await sharp(square).resize(size, size).webp({ quality: size > 600 ? 80 : 76, effort: 5 }).toBuffer(),
    })),
  );
}

async function handle(id, stats) {
  const names = SIZES.map((s) => `${id}-${s}.webp`);
  if (names.every((n) => existsSync(path.join(CACHE, n)))) {
    await Promise.all(names.map((n) => fs.copyFile(path.join(CACHE, n), path.join(OUT, n))));
    stats.cache++;
    return true;
  }
  const outputs = await processPhoto(await readSource(id));
  for (const { size, data } of outputs) {
    await fs.writeFile(path.join(CACHE, `${id}-${size}.webp`), data);
    await fs.writeFile(path.join(OUT, `${id}-${size}.webp`), data);
  }
  stats.nuevas++;
  return true;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(CACHE, { recursive: true });
  const ids = await photoIds();
  const ok = [];
  const fallas = [];
  const stats = { cache: 0, nuevas: 0 };
  let next = 0;

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < ids.length) {
        const id = ids[next++];
        try {
          if (await handle(id, stats)) ok.push(id);
        } catch (e) {
          fallas.push(`${id}: ${e.message}`);
        }
      }
    }),
  );

  ok.sort();
  await fs.writeFile(MANIFEST, JSON.stringify(ok, null, 0) + "\n");
  console.log(`fotos: ${ok.length}/${ids.length} listas (${stats.nuevas} nuevas, ${stats.cache} de caché)`);
  if (fallas.length) {
    console.log(`fotos: ${fallas.length} se muestran desde Drive porque no se pudieron procesar:`);
    for (const f of fallas.slice(0, 10)) console.log(`  - ${f}`);
  }
}

main().catch(async (e) => {
  // Nunca frenar el build por las fotos: en el peor caso se ven desde Drive.
  console.log(`fotos: no se pudieron preparar (${e.message}). Se usan las de Drive.`);
  if (!existsSync(MANIFEST)) await fs.writeFile(MANIFEST, "[]\n");
});
