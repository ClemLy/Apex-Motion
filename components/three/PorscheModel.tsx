"use client";

import { useEffect, useMemo, useRef, type ComponentProps } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useConfigurator } from "@/lib/configurator/store";
import { caliperColors, paintOptions } from "@/lib/configurator/types";
import {
  getCarbonNormalMap,
  getClearcoatNormalMap,
} from "@/lib/three/textures";

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
 * A bodywork panel.
 *
 * The material eases toward the selected paint every frame, so a finish change
 * reads as the lacquer morphing rather than a hard swap. A very low amplitude
 * clearcoat normal map adds the orange-peel of a real sprayed panel, which is
 * what stops the surface looking like moulded plastic.
 */
function PaintedBox(props: PaintedBoxProps) {
  const paint = usePaintSpec();
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const goalColor = useMemo(() => new THREE.Color(paint.color), [paint.color]);
  const clearcoatNormal = useMemo(() => getClearcoatNormalMap(), []);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const k = 1 - Math.pow(0.0015, delta);
    material.color.lerp(goalColor, k);
    material.roughness += (paint.roughness - material.roughness) * k;
    material.metalness += (paint.metalness - material.metalness) * k;
    material.clearcoat += (paint.clearcoat - material.clearcoat) * k;
    // Matte finishes get a diffused clearcoat, gloss gets a wet mirror.
    const goalCcRough = paint.finish === "matte" ? 0.55 : 0.03;
    material.clearcoatRoughness +=
      (goalCcRough - material.clearcoatRoughness) * k;
  });

  return (
    <RoundedBox {...props}>
      <meshPhysicalMaterial
        ref={materialRef}
        color={paint.color}
        roughness={paint.roughness}
        metalness={paint.metalness}
        clearcoat={paint.clearcoat}
        clearcoatRoughness={paint.finish === "matte" ? 0.55 : 0.03}
        clearcoatNormalMap={clearcoatNormal ?? undefined}
        clearcoatNormalScale={new THREE.Vector2(0.06, 0.06)}
        envMapIntensity={1.5}
        specularIntensity={1}
      />
    </RoundedBox>
  );
}

/** Dry carbon composite, used for aero parts and the roll cage mounts. */
function CarbonMaterial() {
  const normalMap = useMemo(() => getCarbonNormalMap(), []);
  return (
    <meshPhysicalMaterial
      color="#08090b"
      roughness={0.34}
      metalness={0.42}
      clearcoat={1}
      clearcoatRoughness={0.09}
      normalMap={normalMap ?? undefined}
      normalScale={new THREE.Vector2(0.55, 0.55)}
      envMapIntensity={1.25}
    />
  );
}

/**
 * Wheel with real rotational inertia.
 *
 * Changing rims or calipers spins the wheel up and lets it coast down through
 * angular damping, so the configurator feels mechanical instead of instant.
 */
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

  const groupRef = useRef<THREE.Group>(null);
  const caliperRef = useRef<THREE.MeshStandardMaterial>(null);
  const angularVelocity = useRef(0);
  const flash = useRef(0);

  // Any rim or caliper change kicks the wheel and pulses the caliper.
  useEffect(() => {
    angularVelocity.current = 15;
    flash.current = 1;
  }, [wheelId, caliperColor]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);

    if (groupRef.current && Math.abs(angularVelocity.current) > 0.0005) {
      groupRef.current.rotation.x += angularVelocity.current * dt;
      // Exponential angular damping: a heavy wheel coasting to rest.
      angularVelocity.current *= Math.pow(0.12, dt);
      if (Math.abs(angularVelocity.current) < 0.02) angularVelocity.current = 0;
    }

    const material = caliperRef.current;
    if (material) {
      flash.current = Math.max(0, flash.current - dt * 2.2);
      material.emissiveIntensity = flash.current * 2.6;
    }
  });

  return (
    <group position={position}>
      {/* Rotating assembly. The caliper stays fixed, as on a real car. */}
      <group ref={groupRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.26, 32]} />
          <meshPhysicalMaterial
            color="#0c0c0d"
            roughness={0.78}
            metalness={0.15}
            clearcoat={0.3}
            clearcoatRoughness={0.6}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.28, 32]} />
          <meshPhysicalMaterial
            color="#d8dade"
            roughness={0.18}
            metalness={1}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={1.8}
          />
        </mesh>
        {Array.from({ length: spokes }).map((_, i) => (
          <mesh key={i} rotation={[(i / spokes) * Math.PI * 2, 0, 0]}>
            <boxGeometry args={[0.3, 0.05, 0.42]} />
            <meshPhysicalMaterial
              color="#a8abb0"
              roughness={0.22}
              metalness={1}
              clearcoat={1}
              clearcoatRoughness={0.08}
              envMapIntensity={1.6}
            />
          </mesh>
        ))}
        {/* Brake disc, visible through the spokes. */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.21, 0.21, 0.04, 32]} />
          <meshStandardMaterial
            color="#2a2c2f"
            roughness={0.55}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Fixed caliper */}
      <mesh position={[0, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.14, 0.16, 0.09]} />
        <meshStandardMaterial
          ref={caliperRef}
          color={caliperColor}
          emissive={caliperColor}
          emissiveIntensity={0}
          roughness={0.32}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

