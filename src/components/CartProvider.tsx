"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/data/catalogo";
import { tierQty, unitPrice } from "@/lib/precios";

export type CartLine = { slug: string; variant: number; qty: number; desl?: number };

const same = (l: CartLine, slug: string, variant: number, desl: number) =>
  l.slug === slug && l.variant === variant && (l.desl ?? 0) === desl;

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, variant: number, qty: number, desl?: number) => void;
  setQty: (slug: string, variant: number, qty: number, desl?: number) => void;
  remove: (slug: string, variant: number, desl?: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "noire-pedido-v3"; // v3: yute 6/2 bobina solo en pack x10

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        setLines(parsed.filter((l) => getProduct(l.slug)?.variants[l.variant]));
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  const add = useCallback((slug: string, variant: number, qty: number, desl = 0) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => same(l, slug, variant, desl));
      if (i === -1) return [...prev, { slug, variant, qty, desl }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
  }, []);

  const setQty = useCallback((slug: string, variant: number, qty: number, desl = 0) => {
    setLines((prev) =>
      prev
        .map((l) => (same(l, slug, variant, desl) ? { ...l, qty } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((slug: string, variant: number, desl = 0) => {
    setLines((prev) => prev.filter((l) => !same(l, slug, variant, desl)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    let subtotal = 0;
    let count = 0;
    for (const l of lines) {
      const p = getProduct(l.slug);
      if (!p) continue;
      subtotal += unitPrice(p, l.variant, tierQty(lines, l.slug, l.variant)) * l.qty;
      count += l.qty;
    }
    return { lines, count, subtotal, open, setOpen, add, setQty, remove, clear };
  }, [lines, open, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart fuera de CartProvider");
  return c;
}
