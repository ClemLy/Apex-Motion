"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Studio } from "./Studio";
import { PorscheModel } from "./PorscheModel";
import { CameraRig } from "./CameraRig";
import { CinematicEffects } from "./CinematicEffects";

export function ConfiguratorCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [4.6, 1.9, 4.9], fov: 32 }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <color attach="background" args={["#020202"]} />
      <fog attach="fog" args={["#020202", 9, 22]} />
      <Suspense fallback={null}>
        <Studio />
        <PorscheModel />
      </Suspense>
      <CameraRig />
      <CinematicEffects preset="studio" />
    </Canvas>
  );
}
