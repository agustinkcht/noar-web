"use client";

import { useEffect, useRef, useState } from "react";
import { imageSources } from "@/lib/config";

type Props = {
  id?: string;
  alt: string;
  /** Texto que se muestra si la foto no carga. */
  fallback: string;
  /** Ancho con el que se muestra, para que el navegador elija 480 o 1200 px. */
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function ProductImage({ id, alt, fallback, sizes = "(min-width: 900px) 280px, 50vw", className, priority }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Si la foto falló antes de que React se enganche, el onError no llega a dispararse.
  useEffect(() => {
    setFailed(false);
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [id]);

  if (!id || failed) {
    return (
      <div className={`img-fallback ${className ?? ""}`} aria-label={alt}>
        <span>{fallback}</span>
      </div>
    );
  }

  const { src, srcSet, lqip } = imageSources(id);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      // La vista previa queda de fondo: se ve al instante y la foto la tapa al llegar.
      style={lqip ? { backgroundImage: `url(${lqip})`, backgroundSize: "cover" } : undefined}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
