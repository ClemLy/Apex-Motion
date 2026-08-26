"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AERO_HERO_IMAGE } from "@/lib/three/aeroHeroImage";
import {
  AERO_CONTOUR_WIDTH,
  AERO_CONTOUR_HEIGHT,
  AERO_TOP_LAYERS,
  AERO_BOTTOM_LAYERS,
} from "@/lib/three/aeroContour";

gsap.registerPlugin(ScrollTrigger);

/** Illustrative only — not the real certified Cx/downforce of any actual
 * GT3RS configuration, same "stylised, not a spec sheet" spirit as the lap
 * telemetry section's speed/G readout. */
const FINAL_CX = 0.32;
const FINAL_DOWNFORCE_KG = 152;

/** The generating script's convex hull picks the *correct* points (it hugs
 * bodywork and bridges concave dips), but a straight polyline through those
 * sparse vertices reads as a drafted, kinked line rather than moving air.
 * Catmull-Rom-to-Bezier turns the same vertices into one continuous curve. */
function contourToPath(points: readonly (readonly [number, number])[]) {
  if (points.length < 3) {
    return points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
      .join(" ");
  }
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** Each entry pairs a soft blurred "glow" stroke with a thinner, sharper
 * "core" stroke on the same path — read together as a wisp of smoke or a
 * laser sheet catching moving air, not a drafted vector line. Layers get
 * progressively softer/fainter outward from the body, matching how only the
 * streak closest to a car's surface reads crisply in real wind-tunnel smoke
 * photography while the outer ones blur into a calmer haze. */
const LINE_STYLES = [
  {
    blur: 0.6,
    glowWidth: 6,
    glowOpacity: 0.22,
    coreWidth: 1.4,
    coreOpacity: 0.7,
  },
  {
    blur: 1.4,
    glowWidth: 8,
    glowOpacity: 0.18,
    coreWidth: 1.3,
    coreOpacity: 0.58,
  },
  {
    blur: 2.4,
    glowWidth: 10,
    glowOpacity: 0.14,
    coreWidth: 1.1,
    coreOpacity: 0.42,
  },
  {
    blur: 3.6,
    glowWidth: 13,
    glowOpacity: 0.1,
    coreWidth: 1,
    coreOpacity: 0.28,
  },
  {
    blur: 0.8,
    glowWidth: 6,
    glowOpacity: 0.17,
    coreWidth: 1.2,
    coreOpacity: 0.55,
  },
  {
    blur: 1.8,
    glowWidth: 8,
    glowOpacity: 0.12,
    coreWidth: 1,
    coreOpacity: 0.38,
  },
];
const LINE_DELAYS = [0, 0.04, 0.08, 0.12, 0.02, 0.06];

/** How much of the scroll range is spent building up the flow lines before
 * the readout starts settling — keeps the two beats from resolving at
 * exactly the same moment. */
const LINES_END = 0.75;

export function AeroFlow() {
  const { dict } = useLanguage();
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const coreRefs = useRef<(SVGPathElement | null)[]>([]);
  const cxRef = useRef<HTMLSpanElement>(null);
  const downforceRef = useRef<HTMLSpanElement>(null);

  const lines = useMemo(
    () => [
      ...AERO_TOP_LAYERS.map((points) => contourToPath(points)),
      ...AERO_BOTTOM_LAYERS.map((points) => contourToPath(points)),
    ],
    [],
  );

  useEffect(() => {
    const lengths = coreRefs.current.map((el) => el?.getTotalLength() ?? 0);
    lengths.forEach((length, i) => {
      const glow = glowRefs.current[i];
      const core = coreRefs.current[i];
      if (glow) glow.style.strokeDasharray = `${length}`;
      if (core) core.style.strokeDasharray = `${length}`;
    });

    const applyProgress = (progress: number) => {
      const p = Math.min(1, Math.max(0, progress));

      lines.forEach((_, i) => {
        const delay = LINE_DELAYS[i];
        const local = Math.min(
          1,
          Math.max(0, (p - delay) / (LINES_END - delay || 1)),
        );
        const dashoffset = `${lengths[i] * (1 - local)}`;
        const glow = glowRefs.current[i];
        const core = coreRefs.current[i];
        if (glow) {
          glow.style.strokeDashoffset = dashoffset;
          glow.style.opacity = `${local * LINE_STYLES[i].glowOpacity}`;
        }
        if (core) {
          core.style.strokeDashoffset = dashoffset;
          core.style.opacity = `${local * LINE_STYLES[i].coreOpacity}`;
        }
      });

      // Amplitude collapses toward 0 as p -> 1, so the readout reads as
      // "unstable, then settling" rather than a plain count-up — a
      // deterministic sine stand-in for jitter, not real measurement noise.
      const amplitude = 1 - p;
      const wobble = Math.sin(p * 41) * amplitude;
      if (cxRef.current) {
        cxRef.current.textContent = (FINAL_CX + wobble * 0.12).toFixed(2);
      }
      if (downforceRef.current) {
        downforceRef.current.textContent = Math.round(
          FINAL_DOWNFORCE_KG + wobble * 45,
        ).toString();
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
  }, [reducedMotion, lines]);

  return (
    <section ref={rootRef} aria-label={dict.a11y.sections.aero} className="relative min-h-[200vh] bg-[#020202] md:min-h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-10 overflow-hidden px-6 py-28 sm:px-10">
        <SectionLabel
          kicker={dict.aero.kicker}
          title={dict.aero.title}
          titleAccent={dict.aero.titleAccent}
          subtitle={dict.aero.subtitle}
          className="relative z-10"
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8">
          <div
            className="relative w-full max-w-5xl"
            style={{ aspectRatio: "1400 / 420" }}
          >
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${AERO_CONTOUR_WIDTH} ${AERO_CONTOUR_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="aero-line-fade" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(245,250,255,0)" />
                  <stop offset="12%" stopColor="rgba(245,250,255,1)" />
                  <stop offset="88%" stopColor="rgba(245,250,255,1)" />
                  <stop offset="100%" stopColor="rgba(245,250,255,0)" />
                </linearGradient>
              </defs>
              {/* Blurred glow pass first, sharper core pass on top — read as one soft streak of air per line, not two overlapping shapes. */}
              {lines.map((d, i) => (
                <path
                  key={`glow-${i}`}
                  ref={(el) => {
                    glowRefs.current[i] = el;
                  }}
                  d={d}
                  fill="none"
                  stroke="url(#aero-line-fade)"
                  strokeWidth={LINE_STYLES[i].glowWidth}
                  strokeLinecap="round"
                  opacity={0}
                  style={{ filter: `blur(${LINE_STYLES[i].blur}px)` }}
                />
              ))}
              {lines.map((d, i) => (
                <path
                  key={`core-${i}`}
                  ref={(el) => {
                    coreRefs.current[i] = el;
                  }}
                  d={d}
                  fill="none"
                  stroke="url(#aero-line-fade)"
                  strokeWidth={LINE_STYLES[i].coreWidth}
                  strokeLinecap="round"
                  opacity={0}
                  style={{ filter: `blur(${LINE_STYLES[i].blur * 0.3}px)` }}
                />
              ))}
            </svg>
            <img
              src={AERO_HERO_IMAGE}
              alt=""
              className="relative z-10 h-full w-full object-contain"
            />
          </div>

          <div className="flex gap-10 font-mono">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                {dict.aero.cxLabel}
              </span>
              <span className="text-3xl tabular-nums text-neutral-50">
                <span ref={cxRef}>0.32</span>
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                {dict.aero.downforceLabel}
              </span>
              <span className="text-3xl tabular-nums text-neutral-50">
                <span ref={downforceRef}>152</span>
                <span className="ml-1 text-xs text-neutral-500">kg</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
