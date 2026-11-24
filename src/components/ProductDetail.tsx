"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIES, categoryHref, familySlug, type Product } from "@/data/catalogo";
import { preloadImage } from "@/lib/config";
import { money, tierIndex, unitPrice, variantImages } from "@/lib/precios";
import { useCart } from "./CartProvider";
import { ProductImage } from "./ProductImage";
import { QtyStepper } from "./QtyStepper";

export function ProductDetail({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const deslizadores = product.deslizadores ?? [];
  const [desl, setDesl] = useState(0);
  const [variant, setVariant] = useState(deslizadores[0]?.variants[0] ?? 0);
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [added, setAdded] = useState(false);

  // Medidas que se pueden elegir con el deslizador actual.
  const medidas = deslizadores[desl]?.variants ?? product.variants.map((_, i) => i);
  const images = variantImages(product, variant, desl);
  const tier = tierIndex(product, variant, qty);
  const unit = unitPrice(product, variant, qty);
  const v = product.variants[variant];
  const category = CATEGORIES.find((c) => c.id === product.category)!;
  const available = v.prices.filter((pr) => pr != null).length;

  useEffect(() => setPhoto(0), [variant, desl]);

  function chooseDesl(i: number) {
    setDesl(i);
    const allowed = deslizadores[i].variants;
    if (!allowed.includes(variant)) setVariant(allowed[0]);
  }

  // Precarga todas las fotos del producto para que la galería pase sin esperas.
  // Con muchas variantes (ej. 36 colores) no se precarga todo: cada foto se pide
  // al pasar por su miniatura.
  useEffect(() => {
    const all = new Set([
      ...product.images,
      ...product.variants.flatMap((x) => x.images ?? []),
      ...(product.deslizadores ?? []).flatMap((d) => d.images),
    ]);
    if (all.size <= 8) all.forEach((id) => preloadImage(id));
  }, [product]);

  const isColor = product.variantName === "Color";

  function onAdd() {
    if (qty < 1) return;
    add(product.slug, variant, qty, desl);
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
            sizes="(min-width: 860px) 600px, 100vw"
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
                <ProductImage id={id} alt="" fallback={String(i + 1)} sizes="72px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="detail-info">
        <p className="eyebrow">
          {product.family ? (
            <Link href={`/catalogo/cierres/${familySlug(product.family)}/`}>
              {category.name} · {product.family}
            </Link>
          ) : (
            <Link href={categoryHref(category.id)}>{category.name}</Link>
          )}
        </p>
        <h1 className="detail-title">{product.name}</h1>
        <p className="muted">{product.subtitle}</p>

        {deslizadores.length > 0 && (
          <fieldset className="choice">
            <legend>Deslizador</legend>
            {deslizadores.length > 1 ? (
              <div className="segmented" role="group" aria-label="Tipo de deslizador">
                {deslizadores.map((d, i) => (
                  <button key={d.nombre} type="button" aria-pressed={i === desl} onClick={() => chooseDesl(i)}>
                    {d.nombre}
                  </button>
                ))}
              </div>
            ) : (
              <p className="choice-static">{deslizadores[0].nombre}</p>
            )}
          </fieldset>
        )}

        {product.variants.length > 1 && (
          <fieldset className="choice">
            <legend>
              {product.variantName}
              {isColor && <span className="legend-value">{v.label}</span>}
            </legend>
            {isColor ? (
              <div className="swatches">
                {medidas.map((i) => {
                  const vv = product.variants[i];
                  const img = vv.images?.[0];
                  return (
                    <button
                      key={vv.label}
                      type="button"
                      className="swatch"
                      aria-pressed={i === variant}
                      onClick={() => setVariant(i)}
                      onPointerEnter={() => preloadImage(img)}
                    >
                      <span className="swatch-img">
                        <ProductImage id={img} alt="" fallback="" sizes="72px" />
                      </span>
                      <span className="swatch-name">{vv.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
            <div className="chips">
              {medidas.map((i) => {
                const vv = product.variants[i];
                return (
                  <button
                    key={vv.label}
                    type="button"
                    className="chip"
                    aria-pressed={i === variant}
                    onClick={() => setVariant(i)}
                  >
                    {product.category === "cierres" ? vv.label.replace(" cm", "") : vv.label}
                  </button>
                );
              })}
            </div>
            )}
            {product.category === "cierres" && <p className="muted small">Medidas en centímetros.</p>}
          </fieldset>
        )}

        <div className="tiers" role="group" aria-label="Precio según cantidad">
          {product.tiers.map((t, i) => {
            const price = v.prices[i];
            if (price == null) return null;
            const body = (
              <>
                <span className="tier-key">{t.label}</span>
                <span className="tier-range">{available > 1 ? t.rango : "Precio por unidad"}</span>
                <span className="tier-price">
                  {money(price)} <span className="muted">{product.unit}</span>
                </span>
              </>
            );
            // Con más de un escalón, tocar uno carga esa cantidad.
            return available > 1 ? (
              <button
                key={t.key}
                type="button"
                className="tier-row"
                data-active={i === tier}
                aria-pressed={i === tier}
                aria-label={`Llevar ${t.min} ${t.min === 1 ? "unidad" : "unidades"} a ${money(price)} ${product.unit}`}
                onClick={() => setQty(t.min)}
              >
                {body}
              </button>
            ) : (
              <div key={t.key} className="tier-row" data-active>
                {body}
              </div>
            );
          })}
        </div>
        {available > 1 && (
          <p className="muted small">
            El precio se calcula por {product.category === "cierres" ? "medida" : "producto"} según la
            cantidad que lleves. Tocá un escalón para cargar esa cantidad.
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
