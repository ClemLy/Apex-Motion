"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Full-screen quad in clip space — camera-independent, always fills the viewport. */
const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Domain-warped simplex noise: one noise field distorts the sampling
 * coordinates of a second, which is what reads as flowing liquid rather than
 * static static — a single noise() call alone just looks like TV static.
 * The cursor adds a local, inertia-trailing warp on top of the same field.
 */
const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform vec2 uResolution;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  /** Low-saturation prism tint riding the rim of each highlight, not the fill. */
  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 aspectUv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) + 0.5;

    vec2 mouseDelta = aspectUv - uMouse;
    float dist = length(mouseDelta);
    float mouseInfluence = smoothstep(0.35, 0.0, dist);

    // The pattern only really exists in a tight pool right under the cursor
    // — a reveal, not a wash. Everywhere else stays the site's own
    // near-black; only a faint trace survives at rest so the page doesn't
    // read as completely inert.
    float reveal = mix(0.025, 1.0, smoothstep(0.4, 0.02, dist));

    vec2 drift = vec2(uTime * 0.018, uTime * 0.012 + uScroll * 0.35);
    vec2 warpCoord = aspectUv * 2.1 + drift;
    vec2 warp = vec2(
      snoise(warpCoord + vec2(1.7, 9.2)),
      snoise(warpCoord + vec2(8.3, 2.8))
    );
    warp += mouseDelta * mouseInfluence * 2.2;

    float n = snoise(warpCoord * 1.3 + warp * 0.55);
    n = n * 0.5 + 0.5;

    // A second, independent noise field drifts the prism hue slowly across
    // the pattern, decoupled from the brightness field n — otherwise the
    // color would just track brightness, reading as one tinted glow.
    float hueShift = snoise(warpCoord * 0.55 + vec2(4.1, -2.3) + uTime * 0.008) * 0.5 + 0.5;
    vec3 prism = hsl2rgb(vec3(hueShift, 0.55, 0.62));

    vec3 base = vec3(0.008, 0.008, 0.01);
    vec3 white = vec3(0.96, 0.97, 1.0);

    float highlight = smoothstep(0.55, 0.94, n) * reveal;
    vec3 color = mix(base, white, highlight * 0.1);

    // A thin prismatic sliver on the rim of each highlight, like light
    // splitting at the edge of glass — not a wash over the whole shape.
    float rim = smoothstep(0.62, 0.83, n) * (1.0 - smoothstep(0.83, 0.97, n));
    color += prism * rim * reveal * 0.04;

    color += white * mouseInfluence * 0.025;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function FluidQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const { size } = useThree();

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      targetMouse.current.set(
        event.clientX / window.innerWidth,
        1 - event.clientY / window.innerHeight,
      );
    };
    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useFrame(({ clock }, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const k = 1 - Math.pow(0.0025, delta);
    mouse.current.lerp(targetMouse.current, k);

    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const scroll = scrollable > 0 ? window.scrollY / scrollable : 0;

    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uMouse.value.copy(mouse.current);
    material.uniforms.uScroll.value = scroll;
    material.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uScroll: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
        }}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Persistent site-wide backdrop: a single full-screen shader quad, mounted
 * once in the root layout. Structurally cheap on purpose — one draw call, no
 * lighting, no scene graph — since it runs continuously behind every page,
 * including ones that already carry their own live 3D canvas.
 */
export function FluidBackground() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const onVisibility = () =>
      setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={1}
        gl={{ antialias: false, alpha: false }}
        frameloop={active ? "always" : "never"}
      >
        <FluidQuad />
      </Canvas>
    </div>
  );
}
