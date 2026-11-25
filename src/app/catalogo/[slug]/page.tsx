import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import {
  CATEGORIES,
  PRODUCTS,
  categoryHref,
  familySlug,
  getCategory,
  getProduct,
  productsByCategory,
  type Category,
} from "@/data/catalogo";
import { imageSources } from "@/lib/config";
import { minPrice, money } from "@/lib/precios";

type Params = { slug: string };

/**
 * Esta ruta sirve dos tipos de página:
 *  - /catalogo/<categoría>/ (yute, hilo-poliester, hilo-elastico, hilo-encerado)
 *  - /catalogo/<producto>/  (detalle)
 * Los cierres tienen su propia carpeta (/catalogo/cierres/).
 */
const CATEGORY_PAGES = CATEGORIES.filter((c) => c.id !== "cierres");

export function generateStaticParams(): Params[] {
  return [...CATEGORY_PAGES.map((c) => ({ slug: c.id })), ...PRODUCTS.map((p) => ({ slug: p.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategory(slug);
  if (c) return { title: c.name, description: `${c.name}: ${c.blurb}. Precios mayoristas por cantidad.` };
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.name}. Desde ${money(minPrice(p))} ${p.unit} comprando por cantidad.`,
  };
}

export default async function CatalogoSlug({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = CATEGORY_PAGES.find((c) => c.id === slug);
  if (category) return <CategoryPage category={category} />;

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
    : { href: categoryHref(product.category), label: getCategory(product.category)!.name };

  return (
    <div className="wrap page">
      <Link href={back.href} className="back">
        ‹ {back.label}
      </Link>
      <ProductDetail product={product} />
    </div>
  );
}

function CategoryPage({ category }: { category: Category }) {
  const products = productsByCategory(category.id);
  return (
    <div className="wrap page">
      <Link href="/catalogo/" className="back">
        ‹ Catálogo
      </Link>
      <header className="page-head">
        <h1 className="page-title">{category.name}</h1>
        {category.id === "hilo-encerado" && (
          <p className="page-note">
            Tres líneas: común, fluo y matizado. Entrá a una para elegir el color. El precio pack
            (x16) es a partir de 16 bobinas del mismo color.
          </p>
        )}
      </header>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} priority />
        ))}
      </div>
    </div>
  );
}
