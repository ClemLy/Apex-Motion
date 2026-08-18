"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useConfigurator } from "@/lib/configurator/store";
import type { CarConfig } from "@/lib/three/carConfigs";
import { stepSpring } from "@/lib/three/springs";

/**
 * Spring constants.
 *
 * Under-damped on purpose: the camera overshoots by a hair and settles, the way
 * a heavy body loads up and rebounds. Position is heavier than the look target,
 * so the framing leads and the body follows, which is what sells the mass.
 */
const POSITION_STIFFNESS = 38;
const POSITION_DAMPING = 10.5;
const TARGET_STIFFNESS = 55;
const TARGET_DAMPING = 13;

/** How far the pointer nudges the camera, in world units. */
const PARALLAX = 0.55;

/** G-force response tuning. */
const BASE_FOV = 32;
const FOV_PUNCH = 5.5;
const MAX_ROLL = 0.055;

/**
 * Camera choreography with simulated G-force.
 *
 * Beyond the spring, two things make the move feel physical: the field of view
 * widens with speed, the way acceleration compresses your perception of a
 * corridor, and the camera rolls into lateral movement like a chassis leaning
 * through a hairpin. Both decay back to neutral as the spring settles.
 */
export function CameraRig({ car }: { car: CarConfig }) {
  const { state } = useConfigurator();

  const position = useRef(new THREE.Vector3(4.6, 1.9, 4.9));
  const positionVelocity = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3(0, 0.55, 0));
  const targetVelocity = useRef(new THREE.Vector3());

  const goalPosition = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const scratch = useRef(new THREE.Vector3());
  const lateralAxis = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());

  const roll = useRef(0);
  const fovOffset = useRef(0);

  useFrame(({ camera, pointer }, delta) => {
    // Guard against long frames (tab restore) destabilising the integrator.
    const dt = Math.min(delta, 1 / 30);
    const preset = car.cameraPresets[state.focus];

    goalPosition.current.set(...preset.position);
    goalTarget.current.set(...preset.target);

    // Pointer parallax, orbiting slightly around the focus point.
    goalPosition.current.x += pointer.x * PARALLAX;
    goalPosition.current.y += pointer.y * PARALLAX * 0.45;

    stepSpring(
      position.current,
      positionVelocity.current,
      goalPosition.current,
      POSITION_STIFFNESS,
      POSITION_DAMPING,
      dt,
      scratch.current,
    );
    stepSpring(
      target.current,
      targetVelocity.current,
      goalTarget.current,
      TARGET_STIFFNESS,
      TARGET_DAMPING,
      dt,
      scratch.current,
    );

    camera.position.copy(position.current);
    camera.lookAt(target.current);

    const speed = positionVelocity.current.length();

    // Lateral G: project velocity onto the axis perpendicular to the view.
    forward.current.copy(target.current).sub(position.current).normalize();
    lateralAxis.current.crossVectors(forward.current, camera.up).normalize();
    const lateralG = positionVelocity.current.dot(lateralAxis.current);

    const goalRoll = THREE.MathUtils.clamp(
      -lateralG * 0.012,
      -MAX_ROLL,
      MAX_ROLL,
    );
    roll.current += (goalRoll - roll.current) * (1 - Math.pow(0.02, dt));
    camera.rotateZ(roll.current);

    // Longitudinal G: speed widens the lens, then it breathes back to neutral.
    const goalFov = Math.min(FOV_PUNCH, speed * 0.5);
    fovOffset.current +=
      (goalFov - fovOffset.current) * (1 - Math.pow(0.05, dt));

    if (camera instanceof THREE.PerspectiveCamera) {
      const nextFov = BASE_FOV + fovOffset.current;
      if (Math.abs(camera.fov - nextFov) > 0.01) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
