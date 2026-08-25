"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { ParticleCar } from "@/components/three/ParticleCar";
import { GltfCar } from "@/components/three/GltfCar";
import { FrameLimiter } from "@/components/three/FrameLimiter";
import { useRenderGate } from "@/hooks/useRenderGate";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIntro } from "@/lib/intro/IntroProvider";
import { GT3RS_CONFIG } from "@/lib/three/carConfigs";
import { paintOptions, wheelFinishOptions } from "@/lib/configurator/types";

gsap.registerPlugin(ScrollTrigger);

const FOV = 30;
const TARGET_FPS = 60;
const TURNTABLE_ARC_DEG = 30;

const HERO_PAINT =
  paintOptions.find((p) => p.id === "apple-green") ?? paintOptions[0];
const HERO_WHEEL =
  wheelFinishOptions.find((w) => w.id === "silver") ?? wheelFinishOptions[0];
/** Matches scripts/extract-particle-points.mjs's COLOR_CALIPER - a
 * contrasting red rather than body-matched green. */
const HERO_CALIPER_COLOR = "#a8121a";

/** Progress boundaries carving the section's single 0-1 scroll range into
 * named beats - the same "split one ScrollTrigger's progress into sub-
 * ranges" technique AeroFlow already uses for its own LINES_END phasing. */
const ENTRY_FADE = [0, 0.05] as const;
const ASSEMBLE = [0.05, 0.42] as const;
// 0.42-0.5 is a deliberate hold: particles stay fully assembled, motionless
// (the shader's own settle wobble already reaches zero at uProgress=1), so
// there's real time to actually see the car before anything else happens -
// short enough now to read as a beat, not a stall.
const FLASH_START = 0.5;
const FLASH_PEAK = 0.52;
const FLASH_END = 0.55;
const TURNTABLE = [FLASH_END, 1] as const;
const LINE1 = [0.58, 0.66] as const;
const LINE2 = [0.64, 0.72] as const;
const BODY = [0.7, 0.78] as const;

function localProgress(p: number, [start, end]: readonly [number, number]) {
  return Math.min(1, Math.max(0, (p - start) / (end - start)));
}

/** yPercent/skew/opacity reveal for one line of the big commercial
 * headline - same shape as Hero's own `.hero-line` entrance (translate +
 * skew, not a plain fade), just driven by a scroll sub-range instead of a
 * one-shot intro timeline. */
function applyLineReveal(el: HTMLElement | null, local: number) {
  if (!el) return;
  const eased = 1 - Math.pow(1 - local, 3);
  el.style.transform = `translateY(${(1 - eased) * 60}%) skewY(${(1 - eased) * 6}deg)`;
  el.style.opacity = `${eased}`;
}

/** A few plain lights, no ground plane and no environment map - deliberately
 * not Studio.tsx's full showcase rig, which reads as a product-shot floor
 * behind the car. The reveal should look like the same car materializing
 * out of the same black void the particles already occupy, not a studio
 * backdrop appearing behind it. */
function CarLighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.6}
        color="#7f9cff"
      />
    </>
  );
}

/** Continuous rotation/scale read every frame from a ref, inside R3F's own
 * render loop - the same pattern ParticleCar already uses for its own
 * progress uniform, rather than mutating the group from a plain function
 * called outside that loop (from a GSAP ScrollTrigger callback), which does
 * not reliably reach the screen under this Canvas's `frameloop="demand"`. */
