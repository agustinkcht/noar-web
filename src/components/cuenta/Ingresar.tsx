"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sb, useSession } from "@/lib/supabase";

/** Adónde volver después de entrar (solo rutas internas). */
function destino() {
  if (typeof window === "undefined") return "/cuenta/";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/cuenta/";
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export function Ingresar() {
  const router = useRouter();
  const session = useSession();
  const [paso, setPaso] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const codigoRef = useRef<HTMLInputElement>(null);

  // Ya logueado (o recién volvió de Google): seguir de largo.
  useEffect(() => {
    if (session) router.replace(destino());
  }, [session, router]);

  useEffect(() => {
    if (paso === "codigo") codigoRef.current?.focus();
  }, [paso]);

  async function google() {
    setError("");
    const s = sb();
    if (!s) return setError("El ingreso todavía no está activo.");
    const { error } = await s.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${destino()}` },
    });
    if (error) setError("No pudimos abrir Google. Probá de nuevo.");
  }

  async function enviarCodigo(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setAviso("");
    if (!emailOk(email)) return setError("Revisá el email.");
    const s = sb();
    if (!s) return setError("El ingreso todavía no está activo.");
    setEnviando(true);
    const { error } = await s.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setEnviando(false);
    if (error) {
      return setError(
        error.status === 429
          ? "Pediste muchos códigos seguidos. Esperá un minuto y probá de nuevo."
          : "No pudimos mandar el código. Probá de nuevo.",
      );
    }
    setPaso("codigo");
    setAviso(`Te mandamos un código a ${email.trim()}. Revisá también Spam o Promociones.`);
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!emailOk(email)) return setError("Primero escribí tu email.");
    const token = codigo.replace(/\D/g, "");
    if (token.length < 6) return setError("El código tiene 6 números.");
    const s = sb();
    if (!s) return;
    setEnviando(true);
    const { error } = await s.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    setEnviando(false);
    if (error) setError("El código no es válido o ya venció. Pedí uno nuevo.");
    // Si salió bien, onAuthStateChange actualiza la sesión y el efecto redirige.
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Iniciá sesión</h1>
      <p className="muted small auth-sub">Para crear tu pedido y verlo cuando quieras.</p>

      <button type="button" className="btn-pill" onClick={google}>
        <GoogleIcon />
        Ingresar con Google
      </button>

      <div className="auth-divider">
        <span>O usá tu email</span>
      </div>

      <div className="auth-mail-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </div>
      <h2 className="auth-h2">Ingresá con un código de acceso</h2>
      <p className="muted small auth-sub">Te enviamos un código a tu email. Sin contraseñas.</p>

      {paso === "email" ? (
        <form className="auth-form" onSubmit={enviarCodigo}>
          <label className="sr-only" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            className="field-pill"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Ingresá tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-pill-solid" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar código de acceso"}
          </button>
          <button
            type="button"
            className="btn-pill"
            onClick={() => (emailOk(email) ? setPaso("codigo") : setError("Escribí tu email y después el código."))}
          >
            Ya tengo un código
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={verificar}>
          <p className="auth-email-line">
            {email.trim()}{" "}
            <button type="button" className="link-btn" onClick={() => (setPaso("email"), setCodigo(""), setAviso(""))}>
              Cambiar
            </button>
          </p>
          <label className="sr-only" htmlFor="auth-code">
            Código
          </label>
          <input
            id="auth-code"
            ref={codigoRef}
            className="field-pill field-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="······"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <button type="submit" className="btn btn-pill-solid" disabled={enviando}>
            {enviando ? "Verificando…" : "Ingresar"}
          </button>
          <button type="button" className="btn-pill" onClick={() => enviarCodigo()} disabled={enviando}>
            Reenviar código
          </button>
        </form>
      )}

      {aviso && !error && <p className="auth-msg">{aviso}</p>}
      {error && (
        <p className="auth-msg auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
