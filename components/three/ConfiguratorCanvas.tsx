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
import { ReadySignal } from "./ReadySignal";
import { useRenderGate } from "@/hooks/useRenderGate";
import { useConfigurator } from "@/lib/configurator/store";
import { paintOptions, wheelFinishOptions } from "@/lib/configurator/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getCarConfig } from "@/lib/three/carConfigs";
import { CaptureHandler } from "./CaptureHandler";
import { DebugTriangleReporter } from "./DebugTriangleReporter";
import { FrameLimiter } from "./FrameLimiter";
import type { GltfCarHandle } from "./GltfCar";

/** Camera parallax reacts to pointer position every render, so this stays higher than the purely-ambient canvases — still well under an uncapped 120Hz+ display. */
const TARGET_FPS = 60;

export function ConfiguratorCanvas() {
  const { ref, active } = useRenderGate<HTMLDivElement>({ eager: true });
  const [dprMax, setDprMax] = useState(1.8);
  const { state } = useConfigurator();
  const { dict } = useLanguage();
  const car = getCarConfig(state.carId);
  const carRef = useRef<GltfCarHandle>(null);
  const [contentReady, setContentReady] = useState(false);

  // Switching cars can suspend this boundary again for the newly-picked
  // model - reset so the overlay is ready to show for that load too,
  // instead of staying hidden from the previous car's already-resolved
  // state. Adjusted during render (React's sanctioned "reset state when a
  // prop changes" pattern) rather than in an effect, so it applies before
  // the first paint of the new car instead of flashing the old ready state.
  const [prevCarId, setPrevCarId] = useState(car.id);
  if (car.id !== prevCarId) {
    setPrevCarId(car.id);
    setContentReady(false);
  }
  // The Visualizer covers this canvas entirely while open — pausing the
  // frameloop (rather than unmounting) avoids a real WebGL context-creation
  // race: tearing this context down at the exact moment the Visualizer's own
  // canvas stands one up has been observed to lose the *new* context outright
  // on constrained/software-rendered GPUs. Keeping this one alive but idle
  // sidesteps that entirely, at the cost of one dormant context.
  const rendering = active && !state.visualizerOpen;

  const paintLabel =
    paintOptions.find((p) => p.id === state.paintId)?.label ?? "";
  const wheelLabel =
    wheelFinishOptions.find((w) => w.id === state.wheelFinish)?.label ?? "";
  const viewportLabel = [car.name, paintLabel, wheelLabel]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${viewportLabel}, ${dict.a11y.studioViewport}`}
      className="relative h-full w-full"
    >
      {!contentReady && <ModelLoadOverlay />}
      <Canvas
        dpr={[1, dprMax]}
        camera={{
          position: car.cameraPresets.exterior.position,
          fov: 32,
        }}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        frameloop={rendering ? "demand" : "never"}
      >
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 11, 26]} />

        <FrameLimiter fps={TARGET_FPS} />

        <PerformanceMonitor
          onDecline={() => setDprMax(1)}
          onIncline={() => setDprMax(1.8)}
        />

        <Suspense fallback={null}>
          <Studio />
          <ConfiguratorCar ref={carRef} car={car} />
          <ReadySignal onReady={() => setContentReady(true)} />
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
