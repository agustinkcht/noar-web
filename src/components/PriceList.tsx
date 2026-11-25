"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VISIBLES, PRODUCTS, type Product } from "@/data/catalogo";
import { amount } from "@/lib/precios";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function PriceList() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const words = normalize(q).split(/\s+/).filter(Boolean);
    if (!words.length) return PRODUCTS;
    return PRODUCTS.filter((p) => {
      const hay = normalize(`${p.name} ${p.subtitle}`);
      return words.every((w) => hay.includes(w));
    });
  }, [q]);

  return (
    <>
      <div className="toolbar">
        <nav className="chips" aria-label="Categorías">
          {VISIBLES.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="chip">
              {c.name}
            </a>
          ))}
        </nav>
        <label className="search">
          <span className="sr-only">Buscar producto</span>
          <input
            id="buscar-precios"
            type="search"
            placeholder="Buscar: vislon fijo, yute 28/4…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>

      {VISIBLES.map((c) => {
        const items = filtered.filter((p) => p.category === c.id);
        if (!items.length) return null;
        return (
          <section key={c.id} id={c.id} className="price-section">
            <h2 className="section-title">{c.name}</h2>
            {c.id === "cierres" && (
              <p className="muted small tier-legend">
                Precio por unidad según cantidad, por medida: x1 = 1 a 3 u. · x4 = 4 a 11 u. · x12 = 12
                a 49 u. · x50 = 50 u. o más.
              </p>
            )}
            {c.id === "yute" && (
              <p className="muted small tier-legend">x12 = desde 12 unidades del mismo producto.</p>
            )}
            {c.id === "hilo-encerado" && (
              <p className="muted small tier-legend">
                Precio por bobina de 70 m. x16 = desde 16 bobinas del mismo color.
              </p>
            )}
            <div className="price-grid">
              {items.map((p) => (
                <PriceTable key={p.slug} product={p} />
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && <p className="muted empty">No encontramos productos con “{q}”.</p>}
    </>
  );
}

function PriceTable({ product }: { product: Product }) {
  const isCierre = product.category === "cierres";
  // Si todas las variantes valen lo mismo (ej. colores), una sola fila alcanza.
  const key = (p: (number | null)[]) => p.join("|");
  const sameForAll =
    product.variants.length > 3 && product.variants.every((v) => key(v.prices) === key(product.variants[0].prices));
  const rows = sameForAll
    ? [{ label: `Todos los ${product.variantName === "Color" ? "colores" : "tipos"} (${product.variants.length})`, prices: product.variants[0].prices }]
    : product.variants;
  // Columnas sin ningún precio cargado (ej. x12 pendiente) no se muestran.
  const cols = product.tiers.map((_, i) => i).filter((i) => rows.some((r) => r.prices[i] != null));
  return (
    <div className="price-block" id={product.slug}>
      <div className="price-head">
        <h3>
          <Link href={`/catalogo/${product.slug}/`}>
            {isCierre ? `${product.family} ${product.subtitle.replace(" · ", " ").replace("Cadena ", "C")}` : product.title}
          </Link>
        </h3>
        {!isCierre && <p className="muted small">{product.subtitle}</p>}
      </div>
      <div className="table-scroll">
        <table className="price-table">
          <thead>
            <tr>
              <th scope="col">{isCierre ? "cm" : product.variantName}</th>
              {cols.map((i) => (
                <th key={product.tiers[i].key} scope="col">
                  {product.tiers[i].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.label}>
                <th scope="row">{isCierre ? v.label.replace(" cm", "") : v.label}</th>
                {cols.map((i) => (
                  <td key={i}>{v.prices[i] == null ? "—" : amount(v.prices[i]!)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
