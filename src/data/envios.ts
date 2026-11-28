/**
 * Envíos desde San Miguel (tarifario ML Flex, 28/11/2026).
 * Se busca primero la localidad y después el partido de la dirección.
 * Fuera de estas zonas el envío queda "a cotizar".
 */
export type Zona = { id: string; nombre: string; precio: number; lugares: string[] };

export const ZONAS: Zona[] = [
  { id: "z1", nombre: "Zona 1", precio: 4990, lugares: ["José C. Paz", "San Miguel"] },
  {
    id: "z2",
    nombre: "Zona 2",
    precio: 6990,
    lugares: [
      "Garín",
      "Hurlingham",
      "Ituzaingó",
      "Malvinas Argentinas",
      "Moreno",
      "Morón",
      "San Martín",
      "Tigre",
      "Tres de Febrero",
    ],
  },
  {
    id: "z3",
    nombre: "Zona 3",
    precio: 8990,
    lugares: [
      "CABA",
      "Almirante Brown",
      "Avellaneda",
      "Berazategui",
      "Berisso",
      "Campana",
      "Cañuelas",
      "Del Viso",
      "Derqui",
      "Ensenada",
      "Escobar",
      "Esteban Echeverría",
      "Exaltación de la Cruz",
      "Ezeiza",
      "Florencio Varela",
      "General Rodríguez",
      "Guernica",
      "Ingeniero Maschwitz",
      "La Matanza",
      "La Plata",
      "Lanús",
      "Lomas de Zamora",
      "Luján",
      "Marcos Paz",
      "Merlo",
      "Nordelta",
      "Pilar",
      "Presidente Perón",
      "Quilmes",
      "San Fernando",
      "San Isidro",
      "San Vicente",
      "Vicente López",
      "Villa Rosa",
      "Zárate",
    ],
  },
];

/** Bonificación: desde $60.000 se cobra la mitad; desde $120.000, gratis. */
export const MEDIO_ENVIO_DESDE = 60000;
export const ENVIO_GRATIS_DESDE = 120000;

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^(partido de|partido|ciudad de|ciudad autonoma de)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();

const ALIAS: Record<string, string> = {
  "buenos aires": "caba",
  "ciudad autonoma de buenos aires": "caba",
  "comuna 1": "caba",
  "general san martin": "san martin",
  "presidente derqui": "derqui",
  "jose clemente paz": "jose c. paz",
  "matanza": "la matanza",
};

/** Busca la zona para una lista de nombres (localidad, partido, provincia…), en ese orden. */
export function zonaPara(nombres: (string | undefined)[]): { zona: Zona; lugar: string } | null {
  for (const n of nombres) {
    if (!n) continue;
    let k = norm(n);
    k = ALIAS[k] ?? k;
    if (k.startsWith("comuna ")) k = "caba";
    for (const zona of ZONAS)
      for (const lugar of zona.lugares) if (norm(lugar) === k) return { zona, lugar };
  }
  return null;
}

/** Lo que paga el cliente por el envío según el subtotal de productos. */
export function costoEnvio(precio: number, subtotal: number) {
  if (subtotal >= ENVIO_GRATIS_DESDE) return { cobro: 0, nota: "Gratis" };
  if (subtotal >= MEDIO_ENVIO_DESDE) return { cobro: Math.round(precio / 2 / 10) * 10, nota: "Bonificado al 50%" };
  return { cobro: precio, nota: "" };
}

/** Todos los lugares, para elegir a mano si no se encuentra la dirección. */
export const LUGARES = ZONAS.flatMap((z) => z.lugares.map((l) => ({ lugar: l, zona: z }))).sort((a, b) =>
  a.lugar.localeCompare(b.lugar, "es"),
);
