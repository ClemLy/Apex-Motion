import type { CameraFocus } from "@/lib/configurator/types";

type CameraPreset = {
  position: [number, number, number];
  target: [number, number, number];
};

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
}

export const GT3RS_CONFIG: CarConfig = {
  id: "gt3rs",
  name: "911 GT3 RS",
  years: "2023",
  url: "/models/porsche-gt3-rs.glb",
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
  url: "/models/porsche-930-turbo.glb",
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

export const CARS: CarConfig[] = [GT3RS_CONFIG, TURBO_930_CONFIG];

export function getCarConfig(id: string): CarConfig {
  return CARS.find((car) => car.id === id) ?? GT3RS_CONFIG;
}
