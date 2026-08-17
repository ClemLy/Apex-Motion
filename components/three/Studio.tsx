"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import type * as THREE from "three";

/**
 * Studio lighting rig: three softboxes (key, cool fill, warm rim) plus a slowly
 * travelling spotlight that sweeps the bodywork so highlights are never static.
 */
export function Studio() {
  const sweepRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.RectAreaLight>(null);
  const keyRef = useRef<THREE.RectAreaLight>(null);

  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Travelling key spot orbits the car, casting a moving specular band.
    if (sweepRef.current) {
      sweepRef.current.position.x = Math.sin(t * 0.24) * 6.5;
      sweepRef.current.position.z = Math.cos(t * 0.24) * 6.5;
      sweepRef.current.position.y = 6 + Math.sin(t * 0.4) * 1.2;
      sweepRef.current.target.position.set(0, 0.5, 0);
      sweepRef.current.target.updateMatrixWorld();
    }

    // Breathing intensities keep the rim light alive without reading as a flicker.
    if (rimRef.current) {
      rimRef.current.intensity = 9 + Math.sin(t * 0.55) * 2.4;
    }
    if (keyRef.current) {
      keyRef.current.intensity = 16 + Math.sin(t * 0.35 + 1.2) * 2.8;
    }
  });

  return (
    <>
      <hemisphereLight args={["#3a4356", "#050505", 0.55]} />
      <ambientLight intensity={0.26} />

      {/* Key softbox */}
      <rectAreaLight
        ref={keyRef}
        position={[4, 4.5, 4]}
        rotation={[-0.4, 0.7, 0]}
        width={5}
        height={3}
        intensity={16}
        color="#ffffff"
      />
      {/* Cool fill */}
      <rectAreaLight
        position={[-5, 3, 1]}
        rotation={[-0.3, -1.1, 0]}
        width={4}
        height={3}
        intensity={7}
        color="#6f8cff"
      />
      {/* Warm rim from behind */}
      <rectAreaLight
        ref={rimRef}
        position={[0, 3.5, -5.5]}
        rotation={[0.3, Math.PI, 0]}
        width={5}
        height={2.4}
        intensity={9}
        color="#ff9a52"
      />

      {/* Travelling shadow-casting spot */}
      <spotLight
        ref={sweepRef}
        position={[5, 7, 5]}
        angle={0.5}
        penumbra={1}
        intensity={2.4}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      <ContactShadows
        position={[0, -0.001, 0]}
        opacity={0.7}
        scale={12}
        blur={2.6}
        far={4}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#020202"
          roughness={0.86}
          metalness={0.16}
        />
      </mesh>
    </>
  );
}
