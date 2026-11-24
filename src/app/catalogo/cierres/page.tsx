import type { Metadata } from "next";
import Link from "next/link";
import { FamilyCard } from "@/components/FamilyCard";
import { FAMILIAS } from "@/data/catalogo";

export const metadata: Metadata = {
  title: "Cierres YKK",
  description: "Cierres YKK en 8 familias, desmontables y fijos. Precios mayoristas por cantidad.",
};

export default function Cierres() {
  return (
    <div className="wrap page">
      <Link href="/catalogo/" className="back">
        ‹ Catálogo
      </Link>
      <header className="page-head">
        <h1 className="page-title">Cierres YKK</h1>
        <p className="page-note">
          Todos los modelos vienen en formato desmontable y fijo. Entrá a un modelo para ver sus
          presentaciones, medidas y precios.
        </p>
      </header>
      <div className="grid">
        {FAMILIAS.map((f) => (
          <FamilyCard key={f.slug} familia={f} priority />
        ))}
      </div>
    </div>
  );
}
