"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/** Hand-drawn, not a real GPS trace — a sweeping loop that reads as a
 * circuit, in the same "stylised, not literal" spirit as the rest of the
 * site's HUD (see Hero's own copy: exploration, not a claim of precision). */
const TRACK_PATH =
  "M 150,480 C 80,420 60,320 120,260 C 180,200 280,220 300,160 " +
  "C 320,100 260,40 340,30 C 460,15 520,90 480,150 C 440,210 340,200 360,270 " +
  "C 380,340 480,330 560,300 C 680,255 760,140 900,120 C 1020,105 1120,160 1100,240 " +
  "C 1080,320 980,300 960,360 C 940,420 1020,440 1080,400 C 1140,362 1150,460 1080,500 " +
  "C 980,555 820,540 700,500 C 580,460 500,520 400,530 C 280,542 200,520 150,480 Z";

/** Keyframes along one stylised lap — braking zones and straights placed by
 * feel, not measured, so the readout has a believable shape once interpolated. */
const KEYFRAMES = [
  { at: 0, speed: 92, gForce: 0.3, brake: 0.1, sector: 1 },
  { at: 0.15, speed: 178, gForce: 0.6, brake: 0, sector: 1 },
  { at: 0.3, speed: 245, gForce: 0.2, brake: 0, sector: 1 },
  { at: 0.42, speed: 96, gForce: 1.3, brake: 0.85, sector: 2 },
  { at: 0.55, speed: 210, gForce: 0.7, brake: 0, sector: 2 },
  { at: 0.68, speed: 287, gForce: 0.15, brake: 0, sector: 2 },
  { at: 0.8, speed: 118, gForce: 1.5, brake: 0.9, sector: 3 },
  { at: 0.92, speed: 205, gForce: 0.5, brake: 0, sector: 3 },
  { at: 1, speed: 265, gForce: 0.3, brake: 0, sector: 3 },
] as const;

function interpolate(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  let i = 0;
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].at < p) i += 1;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const t = (p - a.at) / (b.at - a.at || 1);
  return {
    speed: a.speed + (b.speed - a.speed) * t,
    gForce: a.gForce + (b.gForce - a.gForce) * t,
    brake: a.brake + (b.brake - a.brake) * t,
    sector: t < 0.5 ? a.sector : b.sector,
  };
}

/**
 * Scroll-drawn lap: the circuit outline traces itself as the section scrolls
 * past (sticky content, tall wrapper), a marker rides the exact drawn point,
 * and the speed/G/braking readout interpolates from a handful of keyframes
 * along the way — a stylised lap, not a real recorded one.
 */
export function LapTelemetry() {
  const { dict } = useLanguage();
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const gForceRef = useRef<HTMLSpanElement>(null);
  const brakeRef = useRef<HTMLSpanElement>(null);
  const sectorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!path || !marker) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    const applyProgress = (progress: number) => {
      path.style.strokeDashoffset = `${length * (1 - progress)}`;
      const point = path.getPointAtLength(length * progress);
      marker.setAttribute("cx", `${point.x}`);
      marker.setAttribute("cy", `${point.y}`);

      const stats = interpolate(progress);
      if (speedRef.current) {
        speedRef.current.textContent = Math.round(stats.speed).toString();
      }
      if (gForceRef.current) {
        gForceRef.current.textContent = stats.gForce.toFixed(1);
      }
      if (brakeRef.current) {
        brakeRef.current.textContent = `${Math.round(stats.brake * 100)}%`;
      }
      if (sectorRef.current) {
        sectorRef.current.textContent = `${stats.sector}`;
      }
    };

    if (reducedMotion) {
      applyProgress(1);
      return;
    }

    applyProgress(0);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => applyProgress(self.progress),
      });
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      aria-label={dict.a11y.sections.telemetry}
      className="relative min-h-[150vh] md:min-h-[250vh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-8 overflow-hidden px-6 pb-10 pt-24 sm:gap-10 sm:px-10 sm:py-16 short:flex-row short:items-center short:gap-8 short:pb-4 short:pt-16">
        <SectionLabel
          className="short:w-[38%] short:shrink-0"
          kicker={dict.telemetry.kicker}
          title={dict.telemetry.title}
          titleAccent={dict.telemetry.titleAccent}
          subtitle={dict.telemetry.subtitle}
        />

        <div
          aria-hidden
          className="relative mx-auto w-full max-w-4xl short:mx-0 short:max-w-none short:flex-1"
        >
          <svg viewBox="0 0 1200 600" className="w-full">
            <path
              d={TRACK_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={3}
            />
            <path
              ref={pathRef}
              d={TRACK_PATH}
              fill="none"
              stroke="#f5f5f5"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle
              ref={markerRef}
              r={9}
              fill="#f5f5f5"
              style={{ filter: "drop-shadow(0 0 8px rgba(245,245,245,0.7))" }}
            />
          </svg>

          {/* A compact strip under the track on phones (floating over it
              would hide half the circuit), the corner readout from md up. */}
          <GlassPanel className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 p-4 md:absolute md:top-0 md:right-0 md:mt-0 md:flex-col md:flex-nowrap md:items-stretch md:justify-start md:gap-3 md:p-5">
            <span className="w-full text-[11px] uppercase tracking-[0.25em] text-neutral-500 md:text-right">
              {dict.telemetry.trackName}
            </span>

            <div className="flex flex-col items-start gap-1 md:items-end">
              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                {dict.telemetry.stats.speed}
              </span>
              <span className="font-mono text-2xl tabular-nums text-neutral-50 md:text-3xl">
                <span ref={speedRef}>92</span>
                <span className="ml-1 text-xs text-neutral-500">km/h</span>
              </span>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-start gap-1 md:items-end">
                <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  {dict.telemetry.stats.gForce}
                </span>
                <span className="font-mono text-sm tabular-nums text-neutral-200">
                  <span ref={gForceRef}>0.3</span> G
                </span>
              </div>
              <div className="flex flex-col items-start gap-1 md:items-end">
                <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  {dict.telemetry.stats.brake}
                </span>
                <span className="font-mono text-sm tabular-nums text-neutral-200">
                  <span ref={brakeRef}>10%</span>
                </span>
              </div>
            </div>

            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 md:text-right">
              {dict.telemetry.sectorLabel} <span ref={sectorRef}>1</span>
            </span>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