/**
 * LED matrix signature.
 *
 * The four-point daytime running light and the full-width rear bar are the two
 * cues that read instantly as a modern 911, so they get their own emissive
 * geometry with a slow breathing intensity.
 */
function LightSignature({ bodyWidth }: { bodyWidth: number }) {
  const frontRef = useRef<THREE.MeshStandardMaterial>(null);
  const rearRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (frontRef.current) {
      frontRef.current.emissiveIntensity = 3.4 + Math.sin(t * 1.1) * 0.35;
    }
    if (rearRef.current) {
      rearRef.current.emissiveIntensity = 2.6 + Math.sin(t * 0.8 + 1.5) * 0.3;
    }
  });

  return (
    <group>
      {/* Four-point DRL clusters */}
      {[-0.62, 0.62].map((x) => (
        <group key={x} position={[x, 0.62, 2.18]}>
          {[-0.09, 0.09].map((dy) =>
            [-0.07, 0.07].map((dx) => (
              <mesh key={`${dx}-${dy}`} position={[dx, dy, 0]}>
                <boxGeometry args={[0.05, 0.05, 0.03]} />
                <meshStandardMaterial
                  ref={dx > 0 && dy > 0 ? frontRef : undefined}
                  color="#ffffff"
                  emissive="#dceaff"
                  emissiveIntensity={3.4}
                  toneMapped={false}
                />
              </mesh>
            )),
          )}
        </group>
      ))}

      {/* Full-width rear light bar */}
      <mesh position={[0, 0.68, -2.19]}>
        <boxGeometry args={[bodyWidth * 0.82, 0.055, 0.03]} />
        <meshStandardMaterial
          ref={rearRef}
          color="#ff2a1a"
          emissive="#ff2a1a"
          emissiveIntensity={2.6}
          toneMapped={false}
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

        {/* Cabin / greenhouse, hidden while inspecting the interior. */}
        <RoundedBox
          args={[bodyWidth * 0.82, 0.46, 1.65]}
          radius={0.22}
          smoothness={6}
          position={[0, 0.98, -0.15]}
          visible={!state.cabinView}
          castShadow
        >
          <meshPhysicalMaterial
            color="#040506"
            roughness={0.04}
            metalness={0.1}
            transmission={0.55}
            thickness={0.5}
            ior={1.52}
            clearcoat={1}
            clearcoatRoughness={0.02}
            envMapIntensity={2.2}
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

        <LightSignature bodyWidth={bodyWidth} />

        {/* Front splitter, dry carbon */}
        {state.splitter && (
          <RoundedBox
            args={[bodyWidth * 1.05, 0.06, 0.35]}
            radius={0.02}
            position={[0, 0.14, 2.1]}
            castShadow
          >
            <CarbonMaterial />
          </RoundedBox>
        )}

        {/* Rear wing, carbon uprights with a painted blade */}
        {state.wing && (
          <group position={[0, 0.95, -2.05]}>
            <mesh position={[-0.55, -0.22, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.06]} />
              <CarbonMaterial />
            </mesh>
            <mesh position={[0.55, -0.22, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.06]} />
              <CarbonMaterial />
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
            color="#141416"
            roughness={0.6}
            metalness={0.15}
          />
        </RoundedBox>
        {[-0.35, 0.35].map((x) => (
          <RoundedBox
            key={x}
            args={[0.35, 0.5, 0.45]}
            radius={0.08}
            position={[x, 0.15, -0.1]}
          >
            <meshPhysicalMaterial
              color={state.interiorTrim === "leather" ? "#4a2c1b" : "#151517"}
              roughness={state.interiorTrim === "leather" ? 0.48 : 0.95}
              metalness={0.04}
              clearcoat={state.interiorTrim === "leather" ? 0.45 : 0}
              clearcoatRoughness={0.5}
              sheen={state.interiorTrim === "alcantara" ? 1 : 0}
              sheenColor="#6b6b70"
              sheenRoughness={0.8}
            />
          </RoundedBox>
        ))}
        {state.rollCage && (
          <group>
            {[-0.6, 0.6].map((x) => (
              <mesh key={x} position={[x, 0.35, -0.55]} castShadow>
                <torusGeometry args={[0.42, 0.025, 8, 24, Math.PI]} />
                <meshPhysicalMaterial
                  color="#dfe1e4"
                  roughness={0.2}
                  metalness={1}
                  clearcoat={1}
                  clearcoatRoughness={0.08}
                  envMapIntensity={1.7}
                />
              </mesh>
            ))}
            <mesh position={[0, 0.75, -0.55]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 1.2, 12]} />
              <meshPhysicalMaterial
                color="#dfe1e4"
                roughness={0.2}
                metalness={1}
                clearcoat={1}
                clearcoatRoughness={0.08}
                envMapIntensity={1.7}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
