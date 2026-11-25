import type { Metadata } from "next";
import { CategoryCard } from "@/components/CategoryCard";
import { VISIBLES, FAMILIAS, productsByCategory, type CategoryId } from "@/data/catalogo";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Cierres YKK, hilo de yute, hilo poliéster, hilo elástico e hilo encerado. Precios mayoristas por cantidad.",
};

/** Lo que se cuenta en cada tarjeta: familias, productos o colores. */
function countFor(id: CategoryId) {
  if (id === "cierres") return `${FAMILIAS.length} familias`;
  const products = productsByCategory(id);
  if (id === "hilo-encerado") {
    const colores = products.reduce((n, p) => n + p.variants.length, 0);
    return `${products.length} líneas · ${colores} colores`;
  }
  return products.length === 1 ? "1 producto" : `${products.length} productos`;
}

export default function Catalogo() {
  return (
    <div className="wrap page">
      <header className="page-head">
        <h1 className="page-title">Catálogo</h1>
        <p className="muted">Elegí una categoría para ver sus productos.</p>
      </header>
      <div className="cat-grid">
        {VISIBLES.map((c) => (
          <CategoryCard key={c.id} category={c} count={countFor(c.id)} featured={c.id === "cierres"} />
        ))}
      </div>
    </div>
  );
}
