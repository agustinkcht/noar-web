/**
 * Catálogo NOIRE.
 *
 * Precios de cierres: planilla "NOIRE Precios IA 09/26" (hoja Lista IA).
 * Precios de hilos: planilla "NOIRE · Precios Hilos (Corona, Yute, Encerados)" (hoja Precios NOIRE).
 * Fotos: carpeta de Drive "NOAR - Catálogo Web" (se guarda el ID de cada archivo).
 *
 * Para actualizar un precio, cambiá el número en la tabla que corresponda.
 */

export type CategoryId = "cierres" | "hilo-elastico" | "hilo-poliester" | "yute";

export type Tier = {
  key: string;
  label: string;
  /** Cantidad mínima (por producto y medida) para que aplique este precio. */
  min: number;
  rango: string;
};

export type Variant = {
  label: string;
  /** Un precio por cada tier del producto. null = no se vende en ese tier. */
  prices: (number | null)[];
  /** Fotos propias de esta variante (ej. yute 6/2 unidad vs pack x10). */
  images?: string[];
};

export type Product = {
  slug: string;
  category: CategoryId;
  /** Familia (solo cierres). */
  family?: string;
  /** Nombre completo, como va en el pedido. */
  name: string;
  /** Título corto para la tarjeta. */
  title: string;
  subtitle: string;
  unit: string;
  variantName: string;
  tiers: Tier[];
  variants: Variant[];
  images: string[];
};

export const CATEGORIES: { id: CategoryId; name: string; blurb: string }[] = [
  { id: "cierres", name: "Cierres YKK", blurb: "8 familias · desmontables y fijos" },
  { id: "yute", name: "Hilo de yute", blurb: "Corona · bobinas, cono y rollos" },
  { id: "hilo-poliester", name: "Hilo poliéster", blurb: "Cucito · cofre surtido" },
  { id: "hilo-elastico", name: "Hilo elástico", blurb: "Corona · blanco y negro" },
];

/** Orden en que se muestran las familias de cierres (2 filas de 4). */
const ORDEN_FAMILIAS = [
  "Poliéster Reforzado",
  "Vislon Diente de Perro",
  "Aluminio",
  "Metal Black Oxide",
  "Metal Plata Níquel",
  "Empavonado Níquel",
  "Metal Bronce Dorado",
  "Empavonado Bronce",
];

/* ---------- Tiers ---------- */

const TIERS_CIERRES: Tier[] = [
  { key: "x1", label: "x1", min: 1, rango: "1 a 3 u." },
  { key: "x4", label: "x4", min: 4, rango: "4 a 11 u." },
  { key: "x12", label: "x12", min: 12, rango: "12 a 49 u." },
  { key: "x50", label: "x50", min: 50, rango: "50 u. o más" },
];

const TIERS_YUTE: Tier[] = [
  { key: "x1", label: "x1", min: 1, rango: "1 a 11 u." },
  { key: "x12", label: "x12", min: 12, rango: "12 u. o más" },
];

const TIER_UNICO: Tier[] = [{ key: "u", label: "Precio", min: 1, rango: "Precio único" }];

/* ---------- Tablas de precios de cierres: [medida cm, x1, x4, x12, x50] ---------- */

type Row = [number, number, number, number, number];

