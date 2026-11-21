import type { Metadata } from "next";
import { PriceList } from "@/components/PriceList";

export const metadata: Metadata = {
  title: "Lista de precios",
  description: "Lista de precios mayorista de NOIRE: cierres YKK por medida y cantidad, hilos y yute.",
};

export default function Precios() {
  return (
    <div className="wrap page">
      <header className="page-head">
        <h1 className="page-title">Lista de precios</h1>
        <p className="muted">Precios por unidad en pesos argentinos.</p>
      </header>
      <PriceList />
    </div>
  );
}
