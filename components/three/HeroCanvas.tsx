"use client";

import { Suspense, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { Studio } from "./Studio";
import { GltfCar } from "./GltfCar";
import { CinematicEffects } from "./CinematicEffects";
import { FrameLimiter } from "./FrameLimiter";
import { useRenderGate } from "@/hooks/useRenderGate";
import { DebugTriangleReporter } from "./DebugTriangleReporter";
import { paintOptions } from "@/lib/configurator/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { CarConfig } from "@/lib/three/carConfigs";

/** Hero field of view — matches the Canvas's own `camera={{ fov: 30 }}` prop below. */
const HERO_FOV = 30;

/** Purely a slow turntable + drift — nothing here needs the display's full refresh rate. */
const TARGET_FPS = 30;

/** Slow turntable with a gentle pointer-driven tilt. */
function Turntable({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 1 / 30);
    group.current.rotation.y += dt * 0.16;

    const goalTilt = pointer.y * 0.08;
    group.current.rotation.x +=
      (goalTilt - group.current.rotation.x) * (1 - Math.pow(0.01, dt));
  });

  return <group ref={group}>{children}</group>;
}

/** Showcase paint: the same GT Silver the studio defaults to, so the car never renders in an unset flat white. */
const SHOWCASE_PAINT =
  paintOptions.find((p) => p.id === "gt-silver") ?? paintOptions[0];

/**
 * Decorative turntable showcase — deliberately not the interactive studio's
 * `ConfiguratorCar`, so whichever car is passed in stays a static, lightweight
 * render (no configurator state, no material overrides beyond the base paint).
 */
export function HeroCanvas({
  car,
  eager = false,
  decorative = false,
}: {
  car: CarConfig;
  /** Pass true only for the instance guaranteed to be the first thing on screen. */
  eager?: boolean;
  /** Pass true when this canvas sits inside a link/button that already has
   * its own accessible name — the wrapper's role="img" description would
   * otherwise prefix that name with a redundant, confusing car description. */
  decorative?: boolean;
}) {
  const { ref, active, mounted } = useRenderGate<HTMLDivElement>({ eager });
  const { dict } = useLanguage();
  // Resolution ceiling drops on weak hardware, so frame rate holds instead.
  const [dprMax, setDprMax] = useState(1.6);

  return (
    <div
      ref={ref}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": `${car.name}, ${dict.a11y.heroShowcase}` })}
      className="h-full w-full"
    >
      {mounted && (
        <Canvas
          dpr={[1, dprMax]}
          camera={{
            position: car.cameraPresets.exterior.position,
            fov: HERO_FOV,
          }}
          gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
          frameloop={active ? "demand" : "never"}
        >
          <color attach="background" args={["#020202"]} />
          <fog attach="fog" args={["#020202", 9, 22]} />

          <FrameLimiter fps={TARGET_FPS} />

          <PerformanceMonitor
            onDecline={() => setDprMax(1)}
            onIncline={() => setDprMax(1.6)}
          />

          <Suspense fallback={null}>
            <Studio />
            <Turntable>
              <GltfCar config={car} paint={SHOWCASE_PAINT} />
            </Turntable>
            <Preload all />
          </Suspense>

          <CinematicEffects preset="hero" />
          <AdaptiveDpr pixelated />
          <DebugTriangleReporter />
        </Canvas>
      )}
    </div>
  );
}
