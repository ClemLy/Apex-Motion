import type { CameraFocus } from "@/lib/configurator/types";
import { MODEL_URLS } from "./modelManifest";

type CameraPreset = {
  position: [number, number, number];
  target: [number, number, number];
};

/** Real-world reference spec, shown only in showroom mode (see isShowroomOnly). */
export interface CarSpecs {
  displacement: string;
  power: string;
  weight: string;
}

/** Per-model material/node wiring — each car names its own patterns since both .glb sources use different naming conventions. */
export interface CarConfig {
  /** Stable key used in configurator state and as the React list key. */
  id: string;
  /** Display name in the car switcher. */
  name: string;
  /** Display years/era in the car switcher. */
  years: string;
  /** Path under /public, served with long-lived caching (see next.config.ts). */
  url: string;
  /** Camera anchor for the exterior preset, tuned to this car's real bbox. */
  scale: number;
  /** Material names (exact or substring) that receive the live paint swap. */
  paintMaterials: { match: string; exact?: boolean }[];
  /** Material name for the wheel rims, recolored as a single shared instance. */
  wheelMaterial?: { match: string; exact?: boolean };
  /** Material name for the brake calipers. Omitted where the model has no separate caliper mesh. */
  caliperMaterial?: { match: string; exact?: boolean };
  /** Node names that can be shown/hidden (e.g. the rear wing). */
  toggleNodes?: Record<string, string[]>;
  /** Node names hidden unconditionally on load (e.g. a duplicate variant left over from a removed toggle). */
  permanentlyHidden?: string[];
  /** Camera position/target per studio focus preset, tuned to this car's own bbox. */
  cameraPresets: Record<CameraFocus, CameraPreset>;
  /** Real spec numbers, surfaced only for showroom-only cars (see isShowroomOnly). */
  specs?: CarSpecs;
}

export const GT3RS_CONFIG: CarConfig = {
  id: "gt3rs",
  name: "911 GT3 RS",
  years: "2023",
  url: MODEL_URLS["porsche-gt3-rs"],
  scale: 1,
  // "carPaint.003" (body) and "carPaint.008" (wing) — both catch on substring.
  paintMaterials: [{ match: "carPaint" }],
  wheelMaterial: { match: "wheels_chrome_1" },
  // Real name is "amdb11_caliper.002" — matched by substring, not exact.
  caliperMaterial: { match: "amdb11_caliper" },
  toggleNodes: {
    wing: [
      "TwiXeR_992_gt3rs_carbon_Wing",
      "TwiXeR_992_gt3rs_left_leg",
      "TwiXeR_992_gt3rs_right_leg",
    ],
  },
  // The antichrome exhaust tip variant lost its toggle when dashTrim/exhaust
  // customization was removed, leaving both variants visible at once.
  permanentlyHidden: ["TwiXeR_992_exhausttip_3_antichrome"],
  cameraPresets: {
    exterior: { position: [5.7, 2.2, 6.1], target: [0, 0.6, 0] },
    rear: { position: [-4.2, 1.6, -5.4], target: [0, 0.7, -2.1] },
    wheels: { position: [3.8, 1.05, 4.1], target: [1, 0.42, 1.4] },
  },
};

export const TURBO_930_CONFIG: CarConfig = {
  id: "930-turbo",
  name: "911 Turbo 930",
  years: "1975",
  url: MODEL_URLS["porsche-930-turbo"],
  scale: 1,
  paintMaterials: [{ match: "paint", exact: true }],
  wheelMaterial: { match: "930_rim" },
  // No separate caliper mesh on this model — the caliper picker stays hidden for it.
  cameraPresets: {
    exterior: { position: [7.4, 2.7, 7.9], target: [0, 0.75, 0] },
    rear: { position: [-5.4, 2.0, -6.9], target: [0, 0.85, -2.6] },
    wheels: { position: [4.9, 1.3, 5.2], target: [1.2, 0.5, 1.7] },
  },
};

export const CAYMAN_GT4_CONFIG: CarConfig = {
  id: "718-gt4",
  name: "718 Cayman GT4",
  years: "2020",
  url: MODEL_URLS["porsche-718-gt4"],
  scale: 1,
  paintMaterials: [{ match: "Porsche_718CaymanGT4_2020Paint_Material" }],
  // The source models the whole wheel, tyre included, under one material —
  // the optimize pipeline splits the rim off so recolouring spares the rubber.
  wheelMaterial: { match: "GT4_RimFace", exact: true },
  // Substring catches both CALIP_1 and CALIP_2, recoloring together.
  caliperMaterial: { match: "CALIP" },
  cameraPresets: {
    exterior: { position: [5.44, 1.77, 5.8], target: [0, 0.49, 0] },
    rear: { position: [-3.97, 1.29, -5.13], target: [0, 0.55, -1.96] },
    wheels: { position: [3.61, 0.84, 3.88], target: [0.94, 0.34, 1.29] },
  },
};

