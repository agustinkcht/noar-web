import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { FAMILIAS, getFamilia } from "@/data/catalogo";
import { minPrice, money } from "@/lib/precios";

type Params = { familia: string };

export function generateStaticParams(): Params[] {
  return FAMILIAS.map((f) => ({ familia: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { familia } = await params;
  const f = getFamilia(familia);
  if (!f) return {};
  const desde = Math.min(...f.products.map(minPrice));
  return {
    title: `Cierres YKK ${f.name}`,
    description: `Cierres YKK ${f.name}, desmontables y fijos. Desde ${money(desde)} c/u comprando por cantidad.`,
  };
}

export default async function FamiliaPage({ params }: { params: Promise<Params> }) {
  const { familia } = await params;
  const f = getFamilia(familia);
  if (!f) notFound();

  return (
    <div className="wrap page">
      <Link href="/catalogo/cierres/" className="back">
        ‹ Cierres YKK
      </Link>
      <header className="page-head">
        <p className="eyebrow">Cierres YKK</p>
        <h1 className="page-title">{f.name}</h1>
      </header>
      <div className="grid">
        {f.products.map((p) => (
          <ProductCard key={p.slug} product={p} priority />
        ))}
      </div>
    </div>
  );
}