const POLIESTER_DESM: Row[] = [
  [25, 2110, 1580, 1260, 1130], [30, 2150, 1610, 1290, 1160], [35, 2190, 1640, 1310, 1180],
  [40, 2210, 1660, 1330, 1200], [45, 2270, 1700, 1360, 1220], [50, 2320, 1740, 1390, 1250],
  [55, 2370, 1780, 1420, 1280], [60, 2400, 1800, 1440, 1300], [65, 2450, 1840, 1470, 1320],
  [70, 2510, 1880, 1500, 1350], [75, 2710, 2030, 1620, 1460], [80, 2910, 2180, 1740, 1570],
  [85, 2990, 2240, 1790, 1610], [90, 3610, 2710, 2170, 1950], [95, 3800, 2850, 2280, 2050],
  [100, 4190, 3140, 2510, 2260],
];
const POLIESTER_FIJO: Row[] = [
  [12, 800, 600, 480, 430], [14, 870, 650, 520, 470], [16, 910, 680, 540, 490],
  [18, 920, 690, 550, 500], [20, 990, 740, 590, 530], [22, 1050, 790, 630, 570],
  [25, 1120, 840, 670, 600], [30, 1190, 890, 710, 640], [35, 1250, 940, 750, 680],
  [40, 1390, 1040, 830, 750], [45, 1510, 1130, 900, 810], [50, 1750, 1310, 1050, 940],
];
const VISLON_DESM: Row[] = [
  [25, 2610, 1960, 1570, 1410], [30, 2670, 2000, 1600, 1440], [35, 2720, 2040, 1630, 1470],
  [40, 2790, 2090, 1670, 1500], [45, 2840, 2130, 1700, 1530], [50, 2880, 2160, 1730, 1560],
  [55, 3080, 2310, 1850, 1660], [60, 3150, 2360, 1890, 1700], [65, 3210, 2410, 1930, 1740],
  [70, 3410, 2560, 2050, 1840], [75, 3480, 2610, 2090, 1880], [80, 3570, 2680, 2140, 1930],
  [85, 3730, 2800, 2240, 2020], [90, 3770, 2830, 2260, 2030], [95, 3990, 2990, 2390, 2150],
  [100, 4320, 3240, 2590, 2330],
];
const VISLON_FIJO: Row[] = [
  [12, 1200, 900, 720, 650], [14, 1250, 940, 750, 680], [16, 1310, 980, 780, 700],
  [18, 1370, 1030, 820, 740], [20, 1400, 1050, 840, 760], [22, 1520, 1140, 910, 820],
  [25, 1600, 1200, 960, 860], [30, 1730, 1300, 1040, 940], [35, 1850, 1390, 1110, 1000],
  [40, 2070, 1550, 1240, 1120], [45, 2270, 1700, 1360, 1220], [50, 2480, 1860, 1490, 1340],
];
const ALUMINIO_DESM: Row[] = [
  [25, 2910, 2180, 1740, 1570], [30, 2970, 2230, 1780, 1600], [35, 3040, 2280, 1820, 1640],
  [40, 3080, 2310, 1850, 1660], [45, 3320, 2490, 1990, 1790], [50, 3390, 2540, 2030, 1830],
  [55, 3610, 2710, 2170, 1950], [60, 3680, 2760, 2210, 1990], [65, 3930, 2950, 2360, 2120],
  [70, 4010, 3010, 2410, 2170], [75, 4110, 3080, 2460, 2210], [80, 4190, 3140, 2510, 2260],
  [85, 4400, 3300, 2640, 2380], [90, 4600, 3450, 2760, 2480], [95, 4840, 3630, 2900, 2610],
  [100, 5320, 3990, 3190, 2870],
];
const ALUMINIO_FIJO: Row[] = [
  [12, 1270, 950, 760, 680], [14, 1330, 1000, 800, 720], [16, 1390, 1040, 830, 750],
  [18, 1470, 1100, 880, 790], [20, 1510, 1130, 900, 810], [22, 1550, 1160, 930, 840],
  [25, 1650, 1240, 990, 890], [30, 1800, 1350, 1080, 970], [35, 1950, 1460, 1170, 1050],
  [40, 2150, 1610, 1290, 1160], [45, 2370, 1780, 1420, 1280], [50, 2640, 1980, 1580, 1420],
];
/** RN (Metal Plata Níquel) y RG (Metal Bronce Dorado). */
const RN_RG_DESM: Row[] = [
  [25, 4320, 3240, 2590, 2330], [30, 4390, 3290, 2630, 2370], [35, 4470, 3350, 2680, 2410],
  [40, 4530, 3400, 2720, 2450], [45, 4920, 3690, 2950, 2660], [50, 5320, 3990, 3190, 2870],
  [55, 5410, 4060, 3250, 2920], [60, 5800, 4350, 3480, 3130], [65, 5970, 4480, 3580, 3220],
  [70, 6080, 4560, 3650, 3280], [75, 6200, 4650, 3720, 3350], [80, 6330, 4750, 3800, 3420],
  [85, 6600, 4950, 3960, 3560], [90, 7590, 5690, 4550, 4100], [95, 7970, 5980, 4780, 4300],
  [100, 8770, 6580, 5260, 4730],
];
const RN_RG_FIJO: Row[] = [
  [12, 1640, 1230, 980, 880], [14, 1680, 1260, 1010, 910], [16, 1790, 1340, 1070, 960],
  [18, 1840, 1380, 1100, 990], [20, 1970, 1480, 1180, 1060], [22, 2040, 1530, 1220, 1100],
  [25, 2270, 1700, 1360, 1220], [30, 2610, 1960, 1570, 1410], [35, 2990, 2240, 1790, 1610],
  [40, 3280, 2460, 1970, 1770], [45, 3640, 2730, 2180, 1960], [50, 3840, 2880, 2300, 2070],
];
const RN_RG_FIJO_C4: Row[] = [
  [10, 1190, 890, 710, 640], [12, 1280, 960, 770, 690], [14, 1350, 1010, 810, 730],
  [16, 1450, 1090, 870, 780], [18, 1510, 1130, 900, 810], [20, 1590, 1190, 950, 860],
  [25, 1840, 1380, 1100, 990],
];
/** RGKB (Empavonado Bronce), RGTH (Empavonado Níquel) y RGK (Metal Black Oxide). */
const RGK_DESM: Row[] = [
  [25, 5320, 3990, 3190, 2870], [30, 5410, 4060, 3250, 2920], [35, 5530, 4150, 3320, 2990],
  [40, 5650, 4240, 3390, 3050], [45, 6070, 4550, 3640, 3280], [50, 6190, 4640, 3710, 3340],
  [55, 6640, 4980, 3980, 3580], [60, 6770, 5080, 4060, 3650], [65, 7240, 5430, 4340, 3910],
  [70, 7390, 5540, 4430, 3990], [75, 7530, 5650, 4520, 4070], [80, 8000, 6000, 4800, 4320],
  [85, 8200, 6150, 4920, 4430], [90, 8990, 6740, 5390, 4850], [95, 9440, 7080, 5660, 5090],
  [100, 10390, 7790, 6230, 5610],
];
const RGK_FIJO: Row[] = [
  [12, 1970, 1480, 1180, 1060], [14, 2080, 1560, 1250, 1130], [16, 2210, 1660, 1330, 1200],
  [18, 2280, 1710, 1370, 1230], [20, 2440, 1830, 1460, 1310], [22, 2770, 2080, 1660, 1490],
  [25, 3110, 2330, 1860, 1670], [30, 3410, 2560, 2050, 1850], [35, 3880, 2910, 2330, 2100],
  [40, 4270, 3200, 2560, 2300], [45, 4720, 3540, 2830, 2550], [50, 5240, 3930, 3140, 2830],
];

