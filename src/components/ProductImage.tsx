"use client";

import { useEffect, useRef, useState } from "react";
import { imageUrl } from "@/lib/config";

type Props = {
  id?: string;
  alt: string;
  /** Texto que se muestra si la foto no carga. */
  fallback: string;
  width?: number;
  className?: string;
  priority?: boolean;
};

export function ProductImage({ id, alt, fallback, width = 800, className, priority }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Si la foto falló antes de que React se enganche, el onError no llega a dispararse.
  useEffect(() => {
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

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={imageUrl(id, width)}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
