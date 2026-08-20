"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { Studio } from "./Studio";
import { ConfiguratorCar } from "./ConfiguratorCar";
import { CameraRig } from "./CameraRig";
import { CinematicEffects } from "./CinematicEffects";
import { ModelLoadOverlay } from "./ModelLoadOverlay";
import { useRenderGate } from "@/hooks/useRenderGate";
import { useConfigurator } from "@/lib/configurator/store";
import { getCarConfig } from "@/lib/three/carConfigs";
import { CaptureHandler } from "./CaptureHandler";
import { DebugTriangleReporter } from "./DebugTriangleReporter";
import type { GltfCarHandle } from "./GltfCar";

export function ConfiguratorCanvas() {
  const { ref, active } = useRenderGate<HTMLDivElement>({ eager: true });
  const [dprMax, setDprMax] = useState(1.8);
  const { state } = useConfigurator();
  const car = getCarConfig(state.carId);
  const carRef = useRef<GltfCarHandle>(null);
  // The Visualizer covers this canvas entirely while open — pausing the
  // frameloop (rather than unmounting) avoids a real WebGL context-creation
  // race: tearing this context down at the exact moment the Visualizer's own
  // canvas stands one up has been observed to lose the *new* context outright
  // on constrained/software-rendered GPUs. Keeping this one alive but idle
  // sidesteps that entirely, at the cost of one dormant context.
  const rendering = active && !state.visualizerOpen;

  return (
    <div ref={ref} className="relative h-full w-full">
      <ModelLoadOverlay />
      <Canvas
        dpr={[1, dprMax]}
        camera={{
          position: car.cameraPresets.exterior.position,
          fov: 32,
        }}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        frameloop={rendering ? "always" : "never"}
      >
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 11, 26]} />

        <PerformanceMonitor
          onDecline={() => setDprMax(1)}
          onIncline={() => setDprMax(1.8)}
        />

        <Suspense fallback={null}>
          <Studio />
          <ConfiguratorCar ref={carRef} car={car} />
          <Preload all />
        </Suspense>

        <CameraRig car={car} />
        <CinematicEffects preset="studio" />
        <AdaptiveDpr pixelated />
        <CaptureHandler carRef={carRef} />
        <DebugTriangleReporter />
      </Canvas>
    </div>
  );
}
