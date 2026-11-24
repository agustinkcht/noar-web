import Link from "next/link";
import { HowTo } from "@/components/HowTo";

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

      <HowTo />
    </>
  );
}
