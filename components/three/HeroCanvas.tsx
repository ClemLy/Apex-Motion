"use client";

import { Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Studio } from "./Studio";
import { PorscheModel } from "./PorscheModel";
import { CinematicEffects } from "./CinematicEffects";

/** Slow turntable with a gentle pointer-driven tilt. */
function Turntable({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.16;

    const goalTilt = pointer.y * 0.08;
    group.current.rotation.x +=
      (goalTilt - group.current.rotation.x) * (1 - Math.pow(0.01, delta));
  });

  return <group ref={group}>{children}</group>;
}

export function HeroCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [4.8, 1.7, 5.4], fov: 30 }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <color attach="background" args={["#020202"]} />
      <fog attach="fog" args={["#020202", 8, 20]} />
      <Suspense fallback={null}>
        <Studio />
        <Turntable>
          <PorscheModel />
        </Turntable>
      </Suspense>
      <CinematicEffects preset="hero" />
    </Canvas>
  );
}
