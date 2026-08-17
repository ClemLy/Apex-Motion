"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { Studio } from "./Studio";
import { PorscheModel } from "./PorscheModel";
import { CameraRig } from "./CameraRig";
import { CinematicEffects } from "./CinematicEffects";
import { useRenderGate } from "@/hooks/useRenderGate";

export function ConfiguratorCanvas() {
  const { ref, active } = useRenderGate<HTMLDivElement>();
  const [dprMax, setDprMax] = useState(1.8);

  return (
    <div ref={ref} className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, dprMax]}
        camera={{ position: [4.6, 1.9, 4.9], fov: 32 }}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        frameloop={active ? "always" : "never"}
      >
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 9, 22]} />

        <PerformanceMonitor
          onDecline={() => setDprMax(1)}
          onIncline={() => setDprMax(1.8)}
        />

        <Suspense fallback={null}>
          <Studio />
          <PorscheModel />
          <Preload all />
        </Suspense>

        <CameraRig />
        <CinematicEffects preset="studio" />
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
