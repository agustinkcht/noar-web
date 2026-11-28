"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sb, useSession } from "@/lib/supabase";

/** Ícono de perfil en el header: ingresar/registrarse, o mi perfil y mis pedidos. */
export function AccountMenu() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const fuera = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const meta = session?.user.user_metadata ?? {};
  const inicial = ((meta.full_name || meta.name || session?.user.email || "") as string).trim().charAt(0).toUpperCase();
  const volver = pathname && !pathname.startsWith("/ingresar") ? `?next=${encodeURIComponent(pathname)}` : "";

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className="account-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={session ? "Mi cuenta" : "Iniciar sesión"}
        data-on={Boolean(session)}
        onClick={() => setOpen((o) => !o)}
      >
        {session && inicial ? (
          inicial
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c1.6-3.6 4.6-5 8-5s6.4 1.4 8 5" />
          </svg>
        )}
      </button>
      {open && (
        <div className="account-menu" role="menu">
          {session ? (
            <>
              <p className="account-email">{session.user.email}</p>
              <Link role="menuitem" href="/cuenta/">
                Mi perfil
              </Link>
              <Link role="menuitem" href="/cuenta/#pedidos">
                Mis pedidos
              </Link>
              <button
                role="menuitem"
                type="button"
                onClick={async () => {
                  await sb()?.auth.signOut();
                  setOpen(false);
                  router.refresh();
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link role="menuitem" href={`/ingresar/${volver}`}>
                Iniciar sesión
              </Link>
              <Link role="menuitem" href={`/ingresar/${volver}`}>
                Registrarte
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
