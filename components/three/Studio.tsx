"use client";

import { useEffect } from "react";
import { ContactShadows } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

export function Studio() {
  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

  return (
    <>
      <hemisphereLight args={["#3a4356", "#050505", 0.6]} />
      <ambientLight intensity={0.3} />

      {/* Key softbox */}
      <rectAreaLight
        position={[4, 4.5, 4]}
        rotation={[-0.4, 0.7, 0]}
        width={5}
        height={3}
        intensity={16}
        color="#ffffff"
      />
      {/* Fill softbox, cool tone */}
      <rectAreaLight
        position={[-5, 3, 1]}
        rotation={[-0.3, -1.1, 0]}
        width={4}
        height={3}
        intensity={7}
        color="#6f8cff"
      />
      {/* Rim softbox, warm tone, from behind */}
      <rectAreaLight
        position={[0, 3.5, -5.5]}
        rotation={[0.3, Math.PI, 0]}
        width={5}
        height={2.4}
        intensity={9}
        color="#ff9a52"
      />

      <spotLight
        position={[5, 7, 5]}
        angle={0.55}
        penumbra={1}
        intensity={1.6}
        color="#ffffff"
        castShadow
      />

      <ContactShadows
        position={[0, -0.001, 0]}
        opacity={0.6}
        scale={12}
        blur={2.4}
        far={4}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#030303" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  );
}
