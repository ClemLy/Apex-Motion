"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AERO_HERO_IMAGE } from "@/lib/three/aeroHeroImage";

gsap.registerPlugin(ScrollTrigger);

/** Illustrative only — not the real certified Cx/downforce of any actual
 * GT3RS configuration, same "stylised, not a spec sheet" spirit as the lap
 * telemetry section's speed/G readout. */
const FINAL_CX = 0.32;
const FINAL_DOWNFORCE_KG = 152;

/** Horizontal streaks layered over the car at different heights, each
 * cascading in with its own offset so they don't all sweep in unison —
 * reuses the "lines suggesting speed" idea from the removed launch sequence,
 * reoriented to read as airflow around a stationary car instead of motion
 * toward the viewer. */
const FLOW_LINES = [
  { top: "18%", delay: 0 },
  { top: "30%", delay: 0.06 },
  { top: "42%", delay: 0.02 },
  { top: "58%", delay: 0.1 },
  { top: "70%", delay: 0.04 },
  { top: "82%", delay: 0.08 },
];

/** How much of the scroll range is spent building up the flow lines before
 * the readout starts settling — keeps the two beats from resolving at
 * exactly the same moment. */
const LINES_END = 0.75;

export function AeroFlow() {
  const { dict } = useLanguage();
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cxRef = useRef<HTMLSpanElement>(null);
  const downforceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const applyProgress = (progress: number) => {
      const p = Math.min(1, Math.max(0, progress));

      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        const { delay } = FLOW_LINES[i];
        const local = Math.min(
          1,
          Math.max(0, (p - delay) / (LINES_END - delay || 1)),
        );
        el.style.width = `${local * 100}%`;
        el.style.opacity = `${local}`;
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
  }, [reducedMotion]);

  return (
    <section ref={rootRef} className="relative min-h-[300vh] bg-[#020202]">
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
            {FLOW_LINES.map((line, i) => (
              <div
                key={line.top}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                aria-hidden
                className="pointer-events-none absolute left-0 h-px"
                style={{
                  top: line.top,
                  width: 0,
                  opacity: 0,
                  background:
                    "linear-gradient(90deg, transparent, rgba(245,245,245,0.6) 40%, rgba(245,245,245,0.6) 90%, transparent)",
                }}
              />
            ))}
            <img
              src={AERO_HERO_IMAGE}
              alt=""
              className="relative z-10 h-full w-full object-contain"
            />
          </div>

          <div className="flex gap-10 font-mono">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">
                {dict.aero.cxLabel}
              </span>
              <span className="text-3xl tabular-nums text-neutral-50">
                <span ref={cxRef}>0.32</span>
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">
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
