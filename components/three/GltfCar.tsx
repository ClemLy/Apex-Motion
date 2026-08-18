"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { CarConfig } from "@/lib/three/carConfigs";

useGLTF.setDecoderPath("/draco/");

function matchesMaterial(
  name: string | undefined,
  spec: { match: string; exact?: boolean },
) {
  if (!name) return false;
  return spec.exact ? name === spec.match : name.includes(spec.match);
}

export interface PaintSpec {
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

interface GltfCarProps {
  config: CarConfig;
  /** When provided, paint-tagged panels ease live toward this spec. */
  paint?: PaintSpec;
  /** When provided, the shared wheel material eases toward this color. */
  wheelColor?: string;
  /** When provided, the shared caliper material eases toward this color. */
  caliperColor?: string;
  /** Node groups to hide, keyed by the same names used in config.toggleNodes. */
  hidden?: string[];
}

/** Clones the shared .glb scene so multiple canvases don't mutate drei's cache. */
export function GltfCar({
  config,
  paint,
  wheelColor,
  caliperColor,
  hidden,
}: GltfCarProps) {
  const { scene } = useGLTF(config.url);

  const cloned = useMemo(() => scene.clone(true), [scene]);

  const paintMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const wheelMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const caliperMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const toggleNodesRef = useRef<Record<string, THREE.Object3D[]>>({});

  useEffect(() => {
    let paintMaterial: THREE.MeshPhysicalMaterial | null = null;
    let wheelMaterial: THREE.MeshStandardMaterial | null = null;
    let caliperMaterial: THREE.MeshStandardMaterial | null = null;
    const toggleGroups: Record<string, THREE.Object3D[]> = {};
    for (const key of Object.keys(config.toggleNodes ?? {})) {
      toggleGroups[key] = [];
    }

    cloned.traverse((object) => {
      for (const [key, names] of Object.entries(config.toggleNodes ?? {})) {
        if (names.includes(object.name)) {
          toggleGroups[key].push(object);
        }
      }

      if (config.permanentlyHidden?.includes(object.name)) {
        object.visible = false;
      }

      if (!(object instanceof THREE.Mesh)) return;
      // Original name is cached on first pass: React StrictMode (and any
      // remount that reuses this same clone) re-runs this effect, and by
      // then `object.material` has already been swapped to an anonymous
      // shared instance, so matching against the live material name would
      // silently fail on every pass after the first.
      if (object.userData.__origMaterialName === undefined) {
        object.userData.__origMaterialName = (
          object.material as THREE.Material | undefined
        )?.name;
      }
      const name = object.userData.__origMaterialName as string | undefined;

      if (
        !paintMaterial &&
        config.paintMaterials.some((spec) => matchesMaterial(name, spec))
      ) {
        paintMaterial = new THREE.MeshPhysicalMaterial({
          envMapIntensity: 1,
        });
      }
      if (
        config.paintMaterials.some((spec) => matchesMaterial(name, spec)) &&
        paintMaterial
      ) {
        object.material = paintMaterial;
      }

      if (config.wheelMaterial && matchesMaterial(name, config.wheelMaterial)) {
        if (!wheelMaterial) {
          wheelMaterial = new THREE.MeshStandardMaterial({
            roughness: 0.28,
            metalness: 0.95,
            envMapIntensity: 1.1,
          });
        }
        object.material = wheelMaterial;
      }

      if (
        config.caliperMaterial &&
        matchesMaterial(name, config.caliperMaterial)
      ) {
        if (!caliperMaterial) {
          caliperMaterial = new THREE.MeshStandardMaterial({
            roughness: 0.35,
            metalness: 0.4,
          });
        }
        object.material = caliperMaterial;
      }
    });

    paintMaterialRef.current = paintMaterial;
    wheelMaterialRef.current = wheelMaterial;
    caliperMaterialRef.current = caliperMaterial;
    toggleNodesRef.current = toggleGroups;

    return () => {
      paintMaterial?.dispose();
      wheelMaterial?.dispose();
      caliperMaterial?.dispose();
    };
  }, [cloned, config]);

  // Apply visibility toggles whenever the requested set changes.
  useEffect(() => {
    for (const [key, nodes] of Object.entries(toggleNodesRef.current)) {
      const isHidden = hidden?.includes(key) ?? false;
      for (const node of nodes) node.visible = !isHidden;
    }
  }, [hidden]);

  const goalColor = useMemo(
    () => (paint ? new THREE.Color(paint.color) : null),
    [paint],
  );
  const goalWheelColor = useMemo(
    () => (wheelColor ? new THREE.Color(wheelColor) : null),
    [wheelColor],
  );
  const goalCaliperColor = useMemo(
    () => (caliperColor ? new THREE.Color(caliperColor) : null),
    [caliperColor],
  );

  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.0015, delta);

    const paintMat = paintMaterialRef.current;
    if (paintMat && paint && goalColor) {
      paintMat.color.lerp(goalColor, k);
      paintMat.roughness += (paint.roughness - paintMat.roughness) * k;
      paintMat.metalness += (paint.metalness - paintMat.metalness) * k;
      paintMat.clearcoat += (paint.clearcoat - paintMat.clearcoat) * k;
      paintMat.clearcoatRoughness +=
        (paint.clearcoatRoughness - paintMat.clearcoatRoughness) * k;
    }

    const wheelMat = wheelMaterialRef.current;
    if (wheelMat && goalWheelColor) {
      wheelMat.color.lerp(goalWheelColor, k);
    }

    const caliperMat = caliperMaterialRef.current;
    if (caliperMat && goalCaliperColor) {
      caliperMat.color.lerp(goalCaliperColor, k);
      caliperMat.emissive.lerp(goalCaliperColor, k);
    }
  });

  return <primitive object={cloned} scale={config.scale} />;
}
