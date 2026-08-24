export interface HeritageEra {
  id: string;
  years: string;
  model: string;
  tagline: { fr: string; en: string };
  power: string;
  topSpeed: string;
  /** Real, well-documented architecture facts — unlike the site's illustrative
   * telemetry elsewhere, these are used to draw an honest engine schematic,
   * not a fabricated spec sheet. */
  cylinders: 4 | 6;
  cooling: "air" | "liquide";
}

export const heritageEras: HeritageEra[] = [
  {
    id: "356",
    years: "1948 - 1965",
    model: "356",
    tagline: {
      fr: "La genèse. Un flat-4 léger qui pose les fondations.",
      en: "The genesis. A light flat-4 that lays the foundation.",
    },
    power: "40 - 95 ch",
    topSpeed: "160 km/h",
    cylinders: 4,
    cooling: "air",
  },
  {
    id: "911-og",
    years: "1963 - 1989",
    model: "911 (901)",
    tagline: {
      fr: "L'icône. Le flat-6 refroidi par air définit une silhouette éternelle.",
      en: "The icon. The air-cooled flat-6 defines an eternal silhouette.",
    },
    power: "130 - 300 ch",
    topSpeed: "245 km/h",
    cylinders: 6,
    cooling: "air",
  },
  {
    id: "959",
    years: "1986 - 1988",
    model: "959",
    tagline: {
      fr: "Le laboratoire. Technologie de course transposée à la route.",
      en: "The laboratory. Race technology brought to the road.",
    },
    power: "450 ch",
    topSpeed: "317 km/h",
    cylinders: 6,
    cooling: "air",
  },
  {
    id: "996-997",
    years: "1998 - 2011",
    model: "911 (996 / 997)",
    tagline: {
      fr: "La transition. Refroidissement liquide, précision moderne.",
      en: "The transition. Water cooling, modern precision.",
    },
    power: "300 - 530 ch",
    topSpeed: "310 km/h",
    cylinders: 6,
    cooling: "liquide",
  },
  {
    id: "991-gt3rs",
    years: "2011 - 2019",
    model: "911 GT3 RS (991)",
    tagline: {
      fr: "L'obsession. Aérodynamique de course et flat-6 atmosphérique portés à leur sommet.",
      en: "The obsession. Race-honed aerodynamics and a naturally aspirated flat-6 at their peak.",
    },
    power: "500 ch",
    topSpeed: "312 km/h",
    cylinders: 6,
    cooling: "liquide",
  },
  {
    id: "992-gt3rs",
    years: "2022 - aujourd'hui",
    model: "911 GT3 RS (992)",
    tagline: {
      fr: "L'apex. Appui aérodynamique digne d'un prototype Le Mans.",
      en: "The apex. Downforce worthy of a Le Mans prototype.",
    },
    power: "525 ch",
    topSpeed: "296 km/h",
    cylinders: 6,
    cooling: "liquide",
  },
];
