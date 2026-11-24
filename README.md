# NOAR · sitio web

Landing, catálogo y lista de precios de NOAR. Está hecho en Next.js 15 (App Router, TypeScript) y se exporta como sitio estático.

## Páginas

| Ruta | Qué es |
|---|---|
| `/` | Landing: NOAR · Mercería mayorista · Proveedor de avíos, con accesos al catálogo y a la lista de precios |
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
- **Precios, productos y fotos:** `src/data/catalogo.ts`. Los cierres están en tablas `[medida, x1, x4, x12, x50]`, copiadas de "NOIRE Precios IA 09/26". Los hilos salen de "NOIRE · Precios Hilos", hoja "Precios Legal 3": x1 (1 a 11 u.) es el mayorista estándar y x12 (12 u. o más) el precio pack.
- **Envío gratis:** `src/lib/config.ts` → `envioGratisDesde`.

## Fotos

Las fotos ya procesadas están en `public/fotos/` (WebP de 480, 800 y 1200 px, de 25 a 150 KB cada una) y se sirven desde el propio sitio. `src/data/fotos.json` guarda, para cada foto, una huella de su contenido (para el caché) y una vista previa mínima que se ve mientras carga. Si falta alguna, el sitio la muestra desde Drive.

Cada producto guarda el ID de Drive de sus fotos en `src/data/catalogo.ts`, y la foto procesada lleva ese mismo ID.

### Agregar o cambiar fotos

1. Juntá las originales en una carpeta, nombradas con su ID de Drive (`<ID>.jpg` o `.png`).
2. En `scripts/fotos-modos.json`, indicá cómo encuadrar cada una:
   - `desm`: desmontables. Mismo aire arriba en todos y el producto llega al borde de abajo.
   - `yute`: rollos. El rollo ocupa siempre la misma proporción del cuadro.
   - `pad`: la foto entera centrada en blanco (fijos, hilos). Si el fondo no es blanco (fotos de ambiente), la recorta al cuadrado.
3. Corré `npm run fotos -- <carpeta>` y subí los cambios.
