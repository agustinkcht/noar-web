"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { money } from "@/lib/precios";
import { ESTADOS, sb, useSession, type Pedido } from "@/lib/supabase";

const dia = (s: string) =>
  new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(s));

type Fila = Pick<Pedido, "id" | "numero" | "creado" | "total" | "estado" | "nombre" | "items">;

export function MiCuenta() {
  const router = useRouter();
  const session = useSession();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardado, setGuardado] = useState("");
  const [pedidos, setPedidos] = useState<Fila[] | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (session === null) router.replace("/ingresar/?next=/cuenta/");
  }, [session, router]);

  useEffect(() => {
    const s = sb();
    if (!s || !session) return;
    const meta = session.user.user_metadata ?? {};
    s.from("perfiles")
      .select("nombre, telefono")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setNombre(data?.nombre || meta.full_name || meta.name || "");
        setTelefono(data?.telefono || "");
      });
    s.from("pedidos")
      .select("id, numero, creado, total, estado, nombre, items")
      .order("creado", { ascending: false })
      .limit(100)
      .then(({ data }) => setPedidos((data as Fila[]) ?? []));
    s.rpc("es_admin").then(({ data }) => setAdmin(Boolean(data)));
  }, [session]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const s = sb();
    if (!s || !session) return;
    const { error } = await s
      .from("perfiles")
      .upsert({ id: session.user.id, nombre: nombre.trim(), telefono: telefono.trim(), actualizado: new Date().toISOString() });
    setGuardado(error ? "No se pudo guardar." : "Guardado.");
    setTimeout(() => setGuardado(""), 2500);
  }

  async function salir() {
    await sb()?.auth.signOut();
    router.replace("/");
  }

  if (!session) return <p className="muted checkout-loading">Cargando…</p>;

  return (
    <div className="checkout">
      <header className="checkout-head">
        <h1 className="checkout-title">Mi cuenta</h1>
        <p className="muted small">{session.user.email}</p>
      </header>

      <section className="checkout-card" id="pedidos" aria-labelledby="mis-pedidos">
        <h2 id="mis-pedidos" className="co-h2">
          {admin ? "Todos los pedidos" : "Mis pedidos"}
        </h2>
        {pedidos === null ? (
          <p className="muted small">Cargando…</p>
        ) : pedidos.length === 0 ? (
          <p className="muted small">
            Todavía no hiciste pedidos. <Link href="/catalogo/" className="text-link">Ir al catálogo</Link>
          </p>
        ) : (
          <ul className="orders">
            {pedidos.map((p) => (
              <li key={p.id}>
                <Link href={`/pedido/?id=${p.id}`} className="order-row">
                  <span className="order-num">#{p.numero}</span>
                  <span className="order-main">
                    <span>{admin && p.nombre ? p.nombre : `${p.items.length} ${p.items.length === 1 ? "producto" : "productos"}`}</span>
                    <span className="muted small">{dia(p.creado)}</span>
                  </span>
                  <span className={`estado estado-${p.estado}`}>{ESTADOS[p.estado]}</span>
                  <span className="order-total">{money(p.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="checkout-card" aria-labelledby="mi-perfil">
        <h2 id="mi-perfil" className="co-h2">
          Mi perfil
        </h2>
        <form className="co-grid" onSubmit={guardar}>
          <label className="co-label">
            Nombre
            <input className="field" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label className="co-label">
            Teléfono
            <input className="field" type="tel" autoComplete="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </label>
          <div className="co-perfil-actions">
            <button type="submit" className="btn">
              Guardar
            </button>
            {guardado && <span className="muted small">{guardado}</span>}
          </div>
        </form>
      </section>

      <button type="button" className="link-btn co-salir" onClick={salir}>
        Cerrar sesión
      </button>
    </div>
  );
}
