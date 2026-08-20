"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useDebug } from "@/lib/debug/DebugProvider";

/** Recompute at most twice a second — DebugProvider also throttles the state write, but the scene walk itself is worth skipping too while waiting. */
const SAMPLE_INTERVAL_MS = 500;

/**
 * Reports this canvas's actual scene triangle count into DebugProvider, but
 * only while debug mode is on. Deliberately sums mesh geometry directly
 * rather than reading `gl.info.render.triangles`: this canvas runs
 * `@react-three/postprocessing`'s EffectComposer, whose bloom/vignette/SMAA/
 * tone-mapping passes each redraw a single full-screen triangle — a common
 * WebGL technique — and each of those resets `gl.info` before the next pass,
 * so by the time a normal-priority useFrame reads it, it reflects the last
 * pass's "1 triangle", not the car.
 */
export function DebugTriangleReporter() {
  const { enabled, reportTriangles } = useDebug();
  const scene = useThree((s) => s.scene);
  const lastSample = useRef(0);

  useFrame(() => {
    if (!enabled) return;
    const now = performance.now();
    if (now - lastSample.current < SAMPLE_INTERVAL_MS) return;
    lastSample.current = now;

    let triangles = 0;
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || !object.visible) return;
      const geometry = object.geometry;
      const count = geometry.index
        ? geometry.index.count
        : (geometry.attributes.position?.count ?? 0);
      triangles += Math.floor(count / 3);
    });
    reportTriangles(triangles);
  });

  return null;
}
