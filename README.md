# NOIRE · sitio web

Landing, catálogo y lista de precios de NOIRE. Está hecho en Next.js 15 (App Router, TypeScript) y se exporta como sitio estático.

## Páginas

| Ruta | Qué es |
|---|---|
| `/` | Landing: NOIRE · Mercería mayorista, con accesos al catálogo y a la lista de precios |
| `/catalogo/` | Todos los productos por categoría (`/catalogo/#cierres`, `#hilo-elastico`, `#hilo-poliester`, `#yute`) |
| `/catalogo/<producto>/` | Detalle: fotos, medida o presentación, precio según cantidad y botón para agregar al pedido |
| `/precios/` | Lista de precios con buscador. Cada producto tiene su ancla, por ejemplo `/precios/#cierre-aluminio-fijo-c5` |

El pedido se arma en el navegador del cliente (queda guardado aunque cierre la página) y se envía por WhatsApp con el detalle y el subtotal ya escritos.

## Correr en tu compu

```bash
npm install
npm run dev        # http://localhost:3000
```

## Publicar

**Vercel (recomendado):** subí el proyecto a GitHub, importalo en vercel.com y listo. No hace falta configurar nada.

**Cualquier otro hosting:** corré `npm run build` y subí el contenido de la carpeta `out/`.

Para el dominio `noire.ar`, se configura desde el panel del hosting.

## Qué tocar

- **Número de WhatsApp:** `src/lib/config.ts` → `whatsapp` (ej. `"5491112345678"`).
- **Precios, productos y fotos:** `src/data/catalogo.ts`. Los cierres están en tablas `[medida, x1, x4, x12, x50]`, copiadas de "NOIRE Precios IA 09/26". Los hilos salen de "NOIRE · Precios Hilos".
- **Envío gratis:** `src/lib/config.ts` → `envioGratisDesde`.

## Fotos

Por ahora se muestran directo desde la carpeta de Drive "NOAR - Catálogo Web". Cada producto guarda el ID del archivo de Drive. Para que se vean, la carpeta tiene que estar compartida como **"Cualquier persona con el vínculo" → Lector**.

Más adelante conviene servirlas desde el propio sitio (cargan más rápido y no dependen de Drive):

1. Bajá cada foto a `public/fotos/<ID de Drive>.jpg`.
2. En `src/lib/config.ts`, cambiá `IMAGE_SOURCE` a `"local"`.
