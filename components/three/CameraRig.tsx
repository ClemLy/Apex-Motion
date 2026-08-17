"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useConfigurator } from "@/lib/configurator/store";
import type { CameraFocus } from "@/lib/configurator/types";

const FOCUS_PRESETS: Record<
  CameraFocus,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  exterior: { position: [4.6, 1.9, 4.9], target: [0, 0.55, 0] },
  rear: { position: [-3.4, 1.35, -4.4], target: [0, 0.62, -1.7] },
  wheels: { position: [3.1, 0.95, 3.4], target: [0.8, 0.42, 1.15] },
  // High three-quarter angle looking down into the cabin, clear of the shell.
  cabin: { position: [2.9, 2.85, 2.5], target: [0, 0.75, -0.2] },
};

/** Critically-under-damped spring, tuned for a heavy cinematic glide. */
const STIFFNESS = 42;
const DAMPING = 11;
/** How far the pointer nudges the camera, in world units. */
const PARALLAX = 0.55;

function stepSpring(
  current: THREE.Vector3,
  velocity: THREE.Vector3,
  goal: THREE.Vector3,
  delta: number,
  scratch: THREE.Vector3,
) {
  // acceleration = stiffness * (goal - current) - damping * velocity
  scratch.copy(goal).sub(current).multiplyScalar(STIFFNESS);
  scratch.addScaledVector(velocity, -DAMPING);
  velocity.addScaledVector(scratch, delta);
  current.addScaledVector(velocity, delta);
}

/**
 * Spring-physics camera choreography. Switching focus retargets the spring
 * rather than cutting, so the camera overshoots very slightly and settles,
 * carrying real inertia. Pointer position adds a subtle parallax on top.
 */
export function CameraRig() {
  const { state } = useConfigurator();
  const { camera } = useThree();

  const position = useRef(new THREE.Vector3(4.6, 1.9, 4.9));
  const positionVelocity = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3(0, 0.55, 0));
  const targetVelocity = useRef(new THREE.Vector3());

  const goalPosition = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const scratch = useRef(new THREE.Vector3());

  useFrame(({ pointer }, delta) => {
    // Guard against long frames (tab restore) destabilising the integrator.
    const dt = Math.min(delta, 1 / 30);
    const preset = FOCUS_PRESETS[state.focus];

    goalPosition.current.set(...preset.position);
    goalTarget.current.set(...preset.target);

    // Pointer parallax, orbiting slightly around the focus point.
    goalPosition.current.x += pointer.x * PARALLAX;
    goalPosition.current.y += pointer.y * PARALLAX * 0.45;

    stepSpring(
      position.current,
      positionVelocity.current,
      goalPosition.current,
      dt,
      scratch.current,
    );
    stepSpring(
      target.current,
      targetVelocity.current,
      goalTarget.current,
      dt,
      scratch.current,
    );

    camera.position.copy(position.current);
    camera.lookAt(target.current);
  });

  return null;
}
