import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { PRODUCTS, getProduct } from "@/data/catalogo";
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

  return (
    <div className="wrap page">
      <Link href="/catalogo/" className="back">
        ‹ Catálogo
      </Link>
      <ProductDetail product={product} />
    </div>
  );
}
