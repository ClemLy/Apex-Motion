"use client";

import { Suspense, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { Studio } from "./Studio";
import { PorscheModel } from "./PorscheModel";
import { CinematicEffects } from "./CinematicEffects";
import { useRenderGate } from "@/hooks/useRenderGate";

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

export function HeroCanvas() {
  const { ref, active } = useRenderGate<HTMLDivElement>();
  // Resolution ceiling drops on weak hardware, so frame rate holds instead.
  const [dprMax, setDprMax] = useState(1.6);

  return (
    <div ref={ref} className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, dprMax]}
        camera={{ position: [4.8, 1.7, 5.4], fov: 30 }}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        frameloop={active ? "always" : "never"}
      >
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 8, 20]} />

        <PerformanceMonitor
          onDecline={() => setDprMax(1)}
          onIncline={() => setDprMax(1.6)}
        />

        <Suspense fallback={null}>
          <Studio />
          <Turntable>
            <PorscheModel />
          </Turntable>
          <Preload all />
        </Suspense>

        <CinematicEffects preset="hero" />
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
