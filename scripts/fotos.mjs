/**
 * Prepara las fotos del catálogo para la web.
 *
 * Uso:
 *   node scripts/fotos.mjs <carpeta-originales>
 *
 * La carpeta tiene que tener cada foto original con el ID de Drive como nombre
 * (<ID>.jpg / .jpeg / .png). Cómo se encuadra cada una está en scripts/fotos-modos.json:
 *
 *  - "desm": desmontables. Mismo aire arriba en todos, el producto ocupa el ancho
 *            y sigue hasta el borde de abajo.
 *  - "yute": rollos de yute. El producto ocupa siempre la misma proporción del cuadro.
 *  - "pad":  la foto entera centrada en el cuadrado (fijos, fotos de costado, hilos).
 *
 * Genera /public/fotos/<ID>-480.webp, -800 y -1200, y src/data/fotos.json con, para
 * cada foto lista, una huella de su contenido (para el caché) y una vista previa
 * mínima que se muestra mientras carga. Las que no estén en la lista se ven desde Drive.
 */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const CANVAS = 1200;
const SIZES = [480, 800, 1200];

/** Desmontables: aire arriba y ancho máximo que ocupa el producto. */
const DESM_TOP = 0.05;
const DESM_WIDTH = 0.92;
/** Yute: proporción del cuadro que ocupa el rollo (lado mayor). */
const YUTE_FILL = 0.88;

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "fotos");
const MANIFEST = path.join(ROOT, "src", "data", "fotos.json");
const MODOS = JSON.parse(await fs.readFile(path.join(ROOT, "scripts", "fotos-modos.json"), "utf8"));

/** Caja del producto (en px de la foto original) y color de fondo. */
async function analyze(img, w, h) {
  const aw = 600;
  const ah = Math.max(1, Math.round((h / w) * aw));
  const { data } = await img.clone().resize(aw, ah, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

  const corners = [];
  for (const [cx, cy] of [[0, 0], [aw - 6, 0], [0, ah - 6], [aw - 6, ah - 6]])
    for (let y = cy; y < cy + 6; y++) for (let x = cx; x < cx + 6; x++) corners.push((y * aw + x) * 3);
  const median = (k) => corners.map((i) => data[i + k]).sort((a, b) => a - b)[corners.length >> 1];
  const bg = { r: median(0), g: median(1), b: median(2) };
  const bgLum = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
  const limit = Math.min(bgLum - 28, 215);

  const rows = new Array(ah).fill(0);
  const cols = new Array(aw).fill(0);
  for (let y = 0; y < ah; y++)
    for (let x = 0; x < aw; x++)
      if (lum((y * aw + x) * 3) < limit) {
        rows[y]++;
        cols[x]++;
      }
  const minRow = Math.max(2, aw * 0.004);
  const minCol = Math.max(2, ah * 0.004);
  const y0 = rows.findIndex((n) => n >= minRow);
  const y1 = ah - 1 - [...rows].reverse().findIndex((n) => n >= minRow);
  const x0 = cols.findIndex((n) => n >= minCol);
  const x1 = aw - 1 - [...cols].reverse().findIndex((n) => n >= minCol);
  const k = w / aw;
  return {
    bg,
    box: { x0: x0 * k, y0: y0 * k, x1: (x1 + 1) * k, y1: (y1 + 1) * k },
  };
}

/** Escala la foto, la ubica en el lienzo y recorta lo que sobresale. */
async function place(img, w, h, s, left, top, bg) {
  const rw = Math.max(1, Math.round(w * s));
  const rh = Math.max(1, Math.round(h * s));
  const resized = await img.clone().resize(rw, rh).png().toBuffer();
  const ex = { left: Math.max(0, -left), top: Math.max(0, -top) };
  ex.width = Math.min(rw - ex.left, CANVAS - Math.max(0, left));
  ex.height = Math.min(rh - ex.top, CANVAS - Math.max(0, top));
  const piece = await sharp(resized).extract(ex).png().toBuffer();
  return sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: bg } })
    .composite([{ input: piece, left: Math.max(0, left), top: Math.max(0, top) }])
    .png()
    .toBuffer();
}

async function processPhoto(file, mode) {
  const img = sharp(await fs.readFile(file)).rotate().flatten({ background: "#ffffff" });
  const { width: w0, height: h0 } = await img.clone().png().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const w = w0;
  const h = h0;
  const { bg, box } = await analyze(img, w, h);
  const bw = box.x1 - box.x0;
  const bh = box.y1 - box.y0;
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + box.y1) / 2;

  if (mode === "desm") {
    const gap = CANVAS * DESM_TOP;
    let s = (CANVAS * DESM_WIDTH) / bw;
    if (bh * s < CANVAS - gap) s = (CANVAS - gap) / bh; // producto bajo: que igual llegue abajo
    return place(img, w, h, s, Math.round(CANVAS / 2 - cx * s), Math.round(gap - box.y0 * s), bg);
  }
  if (mode === "yute") {
    const s = (CANVAS * YUTE_FILL) / Math.max(bw, bh);
    return place(img, w, h, s, Math.round(CANVAS / 2 - cx * s), Math.round(CANVAS / 2 - cy * s), bg);
  }
  // Fotos de ambiente (fondo que no es blanco): recortadas al cuadrado, sin franjas.
  if (0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b < 235) {
    return img.clone().resize(CANVAS, CANVAS, { fit: "cover", position: "attention" }).png().toBuffer();
  }
  // pad: la foto entera centrada
  const s = CANVAS / Math.max(w, h);
  return place(img, w, h, s, Math.round((CANVAS - w * s) / 2), Math.round((CANVAS - h * s) / 2), bg);
}

async function main() {
  const srcDir = process.argv[2];
  if (!srcDir) {
    console.log("Uso: node scripts/fotos.mjs <carpeta con las fotos originales nombradas por ID>");
    process.exit(1);
  }
  await fs.mkdir(OUT, { recursive: true });
  const prev = existsSync(MANIFEST) ? JSON.parse(await fs.readFile(MANIFEST, "utf8")) : {};
  const listas = Array.isArray(prev) ? {} : prev;
  let hechas = 0;
  const faltan = [];

  for (const [id, mode] of Object.entries(MODOS)) {
    const ext = ["jpg", "jpeg", "png", "webp"].find((e) => existsSync(path.join(srcDir, `${id}.${e}`)));
    if (!ext) {
      faltan.push(id);
      continue;
    }
    const square = await processPhoto(path.join(srcDir, `${id}.${ext}`), mode);
    const hash = createHash("sha1");
    for (const size of SIZES) {
      const data = await sharp(square)
        .resize(size, size)
        .webp({ quality: size > 600 ? 80 : 76, effort: 6 })
        .toBuffer();
      hash.update(data);
      await fs.writeFile(path.join(OUT, `${id}-${size}.webp`), data);
    }
    const tiny = await sharp(square).resize(24, 24).webp({ quality: 50 }).toBuffer();
    listas[id] = { v: hash.digest("hex").slice(0, 8), lqip: `data:image/webp;base64,${tiny.toString("base64")}` };
    hechas++;
  }

  const ordenado = Object.fromEntries(Object.entries(listas).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(MANIFEST, JSON.stringify(ordenado, null, 1) + "\n");
  console.log(`fotos: ${hechas} procesadas, ${Object.keys(listas).length} listas en total`);
  if (faltan.length) console.log(`fotos: ${faltan.length} sin original en la carpeta: ${faltan.join(", ")}`);
}

main();
