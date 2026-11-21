import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { ProductDetail } from "@/components/ProductDetail";
import { CATEGORIES, PRODUCTS, familySlug, getProduct } from "@/data/catalogo";
import { imageSources } from "@/lib/config";
import { minPrice, money } from "@/lib/precios";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.name}. Desde ${money(minPrice(p))} ${p.unit} comprando por cantidad.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  // Anuncia la foto principal en el <head> para que se pida antes que todo lo demás.
  const main = product.variants[0].images?.[0] ?? product.images[0];
  if (main) {
    const { src, srcSet } = imageSources(main);
    preload(src, { as: "image", imageSrcSet: srcSet, imageSizes: "(min-width: 860px) 600px, 100vw", fetchPriority: "high" });
  }

  const back = product.family
    ? { href: `/catalogo/cierres/${familySlug(product.family)}/`, label: product.family }
    : { href: `/catalogo/#${product.category}`, label: CATEGORIES.find((c) => c.id === product.category)!.name };

  return (
    <div className="wrap page">
      <Link href={back.href} className="back">
        ‹ {back.label}
      </Link>
      <ProductDetail product={product} />
    </div>
  );
}
