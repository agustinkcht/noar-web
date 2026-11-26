"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProduct } from "@/data/catalogo";
import { SITE } from "@/lib/config";
import { lineName, money, tierIndex, tierQty, unitPrice, variantImages } from "@/lib/precios";
import { useCart } from "./CartProvider";
import { ProductImage } from "./ProductImage";
import { QtyStepper } from "./QtyStepper";

export function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQty, remove, clear } = useCart();
  // Vaciar pide un segundo toque para no borrar el pedido sin querer.
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const message = buildMessage(lines);
  // Sin número cargado, WhatsApp abre con el mensaje listo y pide elegir el contacto.
  const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
  const falta = SITE.envioGratisDesde - subtotal;

  return (
    <div className="drawer-root" data-open={open} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <aside className="drawer" role="dialog" aria-label="Tu pedido" aria-modal="true">
        <div className="drawer-head">
          <h2>Tu pedido</h2>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p>Todavía no agregaste productos.</p>
            <p className="muted">
              Elegí un producto en el catálogo, la medida y la cantidad. El precio se ajusta solo
              según cuántas unidades lleves.
            </p>
            <Link href="/catalogo/" className="btn" onClick={() => setOpen(false)}>
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="drawer-lines">
              {lines.map((l) => {
                const p = getProduct(l.slug)!;
                const d = l.desl ?? 0;
                const n = tierQty(lines, l.slug, l.variant);
                const t = p.tiers[tierIndex(p, l.variant, n)];
                const unit = unitPrice(p, l.variant, n);
                return (
                  <li key={`${l.slug}-${l.variant}-${d}`} className="line">
                    <Link
                      href={`/catalogo/${p.slug}/`}
                      className="line-img"
                      onClick={() => setOpen(false)}
                    >
                      <ProductImage
                        id={variantImages(p, l.variant, d)[0]}
                        alt={p.name}
                        fallback={p.title}
                        sizes="64px"
                      />
                    </Link>
                    <div className="line-body">
                      <p className="line-name">{lineName(p, l.variant, d)}</p>
                      <p className="line-meta">
                        {money(unit)} {p.unit}
                        {p.tiers.length > 1 && <span className="tier-chip">{t.label}</span>}
                      </p>
                      <div className="line-actions">
                        <QtyStepper
                          value={l.qty}
                          onChange={(q) => setQty(l.slug, l.variant, q, d)}
                          id={`qty-${l.slug}-${l.variant}-${d}`}
                        />
                        <button type="button" className="link-btn" onClick={() => remove(l.slug, l.variant, d)}>
                          Quitar
                        </button>
                      </div>
                    </div>
                    <p className="line-total">{money(unit * l.qty)}</p>
                  </li>
                );
              })}
            </ul>

            <div className="drawer-foot">
              <div className="subtotal">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p className="muted small">
                {falta > 0
                  ? `Te faltan ${money(falta)} para el envío gratis en GBA.`
                  : "Tu pedido tiene envío gratis en GBA."}
              </p>
              <div className="drawer-actions">
                <a className="btn btn-send" href={waHref} target="_blank" rel="noopener noreferrer">
                  Enviar pedido
                </a>
                <button
                  type="button"
                  className={`btn btn-ghost btn-clear${confirmClear ? " confirm" : ""}`}
                  onClick={() => (confirmClear ? (clear(), setConfirmClear(false)) : setConfirmClear(true))}
                  onBlur={() => setConfirmClear(false)}
                >
                  {confirmClear ? "¿Vaciar?" : "Vaciar"}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/** Redondeo a la decena, como en los presupuestos. */
const r10 = (n: number) => Math.round(n / 10) * 10;

/**
 * Resumen para WhatsApp:
 *   Cierre YKK <modelo> - <medida>
 *   * <n>u. x $<unitario> = *$<subtotal>*
 * Números sin separadores y redondeados a la decena.
 */
function buildMessage(lines: { slug: string; variant: number; qty: number; desl?: number }[]) {
  let total = 0;
  const items = lines
    .map((l) => {
      const p = getProduct(l.slug);
      if (!p) return "";
      const unit = r10(unitPrice(p, l.variant, tierQty(lines, l.slug, l.variant)));
      const sub = r10(unit * l.qty);
      total += sub;
      return `${lineName(p, l.variant, l.desl ?? 0)}\n* ${l.qty}u. x $${unit} = *$${sub}*`;
    })
    .filter(Boolean)
    .join("\n\n");
  return `¡Hola NOAR! Quiero hacer este pedido:\n\n${items}\n\nSubtotal productos: *$${total}*`;
}
