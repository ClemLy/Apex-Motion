"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import type * as THREE from "three";

/**
 * Studio rig.
 *
 * The reflections that sell car paint do not come from lights, they come from
 * what the paint can see. So the scene builds its own cubemap from emissive
 * strips (`Lightformer`) arranged like a real photographic studio: a long
 * overhead softbox, vertical strips down each flank for the signature streak,
 * and a warm rim behind. Baked once into a 256px cubemap, no network fetch.
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

    // Breathing intensities keep the rim alive without reading as a flicker.
    if (rimRef.current) {
      rimRef.current.intensity = 7 + Math.sin(t * 0.55) * 2;
    }
    if (keyRef.current) {
      keyRef.current.intensity = 13 + Math.sin(t * 0.35 + 1.2) * 2.4;
    }
  });

  return (
    <>
      {/* Reflection environment, baked once. */}
      <Environment resolution={256} frames={1}>
        {/* Overhead softbox: the long highlight that runs the roof and hood. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 5, 1]}
          color="#ffffff"
        />
        {/* Flank strips: these produce the streak that defines the body line.
            Kept narrow and moderate, so the streak reads as a highlight rather
            than washing the whole flank to white. */}
        <Lightformer
          form="rect"
          intensity={4.2}
          position={[-6, 2.4, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[14, 0.9, 1]}
          color="#cfe0ff"
        />
        <Lightformer
          form="rect"
          intensity={3.4}
          position={[6, 2.4, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[14, 0.7, 1]}
          color="#ffffff"
        />
        {/* Warm rim behind, and a cool fill in front. */}
        <Lightformer
          form="rect"
          intensity={4}
          position={[0, 2.2, -7]}
          rotation={[0, Math.PI, 0]}
          scale={[9, 2.2, 1]}
          color="#ff9a52"
        />
        <Lightformer
          form="circle"
          intensity={2}
          position={[0, 1.6, 7]}
          rotation={[0, 0, 0]}
          scale={5}
          color="#7f9cff"
        />
        {/* Dark floor card, so the underside does not float in grey. */}
        <Lightformer
          form="rect"
          intensity={0.4}
          position={[0, -3, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[12, 12, 1]}
          color="#0a0c10"
        />
      </Environment>

      <hemisphereLight args={["#3a4356", "#050505", 0.45]} />
      <ambientLight intensity={0.18} />

      {/* Key softbox */}
      <rectAreaLight
        ref={keyRef}
        position={[4, 4.5, 4]}
        rotation={[-0.4, 0.7, 0]}
        width={5}
        height={3}
        intensity={13}
        color="#ffffff"
      />
      {/* Cool fill */}
      <rectAreaLight
        position={[-5, 3, 1]}
        rotation={[-0.3, -1.1, 0]}
        width={4}
        height={3}
        intensity={6}
        color="#6f8cff"
      />
      {/* Warm rim from behind */}
      <rectAreaLight
        ref={rimRef}
        position={[0, 3.5, -5.5]}
        rotation={[0.3, Math.PI, 0]}
        width={5}
        height={2.4}
        intensity={7}
        color="#ff9a52"
      />

      {/* Travelling shadow-casting spot */}
      <spotLight
        ref={sweepRef}
        position={[5, 7, 5]}
        angle={0.5}
        penumbra={1}
        intensity={2.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      <ContactShadows
        position={[0, -0.001, 0]}
        opacity={0.75}
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
          roughness={0.72}
          metalness={0.3}
        />
      </mesh>
    </>
  );
}
