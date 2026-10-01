import * as THREE from "three";

export interface FramedCamera {
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * Positions a camera to consistently fill the frame with `object`, regardless
 * of the object's real-world size, while preserving the viewing angle implied
 * by `referencePosition`/`referenceTarget` (a hand-authored CarConfig camera
 * preset). Distance is derived from the object's actual bounding sphere
 * rather than the preset's own (possibly untuned) distance, so any car —
 * current or future — fills a comparable fraction of the frame without a
 * per-car manual pass.
 */
export function frameObject(
  object: THREE.Object3D,
  referencePosition: [number, number, number],
  referenceTarget: [number, number, number],
  fovDegrees: number,
  padding = 1.35,
  aspect = 1,
): FramedCamera {
  const box = new THREE.Box3().setFromObject(object);
  const sphere = box.getBoundingSphere(new THREE.Sphere());

  const direction = new THREE.Vector3(...referencePosition)
    .sub(new THREE.Vector3(...referenceTarget))
    .normalize();

  // Fit against whichever field of view is narrower — on a portrait screen
  // that's the horizontal one, and fitting only the vertical FOV would crop
  // the car's nose and tail off the sides.
  const vFov = (fovDegrees * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const fovRadians = Math.min(vFov, hFov);
  const distance = (sphere.radius / Math.sin(fovRadians / 2)) * padding;

  const position = sphere.center.clone().addScaledVector(direction, distance);

  return {
    position: [position.x, position.y, position.z],
    target: [sphere.center.x, sphere.center.y, sphere.center.z],
  };
}

/**
 * How much farther than its authored preset a camera should sit for a given
 * viewport aspect. Presets are tuned for landscape screens; on a narrower
 * (portrait) canvas the horizontal field of view shrinks with the aspect, so
 * the same distance crops the car's nose and tail. Pulling back by the aspect
 * ratio restores the horizontal coverage, capped so a very tall phone screen
 * doesn't shrink the car to a speck.
 */
export function portraitDistanceScale(
  aspect: number,
  referenceAspect = 1.2,
  maxScale = 1.6,
): number {
  if (!Number.isFinite(aspect) || aspect <= 0) return 1;
  return THREE.MathUtils.clamp(referenceAspect / aspect, 1, maxScale);
}