function CarRig({
  progressRef,
  children,
}: {
  progressRef: MutableRefObject<number>;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const p = progressRef.current;
    ref.current.rotation.y = THREE.MathUtils.degToRad(TURNTABLE_ARC_DEG * p);
    ref.current.scale.setScalar(0.95 + 0.05 * p);
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Closing statement for the homepage: the GT3RS's real geometry, scattered
 * into a point cloud, pulled back together by scroll, held fully assembled
 * for a beat, then handed off (a Preloader-style flash masking the cut) to
 * the same car rendered live - real geometry, plain directional lighting,
 * turning continuously into its final presentation angle as the commercial
 * copy builds up. Both live in the same Canvas and share its camera, so the
 * handoff needs no pixel-alignment trick; the live render also means the
 * turn has no frame count to be limited by, unlike an earlier baked-photo
 * version of this reveal that visibly stepped between angles. See
 * components/three/ParticleCar.tsx and scripts/extract-particle-points.mjs
 * for the point cloud. Same scroll-scrub skeleton as AeroFlow/LapTelemetry -
 * a tall wrapper, a pinned full-screen viewport, a single ScrollTrigger.
 */
export function ParticleAssembly() {
  const { dict } = useLanguage();
  const { hasEntered } = useIntro();
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const turntableProgressRef = useRef(0);

  // Deliberately *not* gated on scroll proximity: a jump-scroll (End key,
  // scrollbar drag, a hard fling) crosses any scroll-position margin in one
  // event, giving an IntersectionObserver no chance to fire early - the only
  // way to actually guarantee the canvas is ready is to mount it on a
  // timeline decoupled from scroll entirely. `hasEntered` (the Preloader
  // curtain opening) is that timeline: it fires only once Hero's own eager
  // load has had the whole ~2.2s+ curtain duration to itself, and a visitor
  // then needs real time to scroll five sections down before this one is
  // ever on screen - by which point this has had far longer to settle than
  // any fetch + shader compile needs (and the GT3RS model itself is already
  // warm regardless - see Preloader.tsx's own preload of the same URL for
  // the Hero). Both the particle cloud and the real car mount together here
  // and stay mounted (just hidden) the whole time - the car's paint has the
  // entire assemble+hold+flash stretch of scroll to live-lerp to its target
  // color and its shader to compile, well before it's ever revealed, rather
  // than paying either cost at the reveal moment itself. Once mounted,
  // nothing here unmounts (this is the page's last section, nothing after
  // it to protect).
  const canvasReady = hasEntered;
  const { ref: canvasRef, active } = useRenderGate<HTMLDivElement>();
  const [dprMax, setDprMax] = useState(1.5);
  const [revealed, setRevealed] = useState(false);

  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const apply = (p: number) => {
      const entry = localProgress(p, ENTRY_FADE);
      if (kickerRef.current) kickerRef.current.style.opacity = `${entry}`;
      if (canvasLayerRef.current) {
        canvasLayerRef.current.style.opacity = `${entry}`;
      }

      const flash =
        p <= FLASH_PEAK
          ? localProgress(p, [FLASH_START, FLASH_PEAK])
          : 1 - localProgress(p, [FLASH_PEAK, FLASH_END]);
      if (flashRef.current) flashRef.current.style.opacity = `${flash}`;

      // React state, not an imperative ref mutation - masked by the flash
      // sitting at full white opacity right at this exact moment either
      // way, but this way the swap always reaches the screen on the exact
      // tick it should, through ordinary reconciliation rather than a
      // manual invalidate() this Canvas's `frameloop="demand"` would
      // otherwise need. Calling this every tick is cheap: React bails out
      // whenever the boolean doesn't actually change.
      setRevealed(p >= FLASH_PEAK);
      turntableProgressRef.current = localProgress(p, TURNTABLE);

      applyLineReveal(line1Ref.current, localProgress(p, LINE1));
      applyLineReveal(line2Ref.current, localProgress(p, LINE2));
      if (bodyRef.current) {
        const local = localProgress(p, BODY);
        bodyRef.current.style.opacity = `${local}`;
        bodyRef.current.style.transform = `translateY(${(1 - local) * 20}%)`;
      }
    };

    if (reducedMotion) {
      progressRef.current = 1;
      apply(1);
      return;
    }

    apply(0);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          progressRef.current = localProgress(self.progress, ASSEMBLE);
          apply(self.progress);
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={rootRef} className="relative min-h-[420vh] bg-[#020202]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute left-6 top-28 z-20 sm:left-10">
          <span
            ref={kickerRef}
            className="text-[10px] uppercase tracking-[0.35em] text-neutral-500"
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            {dict.particleAssembly.kicker}
          </span>
        </div>

        <div
          ref={canvasLayerRef}
          className="absolute inset-0"
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          <div ref={canvasRef} className="absolute inset-0">
            {canvasReady && (
              <Canvas
                dpr={[1, dprMax]}
                camera={{
                  position: GT3RS_CONFIG.cameraPresets.exterior.position,
                  fov: FOV,
                }}
                gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
                frameloop={active ? "demand" : "never"}
              >
                <FrameLimiter fps={TARGET_FPS} />
                <PerformanceMonitor
                  onDecline={() => setDprMax(1)}
                  onIncline={() => setDprMax(1.5)}
                />
                <Suspense fallback={null}>
                  <group visible={reducedMotion ? false : !revealed}>
                    <ParticleCar progressRef={progressRef} />
                  </group>
                  <group visible={reducedMotion ? true : revealed}>
                    <CarRig progressRef={turntableProgressRef}>
                      <CarLighting />
                      <GltfCar
                        config={GT3RS_CONFIG}
                        paint={HERO_PAINT}
                        wheelColor={HERO_WHEEL.color}
                        caliperColor={HERO_CALIPER_COLOR}
                      />
                    </CarRig>
                  </group>
                </Suspense>
                <AdaptiveDpr pixelated />
              </Canvas>
            )}
          </div>
        </div>

        <div
          ref={flashRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-white"
          style={{ opacity: 0 }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex flex-col items-center gap-5 px-6 text-center sm:bottom-20">
          <span
            ref={line1Ref}
            className="block text-[13vw] font-semibold uppercase leading-[0.95] tracking-tighter text-neutral-50 sm:text-7xl"
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            {dict.particleAssembly.title}
          </span>
          <span
            ref={line2Ref}
            className="block text-[13vw] font-semibold uppercase leading-[0.95] tracking-tighter text-neutral-300 sm:text-7xl"
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            {dict.particleAssembly.titleAccent}
          </span>
          <p
            ref={bodyRef}
            className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base"
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            {dict.particleAssembly.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
