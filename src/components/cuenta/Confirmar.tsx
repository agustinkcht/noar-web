"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { costoEnvio, ENVIO_GRATIS_DESDE, LUGARES, MEDIO_ENVIO_DESDE, zonaPara, ZONAS } from "@/data/envios";
import { CUENTAS_ACTIVAS, SITE } from "@/lib/config";
import { itemsDelCarrito } from "@/lib/pedido";
import { money } from "@/lib/precios";
import { pedidoUrl, sb, useSession, type Envio } from "@/lib/supabase";
import { useCart } from "../CartProvider";
import { ProductImage } from "../ProductImage";
import { BuscarDireccion, type Direccion } from "./BuscarDireccion";

const INTERIOR = "__interior";

export function Confirmar() {
  const router = useRouter();
  const session = useSession();
  const { lines, subtotal, clear, setOpen } = useCart();
  const items = useMemo(() => itemsDelCarrito(lines), [lines]);

  const [tipo, setTipo] = useState<Envio["tipo"]>("domicilio");
  const [dir, setDir] = useState<Direccion | null>(null);
  const [lugar, setLugar] = useState(""); // elegido a mano ("" = el que se detectó)
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [descartar, setDescartar] = useState(false);
  const [listo, setListo] = useState(false);

  // Sin sesión → a iniciar sesión y volver acá.
  useEffect(() => {
    if (session === null) router.replace("/ingresar/?next=/confirmar/");
  }, [session, router]);

  // Datos guardados del perfil (o los de Google).
  useEffect(() => {
    if (!session) return;
    const meta = session.user.user_metadata ?? {};
    sb()
      ?.from("perfiles")
      .select("nombre, telefono")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setNombre((n) => n || data?.nombre || meta.full_name || meta.name || "");
        setTelefono((t) => t || data?.telefono || "");
      });
  }, [session]);

  // Zona: la que eligió a mano, o la que sale de la dirección.
  const detectada = useMemo(() => {
    if (!dir) return null;
    const prov = dir.provincia ?? "";
    const esCaba = /aut[oó]noma/i.test(prov);
    return zonaPara([dir.localidad, dir.partido, esCaba ? "CABA" : undefined]);
  }, [dir]);
  const fueraDeBA = !!dir?.provincia && !/buenos aires|aut[oó]noma/i.test(dir.provincia);
  const lugarFinal = lugar || (detectada ? detectada.lugar : fueraDeBA ? INTERIOR : "");
  const zona = lugarFinal && lugarFinal !== INTERIOR ? zonaPara([lugarFinal])?.zona ?? null : null;

  const envio: Envio = useMemo(() => {
    if (tipo === "coordinar") return { tipo, cobro: 0, precio: 0, nota: "A coordinar por WhatsApp" };
    if (!zona) return { tipo, direccion: dir?.texto, lugar: lugarFinal === INTERIOR ? "Interior" : lugarFinal || undefined, precio: null, cobro: null, nota: "A cotizar" };
    const c = costoEnvio(zona.precio, subtotal);
    return { tipo, direccion: dir?.texto, lugar: lugarFinal, zona: zona.nombre, precio: zona.precio, cobro: c.cobro, nota: c.nota };
  }, [tipo, zona, dir, lugarFinal, subtotal]);

  const total = subtotal + (envio.cobro ?? 0);

  async function confirmar() {
    setError("");
    if (!nombre.trim()) return setError("Falta tu nombre.");
    if (telefono.replace(/\D/g, "").length < 8) return setError("Falta un teléfono para coordinar la entrega.");
    if (tipo === "domicilio" && !dir?.texto?.trim()) return setError("Falta la dirección de envío.");
    if (tipo === "domicilio" && !lugarFinal) return setError("Elegí la localidad o partido de la dirección.");
    const s = sb();
    if (!s || !session) return;

    // Se abre ya (dentro del toque) para que el navegador no la bloquee; después se le pone el link.
    const wa = window.open("", "_blank");
    setEnviando(true);
    const { data, error } = await s
      .from("pedidos")
      .insert({
        email: session.user.email,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        items: items.map(({ escalon: _e, ...i }) => i),
        subtotal,
        envio,
        envio_cobro: envio.cobro,
        total,
        nota: nota.trim() || null,
      })
      .select("id, numero")
      .single();
    if (error || !data) {
      setEnviando(false);
      wa?.close();
      return setError("No pudimos crear el pedido. Revisá la conexión y probá de nuevo.");
    }
    await s.from("perfiles").upsert({ id: session.user.id, nombre: nombre.trim(), telefono: telefono.trim(), actualizado: new Date().toISOString() });

    const texto = `¡Hola NOAR! Quiero hacer este pedido: ${pedidoUrl(data.id)}`;
    const href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
    if (wa) wa.location.href = href;
    setListo(true);
    clear();
    router.replace(`/pedido/?id=${data.id}&nuevo=1${wa ? "" : "&wa=1"}`);
  }

  if (!CUENTAS_ACTIVAS) {
    return (
      <div className="checkout-empty">
        <p>Todavía no se pueden crear pedidos desde la web.</p>
        <Link href="/catalogo/" className="btn">
          Ir al catálogo
        </Link>
      </div>
    );
  }
  if (!session) return <p className="muted checkout-loading">Cargando…</p>;
  if (!items.length && !listo) {
    return (
      <div className="checkout-empty">
        <p>Tu pedido está vacío.</p>
        <Link href="/catalogo/" className="btn">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const faltaMedio = MEDIO_ENVIO_DESDE - subtotal;
  const faltaGratis = ENVIO_GRATIS_DESDE - subtotal;

  return (
    <div className="checkout">
      <header className="checkout-head">
        <h1 className="checkout-title">Revisá y confirmá tu pedido</h1>
        <p className="muted">Revisá los productos y los datos de entrega antes de confirmar.</p>
      </header>

      <section className="checkout-card" aria-label="Productos">
        <div className="co-row co-row-head" aria-hidden="true">
          <span>Producto</span>
          <span>Unitario</span>
          <span>Cant.</span>
          <span>Subtotal</span>
        </div>
        <ul className="co-items">
          {items.map((i) => (
            <li key={`${i.slug}-${i.variant}-${i.desl}`} className="co-row">
              <div className="co-prod">
                <Link href={`/catalogo/${i.slug}/`} className="line-img">
                  <ProductImage id={i.foto} alt={i.nombre} fallback={i.nombre} sizes="64px" />
                </Link>
                <div className="co-prod-text">
                  <p className="co-name">{i.nombre}</p>
                  {i.escalon && <span className="tier-chip">{i.escalon}</span>}
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
        <div className="co-total-line">
          <span>Subtotal productos</span>
          <strong>{money(subtotal)}</strong>
        </div>
      </section>

      <section className="checkout-card" aria-labelledby="co-envio">
        <h2 id="co-envio" className="co-h2">
          Envío
        </h2>
        <div className="segmented co-seg" role="radiogroup" aria-label="Tipo de entrega">
          <button type="button" role="radio" aria-checked={tipo === "domicilio"} onClick={() => setTipo("domicilio")}>
            Envío a domicilio
          </button>
          <button type="button" role="radio" aria-checked={tipo === "coordinar"} onClick={() => setTipo("coordinar")}>
            Lo coordino por WhatsApp
          </button>
        </div>

        {tipo === "domicilio" ? (
          <div className="co-fields">
            <label className="co-label">
              Dirección
              <BuscarDireccion
                onElegir={(d) => {
                  setDir(d);
                  // Si vino de Google Maps, la zona se recalcula sola.
                  if (d.localidad || d.partido || d.provincia) setLugar("");
                }}
              />
            </label>
            <label className="co-label">
              Localidad o partido
              <select className="field" value={lugarFinal} onChange={(e) => setLugar(e.target.value)}>
                <option value="">Elegí…</option>
                {ZONAS.length > 0 &&
                  LUGARES.map((l) => (
                    <option key={l.lugar} value={l.lugar}>
                      {l.lugar}
                    </option>
                  ))}
                <option value={INTERIOR}>Otro / interior del país</option>
              </select>
            </label>
            <div className="co-envio-res">
              {!lugarFinal ? (
                <p className="muted small">Buscá la dirección o elegí la localidad para ver el costo.</p>
              ) : zona ? (
                <>
                  <p>
                    {lugarFinal} · {zona.nombre}
                    <span className="co-envio-precio">
                      {envio.cobro === 0 ? (
                        <>
                          <s>{money(zona.precio)}</s> Gratis
                        </>
                      ) : envio.cobro !== zona.precio ? (
                        <>
                          <s>{money(zona.precio)}</s> {money(envio.cobro!)}
                        </>
                      ) : (
                        money(zona.precio)
                      )}
                    </span>
                  </p>
                  <p className="muted small">
                    {envio.nota === "Gratis"
                      ? "Tu pedido tiene envío gratis."
                      : envio.nota
                        ? `Bonificamos la mitad del envío. Te faltan ${money(faltaGratis)} para que sea gratis.`
                        : `Desde ${money(MEDIO_ENVIO_DESDE)} bonificamos la mitad (te faltan ${money(faltaMedio)}) y desde ${money(ENVIO_GRATIS_DESDE)} es gratis.`}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Envío a cotizar<span className="co-envio-precio">—</span>
                  </p>
                  <p className="muted small">
                    Fuera de nuestras zonas de reparto. Te pasamos el costo por WhatsApp antes de despachar.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="muted small co-fields">Acordamos retiro o envío por WhatsApp cuando nos mandes el pedido.</p>
        )}
      </section>

      <section className="checkout-card" aria-labelledby="co-datos">
        <h2 id="co-datos" className="co-h2">
          Tus datos
        </h2>
        <div className="co-grid">
          <label className="co-label">
            Nombre
            <input className="field" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label className="co-label">
            Teléfono
            <input
              className="field"
              type="tel"
              autoComplete="tel"
              placeholder="11 2345-6789"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </label>
        </div>
        <label className="co-label">
          Nota (opcional)
          <textarea className="field" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} />
        </label>
        <p className="muted small">{session.user.email}</p>
      </section>

      <section className="checkout-card co-summary">
        <div className="co-total-line co-muted-line">
          <span>Subtotal productos</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="co-total-line co-muted-line">
          <span>Envío</span>
          <span>{tipo === "domicilio" && !lugarFinal ? "—" : envio.cobro == null ? "A cotizar" : envio.cobro === 0 ? (tipo === "coordinar" ? "A coordinar" : "Gratis") : money(envio.cobro)}</span>
        </div>
        <div className="co-total-line co-grand">
          <span>Total</span>
          <strong>{money(total)}</strong>
        </div>

        {error && (
          <p className="auth-msg auth-error" role="alert">
            {error}
          </p>
        )}
        <div className="co-actions">
          <button type="button" className="btn btn-send" onClick={confirmar} disabled={enviando}>
            {enviando ? "Creando pedido…" : "Confirmar pedido"}
          </button>
          <div className="co-actions-sec">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>
              Editar pedido
            </button>
            <button
              type="button"
              className={`btn btn-ghost btn-clear${descartar ? " confirm" : ""}`}
              onClick={() => (descartar ? (clear(), router.push("/catalogo/")) : setDescartar(true))}
              onBlur={() => setDescartar(false)}
            >
              {descartar ? "¿Descartar todo?" : "Descartar"}
            </button>
          </div>
        </div>
        <p className="muted small co-foot">
          Al confirmar se abre WhatsApp con el link de tu pedido para mandárnoslo.
        </p>
      </section>
    </div>
  );
}
