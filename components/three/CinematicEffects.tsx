"use client";

import {
  Bloom,
  EffectComposer,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export type EffectsIntensity = "hero" | "studio";

const PRESETS = {
  hero: {
    bloomIntensity: 0.18,
    bloomThreshold: 0.92,
    vignetteDarkness: 0.55,
  },
  studio: {
    bloomIntensity: 0.12,
    bloomThreshold: 0.94,
    vignetteDarkness: 0.4,
  },
} as const;

/** Shared post-processing chain: a touch of bloom on real hotspots, vignette, SMAA, ACES tone mapping. */
export function CinematicEffects({
  preset = "studio",
}: {
  preset?: EffectsIntensity;
}) {
  const config = PRESETS[preset];

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={config.bloomIntensity}
        luminanceThreshold={config.bloomThreshold}
        luminanceSmoothing={0.2}
        mipmapBlur
        radius={0.6}
      />
      <Vignette eskil={false} offset={0.3} darkness={config.vignetteDarkness} />
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
