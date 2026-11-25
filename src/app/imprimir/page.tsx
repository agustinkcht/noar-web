import type { Metadata } from "next";
import { CATEGORIES, FAMILIAS, productsByCategory, type Product } from "@/data/catalogo";
import { SITE, thumbSrc } from "@/lib/config";
import { amount } from "@/lib/precios";

/**
 * Versión para imprimir o guardar en PDF (catálogo + lista de precios).
 * No está enlazada desde el sitio: abrí /imprimir/ y usá Imprimir → Guardar como PDF.
 */
export const metadata: Metadata = {
  title: "Catálogo y lista de precios",
  robots: { index: false, follow: false },
};

const fecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
}).format(new Date());

const LEGEND: Record<string, string> = {
  yute: "x1 = 1 a 11 u. · x12 = 12 u. o más del mismo producto.",
  "hilo-poliester": "Precio por unidad.",
  "hilo-elastico": "Precio por pack de 12 bobinas. x12 = desde 12 packs.",
  "hilo-encerado": "Precio por bobina de 70 m. x16 = desde 16 bobinas del mismo color.",
  cierres: "Precio por unidad según cantidad, por medida: x1 = 1 a 3 u. · x4 = 4 a 11 u. · x12 = 12 a 49 u. · x50 = 50 u. o más.",
};

function Photo({ id, alt, className }: { id?: string; alt: string; className: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return id ? <img src={thumbSrc(id)} alt={alt} className={className} /> : null;
}

/** Columnas de precio que tienen al menos un valor. */
function priceCols(p: Product) {
  return p.tiers.map((_, i) => i).filter((i) => p.variants.some((v) => v.prices[i] != null));
}

function SimpleProduct({ p }: { p: Product }) {
  const cols = priceCols(p);
  return (
    <div className="pdf-item">
      <Photo id={p.images[0]} alt={p.title} className="pdf-item-img" />
      <div className="pdf-item-info">
        <p className="pdf-item-name">{p.name}</p>
        <p className="pdf-muted">{p.subtitle}</p>
      </div>
      <table className="pdf-mini">
        <thead>
          <tr>
            {cols.map((i) => (
              <th key={i}>{p.tiers[i].label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {p.variants.map((v) => (
            <tr key={v.label}>
              {cols.map((i) => (
                <td key={i}>{v.prices[i] == null ? "—" : `$ ${amount(v.prices[i]!)}`}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EnceradoLine({ p }: { p: Product }) {
  const cols = priceCols(p);
  const prices = p.variants[0].prices;
  return (
    <div className="pdf-block">
      <div className="pdf-block-head">
        <div>
          <p className="pdf-item-name">{p.name}</p>
          <p className="pdf-muted">{p.subtitle}</p>
        </div>
        <p className="pdf-inline-prices">
          {cols.map((i) => (
            <span key={i}>
              <b>{p.tiers[i].label}</b> $ {amount(prices[i]!)}
            </span>
          ))}
        </p>
      </div>
      <div className="pdf-swatches">
        {p.variants.map((v) => (
          <div key={v.label} className="pdf-swatch">
            <Photo id={v.images?.[0]} alt={v.label} className="pdf-swatch-img" />
            <span>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CierreTable({ p }: { p: Product }) {
  const desl = p.deslizadores ?? [];
  return (
    <div className="pdf-formato">
      <p className="pdf-formato-name">{p.subtitle}</p>
      {desl.length > 1 && (
        <p className="pdf-muted pdf-desl">
          Deslizador:{" "}
          {desl
            .map((d) => {
              const cms = d.variants.map((i) => p.variants[i].label.replace(" cm", ""));
              return `${d.nombre} (${cms.length > 2 ? `${cms[0]} a ${cms[cms.length - 1]}` : cms.join(" y ")})`;
            })
            .join(" · ")}
        </p>
      )}
      <table className="pdf-table">
        <thead>
          <tr>
            <th>cm</th>
            {p.tiers.map((t) => (
              <th key={t.key}>{t.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {p.variants.map((v) => (
            <tr key={v.label}>
              <th>{v.label.replace(" cm", "")}</th>
              {v.prices.map((pr, i) => (
                <td key={i}>{pr == null ? "—" : amount(pr)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Imprimir() {
  return (
    <div className="pdf-doc">
      <section className="pdf-cover">
        <p className="pdf-mark">NOAR</p>
        <p className="pdf-tag">Mercería mayorista · Proveedor de avíos</p>
        <p className="pdf-cover-title">Catálogo y lista de precios</p>
        <p className="pdf-muted">Precios en pesos argentinos, actualizados al {fecha}.</p>
        <ol className="pdf-steps">
          <li>
            <b>Elegí los productos</b> en este catálogo.
          </li>
          <li>
            <b>Mirá cuánto te conviene llevar:</b> cuanto más cantidad, menor el precio por unidad.
          </li>
          <li>
            <b>Mandanos tu pedido por WhatsApp</b> y lo seguimos personalmente.
          </li>
        </ol>
        <p className="pdf-site">
          {SITE.url.replace("https://", "")}
          {SITE.whatsapp && <> · WhatsApp +{SITE.whatsapp}</>}
        </p>
      </section>

      {CATEGORIES.map((c, i) => (
        <section
          key={c.id}
          className={`pdf-section${i === 0 || c.id === "hilo-encerado" || c.id === "cierres" ? " pdf-newpage" : ""}`}
        >
          <h2 className="pdf-h2">{c.name}</h2>
          <p className="pdf-legend">{LEGEND[c.id]}</p>

          {c.id === "cierres" &&
            FAMILIAS.map((f) => (
              <div key={f.slug} className="pdf-family">
                <div className="pdf-family-head">
                  <Photo id={f.products[0]?.images[0]} alt={f.name} className="pdf-family-img" />
                  <h3 className="pdf-h3">Cierre YKK {f.name}</h3>
                </div>
                <div className="pdf-formatos">
                  {f.products.map((p) => (
                    <CierreTable key={p.slug} p={p} />
                  ))}
                </div>
              </div>
            ))}

          {c.id === "hilo-encerado" && productsByCategory(c.id).map((p) => <EnceradoLine key={p.slug} p={p} />)}

          {c.id !== "cierres" && c.id !== "hilo-encerado" && (
            <div className="pdf-items">
              {productsByCategory(c.id).map((p) => (
                <SimpleProduct key={p.slug} p={p} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
