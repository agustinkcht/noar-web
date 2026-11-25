// Genera out/sw.js después de `next build`: el service worker que guarda TODO el sitio
// (páginas, código, fotos y fuentes) para poder navegarlo sin conexión.
// Se corre solo con `npm run build`.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const FONTS_CSS =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Inter+Tight:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

const fotos = JSON.parse(readFileSync("src/data/fotos.json", "utf8"));

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const urls = [];
const hash = createHash("sha256").update(readFileSync(new URL(import.meta.url)));
let bytes = 0;

for (const file of walk(OUT).sort()) {
  const rel = "/" + relative(OUT, file).split(sep).join("/");
  if (rel === "/sw.js" || rel.endsWith(".map") || rel.startsWith("/404")) continue;
  if (rel.startsWith("/imprimir/")) continue; // versión para imprimir: no hace falta sin conexión

  let url = rel;
  if (rel.endsWith("/index.html")) url = rel.slice(0, -"index.html".length);
  else if (rel.startsWith("/fotos/")) {
    const m = rel.match(/^\/fotos\/(.+)-(\d+)\.webp$/);
    if (!m || !fotos[m[1]]) continue; // foto huérfana
    url = `${rel}?v=${fotos[m[1]].v}`;
  }
  // Next pide las rutas dinámicas codificadas: /[familia]/ → /%5Bfamilia%5D/
  urls.push(url.replace(/\[/g, "%5B").replace(/\]/g, "%5D"));
  const buf = readFileSync(file);
  bytes += buf.length;
  hash.update(rel).update(buf);
}

const version = hash.digest("hex").slice(0, 10);
const fecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
}).format(new Date());

const sw = `// Generado por scripts/sw.mjs — no editar a mano.
const VERSION = ${JSON.stringify(version)};
const FECHA = ${JSON.stringify(fecha)};
const CACHE = "noar-" + VERSION;
const FONTS = "noar-fuentes";
const FONTS_CSS = ${JSON.stringify(FONTS_CSS)};
const PRECACHE = ${JSON.stringify(urls)};
const READY = "/__noar-ready";
// Archivos que nunca cambian de contenido para la misma URL: se reusan de una versión anterior.
const INMUTABLE = (u) => u.startsWith("/_next/static/") || u.startsWith("/fotos/");

let progreso = { hechos: 0, total: PRECACHE.length + 1 };

async function avisar(msg) {
  const cs = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  for (const c of cs) c.postMessage(msg);
}

async function reusar(url) {
  const keys = (await caches.keys()).filter((k) => k.startsWith("noar-") && k !== CACHE && k !== FONTS);
  for (const k of keys) {
    const r = await (await caches.open(k)).match(url);
    if (r) return r;
  }
  return null;
}

async function bajarFuentes() {
  try {
    const fc = await caches.open(FONTS);
    const css = await fetch(FONTS_CSS, { mode: "cors" });
    if (!css.ok) return;
    const texto = await css.clone().text();
    await fc.put(FONTS_CSS, css);
    const woffs = [...texto.matchAll(/url\\((https:[^)]+)\\)/g)].map((m) => m[1]);
    await Promise.allSettled(
      woffs.map(async (u) => {
        if (await fc.match(u)) return;
        const r = await fetch(u, { mode: "cors" });
        if (r.ok) await fc.put(u, r);
      }),
    );
  } catch {}
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      let ultimo = 0;
      const paso = () => {
        progreso.hechos++;
        const now = Date.now();
        if (now - ultimo > 250 || progreso.hechos === progreso.total) {
          ultimo = now;
          avisar({ tipo: "noar-progreso", ...progreso });
        }
      };
      const cola = [...PRECACHE];
      let fallas = 0;
      async function trabajador() {
        while (cola.length) {
          const url = cola.shift();
          try {
            const viejo = INMUTABLE(url) ? await reusar(url) : null;
            if (viejo) await cache.put(url, viejo);
            else {
              const r = await fetch(url, { cache: "no-cache" });
              if (!r.ok) throw new Error(r.status);
              await cache.put(url, r);
            }
          } catch {
            fallas++;
          }
          paso();
        }
      }
      await Promise.all(Array.from({ length: 6 }, trabajador));
      await bajarFuentes();
      paso();
      if (fallas > 0) throw new Error("No se pudo bajar todo (" + fallas + " archivos)");
      await cache.put(
        READY,
        new Response(JSON.stringify({ version: VERSION, fecha: FECHA }), {
          headers: { "content-type": "application/json" },
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith("noar-") && k !== CACHE && k !== FONTS) await caches.delete(k);
      await self.clients.claim();
      avisar({ tipo: "noar-listo", fecha: FECHA });
    })(),
  );
});

function conTimeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

async function desdeCache(req, opts) {
  const cache = await caches.open(CACHE);
  return cache.match(req, opts);
}

async function pagina(req) {
  const url = new URL(req.url);
  let path = url.pathname;
  if (!path.endsWith("/") && !path.split("/").pop().includes(".")) path += "/";
  try {
    const r = await conTimeout(fetch(req), 4000);
    if (r.ok) {
      const copia = r.clone();
      caches.open(CACHE).then((c) => c.match(path).then((hay) => hay && c.put(path, copia)));
    }
    return r;
  } catch {
    return (
      (await desdeCache(path, { ignoreSearch: true })) ||
      (await desdeCache("/", { ignoreSearch: true })) ||
      Response.error()
    );
  }
}

async function rsc(req) {
  try {
    return await conTimeout(fetch(req), 4000);
  } catch {
    const url = new URL(req.url);
    return (await desdeCache(url.pathname, { ignoreSearch: true })) || Response.error();
  }
}

async function primeroCache(req) {
  const hit = (await desdeCache(req)) || (await desdeCache(new URL(req.url).pathname, { ignoreSearch: true }));
  if (hit) return hit;
  return fetch(req).catch(() => Response.error());
}

async function fuentes(req) {
  const fc = await caches.open(FONTS);
  const hit = await fc.match(req);
  const red = fetch(req)
    .then((r) => {
      if (r.ok) fc.put(req, r.clone());
      return r;
    })
    .catch(() => hit || Response.error());
  return hit || red;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(fuentes(req));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") event.respondWith(pagina(req));
  else if (url.pathname.endsWith(".txt") || req.headers.get("RSC")) event.respondWith(rsc(req));
  else event.respondWith(primeroCache(req));
});
`;

writeFileSync(join(OUT, "sw.js"), sw);
console.log(`sw.js: ${urls.length} archivos, ${(bytes / 1e6).toFixed(1)} MB, versión ${version}`);
