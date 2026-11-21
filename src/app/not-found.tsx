import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page empty-page">
      <h1 className="page-title">No encontramos esta página</h1>
      <p className="muted">Puede que el producto haya cambiado de nombre.</p>
      <Link href="/catalogo/" className="btn">
        Ir al catálogo
      </Link>
    </div>
  );
}
