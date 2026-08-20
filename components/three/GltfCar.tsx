"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { CarConfig } from "@/lib/three/carConfigs";
import { useDebug } from "@/lib/debug/DebugProvider";

useGLTF.setDecoderPath("/draco/");

/** `wireframe` only exists on some Material subclasses, not the base type this codebase otherwise treats materials as. */
function setWireframe(material: THREE.Material, value: boolean) {
  if ("wireframe" in material) {
    (material as THREE.Material & { wireframe: boolean }).wireframe = value;
  }
}

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

export interface GltfCarHandle {
  /**
   * Jumps every material straight to the given look — no lerp — and returns
   * a closure that jumps it straight back. Meant to bracket a single
   * `gl.render()` call so a one-off frame (e.g. the compare slider's
   * "before" side) can render a look other than the live one without the
   * normal easing ever becoming visible on screen.
   */
  setInstant: (
    paint: PaintSpec,
    wheelColor: string,
    caliperColor: string,
    hidden: string[],
  ) => () => void;
}

/** Clones the shared .glb scene so multiple canvases don't mutate drei's cache. */
export const GltfCar = forwardRef<GltfCarHandle, GltfCarProps>(function GltfCar(
  { config, paint, wheelColor, caliperColor, hidden },
  ref,
) {
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

  // Debug wireframe. `scene.clone(true)` deep-clones the object graph but not
  // materials — Mesh.copy() shares them by reference — so every mesh this
  // component never repaints (glass, interior, badges...) still points at
  // the exact material instance every other clone of this same .glb shares,
  // including other canvases currently showing the same car. Mutating those
  // in place would leak wireframe across canvases with debug off; clone them
  // once per GltfCar instance instead, cached so repeated toggles reuse it.
  const { enabled: debugEnabled, wireframe: debugWireframe } = useDebug();
  const debugMaterialClones = useRef(new Map<THREE.Material, THREE.Material>());

  useEffect(() => {
    if (!debugEnabled) return;
    const clones = debugMaterialClones.current;

    const applyWireframe = (
      material: THREE.Material,
      assign: (next: THREE.Material) => void,
    ) => {
      const isOwnMaterial =
        material === paintMaterialRef.current ||
        material === wheelMaterialRef.current ||
        material === caliperMaterialRef.current;
      if (isOwnMaterial) {
        setWireframe(material, debugWireframe);
        return;
      }
      let clone = clones.get(material);
      if (!clone) {
        clone = material.clone();
        clones.set(material, clone);
      }
      setWireframe(clone, debugWireframe);
      assign(clone);
    };

    cloned.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || !object.material) return;
      if (Array.isArray(object.material)) {
        const materials = object.material;
        materials.forEach((material, index) =>
          applyWireframe(material, (next) => {
            materials[index] = next;
          }),
        );
      } else {
        applyWireframe(object.material, (next) => {
          object.material = next;
        });
      }
    });

    return () => {
      const paintMat = paintMaterialRef.current;
      const wheelMat = wheelMaterialRef.current;
      const caliperMat = caliperMaterialRef.current;
      if (paintMat) setWireframe(paintMat, false);
      if (wheelMat) setWireframe(wheelMat, false);
      if (caliperMat) setWireframe(caliperMat, false);
      clones.forEach((clone) => setWireframe(clone, false));
    };
  }, [cloned, debugEnabled, debugWireframe]);

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

  useImperativeHandle(
    ref,
    () => ({
      setInstant: (
        overridePaint,
        overrideWheelColor,
        overrideCaliperColor,
        overrideHidden,
      ) => {
        const paintMat = paintMaterialRef.current;
        const wheelMat = wheelMaterialRef.current;
        const caliperMat = caliperMaterialRef.current;

        const prevPaint = paintMat
          ? {
              color: paintMat.color.clone(),
              roughness: paintMat.roughness,
              metalness: paintMat.metalness,
              clearcoat: paintMat.clearcoat,
              clearcoatRoughness: paintMat.clearcoatRoughness,
            }
          : null;
        const prevWheelColor = wheelMat ? wheelMat.color.clone() : null;
        const prevCaliperColor = caliperMat ? caliperMat.color.clone() : null;
        const prevCaliperEmissive = caliperMat
          ? caliperMat.emissive.clone()
          : null;
        const prevHidden: Record<string, boolean> = {};
        for (const [key, nodes] of Object.entries(toggleNodesRef.current)) {
          prevHidden[key] = nodes[0] ? !nodes[0].visible : false;
        }

        const apply = (
          paintSpec: PaintSpec,
          wheel: string,
          caliper: string,
          hiddenKeys: string[],
        ) => {
          if (paintMat) {
            paintMat.color.set(paintSpec.color);
            paintMat.roughness = paintSpec.roughness;
            paintMat.metalness = paintSpec.metalness;
            paintMat.clearcoat = paintSpec.clearcoat;
            paintMat.clearcoatRoughness = paintSpec.clearcoatRoughness;
          }
          if (wheelMat) wheelMat.color.set(wheel);
          if (caliperMat) {
            caliperMat.color.set(caliper);
            caliperMat.emissive.set(caliper);
          }
          for (const [key, nodes] of Object.entries(toggleNodesRef.current)) {
            const isHidden = hiddenKeys.includes(key);
            for (const node of nodes) node.visible = !isHidden;
          }
        };

        apply(
          overridePaint,
          overrideWheelColor,
          overrideCaliperColor,
          overrideHidden,
        );

        return () => {
          if (paintMat && prevPaint) {
            paintMat.color.copy(prevPaint.color);
            paintMat.roughness = prevPaint.roughness;
            paintMat.metalness = prevPaint.metalness;
            paintMat.clearcoat = prevPaint.clearcoat;
            paintMat.clearcoatRoughness = prevPaint.clearcoatRoughness;
          }
          if (wheelMat && prevWheelColor) wheelMat.color.copy(prevWheelColor);
          if (caliperMat) {
            if (prevCaliperColor) caliperMat.color.copy(prevCaliperColor);
            if (prevCaliperEmissive)
              caliperMat.emissive.copy(prevCaliperEmissive);
          }
          for (const [key, nodes] of Object.entries(toggleNodesRef.current)) {
            const isHidden = prevHidden[key] ?? false;
            for (const node of nodes) node.visible = !isHidden;
          }
        };
      },
    }),
    [],
  );

  return <primitive object={cloned} scale={config.scale} />;
});
