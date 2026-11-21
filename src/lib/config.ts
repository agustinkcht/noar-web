import fotosLocales from "@/data/fotos.json";

/**
 * Configuración general del sitio. Lo que más vas a tocar está acá.
 */
export const SITE = {
  name: "NOIRE",
  tagline: "Mercería mayorista",
  url: "https://noire.ar",
  /**
   * Número de WhatsApp al que llegan los pedidos, en formato internacional
   * sin "+" ni espacios. Ej: "5491112345678".
   */
  whatsapp: "",
  /** Envío gratis en GBA desde este subtotal. */
  envioGratisDesde: 120000,
};

/**
 * Fotos: scripts/fotos.mjs las procesa en cada build y las deja en /public/fotos
 * (WebP de 480 y 1200 px). Si alguna no se pudo procesar, se muestra desde Drive.
 */
const LOCAL = new Set<string>(fotosLocales as string[]);

const drive = (id: string, w: number) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

export function imageSources(id: string) {
  if (LOCAL.has(id)) {
    return {
      src: `/fotos/${id}-1200.webp`,
      srcSet: `/fotos/${id}-480.webp 480w, /fotos/${id}-1200.webp 1200w`,
    };
  }
  return { src: drive(id, 1200), srcSet: `${drive(id, 480)} 480w, ${drive(id, 1200)} 1200w` };
}

/** Precarga la foto grande para que el detalle abra sin esperar. */
export function preloadImage(id?: string) {
  if (!id || typeof window === "undefined") return;
  const img = new Image();
  img.decoding = "async";
  img.src = imageSources(id).src;
}
