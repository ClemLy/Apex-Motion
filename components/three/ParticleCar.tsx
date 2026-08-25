"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { PARTICLE_POINTS } from "@/lib/three/particlePoints";

/** `position` doubles as the assembled target — mixed toward `aDispersed` by
 * `uProgress` — so three.js's own bounding-sphere machinery still sees real
 * car-shaped coordinates even though nothing here is skinned or animated in
 * the usual sense. */
const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aDispersed;
  attribute vec3 aColor;
  attribute float aSeed;

  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;

  varying vec3 vColor;
  varying float vGlow;

  void main() {
    vec3 pos = mix(aDispersed, position, uProgress);

    // Settle wobble damps to nothing as the car assembles — reads as
    // particles drifting into place, not a rigid straight-line lerp.
    float wobble = (1.0 - uProgress) * 0.12;
    pos.x += sin(uTime * 1.6 + aSeed * 6.2831) * wobble;
    pos.y += cos(uTime * 1.3 + aSeed * 6.2831 * 1.7) * wobble;
    pos.z += sin(uTime * 1.9 + aSeed * 6.2831 * 2.3) * wobble;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Clamped: an unbounded 1/-z attenuation blows a particle into a huge
    // soft blob whenever the dispersed scatter happens to land it close to
    // the camera, which reads as a stray glowing ball rather than dust.
    gl_PointSize = clamp(uSize * uPixelRatio * (1.0 / -mvPosition.z), 1.0, 9.0);

    vColor = aColor;
    // Brightest mid-transition, like a spark catching the light as it moves.
    vGlow = 1.0 - abs(uProgress - 0.5) * 2.0;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vGlow;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 color = vColor + vGlow * 0.4;
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Both the assembled and dispersed positions (plus color and wobble seed)
 * are already baked into the fetched buffer by
 * scripts/extract-particle-points.mjs - stride-10 interleaved, per particle
 * [x,y,z, dx,dy,dz, r,g,b, seed]. `InterleavedBufferAttribute` reads that
 * layout directly with zero per-particle work: no loop, no vector math, no
 * copy (the Float32Array view shares memory with the fetched ArrayBuffer).
 * This replaced an earlier version that computed the scatter client-side on
 * every load - that loop, not the fetch, was what made the section feel
 * slow to appear. */
function useParticleGeometry(buffer: ArrayBuffer) {
  return useMemo(() => {
    const stride = 10;
    const floats = new Float32Array(buffer);
    const interleaved = new THREE.InterleavedBuffer(floats, stride);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.InterleavedBufferAttribute(interleaved, 3, 0),
    );
    geometry.setAttribute(
      "aDispersed",
      new THREE.InterleavedBufferAttribute(interleaved, 3, 3),
    );
    geometry.setAttribute(
      "aColor",
      new THREE.InterleavedBufferAttribute(interleaved, 3, 6),
    );
    geometry.setAttribute(
      "aSeed",
      new THREE.InterleavedBufferAttribute(interleaved, 1, 9),
    );
    return geometry;
  }, [buffer]);
}

/**
 * GPU-driven point cloud of the GT3RS's real geometry (see
 * scripts/extract-particle-points.mjs), blended between a scattered and an
 * assembled state by `uProgress`. The caller drives that uniform through
 * `progressRef` every frame rather than a React prop, matching the rest of
 * the site's ref-driven scroll-scrub sections (AeroFlow, LapTelemetry) —
 * no re-render per scroll tick.
 */
export function ParticleCar({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const buffer = useLoader(THREE.FileLoader, PARTICLE_POINTS.url, (loader) => {
    loader.setResponseType("arraybuffer");
  }) as unknown as ArrayBuffer;

  const geometry = useParticleGeometry(buffer);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uProgress.value = progressRef.current;
    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={{
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 28 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
