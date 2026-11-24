import Link from "next/link";
import { CATEGORIES, categoryHref } from "@/data/catalogo";
import { ProductImage } from "@/components/ProductImage";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <h1 className="hero-mark">NOAR</h1>
          <p className="hero-tag">
            <span className="tag-part">Mercería mayorista</span>
            <span className="tag-sep" aria-hidden="true">
              ·
            </span>
            <span className="tag-part">Proveedor de avíos</span>
          </p>
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
          <Link key={c.id} href={categoryHref(c.id)} className="cat-tile">
            <div className="cat-img">
              <ProductImage id={c.cover} alt={c.name} fallback={c.name} sizes="(min-width: 900px) 230px, 50vw" priority />
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
