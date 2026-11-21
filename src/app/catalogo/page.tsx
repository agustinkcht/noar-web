import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, cierresPorFamilia, productsByCategory } from "@/data/catalogo";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Cierres YKK, hilo elástico, hilo poliéster y yute. Precios mayoristas por cantidad.",
};

export default function Catalogo() {
  const familias = cierresPorFamilia();

  return (
    <div className="wrap page">
      <header className="page-head">
        <h1 className="page-title">Catálogo</h1>
        <nav className="chips" aria-label="Categorías">
          {CATEGORIES.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="chip">
              {c.name}
            </a>
          ))}
        </nav>
      </header>

      <section id="cierres" className="cat-section">
        <h2 className="section-title">Cierres YKK</h2>
        {familias.map(({ family, products }) => (
          <div key={family} className="family">
            <h3 className="family-title">{family}</h3>
            <div className="grid">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {CATEGORIES.filter((c) => c.id !== "cierres").map((c) => (
        <section key={c.id} id={c.id} className="cat-section">
          <h2 className="section-title">{c.name}</h2>
          <div className="grid">
            {productsByCategory(c.id).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
