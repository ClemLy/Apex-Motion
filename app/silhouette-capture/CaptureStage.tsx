"use client";

import { Suspense, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Studio } from "@/components/three/Studio";
import { GltfCar } from "@/components/three/GltfCar";
import type { CarConfig } from "@/lib/three/carConfigs";
import { paintOptions, wheelFinishOptions } from "@/lib/configurator/types";

/** Same showcase paint HeroCanvas/ConfiguratorTeaser use, so the fleet reads consistently across the site. */
const SHOWCASE_PAINT =
  paintOptions.find((p) => p.id === "gt-silver") ?? paintOptions[0];
const SHOWCASE_WHEEL =
  wheelFinishOptions.find((w) => w.id === "silver") ?? wheelFinishOptions[0];

/** Shared across every car — this is what preserves real size differences
 * between a 917K and a GT3RS instead of auto-framing each to fill its own frame. */
const ORTHO_ZOOM = 200;
/** How tall a world-space "window" each capture frames, anchored to each
 * car's own ground contact point — keeps every car's wheels on the same
 * pixel row regardless of ride height. */
const FRAME_HALF_HEIGHT = 1.05;

/** Positions the shared orthographic camera side-on, offset per car so the
 * lowest point of its own bounding box (the wheels) lands at a consistent
 * screen height across every capture. Flags the page ready once the first
 * real frame has rendered — one car, one context, one page load, so
 * scripts/capture-fleet-images.mjs never has to juggle several live WebGL
 * contexts at once. */
function GroundedRig({ carRef }: { carRef: RefObject<THREE.Group | null> }) {
  const invalidate = useThree((state) => state.invalidate);
  const doneRef = useRef(false);
  const frameCountRef = useRef(0);

  // Two frames of run-up: one for the model to finish mounting into the
  // scene graph after Suspense resolves, one more for the resulting layout
  // to settle, before the one-time framing pass below.
  useFrame(({ camera, scene, gl }) => {
    if (doneRef.current) return;
    frameCountRef.current += 1;
    if (frameCountRef.current < 3) {
      invalidate();
      return;
    }
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    camera.zoom = ORTHO_ZOOM;

    const carGroup = carRef.current;
    if (!carGroup) return;
    // Manual vertex traversal, not Box3().setFromObject(carGroup): for a
    // couple of these models (917K, Carrera 4S) that call produced a
    // wildly inflated box (~2x the real car height) even though the actual
    // render looked completely normal — the classic gotcha where cloning a
    // model with a SkinnedMesh via Object3D.clone() (drei/useGLTF's cache
    // clone) doesn't reconstruct bone bindings correctly, and Box3's
    // skinned-aware bounds computation reads that broken state even though
    // the GPU draw itself uses a different, correct path. Reading each
    // mesh's raw local vertex positions through its own matrixWorld sidesteps
    // that special-cased skinned-bounds logic entirely.
    carGroup.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const vertex = new THREE.Vector3();
    carGroup.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const position = object.geometry.attributes.position;
      if (!position) return;
      for (let i = 0; i < position.count; i += 1) {
        vertex.fromBufferAttribute(position, i);
        vertex.applyMatrix4(object.matrixWorld);
        box.expandByPoint(vertex);
      }
    });
    if (box.isEmpty()) {
      invalidate();
      return;
    }
    const groundY = box.min.y;
    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;
    const centerY = groundY + FRAME_HALF_HEIGHT;

    // Models aren't authored on a consistent forward axis — the longer of
    // the two horizontal extents is the car's nose-to-tail axis, true for
    // any car shape, so the camera sits on the *other* horizontal axis to
    // get an actual side profile instead of a front/rear view.
    const lengthIsX = box.max.x - box.min.x >= box.max.z - box.min.z;
    if (lengthIsX) {
      camera.position.set(centerX, centerY, 12);
    } else {
      camera.position.set(centerX + 12, centerY, centerZ);
    }
    camera.up.set(0, 1, 0);
    camera.lookAt(centerX, centerY, centerZ);
    camera.updateProjectionMatrix();

    gl.render(scene, camera);
    doneRef.current = true;
    document.body.dataset.captureReady = "true";
  });

  return null;
}

export function CaptureStage({
  car,
  paintId,
}: {
  car: CarConfig;
  /** Overrides the default showcase paint — e.g. for a one-off hero shot that wants to stand out from the fleet capture's uniform GT Silver. */
  paintId?: string;
}) {
  const carRef = useRef<THREE.Group>(null);
  const paint = paintId
    ? (paintOptions.find((p) => p.id === paintId) ?? SHOWCASE_PAINT)
    : SHOWCASE_PAINT;

  return (
    <div data-capture-canvas className="h-[420px] w-[1400px]">
      <Canvas
        orthographic
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        frameloop="demand"
      >
        <Suspense fallback={null}>
          <Studio />
          <group ref={carRef}>
            <GltfCar
              config={car}
              paint={paint}
              wheelColor={SHOWCASE_WHEEL.color}
            />
          </group>
          <GroundedRig carRef={carRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
