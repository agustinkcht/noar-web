import fotosLocales from "@/data/fotos.json";

/**
 * Configuración general del sitio. Lo que más vas a tocar está acá.
 */
export const SITE = {
  name: "NOAR",
  tagline: "Mercería mayorista · Proveedor de avíos",
  url: "https://noar.ar",
  /**
   * Número de WhatsApp al que llegan los pedidos, en formato internacional
   * sin "+" ni espacios. Ej: "5491112345678".
   */
  whatsapp: "",
  /** Envío gratis en GBA desde este subtotal. */
  envioGratisDesde: 120000,
};

/**
 * Fotos: procesadas con scripts/fotos.mjs y guardadas en /public/fotos (WebP de 480,
 * 800 y 1200 px). Cada una trae una huella de contenido (`v`, para el caché) y una
 * vista previa mínima (`lqip`) que se ve mientras carga. Si alguna falta, va desde Drive.
 */
type Foto = { v: string; lqip: string };
const LOCAL = fotosLocales as Record<string, Foto>;

const drive = (id: string, w: number) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

export function imageSources(id: string) {
  const f = LOCAL[id];
  if (f) {
    const u = (w: number) => `/fotos/${id}-${w}.webp?v=${f.v}`;
    return {
      src: u(1200),
      srcSet: `${u(480)} 480w, ${u(800)} 800w, ${u(1200)} 1200w`,
      lqip: f.lqip,
    };
  }
  return { src: drive(id, 1200), srcSet: `${drive(id, 480)} 480w, ${drive(id, 1200)} 1200w`, lqip: undefined };
}

/** Foto chica (480 px), para listados e impresión. */
export function thumbSrc(id: string) {
  const f = LOCAL[id];
  return f ? `/fotos/${id}-480.webp?v=${f.v}` : drive(id, 480);
}

/** Precarga la foto grande para que el detalle abra sin esperar. */
export function preloadImage(id?: string) {
  if (!id || typeof window === "undefined") return;
  const { src, srcSet } = imageSources(id);
  const img = new Image();
  img.decoding = "async";
  // Mismo tamaño que va a pedir el detalle, así queda en caché la versión justa.
  img.sizes = "(min-width: 860px) 600px, 100vw";
  img.srcset = srcSet;
  img.src = src;
}
