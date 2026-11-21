"use client";

import Link from "next/link";
import type { Product } from "@/data/catalogo";
import { preloadImage } from "@/lib/config";
import { minPrice, money } from "@/lib/precios";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const first = product.variants[0].label;
  const last = product.variants[product.variants.length - 1].label;
  const rango =
    product.category === "cierres" ? `${first.replace(" cm", "")} a ${last}` : product.subtitle.split(" · ").pop();

  return (
    <Link
      href={`/catalogo/${product.slug}/`}
      className="card"
      onPointerEnter={() => preloadImage(product.images[0])}
      onTouchStart={() => preloadImage(product.images[0])}
    >
      <div className="card-img">
        <ProductImage id={product.images[0]} alt={product.name} fallback={product.title} />
      </div>
      <div className="card-body">
        <p className="card-sub">{product.category === "cierres" ? product.subtitle : product.title}</p>
        <p className="card-range">{rango}</p>
        <p className="card-price">
          <span className="muted">desde</span> {money(minPrice(product))}
          <span className="muted"> {product.unit}</span>
        </p>
      </div>
    </Link>
  );
}
