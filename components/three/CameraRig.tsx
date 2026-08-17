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
  exterior: { position: [4.2, 1.8, 4.6], target: [0, 0.5, 0] },
  rear: { position: [-3.2, 1.3, -4.2], target: [0, 0.6, -1.8] },
  wheels: { position: [1.8, 0.65, 2.6], target: [0.95, 0.38, 1.35] },
  cabin: { position: [0.9, 1.15, 0.4], target: [0, 0.7, -0.3] },
};

export function CameraRig() {
  const { state } = useConfigurator();
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 0.5, 0));
  const desiredPos = useRef(new THREE.Vector3(4.2, 1.8, 4.6));
  const desiredTarget = useRef(new THREE.Vector3(0, 0.5, 0));

  useFrame((_, delta) => {
    const preset = FOCUS_PRESETS[state.focus];
    desiredPos.current.set(...preset.position);
    desiredTarget.current.set(...preset.target);

    const damp = 1 - Math.pow(0.001, delta);
    camera.position.lerp(desiredPos.current, damp);
    currentTarget.current.lerp(desiredTarget.current, damp);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
