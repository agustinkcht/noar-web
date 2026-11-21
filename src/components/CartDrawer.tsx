"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProduct } from "@/data/catalogo";
import { SITE } from "@/lib/config";
import { lineName, money, moneyPlain, tierIndex, tierQty, unitPrice, variantImages } from "@/lib/precios";
import { useCart } from "./CartProvider";
import { ProductImage } from "./ProductImage";
import { QtyStepper } from "./QtyStepper";

export function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQty, remove, clear } = useCart();
  const [copied, setCopied] = useState(false);

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

  const message = buildMessage(lines, subtotal);
  const waHref = SITE.whatsapp
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`
    : undefined;
  const falta = SITE.envioGratisDesde - subtotal;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

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
              {waHref ? (
                <a className="btn btn-full" href={waHref} target="_blank" rel="noopener noreferrer">
                  Enviar pedido por WhatsApp
                </a>
              ) : (
                <p className="warn small">Falta cargar el número de WhatsApp en src/lib/config.ts.</p>
              )}
              <div className="drawer-secondary">
                <button type="button" className="link-btn" onClick={copy}>
                  {copied ? "Copiado" : "Copiar pedido"}
                </button>
                <button type="button" className="link-btn" onClick={clear}>
                  Vaciar
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function buildMessage(lines: { slug: string; variant: number; qty: number; desl?: number }[], subtotal: number) {
  const items = lines
    .map((l) => {
      const p = getProduct(l.slug);
      if (!p) return "";
      const unit = unitPrice(p, l.variant, tierQty(lines, l.slug, l.variant));
      return `*${lineName(p, l.variant, l.desl ?? 0)}*\n${l.qty} x ${moneyPlain(unit)} = ${moneyPlain(unit * l.qty)}`;
    })
    .filter(Boolean)
    .join("\n\n");
  return `Hola! Quiero hacer este pedido:\n\n${items}\n\nSubtotal productos: ${moneyPlain(subtotal)}`;
}
