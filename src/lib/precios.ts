import type { Product } from "@/data/catalogo";

/** Índice del tier que aplica para una cantidad (por producto y medida). */
export function tierIndex(product: Product, variantIndex: number, qty: number) {
  const prices = product.variants[variantIndex].prices;
  let idx = 0;
  product.tiers.forEach((t, i) => {
    if (qty >= t.min && prices[i] != null) idx = i;
  });
  return idx;
}

export function unitPrice(product: Product, variantIndex: number, qty: number) {
  const i = tierIndex(product, variantIndex, qty);
  return product.variants[variantIndex].prices[i] ?? 0;
}

/** El precio más bajo del producto (mayor tier, medida más barata). */
export function minPrice(product: Product) {
  let min = Infinity;
  for (const v of product.variants) for (const p of v.prices) if (p != null && p < min) min = p;
  return min;
}

/** El precio de lista más bajo (x1) del producto. */
export function minListPrice(product: Product) {
  return Math.min(...product.variants.map((v) => v.prices[0] ?? Infinity));
}

const ars = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

/** Para la web: $ 3.480 */
export function money(n: number) {
  return `$ ${ars.format(n)}`;
}

/** Solo el número: 3.480 (para tablas). */
export function amount(n: number) {
  return ars.format(n);
}

/** Para WhatsApp: $3480 (sin separadores, como en los presupuestos). */
export function moneyPlain(n: number) {
  return `$${Math.round(n)}`;
}

/** Nombre del ítem tal como va en el pedido. */
export function lineName(product: Product, variantIndex: number) {
  const v = product.variants[variantIndex];
  if (product.category === "cierres") return `${product.name} - ${v.label.replace(" ", "")}`;
  if (product.variants.length > 1) return `${product.name} - ${v.label}`;
  return product.name;
}

export function variantImages(product: Product, variantIndex: number) {
  return product.variants[variantIndex]?.images ?? product.images;
}
