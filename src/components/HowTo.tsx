import Link from "next/link";

const STEPS = [
  {
    title: "Explorá el catálogo",
    text: "Mirá todos los productos que tenemos disponibles, con sus medidas, colores y presentaciones.",
    link: { href: "/catalogo/", label: "Ver catálogo" },
  },
  {
    title: "Mirá la lista de precios",
    text: "Cuanto más llevás, menos pagás por unidad. Fijate qué cantidad te conviene según lo que necesitás.",
    link: { href: "/precios/", label: "Ver precios" },
  },
  {
    title: "Armá tu pedido",
    text: "Elegí en el catálogo los productos y la cantidad de cada uno. El precio se ajusta solo.",
  },
  {
    title: "Envianos tu pedido",
    text: "Lo mandás por WhatsApp con un toque y seguimos la conversación personalmente.",
  },
];

/** Guía de compra debajo del hero. `variant`: tarjetas o pasos sobre una línea. */
export function HowTo({ variant = "cards" }: { variant?: "cards" | "steps" }) {
  return (
    <section className="howto" aria-labelledby="howto-title">
      <div className="wrap">
        <header className="howto-head">
          <p className="eyebrow">Cómo comprar</p>
          <h2 id="howto-title" className="howto-title">
            Tu pedido en cuatro pasos
          </h2>
        </header>
        <ol className={variant === "cards" ? "howto-cards" : "howto-steps"}>
          {STEPS.map((s, i) => (
            <li key={s.title} className="howto-item">
              <span className="howto-num" aria-hidden="true">
                {variant === "cards" ? String(i + 1).padStart(2, "0") : i + 1}
              </span>
              <div className="howto-body">
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
                {s.link && (
                  <Link href={s.link.href} className="howto-link">
                    {s.link.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
