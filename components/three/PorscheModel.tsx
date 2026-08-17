"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useConfigurator } from "@/lib/configurator/store";
import { caliperColors, paintOptions } from "@/lib/configurator/types";

const WHEEL_POSITIONS: [number, number, number][] = [
  [-0.95, 0.38, 1.35],
  [0.95, 0.38, 1.35],
  [-0.95, 0.38, -1.35],
  [0.95, 0.38, -1.35],
];

function Wheel({
  position,
  wheelId,
  caliperColor,
}: {
  position: [number, number, number];
  wheelId: string;
  caliperColor: string;
}) {
  const spokes = wheelId === "gt-center-lock" ? 5 : wheelId === "carrera-classic" ? 8 : 6;

  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.26, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.24, 0.24, 0.28, 32]} />
        <meshStandardMaterial color="#d8d8d8" roughness={0.35} metalness={0.85} />
      </mesh>
      {Array.from({ length: spokes }).map((_, i) => (
        <mesh
          key={i}
          rotation={[0, 0, (i / spokes) * Math.PI * 2]}
          position={[0, 0, 0]}
        >
          <boxGeometry args={[0.29, 0.045, 0.04]} />
          <meshStandardMaterial color="#9a9a9a" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 24]} />
        <meshStandardMaterial color={caliperColor} roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function PorscheModel() {
  const { state } = useConfigurator();
  const bodyRef = useRef<THREE.Group>(null);

  const paint = useMemo(
    () => paintOptions.find((p) => p.id === state.paintId) ?? paintOptions[0],
    [state.paintId],
  );

  useFrame((frameState) => {
    if (!bodyRef.current) return;
    const t = frameState.clock.getElapsedTime();
    bodyRef.current.position.y = Math.sin(t * 0.6) * 0.015;
  });

  const bodyWidth = state.widebody ? 2.05 : 1.85;
  const caliperColor = caliperColors[state.caliperColor];

  return (
    <group ref={bodyRef} position={[0, 0, 0]}>
      {/* Main body shell */}
      <RoundedBox
        args={[bodyWidth, 0.62, 3.7]}
        radius={0.28}
        smoothness={6}
        position={[0, 0.55, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color={paint.color}
          roughness={paint.roughness}
          metalness={paint.metalness}
          clearcoat={paint.clearcoat}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>

      {/* Cabin / greenhouse */}
      <RoundedBox
        args={[bodyWidth * 0.82, 0.46, 1.65]}
        radius={0.22}
        smoothness={6}
        position={[0, 0.98, -0.15]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#050607"
          roughness={0.1}
          metalness={0.2}
          transmission={0.55}
          thickness={0.4}
          ior={1.4}
        />
      </RoundedBox>

      {/* Front nose taper */}
      <RoundedBox
        args={[bodyWidth * 0.94, 0.4, 0.7]}
        radius={0.22}
        smoothness={6}
        position={[0, 0.42, 1.85]}
        castShadow
      >
        <meshPhysicalMaterial
          color={paint.color}
          roughness={paint.roughness}
          metalness={paint.metalness}
          clearcoat={paint.clearcoat}
        />
      </RoundedBox>

      {/* Rear deck */}
      <RoundedBox
        args={[bodyWidth * 0.94, 0.36, 0.6]}
        radius={0.2}
        smoothness={6}
        position={[0, 0.5, -1.9]}
        castShadow
      >
        <meshPhysicalMaterial
          color={paint.color}
          roughness={paint.roughness}
          metalness={paint.metalness}
          clearcoat={paint.clearcoat}
        />
      </RoundedBox>

      {/* Widebody flares */}
      {state.widebody && (
        <>
          <RoundedBox
            args={[0.12, 0.5, 3.4]}
            radius={0.06}
            position={[-bodyWidth / 2 - 0.02, 0.5, 0]}
            castShadow
          >
            <meshPhysicalMaterial color={paint.color} roughness={paint.roughness} metalness={paint.metalness} />
          </RoundedBox>
          <RoundedBox
            args={[0.12, 0.5, 3.4]}
            radius={0.06}
            position={[bodyWidth / 2 + 0.02, 0.5, 0]}
            castShadow
          >
            <meshPhysicalMaterial color={paint.color} roughness={paint.roughness} metalness={paint.metalness} />
          </RoundedBox>
        </>
      )}

      {/* Front splitter */}
      {state.splitter && (
        <RoundedBox
          args={[bodyWidth * 1.05, 0.06, 0.35]}
          radius={0.02}
          position={[0, 0.14, 2.1]}
          castShadow
        >
          <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.2} />
        </RoundedBox>
      )}

      {/* Rear wing */}
      {state.wing && (
        <group position={[0, 0.95, -2.05]}>
          <mesh position={[-0.55, -0.22, 0]} castShadow>
            <boxGeometry args={[0.06, 0.44, 0.06]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0.55, -0.22, 0]} castShadow>
            <boxGeometry args={[0.06, 0.44, 0.06]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
          </mesh>
          <RoundedBox args={[bodyWidth * 0.9, 0.06, 0.34]} radius={0.02} castShadow>
            <meshPhysicalMaterial
              color={paint.color}
              roughness={paint.roughness}
              metalness={paint.metalness}
              clearcoat={paint.clearcoat}
            />
          </RoundedBox>
        </group>
      )}

      {/* Wheels */}
      {WHEEL_POSITIONS.map((pos, i) => (
        <Wheel
          key={i}
          position={pos}
          wheelId={state.wheelId}
          caliperColor={caliperColor}
        />
      ))}

      {/* Interior (visible primarily on cabin focus) */}
      <group position={[0, 0.62, -0.1]} visible={state.cabinView}>
        <RoundedBox args={[bodyWidth * 0.7, 0.08, 1.2]} radius={0.03} position={[0, 0, 0.6]}>
          <meshStandardMaterial color="#1c1c1e" roughness={0.6} metalness={0.1} />
        </RoundedBox>
        {[-0.35, 0.35].map((x) => (
          <RoundedBox
            key={x}
            args={[0.35, 0.5, 0.45]}
            radius={0.08}
            position={[x, 0.15, -0.1]}
          >
            <meshStandardMaterial
              color={state.interiorTrim === "leather" ? "#3b2418" : "#1a1a1a"}
              roughness={state.interiorTrim === "leather" ? 0.55 : 0.85}
              metalness={0.05}
            />
          </RoundedBox>
        ))}
        {state.rollCage && (
          <group>
            {[-0.6, 0.6].map((x) => (
              <mesh key={x} position={[x, 0.35, -0.55]} castShadow>
                <torusGeometry args={[0.42, 0.025, 8, 24, Math.PI]} />
                <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.9} />
              </mesh>
            ))}
            <mesh position={[0, 0.75, -0.55]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 1.2, 12]} />
              <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