/* ---------- Cierres ---------- */

type Formato = "desm-c5" | "fijo-c5" | "fijo-c4";

const FORMATO: Record<Formato, { nombre: string; subtitle: string; slug: string }> = {
  "desm-c5": { nombre: "C5 Desmontable", subtitle: "Desmontable · Cadena 5", slug: "desmontable-c5" },
  "fijo-c5": { nombre: "C5 Fijo", subtitle: "Fijo · Cadena 5", slug: "fijo-c5" },
  "fijo-c4": { nombre: "C4 Fijo", subtitle: "Fijo · Cadena 4", slug: "fijo-c4" },
};

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cierre(family: string, formato: Formato, table: Row[], images: string[]): Product {
  const f = FORMATO[formato];
  return {
    slug: `cierre-${slugify(family)}-${f.slug}`,
    category: "cierres",
    family,
    name: `Cierre YKK ${family} ${f.nombre}`,
    title: family,
    subtitle: f.subtitle,
    unit: "c/u",
    variantName: "Medida",
    tiers: TIERS_CIERRES,
    variants: table.map(([cm, ...prices]) => ({ label: `${cm} cm`, prices })),
    images,
  };
}

const CIERRES: Product[] = [
  // Poliéster Reforzado (CIF)
  cierre("Poliéster Reforzado", "desm-c5", POLIESTER_DESM, [
    "1id5u8rn06OxZJiWRdWH9Jp6qAeE6LN1Y", // Poliéster Reforzado - 1
    "1i6IsR27QWL3Lzzdg71iOJVB9a2vzGQd9", // Poliéster Reforzado - 2
    "1Kh0m7dEgY8EuultMO--Q9MHNOE8R9Mni", // cifDc5t580alt-1
    "1ZyIjeEWz3IyOCAX0rQeWzRO3nVFwq1Q8", // cifDc5t580alt-2
  ]),
  cierre("Poliéster Reforzado", "fijo-c5", POLIESTER_FIJO, [
    "1GTMKx8AUx0ufWcn6y0J0GiJDBJn0uadu",
    "14Amc2TghQYxkLw0pwN-bt9RKCbAATLA8",
  ]),
  // Vislon Diente de Perro (VS)
  cierre("Vislon Diente de Perro", "desm-c5", VISLON_DESM, [
    "1FmE1jQVqmSpfZ8ibQZtEl8Chb2OBnAUV",
    "1U29QPTJpyPd3XImqPTruB4K-GfMTlwtt",
  ]),
  cierre("Vislon Diente de Perro", "fijo-c5", VISLON_FIJO, [
    "1Rw0OYwVHdRUG19oG-T7oo_MQPlNLnZir",
    "1ybCyRAZAnjFzsO_0xwTJLUtpxyMGRM0u",
  ]),
  // Aluminio (RA)
  cierre("Aluminio", "desm-c5", ALUMINIO_DESM, [
    "1AL2wEcXY3UxnWoPrGRCyktWH4ZoP4ANq",
    "1NDzMKKFRxJcD2E-_pC2cHhcWtQRlo6zw",
  ]),
  cierre("Aluminio", "fijo-c5", ALUMINIO_FIJO, [
    "1Auw8a05AfAbhjQ_8WKP2FE1HojgAHPYD",
    "1o7jf5RXI06OHhTZZtzgTAQiIbI15q27C",
  ]),
  // Metal Plata Níquel (RN)
  cierre("Metal Plata Níquel", "desm-c5", RN_RG_DESM, [
    "1VQb5S_JfIgayElkTjihAfwx6WYS7ChYa", // rnDc5t580-1
    "1ZRLvf0smPOnJpymCOUlPyWmrvwj0bwjZ", // rnDc5t580-2
    "1-KYGpRqU7x-dbNXW9wutwgkWj0BAknqV", // rnDc5t580argo-1
    "1TfKZERInH50C3iVSPH-XagPX0i2iM6EV", // rnDc5t580argo-2
    "1z8wCtTrmG9Yq_EZBlbw579pvFOX6gro5", // rnDc5t580alt-1
    "1LgwfSo3cgXFOTpBhPuBaozWfsj0IvSL0", // rnDc5t580alt-2
  ]),
  cierre("Metal Plata Níquel", "fijo-c5", RN_RG_FIJO, [
    "1F-EEy2p5444OK0M7SI_-6AJxCL8XlqPG",
    "19jdEPs9OPQVlT97qTDmg3DqSzb24ipWF",
  ]),
  cierre("Metal Plata Níquel", "fijo-c4", RN_RG_FIJO_C4, [
    "1sKwPcyI8UFa1eNIwE8ytEDUgIbtn_doR",
    "1eOBBFK4IvuGLOkBU2kwj0bLijD-i4Erd",
  ]),
  // Metal Bronce Dorado (RG)
  cierre("Metal Bronce Dorado", "desm-c5", RN_RG_DESM, [
    "1unq6TOXaJqRTtCyN0qAMFqKy4IWcp0Si",
    "1giauMbaYFIoO9bPAZ4NTKMmZd8qQYq65",
  ]),
  cierre("Metal Bronce Dorado", "fijo-c5", RN_RG_FIJO, [
    "1bd-bIh2qQn-N9ImNwVTG2ulnvRuZuhZd",
    "1Ehz1h9job2h0355fQnR8qNdH5WdkdyL9",
  ]),
  cierre("Metal Bronce Dorado", "fijo-c4", RN_RG_FIJO_C4, [
    "1Z73bh0jUOfwP1Wp5Lwj3x56T4soARTIe", // rgFc4t580-1
    "17HZunq6tgqk7ureayemTHq07ou4KD_GM", // rgFc4t580-x6-b
  ]),
  // Metal Black Oxide (RGK)
  cierre("Metal Black Oxide", "desm-c5", RGK_DESM, [
    "1d8oawsH9ATccGY2cC_2kMpa3AaFCYzk2",
    "1ATpOYRt0f938lMPBGN6-ZNF0R9qiJ6aZ",
  ]),
  cierre("Metal Black Oxide", "fijo-c5", RGK_FIJO, [
    "15H9Eqk8mhymRvfk49eJJldMVRksig1L1",
    "1T8taLsFZm58xVeOgxVOav4GE3DuMVFpS",
  ]),
  // Empavonado Bronce (RGKB)
  cierre("Empavonado Bronce", "desm-c5", RGK_DESM, [
    "1fcxSEJMaKLwjkcVEH1fhtksgX-Mpreu5", // rgthDc5t580-1 (ojo: código RGTH)
    "1cAzaf9Fb7AhVKgNKJEfIPPEKNrT6T998",
  ]),
  cierre("Empavonado Bronce", "fijo-c5", RGK_FIJO, [
    "1dns2k6w77i7rl26COPtnpNazmxK3TmBR",
    "1UUrcirnQP-M0LLGLaG7OJk4BkJuaKKHk",
  ]),
  // Empavonado Níquel (RGTH)
  cierre("Empavonado Níquel", "desm-c5", RGK_DESM, [
    "1Z0HlpyeIIlCdMMElGHeLv1bmo8AJrhEq",
    "1XrdSw-pqS6w9OwEweiB3TVOr4Nls6HnY",
  ]),
  cierre("Empavonado Níquel", "fijo-c5", RGK_FIJO, [
    "1AqflnDJz1Et6p0x1hF0VyGP-QfoGRRAh",
    "1KtKuixxl-dlIimYx-y5wuEqpfdyyvAiV",
  ]),
];

