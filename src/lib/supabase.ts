"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { CUENTAS_ACTIVAS, SITE } from "./config";

let client: SupabaseClient | null = null;

/** Cliente de Supabase (null si todavía no está configurado). */
export function sb() {
  if (!CUENTAS_ACTIVAS || typeof window === "undefined") return null;
  client ??= createClient(SITE.supabaseUrl, SITE.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
  });
  return client;
}

/** Sesión actual: undefined mientras carga, null si no hay nadie logueado. */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    const s = sb();
    if (!s) return setSession(null);
    s.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = s.auth.onAuthStateChange((_e, sess) => setSession(sess));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

export type ItemPedido = {
  slug: string;
  variant: number;
  desl: number;
  nombre: string;
  foto?: string;
  cantidad: number;
  unitario: number;
  subtotal: number;
};

export type Envio = {
  tipo: "domicilio" | "coordinar";
  direccion?: string;
  lugar?: string;
  zona?: string;
  precio?: number | null; // null = a cotizar
  cobro?: number | null;
  nota?: string;
};

export type Pedido = {
  id: string;
  numero: number;
  email: string | null;
  nombre: string | null;
  telefono: string | null;
  items: ItemPedido[];
  subtotal: number;
  envio: Envio | null;
  envio_cobro: number | null;
  total: number;
  nota: string | null;
  estado: "pendiente" | "confirmado" | "concretado" | "cancelado";
  creado: string;
};

export const ESTADOS: Record<Pedido["estado"], string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  concretado: "Concretado",
  cancelado: "Cancelado",
};

export const pedidoUrl = (id: string) => `${SITE.url}/pedido/?id=${id}`;
