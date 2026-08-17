"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Studio } from "./Studio";
import { PorscheModel } from "./PorscheModel";

function AutoRotate({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
  });
  return <group ref={group}>{children}</group>;
}

export function HeroCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [4.6, 1.6, 5.2], fov: 30 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#030303"]} />
      <fog attach="fog" args={["#030303", 8, 20]} />
      <Suspense fallback={null}>
        <Studio />
        <AutoRotate>
          <PorscheModel />
        </AutoRotate>
      </Suspense>
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.6} luminanceThreshold={0.3} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.95} />
      </EffectComposer>
    </Canvas>
  );
}
