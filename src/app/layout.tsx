import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { SITE } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "NOIRE · Mercería mayorista", template: "%s · NOIRE" },
  description:
    "Cierres YKK, hilo elástico, hilo poliéster y yute a precio mayorista. Catálogo y lista de precios.",
  openGraph: {
    title: "NOIRE · Mercería mayorista",
    description: "Cierres YKK, hilos y avíos para confección a precio mayorista.",
    url: SITE.url,
    siteName: "NOIRE",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0e0e0f", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Inter+Tight:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <footer className="site-footer">
            <div className="wrap footer-inner">
              <span className="wordmark small">NOIRE</span>
              <nav className="footer-nav" aria-label="Pie">
                <Link href="/catalogo/">Catálogo</Link>
                <Link href="/precios/">Lista de precios</Link>
                {SITE.whatsapp && (
                  <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                )}
              </nav>
              <span className="muted small">Mercería mayorista · Buenos Aires</span>
            </div>
          </footer>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
