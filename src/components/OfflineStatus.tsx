"use client";

import { useEffect, useState } from "react";

type Estado =
  | { tipo: "nada" }
  | { tipo: "bajando"; pct: number }
  | { tipo: "listo"; fecha: string }
  | { tipo: "error" };

/**
 * Registra el service worker (solo en producción) y muestra en el pie
 * si el sitio ya está guardado para usarse sin conexión.
 */
export function OfflineStatus() {
  const [estado, setEstado] = useState<Estado>({ tipo: "nada" });
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const sw = navigator.serviceWorker;

    const leerListo = async () => {
      try {
        const r = await caches.match("/__noar-ready");
        if (r) {
          const { fecha } = await r.json();
          setEstado({ tipo: "listo", fecha });
          return true;
        }
      } catch {}
      return false;
    };

    const onMsg = (e: MessageEvent) => {
      const d = e.data || {};
      if (d.tipo === "noar-progreso") {
        setEstado((s) =>
          s.tipo === "listo" ? s : { tipo: "bajando", pct: Math.min(99, Math.floor((d.hechos / d.total) * 100)) },
        );
      } else if (d.tipo === "noar-listo") {
        leerListo();
      }
    };
    sw.addEventListener("message", onMsg);

    leerListo();
    sw.register("/sw.js").then((reg) => {
      const vigilar = (w: ServiceWorker | null) => {
        w?.addEventListener("statechange", () => {
          if (w.state === "redundant") leerListo().then((ok) => !ok && setEstado({ tipo: "error" }));
          if (w.state === "activated") leerListo();
        });
      };
      vigilar(reg.installing);
      reg.addEventListener("updatefound", () => vigilar(reg.installing));
    }, () => setEstado({ tipo: "error" }));

    const upd = () => setOnline(navigator.onLine);
    upd();
    window.addEventListener("online", upd);
    window.addEventListener("offline", upd);
    return () => {
      sw.removeEventListener("message", onMsg);
      window.removeEventListener("online", upd);
      window.removeEventListener("offline", upd);
    };
  }, []);

  if (estado.tipo === "nada") return null;
  return (
    <p className="offline-status" role="status">
      <span className={`offline-dot ${estado.tipo}`} aria-hidden="true" />
      {estado.tipo === "bajando" && <>Guardando el sitio para usar sin conexión… {estado.pct}%</>}
      {estado.tipo === "listo" &&
        (online ? (
          <>Disponible sin conexión · precios al {estado.fecha}</>
        ) : (
          <>Sin conexión · mostrando precios al {estado.fecha}</>
        ))}
      {estado.tipo === "error" && <>No se pudo guardar todo para usar sin conexión. Se reintenta al recargar.</>}
    </p>
  );
}
