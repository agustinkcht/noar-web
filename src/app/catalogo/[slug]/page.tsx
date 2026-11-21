import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { CATEGORIES, PRODUCTS, familySlug, getProduct } from "@/data/catalogo";
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
