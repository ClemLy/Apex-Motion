import * as THREE from "three";

/** Critically-tunable spring integrator shared by every camera rig on the site. */
export function stepSpring(
  current: THREE.Vector3,
  velocity: THREE.Vector3,
  goal: THREE.Vector3,
  stiffness: number,
  damping: number,
  delta: number,
  scratch: THREE.Vector3,
) {
  // acceleration = stiffness * (goal - current) - damping * velocity
  scratch.copy(goal).sub(current).multiplyScalar(stiffness);
  scratch.addScaledVector(velocity, -damping);
  velocity.addScaledVector(scratch, delta);
  current.addScaledVector(velocity, delta);
}
