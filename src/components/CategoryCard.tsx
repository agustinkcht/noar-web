"use client";

import Link from "next/link";
import { categoryHref, type Category } from "@/data/catalogo";
import { preloadImage } from "@/lib/config";
import { ProductImage } from "./ProductImage";

type Props = { category: Category; count: string; featured?: boolean };

/** Tarjeta grande de categoría para la portada del catálogo. */
export function CategoryCard({ category, count, featured }: Props) {
  return (
    <Link
      href={categoryHref(category.id)}
      className={`cat-card${featured ? " featured" : ""}`}
      onPointerEnter={() => preloadImage(category.cover)}
      onTouchStart={() => preloadImage(category.cover)}
    >
      <div className="cat-card-img">
        <ProductImage
          id={category.cover}
          alt={category.name}
          fallback={category.name}
          sizes={featured ? "(min-width: 900px) 560px, 100vw" : "(min-width: 900px) 560px, 100vw"}
          priority
        />
      </div>
      <div className="cat-card-body">
        <h2 className="cat-card-title">{category.name}</h2>
        <p className="muted">{category.blurb}</p>
        <p className="cat-card-foot">
          <span className="cat-card-count">{count}</span>
          <span className="cat-card-cta" aria-hidden="true">
            Ver productos →
          </span>
        </p>
      </div>
    </Link>
  );
}
