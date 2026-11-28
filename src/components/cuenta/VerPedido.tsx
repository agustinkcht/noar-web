"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/config";
import { money } from "@/lib/precios";
import { ESTADOS, pedidoUrl, sb, useSession, type Pedido } from "@/lib/supabase";
import { ProductImage } from "../ProductImage";

const fecha = (s: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(s));

export function VerPedido() {
  const router = useRouter();
  const session = useSession();
  const [id, setId] = useState<string | null>(null);
  const [flags, setFlags] = useState({ nuevo: false, wa: false });
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);
  const [admin, setAdmin] = useState(false);
  const [cancelar, setCancelar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setId(q.get("id"));
    setFlags({ nuevo: q.has("nuevo"), wa: q.has("wa") });
  }, []);

  useEffect(() => {
    if (session === null && id) router.replace(`/ingresar/?next=${encodeURIComponent(`/pedido/?id=${id}`)}`);
  }, [session, id, router]);

  useEffect(() => {
    const s = sb();
    if (!s || !session || !id) return;
    s.from("pedidos")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setPedido((data as Pedido) ?? null));
    s.rpc("es_admin").then(({ data }) => setAdmin(Boolean(data)));
  }, [session, id]);

  async function cambiarEstado(estado: Pedido["estado"]) {
    const s = sb();
    if (!s || !pedido) return;
    setGuardando(true);
    const { data } = await s.from("pedidos").update({ estado }).eq("id", pedido.id).select("*").single();
    setGuardando(false);
    if (data) setPedido(data as Pedido);
    setCancelar(false);
  }

  if (!id) return <p className="muted checkout-loading">Falta el número de pedido en el link.</p>;
  if (!session || pedido === undefined) return <p className="muted checkout-loading">Cargando pedido…</p>;
  if (pedido === null)
    return (
      <div className="checkout-empty">
        <p>No encontramos este pedido en tu cuenta.</p>
        <p className="muted small">Si te lo pasaron por link, entrá con la cuenta con la que se hizo.</p>
        <Link href="/cuenta/" className="btn">
          Mis pedidos
        </Link>
      </div>
    );

  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`¡Hola NOAR! Quiero hacer este pedido: ${pedidoUrl(pedido.id)}`)}`;
  const esMio = pedido.email === session.user.email;
  const envio = pedido.envio;

  return (
    <div className="checkout">
      {flags.nuevo && (
        <div className="co-banner" role="status">
          <p>
            <strong>¡Pedido creado!</strong> {flags.wa ? "Mandanos el link por WhatsApp para que lo veamos." : "Si no se abrió WhatsApp, mandanos el link desde acá."}
          </p>
          <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">
            Enviar por WhatsApp
          </a>
        </div>
      )}

      <header className="checkout-head">
        <p className="eyebrow">Pedido #{pedido.numero}</p>
        <h1 className="checkout-title">
          {pedido.nombre ? `Pedido de ${pedido.nombre.split(" ")[0]}` : "Tu pedido"}
          <span className={`estado estado-${pedido.estado}`}>{ESTADOS[pedido.estado]}</span>
        </h1>
        <p className="muted small">Creado el {fecha(pedido.creado)}</p>
      </header>

      <section className="checkout-card" aria-label="Productos">
        <div className="co-row co-row-head" aria-hidden="true">
          <span>Producto</span>
          <span>Unitario</span>
          <span>Cant.</span>
          <span>Subtotal</span>
        </div>
        <ul className="co-items">
          {pedido.items.map((i, n) => (
            <li key={n} className="co-row">
              <div className="co-prod">
                <Link href={`/catalogo/${i.slug}/`} className="line-img">
                  <ProductImage id={i.foto} alt={i.nombre} fallback={i.nombre} sizes="64px" />
                </Link>
                <div className="co-prod-text">
                  <p className="co-name">{i.nombre}</p>
                </div>
              </div>
              <span className="co-num" data-label="Unitario">
                {money(i.unitario)}
              </span>
              <span className="co-num" data-label="Cantidad">
                {i.cantidad}
              </span>
              <span className="co-num co-sub" data-label="Subtotal">
                {money(i.subtotal)}
              </span>
            </li>
          ))}
        </ul>
        <div className="co-total-line co-muted-line">
          <span>Subtotal productos</span>
          <span>{money(pedido.subtotal)}</span>
        </div>
        <div className="co-total-line co-muted-line">
          <span>
            Envío
            {envio?.tipo === "domicilio" && envio.lugar ? ` a ${envio.lugar}` : ""}
            {envio?.nota && envio.nota !== "A cotizar" && envio.nota !== "Gratis" ? ` (${envio.nota.toLowerCase()})` : ""}
          </span>
          <span>
            {pedido.envio_cobro == null
              ? "A cotizar"
              : pedido.envio_cobro === 0
                ? envio?.tipo === "coordinar"
                  ? "A coordinar"
                  : "Gratis"
                : money(pedido.envio_cobro)}
          </span>
        </div>
        <div className="co-total-line co-grand">
          <span>Total</span>
          <strong>{money(pedido.total)}</strong>
        </div>
      </section>

      <section className="checkout-card co-datos-ver">
        <h2 className="co-h2">Entrega y contacto</h2>
        <dl className="co-dl">
          <div>
            <dt>Entrega</dt>
            <dd>{envio?.tipo === "coordinar" ? "A coordinar por WhatsApp" : envio?.direccion || "—"}</dd>
          </div>
          <div>
            <dt>Nombre</dt>
            <dd>{pedido.nombre || "—"}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{pedido.telefono || "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{pedido.email || "—"}</dd>
          </div>
          {pedido.nota && (
            <div>
              <dt>Nota</dt>
              <dd>{pedido.nota}</dd>
            </div>
          )}
        </dl>
      </section>

      <div className="co-actions co-actions-ver">
        {admin ? (
          <label className="co-label co-admin">
            Estado del pedido
            <select
              className="field"
              value={pedido.estado}
              disabled={guardando}
              onChange={(e) => cambiarEstado(e.target.value as Pedido["estado"])}
            >
              {Object.entries(ESTADOS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {esMio && pedido.estado === "pendiente" && (
          <div className="co-actions-sec">
            <a className="btn btn-ghost" href={wa} target="_blank" rel="noopener noreferrer">
              Enviar por WhatsApp
            </a>
            <button
              type="button"
              className={`btn btn-ghost btn-clear${cancelar ? " confirm" : ""}`}
              onClick={() => (cancelar ? cambiarEstado("cancelado") : setCancelar(true))}
              onBlur={() => setCancelar(false)}
              disabled={guardando}
            >
              {cancelar ? "¿Cancelar el pedido?" : "Cancelar pedido"}
            </button>
          </div>
        )}
        <Link href="/cuenta/" className="text-link small">
          {admin ? "Todos los pedidos" : "Mis pedidos"}
        </Link>
      </div>
    </div>
  );
}
