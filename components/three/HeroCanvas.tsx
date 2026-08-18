"use client";

import { Suspense, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { Studio } from "./Studio";
import { GltfCar } from "./GltfCar";
import { CinematicEffects } from "./CinematicEffects";
import { useRenderGate } from "@/hooks/useRenderGate";
import { paintOptions } from "@/lib/configurator/types";
import type { CarConfig } from "@/lib/three/carConfigs";

/** Slow turntable with a gentle pointer-driven tilt. */
function Turntable({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 1 / 30);
    group.current.rotation.y += dt * 0.16;

    const goalTilt = pointer.y * 0.08;
    group.current.rotation.x +=
      (goalTilt - group.current.rotation.x) * (1 - Math.pow(0.01, dt));
  });

  return <group ref={group}>{children}</group>;
}

/** Showcase paint: the same GT Silver the studio defaults to, so the car never renders in an unset flat white. */
const SHOWCASE_PAINT =
  paintOptions.find((p) => p.id === "gt-silver") ?? paintOptions[0];

/**
 * Decorative turntable showcase — deliberately not the interactive studio's
 * `ConfiguratorCar`, so whichever car is passed in stays a static, lightweight
 * render (no configurator state, no material overrides beyond the base paint).
 */
export function HeroCanvas({ car }: { car: CarConfig }) {
  const { ref, active, mounted } = useRenderGate<HTMLDivElement>();
  // Resolution ceiling drops on weak hardware, so frame rate holds instead.
  const [dprMax, setDprMax] = useState(1.6);

  return (
    <div ref={ref} className="h-full w-full">
      {mounted && (
        <Canvas
          dpr={[1, dprMax]}
          camera={{ position: car.cameraPresets.exterior.position, fov: 30 }}
          gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
          frameloop={active ? "always" : "never"}
        >
          <color attach="background" args={["#020202"]} />
          <fog attach="fog" args={["#020202", 9, 22]} />

          <PerformanceMonitor
            onDecline={() => setDprMax(1)}
            onIncline={() => setDprMax(1.6)}
          />

          <Suspense fallback={null}>
            <Studio />
            <Turntable>
              <GltfCar config={car} paint={SHOWCASE_PAINT} />
            </Turntable>
            <Preload all />
          </Suspense>

          <CinematicEffects preset="hero" />
          <AdaptiveDpr pixelated />
        </Canvas>
      )}
    </div>
  );
}
