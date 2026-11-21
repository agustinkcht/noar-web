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

Las fotos salen de la carpeta de Drive "NOAR - Catálogo Web", que tiene que estar compartida como **"Cualquier persona con el vínculo" → Lector**. Cada producto guarda el ID del archivo de Drive en `src/data/catalogo.ts`.

Antes de cada build corre `scripts/fotos.mjs`, que:

1. Baja cada foto de Drive.
2. Si tiene fondo blanco, recorta el blanco sobrante y centra el producto en un cuadrado blanco con aire alrededor. Si tiene otro fondo (fotos de ambiente), la recorta al cuadrado.
3. La guarda comprimida en WebP (480 y 1200 px) en `public/fotos/`.

Las fotos procesadas quedan en caché entre builds, así que solo se bajan las nuevas. En el log de Vercel aparece una línea `fotos: N/M listas`. Si alguna foto no se pudo procesar, el sitio la muestra desde Drive (más lenta, pero se ve).

Para regenerar todas, por ejemplo después de cambiar el encuadre, cambiá `VERSION` en `scripts/fotos.mjs`.