export const CARRERA_4S_CONFIG: CarConfig = {
  id: "911-carrera-4s",
  name: "911 Carrera 4S",
  years: "2019",
  url: MODEL_URLS["porsche-911-carrera-4s"],
  scale: 1,
  paintMaterials: [{ match: "paint", exact: true }],
  // The rims sat in two nodes sharing the generic "silver" brightwork material
  // (mirrors, trim); the optimize pipeline moves them onto their own material.
  wheelMaterial: { match: "Carrera4S_RimFace", exact: true },
  // Matched exactly: a plain "Material" also exists on this model.
  caliperMaterial: { match: "Material.001", exact: true },
  cameraPresets: {
    exterior: { position: [5.53, 1.54, 5.89], target: [0, 0.43, 0] },
    rear: { position: [-4.03, 1.12, -5.21], target: [0, 0.48, -1.99] },
    wheels: { position: [3.67, 0.73, 3.94], target: [0.95, 0.29, 1.31] },
  },
};

export const PORSCHE_917K_CONFIG: CarConfig = {
  id: "917k-lm",
  name: "917K",
  years: "1970",
  url: MODEL_URLS["porsche-917k-lm"],
  scale: 1,
  // Livery is baked entirely into the texture (neutral [1,1,1] base color) —
  // recoloring would tint the historic paint scheme itself. Showroom-only.
  paintMaterials: [],
  cameraPresets: {
    exterior: { position: [5.03, 1.33, 5.36], target: [0, 0.37, 0] },
    rear: { position: [-3.67, 0.97, -4.74], target: [0, 0.42, -1.81] },
    wheels: { position: [3.34, 0.63, 3.58], target: [0.87, 0.25, 1.19] },
  },
  specs: { displacement: "4.5L flat-12", power: "~600 hp", weight: "~800 kg" },
};

export const SPYDER_918_CONFIG: CarConfig = {
  id: "918-spyder",
  name: "918 Spyder",
  years: "2015",
  url: MODEL_URLS["porsche-918-spyder"],
  scale: 1,
  paintMaterials: [{ match: "Body_Paint_-_GT_Silver_Metalic" }],
  // Generic name, so matched exactly — "material" and "material_0" also exist.
  wheelMaterial: { match: "material_42", exact: true },
  caliperMaterial: { match: "Caliper" },
  cameraPresets: {
    exterior: { position: [5.67, 1.62, 6.05], target: [0, 0.45, 0] },
    rear: { position: [-4.14, 1.18, -5.35], target: [0, 0.51, -2.05] },
    wheels: { position: [3.77, 0.77, 4.05], target: [0.98, 0.31, 1.35] },
  },
};

export const MISSION_R_CONFIG: CarConfig = {
  id: "mission-r",
  name: "Mission R",
  years: "2021",
  url: MODEL_URLS["porsche-mission-r"],
  scale: 1,
  // Fixed concept livery baked into the texture, same reasoning as the 917K.
  paintMaterials: [],
  cameraPresets: {
    exterior: { position: [5.61, 2.17, 5.98], target: [0, 0.6, 0] },
    rear: { position: [-4.09, 1.59, -5.29], target: [0, 0.68, -2.02] },
    wheels: { position: [3.73, 1.03, 4.0], target: [0.97, 0.41, 1.33] },
  },
  specs: {
    displacement: "Dual-motor EV concept",
    power: "~1073 hp (qualifying mode)",
    weight: "~1500 kg",
  },
};

/**
 * Ordered oldest to newest, so the switcher reads as a timeline of the range.
 * The studio still opens on the GT3 RS — that comes from
 * defaultConfiguratorState.carId, not from this order.
 */
export const CARS: CarConfig[] = [
  PORSCHE_917K_CONFIG,
  TURBO_930_CONFIG,
  SPYDER_918_CONFIG,
  CARRERA_4S_CONFIG,
  CAYMAN_GT4_CONFIG,
  MISSION_R_CONFIG,
  GT3RS_CONFIG,
];

export function getCarConfig(id: string): CarConfig {
  return CARS.find((car) => car.id === id) ?? GT3RS_CONFIG;
}

/** True when a car has no repaintable/recolorable material at all — its side panel drops the customization tabs for a showroom (camera + spec sheet) view instead. */
export function isShowroomOnly(car: CarConfig): boolean {
  return (
    car.paintMaterials.length === 0 &&
    !car.wheelMaterial &&
    !car.caliperMaterial
  );
}
