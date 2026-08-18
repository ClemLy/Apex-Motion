"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import * as THREE from "three";

/**
 * Soft radial shadow pool, baked once into a texture and applied straight to
 * the ground plane's material. A `ContactShadows`-style render-to-texture
 * blob has to re-render the scene from a top-down camera every frame it
 * updates, and sits a hair above the ground mesh — both the per-frame
 * re-render and the near-coplanar z-fighting showed up as a shimmering,
 * pixelating patch under the car as the camera moved. A static gradient
 * baked into the one ground mesh has neither problem, at zero render cost.
 */
function useGroundShadowTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(0,0,0,0.85)");
    gradient.addColorStop(0.55, "rgba(0,0,0,0.45)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

/** Studio rig. Grounding is a baked-in shadow gradient, not a shadow-casting light or render-to-texture pass. */
export function Studio() {
  const sweepRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.RectAreaLight>(null);
  const keyRef = useRef<THREE.RectAreaLight>(null);
  const shadowTexture = useGroundShadowTexture();

  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

  useEffect(() => {
    return () => shadowTexture?.dispose();
  }, [shadowTexture]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (sweepRef.current) {
      sweepRef.current.position.x = Math.sin(t * 0.24) * 6.5;
      sweepRef.current.position.z = Math.cos(t * 0.24) * 6.5;
      sweepRef.current.position.y = 6 + Math.sin(t * 0.4) * 1.2;
      sweepRef.current.target.position.set(0, 0.5, 0);
      sweepRef.current.target.updateMatrixWorld();
    }

    if (rimRef.current) {
      rimRef.current.intensity = 4 + Math.sin(t * 0.55) * 1.1;
    }
    if (keyRef.current) {
      keyRef.current.intensity = 7 + Math.sin(t * 0.35 + 1.2) * 1.3;
    }
  });

  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 5, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[-6, 2.4, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[14, 0.9, 1]}
          color="#cfe0ff"
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[6, 2.4, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[14, 0.7, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[0, 2.2, -7]}
          rotation={[0, Math.PI, 0]}
          scale={[9, 2.2, 1]}
          color="#ff9a52"
        />
        <Lightformer
          form="circle"
          intensity={1.2}
          position={[0, 1.6, 7]}
          rotation={[0, 0, 0]}
          scale={5}
          color="#7f9cff"
        />
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

      <rectAreaLight
        ref={keyRef}
        position={[4, 4.5, 4]}
        rotation={[-0.4, 0.7, 0]}
        width={5}
        height={3}
        intensity={7}
        color="#ffffff"
      />
      <rectAreaLight
        position={[-5, 3, 1]}
        rotation={[-0.3, -1.1, 0]}
        width={4}
        height={3}
        intensity={3.2}
        color="#6f8cff"
      />
      <rectAreaLight
        ref={rimRef}
        position={[0, 3.5, -5.5]}
        rotation={[0.3, Math.PI, 0]}
        width={5}
        height={2.4}
        intensity={4}
        color="#ff9a52"
      />

      <spotLight
        ref={sweepRef}
        position={[5, 7, 5]}
        angle={0.5}
        penumbra={1}
        intensity={1.3}
        color="#ffffff"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#020202"
          roughness={0.72}
          metalness={0.3}
        />
      </mesh>
      {shadowTexture && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
          <planeGeometry args={[9, 9]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
          />
        </mesh>
      )}
    </>
  );
}
