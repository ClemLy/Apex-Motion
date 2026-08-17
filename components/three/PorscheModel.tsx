"use client";

import { useEffect, useMemo, useRef, type ComponentProps } from "react";
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

function usePaintSpec() {
  const { state } = useConfigurator();
  return useMemo(
    () => paintOptions.find((p) => p.id === state.paintId) ?? paintOptions[0],
    [state.paintId],
  );
}

type PaintedBoxProps = Omit<ComponentProps<typeof RoundedBox>, "children">;

/**
 * A bodywork panel whose material eases toward the selected paint every frame,
 * so finish changes read as the lacquer morphing rather than a hard swap.
 */
function PaintedBox(props: PaintedBoxProps) {
  const paint = usePaintSpec();
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const goalColor = useMemo(() => new THREE.Color(paint.color), [paint.color]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const k = 1 - Math.pow(0.0015, delta);
    material.color.lerp(goalColor, k);
    material.roughness += (paint.roughness - material.roughness) * k;
    material.metalness += (paint.metalness - material.metalness) * k;
    material.clearcoat += (paint.clearcoat - material.clearcoat) * k;
  });

  return (
    <RoundedBox {...props}>
      <meshPhysicalMaterial
        ref={materialRef}
        color={paint.color}
        roughness={paint.roughness}
        metalness={paint.metalness}
        clearcoat={paint.clearcoat}
        clearcoatRoughness={0.14}
        envMapIntensity={1.1}
      />
    </RoundedBox>
  );
}

function Wheel({
  position,
  wheelId,
  caliperColor,
}: {
  position: [number, number, number];
  wheelId: string;
  caliperColor: string;
}) {
  const spokes =
    wheelId === "gt-center-lock" ? 5 : wheelId === "carrera-classic" ? 8 : 6;

  const caliperRef = useRef<THREE.MeshStandardMaterial>(null);
  const flash = useRef(0);

  // Any caliper or rim change pulses the emissive channel briefly.
  useEffect(() => {
    flash.current = 1;
  }, [caliperColor, wheelId]);

  useFrame((_, delta) => {
    const material = caliperRef.current;
    if (!material) return;
    flash.current = Math.max(0, flash.current - delta * 2.2);
    material.emissiveIntensity = flash.current * 2.6;
  });

  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.26, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.24, 0.24, 0.28, 32]} />
        <meshStandardMaterial
          color="#d8d8d8"
          roughness={0.32}
          metalness={0.9}
        />
      </mesh>
      {Array.from({ length: spokes }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i / spokes) * Math.PI * 2]}>
          <boxGeometry args={[0.29, 0.045, 0.04]} />
          <meshStandardMaterial
            color="#9a9a9a"
            roughness={0.38}
            metalness={0.85}
          />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 24]} />
        <meshStandardMaterial
          ref={caliperRef}
          color={caliperColor}
          emissive={caliperColor}
          emissiveIntensity={0}
          roughness={0.38}
          metalness={0.35}
        />
      </mesh>
    </group>
  );
}

export function PorscheModel() {
  const { state } = useConfigurator();
  const floatRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Group>(null);
  const widthRef = useRef(1);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(t * 0.6) * 0.015;
    }

    // Widebody eases in on the shell scale rather than snapping.
    if (shellRef.current) {
      const goalWidth = state.widebody ? 1.108 : 1;
      widthRef.current +=
        (goalWidth - widthRef.current) * (1 - Math.pow(0.002, delta));
      shellRef.current.scale.x = widthRef.current;
    }
  });

  const bodyWidth = 1.85;
  const caliperColor = caliperColors[state.caliperColor];

  return (
    <group ref={floatRef}>
      {/* Painted bodywork: the only subtree that widens with the widebody kit. */}
      <group ref={shellRef}>
        {/* Main body shell */}
        <PaintedBox
          args={[bodyWidth, 0.62, 3.7]}
          radius={0.28}
          smoothness={6}
          position={[0, 0.55, 0]}
          castShadow
        />

        {/* Cabin / greenhouse, lifted away while inspecting the interior. */}
        <RoundedBox
          args={[bodyWidth * 0.82, 0.46, 1.65]}
          radius={0.22}
          smoothness={6}
          position={[0, 0.98, -0.15]}
          visible={!state.cabinView}
          castShadow
        >
          <meshPhysicalMaterial
            color="#050607"
            roughness={0.08}
            metalness={0.2}
            transmission={0.6}
            thickness={0.4}
            ior={1.45}
          />
        </RoundedBox>

        {/* Front nose taper */}
        <PaintedBox
          args={[bodyWidth * 0.94, 0.4, 0.7]}
          radius={0.22}
          smoothness={6}
          position={[0, 0.42, 1.85]}
          castShadow
        />

        {/* Rear deck */}
        <PaintedBox
          args={[bodyWidth * 0.94, 0.36, 0.6]}
          radius={0.2}
          smoothness={6}
          position={[0, 0.5, -1.9]}
          castShadow
        />

        {/* Front splitter */}
        {state.splitter && (
          <RoundedBox
            args={[bodyWidth * 1.05, 0.06, 0.35]}
            radius={0.02}
            position={[0, 0.14, 2.1]}
            castShadow
          >
            <meshStandardMaterial
              color="#0a0a0a"
              roughness={0.4}
              metalness={0.25}
            />
          </RoundedBox>
        )}

        {/* Rear wing */}
        {state.wing && (
          <group position={[0, 0.95, -2.05]}>
            <mesh position={[-0.55, -0.22, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.06]} />
              <meshStandardMaterial
                color="#0a0a0a"
                roughness={0.5}
                metalness={0.35}
              />
            </mesh>
            <mesh position={[0.55, -0.22, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.06]} />
              <meshStandardMaterial
                color="#0a0a0a"
                roughness={0.5}
                metalness={0.35}
              />
            </mesh>
            <PaintedBox
              args={[bodyWidth * 0.9, 0.06, 0.34]}
              radius={0.02}
              castShadow
            />
          </group>
        )}
      </group>

      {/* Wheels sit outside the widebody scale so they never stretch. */}
      {WHEEL_POSITIONS.map((pos, i) => (
        <Wheel
          key={i}
          position={pos}
          wheelId={state.wheelId}
          caliperColor={caliperColor}
        />
      ))}

      {/* Cabin interior, revealed on the interior focus */}
      <group position={[0, 0.62, -0.1]} visible={state.cabinView}>
        <RoundedBox
          args={[bodyWidth * 0.7, 0.08, 1.2]}
          radius={0.03}
          position={[0, 0, 0.6]}
        >
          <meshStandardMaterial
            color="#1c1c1e"
            roughness={0.6}
            metalness={0.1}
          />
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
              roughness={state.interiorTrim === "leather" ? 0.55 : 0.9}
              metalness={0.05}
            />
          </RoundedBox>
        ))}
        {state.rollCage && (
          <group>
            {[-0.6, 0.6].map((x) => (
              <mesh key={x} position={[x, 0.35, -0.55]} castShadow>
                <torusGeometry args={[0.42, 0.025, 8, 24, Math.PI]} />
                <meshStandardMaterial
                  color="#e8e8e8"
                  roughness={0.3}
                  metalness={0.9}
                />
              </mesh>
            ))}
            <mesh position={[0, 0.75, -0.55]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 1.2, 12]} />
              <meshStandardMaterial
                color="#e8e8e8"
                roughness={0.3}
                metalness={0.9}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
