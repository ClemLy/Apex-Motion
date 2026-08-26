export type PaintFinish = "solid" | "metallic" | "satin" | "matte" | "pts";

export interface PaintOption {
  id: string;
  label: string;
  finish: PaintFinish;
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

/**
 * Every field below maps to something that actually exists on the GT3 RS
 * mesh (see lib/three/carConfigs.ts) — no toggle here pretends to control
 * geometry the model doesn't have.
 */
export type WheelFinish =
  "silver" | "satin-black" | "weissach-gold" | "titanium";
export type CaliperColor =
  "pccb" | "guards-red" | "black" | "blue" | "silver" | "white";

export type CameraFocus = "exterior" | "rear" | "wheels";

export interface ConfiguratorState {
  /** Matches a CarConfig.id in lib/three/carConfigs.ts. */
  carId: string;
  paintId: string;
  wing: boolean;
  wheelFinish: WheelFinish;
  caliperColor: CaliperColor;
  focus: CameraFocus;
  /** A still frame of the look at the moment "Comparer" was pressed — the
   * slider's "before" side. Data URL; null when no comparison is active. */
  compareImage: string | null;
  /** Full-screen free-orbit view of the current build, replacing the Stage while true. */
  visualizerOpen: boolean;
}

export const defaultConfiguratorState: ConfiguratorState = {
  carId: "gt3rs",
  paintId: "gt-silver",
  wing: true,
  wheelFinish: "silver",
  caliperColor: "guards-red",
  focus: "exterior",
  compareImage: null,
  visualizerOpen: false,
};

/** Grouped the way Porsche's own configurator does: solid, metallic, satin, then Paint to Sample. */
export const paintOptions: PaintOption[] = [
  // Couleurs de série (solid, non-metallic)
  {
    id: "guards-red",
    label: "Guards Red",
    finish: "solid",
    color: "#a8121a",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "racing-yellow",
    label: "Racing Yellow",
    finish: "solid",
    color: "#e8b900",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "black",
    label: "Black",
    finish: "solid",
    color: "#0a0a0a",
    roughness: 0.18,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "carrara-white",
    label: "Carrara White",
    finish: "solid",
    color: "#e8e6e0",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  // Couleurs métallisées
  {
    id: "gt-silver",
    label: "GT Silver Metallic",
    finish: "metallic",
    color: "#c9cdd1",
    roughness: 0.25,
    metalness: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "jet-black-metallic",
    label: "Jet Black Metallic",
    finish: "metallic",
    color: "#16171c",
    roughness: 0.22,
    metalness: 0.85,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "gentian-blue",
    label: "Gentian Blue Metallic",
    finish: "metallic",
    color: "#0d2f6b",
    roughness: 0.2,
    metalness: 0.75,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "agate-grey",
    label: "Agate Grey Metallic",
    finish: "metallic",
    color: "#4a4d52",
    roughness: 0.22,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "carmine-red",
    label: "Carmine Red Metallic",
    finish: "metallic",
    color: "#7a1620",
    roughness: 0.2,
    metalness: 0.75,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  // Finitions satinées (rare, special-order)
  {
    id: "shark-blue-satin",
    label: "Shark Blue Satin",
    finish: "satin",
    color: "#0f3f52",
    roughness: 0.8,
    metalness: 0.25,
    clearcoat: 0.4,
    clearcoatRoughness: 0.55,
  },
  {
    id: "chalk",
    label: "Chalk",
    finish: "satin",
    color: "#b8b2a4",
    roughness: 0.8,
    metalness: 0.15,
    clearcoat: 0.35,
    clearcoatRoughness: 0.5,
  },
  // Couleurs mates (flat, virtually no clearcoat gloss)
  {
    id: "jet-black-matte",
    label: "Jet Black Matte",
    finish: "matte",
    color: "#0d0d0d",
    roughness: 0.92,
    metalness: 0.1,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
  },
  {
    id: "quartz-grey-matte",
    label: "Quartz Grey Matte",
    finish: "matte",
    color: "#6b6d70",
    roughness: 0.9,
    metalness: 0.12,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
  },
  {
    id: "racing-yellow-matte",
    label: "Racing Yellow Matte",
    finish: "matte",
    color: "#d9ad00",
    roughness: 0.88,
    metalness: 0.1,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
  },
  {
    id: "gt3rs-orange-matte",
    label: "Lava Orange Matte",
    finish: "matte",
    color: "#c24f1a",
    roughness: 0.9,
    metalness: 0.1,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
  },
  {
    id: "python-green-matte",
    label: "Python Green Matte",
    finish: "matte",
    color: "#4c6b1f",
    roughness: 0.9,
    metalness: 0.12,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
  },
  // Couleurs de série additionnelles (solid, non-metallic)
  {
    id: "acid-green",
    label: "Acid Green",
    finish: "solid",
    color: "#9fd616",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "miami-blue",
    label: "Miami Blue",
    finish: "solid",
    color: "#0fa8c9",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "lava-orange",
    label: "Lava Orange",
    finish: "solid",
    color: "#d4491e",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "signal-yellow",
    label: "Signal Yellow",
    finish: "solid",
    color: "#f2c200",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "indigo-blue",
    label: "Indigo Blue",
    finish: "solid",
    color: "#242e6b",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "cherry-red",
    label: "Cherry Red",
    finish: "solid",
    color: "#8f0f22",
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  // Couleurs métallisées additionnelles
  {
    id: "aventurine-green",
    label: "Aventurine Green Metallic",
    finish: "metallic",
    color: "#1f4a3a",
    roughness: 0.22,
    metalness: 0.85,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "biscay-blue",
    label: "Biscay Blue Metallic",
    finish: "metallic",
    color: "#1a3f6b",
    roughness: 0.22,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "burgundy-red",
    label: "Burgundy Red Metallic",
    finish: "metallic",
    color: "#5a1224",
    roughness: 0.2,
    metalness: 0.78,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "moonlight-silver",
    label: "Moonlight Silver Metallic",
    finish: "metallic",
    color: "#9ea3a8",
    roughness: 0.25,
    metalness: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "mahogany-metallic",
    label: "Mahogany Metallic",
    finish: "metallic",
    color: "#3d2418",
    roughness: 0.24,
    metalness: 0.75,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "dolomite-silver",
    label: "Dolomite Silver Metallic",
    finish: "metallic",
    color: "#b8bcc2",
    roughness: 0.25,
    metalness: 0.88,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "graphite-blue",
    label: "Graphite Blue Metallic",
    finish: "metallic",
    color: "#2e3a4a",
    roughness: 0.22,
    metalness: 0.82,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "sapphire-blue",
    label: "Sapphire Blue Metallic",
    finish: "metallic",
    color: "#0f2f7a",
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "amethyst-metallic",
    label: "Amethyst Metallic",
    finish: "metallic",
    color: "#4a2c5e",
    roughness: 0.22,
    metalness: 0.78,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "champagne-metallic",
    label: "Champagne Metallic",
    finish: "metallic",
    color: "#c9b28a",
    roughness: 0.25,
    metalness: 0.75,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  // Finitions satinées additionnelles
  {
    id: "crayon-satin",
    label: "Crayon Satin",
    finish: "satin",
    color: "#d8d5cc",
    roughness: 0.78,
    metalness: 0.15,
    clearcoat: 0.35,
    clearcoatRoughness: 0.5,
  },
  {
    id: "python-green-satin",
    label: "Python Green Satin",
    finish: "satin",
    color: "#5b7a1f",
    roughness: 0.8,
    metalness: 0.22,
    clearcoat: 0.4,
    clearcoatRoughness: 0.55,
  },
  {
    id: "gentian-blue-satin",
    label: "Gentian Blue Satin",
    finish: "satin",
    color: "#123a6b",
    roughness: 0.8,
    metalness: 0.25,
    clearcoat: 0.4,
    clearcoatRoughness: 0.55,
  },
  {
    id: "carmine-red-satin",
    label: "Carmine Red Satin",
    finish: "satin",
    color: "#7a1620",
    roughness: 0.8,
    metalness: 0.22,
    clearcoat: 0.4,
    clearcoatRoughness: 0.55,
  },
  // Paint to Sample
  {
    // A brighter, more saturated "apple green" than the two olive-leaning
    // PTS greens below - used by the homepage's particle-assembly section
    // (components/sections/ParticleAssembly.tsx) and its hero capture
    // (scripts/capture-particle-hero.mjs), not currently offered as a
    // configurator swatch selection.
    id: "apple-green",
    label: "Apple Green",
    finish: "pts",
    color: "#8bc53f",
    roughness: 0.2,
    metalness: 0.75,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "pts-viper-green",
    label: "PTS Viper Green",
    finish: "pts",
    color: "#3c6b1f",
    roughness: 0.18,
    metalness: 0.85,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "pts-python-green",
    label: "PTS Python Green",
    finish: "pts",
    color: "#5b7a1f",
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "pts-riviera-blue",
    label: "PTS Riviera Blue",
    finish: "pts",
    color: "#1f6f8b",
    roughness: 0.18,
    metalness: 0.82,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "pts-ruby-star",
    label: "PTS Ruby Star Neo",
    finish: "pts",
    color: "#7a0f2e",
    roughness: 0.18,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "pts-mexico-blue",
    label: "PTS Mexico Blue",
    finish: "pts",
    color: "#0f5ba8",
    roughness: 0.18,
    metalness: 0.82,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "pts-oak-green",
    label: "PTS Oak Green",
    finish: "pts",
    color: "#2f4a2a",
    roughness: 0.2,
    metalness: 0.78,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "pts-slate-grey",
    label: "PTS Slate Grey Neo",
    finish: "pts",
    color: "#5c6066",
    roughness: 0.22,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
  {
    id: "pts-sunburst-yellow",
    label: "PTS Sunburst Yellow",
    finish: "pts",
    color: "#f0a800",
    roughness: 0.2,
    metalness: 0.75,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  },
];

export const wheelFinishOptions: {
  id: WheelFinish;
  label: string;
  color: string;
}[] = [
  { id: "silver", label: "Silver", color: "#c7cad0" },
  { id: "satin-black", label: "Satin Black", color: "#1a1a1c" },
  { id: "weissach-gold", label: "Weissach Gold", color: "#8a6a2f" },
  { id: "titanium", label: "Titanium", color: "#8a8378" },
];

export const caliperColors: Record<CaliperColor, string> = {
  pccb: "#f2c200",
  "guards-red": "#a8121a",
  black: "#111111",
  blue: "#1c4fa8",
  silver: "#c7cad0",
  white: "#e8e6e0",
};
