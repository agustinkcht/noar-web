"use client";

import Link from "next/link";
import type { Familia } from "@/data/catalogo";
import { preloadImage } from "@/lib/config";
import { minPrice, money } from "@/lib/precios";
import { ProductImage } from "./ProductImage";

/** Tarjeta de una familia de cierres. La foto es la del desmontable. */
export function FamilyCard({ familia, priority }: { familia: Familia; priority?: boolean }) {
  const cover = familia.products[0]?.images[0];
  const desde = Math.min(...familia.products.map(minPrice));
  const formatos = familia.products.map((p) => p.subtitle.replace(" · Cadena ", " C")).join(" · ");

  return (
    <Link
      href={`/catalogo/cierres/${familia.slug}/`}
      className="card"
      onPointerEnter={() => preloadImage(cover)}
      onTouchStart={() => preloadImage(cover)}
    >
      <div className="card-img">
        <ProductImage id={cover} alt={`Cierre YKK ${familia.name}`} fallback={familia.name} priority={priority} />
      </div>
      <div className="card-body">
        <p className="card-sub">{familia.name}</p>
        <p className="card-range">{formatos}</p>
        <p className="card-price">
          <span className="muted">desde</span> {money(desde)}
          <span className="muted"> c/u</span>
        </p>
      </div>
    </Link>
  );
}
