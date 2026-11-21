import Link from "next/link";
import { CATEGORIES, PRODUCTS } from "@/data/catalogo";
import { ProductImage } from "@/components/ProductImage";

export default function Home() {
  const covers: Record<string, string | undefined> = {
    cierres: PRODUCTS.find((p) => p.slug === "cierre-metal-plata-niquel-desmontable-c5")?.images[0],
    "hilo-elastico": PRODUCTS.find((p) => p.slug === "hilo-elastico-negro")?.images[0],
    "hilo-poliester": PRODUCTS.find((p) => p.slug === "hilo-cucito-cofre")?.images[0],
    yute: PRODUCTS.find((p) => p.slug === "yute-28-4")?.images[0],
  };

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <h1 className="hero-mark">NOIRE</h1>
          <p className="hero-tag">Mercería mayorista</p>
          <div className="hero-ctas">
            <Link href="/catalogo/" className="btn">
              Ver catálogo
            </Link>
            <Link href="/precios/" className="btn btn-ghost">
              Ver lista de precios
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap home-cats" aria-label="Categorías">
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={`/catalogo/#${c.id}`} className="cat-tile">
            <div className="cat-img">
              <ProductImage id={covers[c.id]} alt={c.name} fallback={c.name} width={900} />
            </div>
            <div className="cat-text">
              <h2>{c.name}</h2>
              <p className="muted small">{c.blurb}</p>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
