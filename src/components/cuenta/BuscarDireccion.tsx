"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/config";

export type Direccion = {
  texto: string;
  localidad?: string;
  partido?: string;
  provincia?: string;
};

type GoogleMaps = {
  maps: {
    importLibrary: (n: string) => Promise<{
      PlaceAutocompleteElement: new (o: object) => HTMLElement;
    }>;
  };
};

let cargando: Promise<GoogleMaps> | null = null;

/** Carga Google Maps una sola vez. */
function cargarMaps(): Promise<GoogleMaps> {
  const w = window as unknown as { google?: GoogleMaps };
  if (w.google?.maps?.importLibrary) return Promise.resolve(w.google);
  cargando ??= new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${SITE.mapsKey}&loading=async&libraries=places&language=es&region=AR&callback=__noarMaps`;
    s.async = true;
    (window as unknown as Record<string, unknown>).__noarMaps = () => ok(w.google!);
    s.onerror = () => {
      cargando = null;
      mal(new Error("maps"));
    };
    document.head.appendChild(s);
  });
  return cargando;
}

type Componente = { types: string[]; longText: string };

/**
 * Buscador de direcciones de Google Maps (Places). Si no hay clave o no carga,
 * queda un campo de texto común y la zona se elige a mano.
 */
export function BuscarDireccion({ onElegir }: { onElegir: (d: Direccion) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<"maps" | "texto">(SITE.mapsKey ? "maps" : "texto");
  const [texto, setTexto] = useState("");
  const cb = useRef(onElegir);
  cb.current = onElegir;

  useEffect(() => {
    if (modo !== "maps") return;
    let el: HTMLElement | null = null;
    let vivo = true;
    cargarMaps()
      .then(async (g) => {
        const { PlaceAutocompleteElement } = await g.maps.importLibrary("places");
        if (!vivo || !box.current) return;
        el = new PlaceAutocompleteElement({ includedRegionCodes: ["ar"] });
        el.setAttribute("placeholder", "Calle y altura, localidad");
        el.addEventListener("gmp-select", async (ev: Event) => {
          const pred = (ev as unknown as { placePrediction: { toPlace: () => { fetchFields: (o: object) => Promise<void>; formattedAddress: string; addressComponents: Componente[] } } }).placePrediction;
          const place = pred.toPlace();
          await place.fetchFields({ fields: ["formattedAddress", "addressComponents"] });
          const c = (t: string) => place.addressComponents?.find((x) => x.types.includes(t))?.longText;
          cb.current({
            texto: place.formattedAddress,
            localidad: c("locality") ?? c("sublocality") ?? c("administrative_area_level_3"),
            partido: c("administrative_area_level_2"),
            provincia: c("administrative_area_level_1"),
          });
        });
        box.current.appendChild(el);
      })
      .catch(() => vivo && setModo("texto"));
    return () => {
      vivo = false;
      el?.remove();
    };
  }, [modo]);

  if (modo === "maps") return <div ref={box} className="maps-box" />;
  return (
    <input
      className="field"
      placeholder="Calle y altura, localidad"
      autoComplete="street-address"
      value={texto}
      onChange={(e) => {
        setTexto(e.target.value);
        cb.current({ texto: e.target.value });
      }}
    />
  );
}