/* ---------- Hilos ---------- */

const HILOS: Product[] = [
  {
    slug: "hilo-elastico-blanco",
    category: "hilo-elastico",
    name: "Hilo elástico Corona blanco 25 m - Pack x12 bobinas",
    title: "Hilo elástico blanco",
    subtitle: "Corona · bobinas de 25 m",
    unit: "pack",
    variantName: "Presentación",
    tiers: TIER_UNICO,
    variants: [{ label: "Pack x12 bobinas", prices: [6160] }],
    images: ["1G-G9ce-JPdD4o4zr5_4NeJIOEod97Mf1", "1Qh99OA0-HvFQZbDAi5YaH9yGn6CBlCiB"],
  },
  {
    slug: "hilo-elastico-negro",
    category: "hilo-elastico",
    name: "Hilo elástico Corona negro 25 m - Pack x12 bobinas",
    title: "Hilo elástico negro",
    subtitle: "Corona · bobinas de 25 m",
    unit: "pack",
    variantName: "Presentación",
    tiers: TIER_UNICO,
    variants: [{ label: "Pack x12 bobinas", prices: [8260] }],
    images: ["1JqYnXIIFAEwynLFCeLJWACnubWhAzx18", "1ybq7eGEroAkYl73FX0KFI14HSQIR0G1s"],
  },
  {
    slug: "hilo-cucito-cofre",
    category: "hilo-poliester",
    name: "Hilo Cucito Cofre x72 bobinas surtidas",
    title: "Cofre Cucito x72",
    subtitle: "Hilo poliéster · 72 bobinas surtidas",
    unit: "c/u",
    variantName: "Presentación",
    tiers: TIER_UNICO,
    variants: [{ label: "Cofre x72 bobinas", prices: [48800] }],
    images: ["1QejRpxLMMfCzYhTuJ6cPzD3ZMHADu5r0", "1fPzPF0Op2vD6Yp9cvx3NPOTcU3KtUIBA"],
  },
  {
    slug: "yute-6-2-bobina",
    category: "yute",
    name: "Hilo de yute Corona 6/2 bobina 50 m",
    title: "Yute 6/2 bobina",
    subtitle: "Corona · bobina de 50 m",
    unit: "c/u",
    variantName: "Presentación",
    tiers: TIERS_YUTE,
    variants: [
      { label: "Unidad", prices: [2500, null], images: ["1DKFcrjrLGFnNe3m-RkDmgKfrobZs8xHF"] },
      { label: "Pack x10", prices: [19800, 17640], images: ["1Qg9tHoK82_jrPEIsZvtLx1on35gw3-LK"] },
    ],
    images: ["1DKFcrjrLGFnNe3m-RkDmgKfrobZs8xHF", "1Qg9tHoK82_jrPEIsZvtLx1on35gw3-LK"],
  },
  {
    slug: "yute-6-2-cono",
    category: "yute",
    name: "Hilo de yute Corona 6/2 cono 500 m",
    title: "Yute 6/2 cono",
    subtitle: "Corona · cono de 500 m",
    unit: "c/u",
    variantName: "Presentación",
    tiers: TIERS_YUTE,
    variants: [{ label: "Cono 500 m", prices: [19800, 17640] }],
    images: ["1KQrvGymQPgeo95uBdncJL5igjfwcSCKq"],
  },
  {
    slug: "yute-11-4",
    category: "yute",
    name: "Hilo de yute Corona 11/4 rollo 50 m",
    title: "Yute 11/4",
    subtitle: "Corona · rollo de 50 m",
    unit: "c/u",
    variantName: "Presentación",
    tiers: TIERS_YUTE,
    variants: [{ label: "Rollo 50 m", prices: [4920, 4430] }],
    images: ["19buE9nLJY1b6oje2pG_nytCEcd35Sttg"],
  },
  {
    slug: "yute-28-2",
    category: "yute",
    name: "Hilo de yute Corona 28/2 rollo 50 m",
    title: "Yute 28/2",
    subtitle: "Corona · rollo de 50 m",
    unit: "c/u",
    variantName: "Presentación",
    tiers: TIERS_YUTE,
    variants: [{ label: "Rollo 50 m", prices: [4920, 4430] }],
    images: ["1ckaNzBhgr9TD3pVDPH6XubxDZ7l5qyDb"],
  },
  {
    slug: "yute-28-4",
    category: "yute",
    name: "Hilo de yute Corona 28/4 rollo 30 m",
    title: "Yute 28/4",
    subtitle: "Corona · rollo de 30 m",
    unit: "c/u",
    variantName: "Presentación",
    tiers: TIERS_YUTE,
    variants: [{ label: "Rollo 30 m", prices: [6960, 6260] }],
    images: ["1TrPfH8wC7PAsVWCuM_Eu9A5ztgKvT7TL"],
  },
  {
    slug: "yute-32-5",
    category: "yute",
    name: "Hilo de yute Corona 32/5 rollo 20 m",
    title: "Yute 32/5",
    subtitle: "Corona · rollo de 20 m",
    unit: "c/u",
    variantName: "Presentación",
    tiers: TIERS_YUTE,
    variants: [{ label: "Rollo 20 m", prices: [5980, 5380] }],
    images: ["1nk_MimgyA95u7R3Ti_WZj0Zj1DMuhrcZ"],
  },
];

/* ---------- Familias ---------- */

export type Familia = { name: string; slug: string; products: Product[] };

export const FAMILIAS: Familia[] = ORDEN_FAMILIAS.map((name) => ({
  name,
  slug: slugify(name),
  // Desmontable primero: su foto es la de la familia.
  products: CIERRES.filter((p) => p.family === name),
}));

export function getFamilia(slug: string) {
  return FAMILIAS.find((f) => f.slug === slug);
}

export function familySlug(name: string) {
  return slugify(name);
}

export const PRODUCTS: Product[] = [...FAMILIAS.flatMap((f) => f.products), ...HILOS];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsByCategory(id: CategoryId) {
  return PRODUCTS.filter((p) => p.category === id);
}
