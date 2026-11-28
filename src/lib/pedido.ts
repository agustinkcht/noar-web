import { getProduct } from "@/data/catalogo";
import type { CartLine } from "@/components/CartProvider";
import { lineName, tierIndex, tierQty, unitPrice, variantImages } from "./precios";
import type { ItemPedido } from "./supabase";

/** Pasa las líneas del carrito a ítems de pedido con precio congelado. */
export function itemsDelCarrito(lines: CartLine[]): (ItemPedido & { escalon?: string })[] {
  return lines.flatMap((l) => {
    const p = getProduct(l.slug);
    if (!p) return [];
    const desl = l.desl ?? 0;
    const n = tierQty(lines, l.slug, l.variant);
    const unitario = unitPrice(p, l.variant, n);
    return [
      {
        slug: l.slug,
        variant: l.variant,
        desl,
        nombre: lineName(p, l.variant, desl),
        foto: variantImages(p, l.variant, desl)[0],
        cantidad: l.qty,
        unitario,
        subtotal: unitario * l.qty,
        escalon: p.tiers.length > 1 ? p.tiers[tierIndex(p, l.variant, n)].label : undefined,
      },
    ];
  });
}
