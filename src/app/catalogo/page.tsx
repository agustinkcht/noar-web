import type { Metadata } from "next";
import { FamilyCard } from "@/components/FamilyCard";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, FAMILIAS, productsByCategory } from "@/data/catalogo";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Cierres YKK, hilo de yute, hilo poliéster e hilo elástico. Precios mayoristas por cantidad.",
};

export default function Catalogo() {
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
        <div className="grid">
          {FAMILIAS.map((f) => (
            <FamilyCard key={f.slug} familia={f} />
          ))}
        </div>
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
