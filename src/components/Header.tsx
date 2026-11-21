"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/catalogo/", label: "Catálogo" },
  { href: "/precios/", label: "Lista de precios" },
];

export function Header() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="wordmark" aria-label="NOIRE, inicio">
          NOIRE
        </Link>
        <nav className="nav" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={pathname?.startsWith(n.href.slice(0, -1)) ? "active" : ""}
            >
              {n.label}
            </Link>
          ))}
          <button type="button" className="cart-btn" onClick={() => setOpen(true)}>
            Pedido
            <span className="cart-count" data-empty={count === 0}>
              {count}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
