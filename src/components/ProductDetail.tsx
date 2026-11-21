"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIES, type Product } from "@/data/catalogo";
import { money, tierIndex, unitPrice, variantImages } from "@/lib/precios";
import { useCart } from "./CartProvider";
import { ProductImage } from "./ProductImage";
import { QtyStepper } from "./QtyStepper";

export function ProductDetail({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const [variant, setVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [added, setAdded] = useState(false);

  const images = variantImages(product, variant);
  const tier = tierIndex(product, variant, qty);
  const unit = unitPrice(product, variant, qty);
  const v = product.variants[variant];
  const category = CATEGORIES.find((c) => c.id === product.category)!;
  const available = v.prices.filter((pr) => pr != null).length;

  useEffect(() => setPhoto(0), [variant]);

  function onAdd() {
    if (qty < 1) return;
    add(product.slug, variant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <article className="detail">
      <div className="gallery">
        <div className="gallery-main">
          <ProductImage
            key={images[photo]}
            id={images[photo]}
            alt={`${product.name}, foto ${photo + 1}`}
            fallback={product.title}
            width={1400}
            priority
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-arrow prev"
                onClick={() => setPhoto((photo - 1 + images.length) % images.length)}
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="gallery-arrow next"
                onClick={() => setPhoto((photo + 1) % images.length)}
                aria-label="Foto siguiente"
              >
                ›
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="thumbs">
            {images.map((id, i) => (
              <button
                key={id}
                type="button"
                className="thumb"
                aria-current={i === photo}
                onClick={() => setPhoto(i)}
                aria-label={`Ver foto ${i + 1}`}
              >
                <ProductImage id={id} alt="" fallback={String(i + 1)} width={240} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="detail-info">
        <p className="eyebrow">
          <Link href={`/catalogo/#${category.id}`}>{category.name}</Link>
        </p>
        <h1 className="detail-title">{product.name}</h1>
        <p className="muted">{product.subtitle}</p>

        {product.variants.length > 1 && (
          <fieldset className="choice">
            <legend>{product.variantName}</legend>
            <div className="chips">
              {product.variants.map((vv, i) => (
                <button
                  key={vv.label}
                  type="button"
                  className="chip"
                  aria-pressed={i === variant}
                  onClick={() => setVariant(i)}
                >
                  {product.category === "cierres" ? vv.label.replace(" cm", "") : vv.label}
                </button>
              ))}
            </div>
            {product.category === "cierres" && <p className="muted small">Medidas en centímetros.</p>}
          </fieldset>
        )}

        <div className="tiers" role="table" aria-label="Precio según cantidad">
          {product.tiers.map((t, i) => {
            const price = v.prices[i];
            if (price == null) return null;
            return (
              <div key={t.key} className="tier-row" role="row" data-active={i === tier}>
                <span role="cell" className="tier-key">{t.label}</span>
                <span role="cell" className="tier-range">{available > 1 ? t.rango : "Precio por unidad"}</span>
                <span role="cell" className="tier-price">
                  {money(price)} <span className="muted">{product.unit}</span>
                </span>
              </div>
            );
          })}
        </div>
        {available > 1 && (
          <p className="muted small">
            El precio se calcula por {product.category === "cierres" ? "medida" : "producto"} según la
            cantidad que lleves.
          </p>
        )}

        <div className="buy">
          <QtyStepper value={qty} onChange={setQty} id="qty" min={1} />
          <div className="buy-total">
            <span className="muted small">
              {qty} × {money(unit)}
            </span>
            <strong>{money(unit * qty)}</strong>
          </div>
        </div>
        <div className="buy-actions">
          <button type="button" className="btn" onClick={onAdd}>
            Agregar al pedido
          </button>
          {added && (
            <button type="button" className="link-btn" onClick={() => setOpen(true)}>
              Agregado. Ver pedido
            </button>
          )}
        </div>
        <p className="small">
          <Link href={`/precios/#${product.slug}`} className="text-link">
            Ver en la lista de precios
          </Link>
        </p>
      </div>
    </article>
  );
}
