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
): FramedCamera {
  const box = new THREE.Box3().setFromObject(object);
  const sphere = box.getBoundingSphere(new THREE.Sphere());

  const direction = new THREE.Vector3(...referencePosition)
    .sub(new THREE.Vector3(...referenceTarget))
    .normalize();

  const fovRadians = (fovDegrees * Math.PI) / 180;
  const distance = (sphere.radius / Math.sin(fovRadians / 2)) * padding;

  const position = sphere.center.clone().addScaledVector(direction, distance);

  return {
    position: [position.x, position.y, position.z],
    target: [sphere.center.x, sphere.center.y, sphere.center.z],
  };
}
