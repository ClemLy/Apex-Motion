"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Studio } from "./Studio";
import { PorscheModel } from "./PorscheModel";
import { CameraRig } from "./CameraRig";

export function ConfiguratorCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [4.2, 1.8, 4.6], fov: 32 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#030303"]} />
      <fog attach="fog" args={["#030303", 9, 22]} />
      <Suspense fallback={null}>
        <Studio />
        <PorscheModel />
      </Suspense>
      <CameraRig />
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.55} luminanceThreshold={0.35} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.9} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
