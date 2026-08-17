"use client";

import { useMemo } from "react";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";

export type EffectsIntensity = "hero" | "studio";

const PRESETS = {
  // Landing: heavier bloom and grain, it reads as a film plate.
  hero: {
    bloomIntensity: 1.15,
    bloomThreshold: 0.22,
    aberration: 0.0012,
    noiseOpacity: 0.055,
    vignetteDarkness: 0.95,
  },
  // Configurator: cleaner, so paint and material changes stay readable.
  studio: {
    bloomIntensity: 0.85,
    bloomThreshold: 0.3,
    aberration: 0.0007,
    noiseOpacity: 0.035,
    vignetteDarkness: 0.82,
  },
} as const;

/**
 * Shared cinematic post-processing chain: bloom for rim-light bleed, a touch of
 * chromatic aberration at the edges, animated film grain, vignette, and ACES
 * tone mapping to keep highlights from clipping to flat white.
 */
export function CinematicEffects({
  preset = "studio",
}: {
  preset?: EffectsIntensity;
}) {
  const config = PRESETS[preset];
  const aberrationOffset = useMemo(
    () => new THREE.Vector2(config.aberration, config.aberration * 0.6),
    [config.aberration],
  );

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={config.bloomIntensity}
        luminanceThreshold={config.bloomThreshold}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.75}
      />
      <ChromaticAberration offset={aberrationOffset} />
      <Noise
        premultiply
        blendFunction={BlendFunction.OVERLAY}
        opacity={config.noiseOpacity}
      />
      <Vignette
        eskil={false}
        offset={0.22}
        darkness={config.vignetteDarkness}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
