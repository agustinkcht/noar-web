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
 * De dónde salen las fotos.
 * - "drive": se muestran directo desde Google Drive (la carpeta tiene que estar
 *   compartida como "Cualquier persona con el vínculo puede ver").
 * - "local": se leen de /public/fotos/<ID>.jpg (más rápido; ver README).
 */
const IMAGE_SOURCE: "drive" | "local" = "drive";

export function imageUrl(id: string, width = 1000) {
  if (IMAGE_SOURCE === "local") return `/fotos/${id}.jpg`;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}
