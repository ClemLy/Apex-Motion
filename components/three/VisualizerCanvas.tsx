"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  OrbitControls,
  PerformanceMonitor,
  Preload,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { Camera, X } from "lucide-react";
import { Studio } from "./Studio";
import { ConfiguratorCar } from "./ConfiguratorCar";
import { CinematicEffects } from "./CinematicEffects";
import { CaptureHandler } from "./CaptureHandler";
import { DebugTriangleReporter } from "./DebugTriangleReporter";
import { FrameLimiter } from "./FrameLimiter";
import { useConfigurator } from "@/lib/configurator/store";
import { useCapture } from "@/lib/capture/CaptureProvider";
import { useUISound } from "@/hooks/useUISound";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getCarConfig, type CarConfig } from "@/lib/three/carConfigs";
import { frameObject } from "@/lib/three/frameCamera";

const VISUALIZER_FOV = 32;

/** OrbitControls invalidates on its own during an active drag, so this only
 * throttles the otherwise-continuous idle render loop between interactions. */
const TARGET_FPS = 60;

/**
 * Sets the initial camera position/orbit target once the model is loaded
 * (same shared-cache, same-Suspense trick as HeroCanvas's own AutoFrame),
 * and hands the computed target to the sibling OrbitControls so free orbit
 * pivots around the car's actual centre rather than the world origin.
 */
function AutoFrame({
  car,
  onFramed,
}: {
  car: CarConfig;
  onFramed: (target: [number, number, number], distance: number) => void;
}) {
  const { scene } = useGLTF(car.url);
  const { camera } = useThree();

  useLayoutEffect(() => {
    const { position, target } = frameObject(
      scene,
      car.cameraPresets.exterior.position,
      car.cameraPresets.exterior.target,
      VISUALIZER_FOV,
    );
    camera.position.set(...position);
    camera.lookAt(...target);
    const distance = new THREE.Vector3(...position).distanceTo(
      new THREE.Vector3(...target),
    );
    onFramed(target, distance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, car, camera]);

  return null;
}

/**
 * Full-screen, distraction-free view of the car exactly as configured — free
 * orbit instead of the Studio's scripted camera rig, plus its own capture
 * button. Mounted as a sibling of the Stage in app/configurator/page.tsx and
 * self-gated on `visualizerOpen`; ConfiguratorStage unmounts its own canvases
 * while this is open, so exactly one WebGL context (and one capture handler)
 * is ever active here.
 */
export function VisualizerCanvas() {
  const { state, toggleVisualizer } = useConfigurator();
  const { dict } = useLanguage();
  const playSound = useUISound();
  const { requestCapture } = useCapture();
  const [dprMax, setDprMax] = useState(1.8);
  const [orbit, setOrbit] = useState<{
    target: [number, number, number];
    distance: number;
  } | null>(null);

  const car = useMemo(() => getCarConfig(state.carId), [state.carId]);
  const captureButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Escape closes the overlay from anywhere, matching the "any gesture gets
  // you in/out" convenience already used elsewhere (Preloader, CarSwitcher).
  useEffect(() => {
    if (!state.visualizerOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleVisualizer();
        return;
      }
      // Simple two-item focus trap: Capturer and Fermer are the only
      // interactive elements this full-screen view exposes, so Tab and
      // Shift+Tab both just toggle which one is focused.
      if (e.key === "Tab") {
        e.preventDefault();
        const other =
          document.activeElement === closeButtonRef.current
            ? captureButtonRef.current
            : closeButtonRef.current;
        other?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.visualizerOpen, toggleVisualizer]);

  if (!state.visualizerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-[#020202]"
      role="dialog"
      aria-modal="true"
      aria-label={car.name}
    >
      <Canvas
        dpr={[1, dprMax]}
        camera={{
          position: car.cameraPresets.exterior.position,
          fov: VISUALIZER_FOV,
        }}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        frameloop="demand"
      >
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 11, 26]} />

        <FrameLimiter fps={TARGET_FPS} />

        <PerformanceMonitor
          onDecline={() => setDprMax(1)}
          onIncline={() => setDprMax(1.8)}
        />

        <Suspense fallback={null}>
          <Studio />
          <ConfiguratorCar car={car} />
          <AutoFrame
            car={car}
            onFramed={(target, distance) => setOrbit({ target, distance })}
          />
          <Preload all />
        </Suspense>

        {orbit && (
          <OrbitControls
            makeDefault
            target={orbit.target}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minDistance={orbit.distance * 0.4}
            maxDistance={orbit.distance * 2.5}
          />
        )}

        <CinematicEffects preset="studio" />
        <AdaptiveDpr pixelated />
        <CaptureHandler />
        <DebugTriangleReporter />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6 sm:p-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            {dict.configurator.visualizer.kicker}
          </span>
          <span className="text-2xl font-semibold uppercase tracking-tight text-neutral-50">
            {car.name}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <button
            ref={captureButtonRef}
            type="button"
            onClick={() => {
              playSound("toggle");
              requestCapture();
            }}
            data-cursor={dict.configurator.capture}
            aria-label={dict.configurator.capture}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-neutral-950/70 text-neutral-300 backdrop-blur-xl transition-colors hover:border-white/25 hover:text-neutral-50"
          >
            <Camera className="h-4 w-4" aria-hidden />
          </button>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => {
              playSound("toggle");
              toggleVisualizer();
            }}
            data-cursor={dict.configurator.visualizer.close}
            aria-label={dict.configurator.visualizer.close}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-neutral-950/70 text-neutral-300 backdrop-blur-xl transition-colors hover:border-white/25 hover:text-neutral-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        {dict.configurator.visualizer.hint}
      </p>
    </div>
  );
}
