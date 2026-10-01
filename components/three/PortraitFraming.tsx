"use client";

import { useLayoutEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { portraitDistanceScale } from "@/lib/three/frameCamera";

/**
 * Keeps a camera's framing readable on portrait screens. Canvases
 * whose camera never moves after mount (HeroCanvas, ParticleAssembly) are
 * authored for a landscape viewport; on a phone the narrower horizontal FOV
 * would crop the car to a door and a wheel. This dollies the camera back
 * along its own view axis (same angle, more distance) whenever the canvas
 * size changes, and can optionally lift the subject in frame so overlaid
 * copy at the bottom of the screen doesn't sit on top of the bodywork.
 *
 * The scene's linear fog is pushed back by the same factor — its near/far
 * planes are tuned to the authored distance, so a camera pulled back without
 * it would see the car sink into the fog. Canvases whose camera is driven
 * elsewhere (CameraRig, OrbitControls) pass `moveCamera={false}` to get only
 * the fog half.
 */
export function PortraitFraming({
  target = [0, 0, 0],
  maxScale,
  liftY = 0,
  moveCamera = true,
}: {
  /** The point the camera looks at — R3F's default camera looks at the origin. */
  target?: [number, number, number];
  maxScale?: number;
  /** Fraction of the canvas height to raise the subject by on portrait screens. */
  liftY?: number;
  moveCamera?: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const invalidate = useThree((s) => s.invalidate);
  const get = useThree((s) => s.get);
  const basePosition = useRef<THREE.Vector3 | null>(null);
  const baseFog = useRef<{ near: number; far: number } | null>(null);
  const [tx, ty, tz] = target;

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || height === 0) return;
    // Captured once: the authored position every later resize scales from,
    // so repeated resizes never compound.
    if (!basePosition.current) basePosition.current = camera.position.clone();

    const aspect = width / height;
    const scale = portraitDistanceScale(aspect, undefined, maxScale);

    // Read through get() rather than a subscribed `scene` value: this effect
    // mutates the fog object in place, which is what three.js expects.
    const fog = get().scene.fog;
    if (fog instanceof THREE.Fog) {
      if (!baseFog.current) baseFog.current = { near: fog.near, far: fog.far };
      fog.near = baseFog.current.near * scale;
      fog.far = baseFog.current.far * scale;
    }

    if (!moveCamera) {
      invalidate();
      return;
    }

    const focus = new THREE.Vector3(tx, ty, tz);
    camera.position
      .copy(basePosition.current)
      .sub(focus)
      .multiplyScalar(scale)
      .add(focus);
    camera.lookAt(focus);

    if (liftY > 0 && aspect < 1) {
      camera.setViewOffset(width, height, 0, height * liftY, width, height);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
    invalidate();
  }, [
    camera,
    get,
    width,
    height,
    tx,
    ty,
    tz,
    maxScale,
    liftY,
    moveCamera,
    invalidate,
  ]);

  return null;
}
