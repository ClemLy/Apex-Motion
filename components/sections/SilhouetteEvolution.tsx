"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { CARS } from "@/lib/three/carConfigs";
import { SILHOUETTE_IMAGES } from "@/lib/three/silhouetteImages";

gsap.registerPlugin(ScrollTrigger);

/** Real renders, one per Studio car, captured by scripts/capture-fleet-images.mjs
 * from app/silhouette-capture/ — same order as the Studio's own car switcher. */
const FRAMES = CARS.map((car) => ({
  id: car.id,
  name: car.name,
  years: car.years,
  src: SILHOUETTE_IMAGES[car.id],
})).filter((frame) => frame.src);

/** How far the outgoing/incoming pair drifts during the wipe, in pixels — a light parallax on top of the clip reveal, not a slide transition on its own. */
const DRIFT_PX = 28;
/** Peak motion blur at the midpoint of a wipe — kept light on purpose, this
 * is a showcase of the cars, the blur should read as a touch of speed, not
 * obscure them. */
const BLUR_MAX_PX = 2.5;

/** Each segment holds the car fully still and sharp before and after the
 * actual wipe, which is compressed into the middle band — a considered
 * "settle, cut, settle" rhythm instead of continuous motion throughout the
 * whole scroll range, which read as mechanical rather than designed. */
const WIPE_START = 0.32;
const WIPE_END = 0.68;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function SilhouetteEvolution() {
  const { dict } = useLanguage();
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const nameRef = useRef<HTMLSpanElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (FRAMES.length < 2) return;
    const segments = FRAMES.length - 1;

    const applyProgress = (progress: number) => {
      const scaled = Math.min(segments, Math.max(0, progress * segments));
      const index = Math.min(segments - 1, Math.floor(scaled));
      const rawT = scaled - index;

      // Hold the outgoing car sharp and static until WIPE_START, run the
      // actual wipe across the middle band, then hold the incoming car
      // sharp and static from WIPE_END onward — most of the scroll for
      // this segment is spent looking at a still, legible car.
      const windowed = Math.min(
        1,
        Math.max(0, (rawT - WIPE_START) / (WIPE_END - WIPE_START)),
      );
      const t = easeInOutCubic(windowed);

      // A single wipe line at x = t*100%: left of it is the incoming car
      // (revealed, sliding the last few px into place), right of it is the
      // outgoing one (eroding away, drifting further off) — one continuous
      // sweep across the frame rather than two images cross-dissolving on
      // top of each other. Blur peaks mid-sweep, echoing actual motion.
      const blur = Math.sin(t * Math.PI) * BLUR_MAX_PX;
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        if (i === index) {
          el.style.opacity = "1";
          el.style.clipPath = `inset(0 0 0 ${t * 100}%)`;
          el.style.transform = `translateX(${t * DRIFT_PX}px)`;
          el.style.filter = `blur(${blur}px)`;
        } else if (i === index + 1) {
          el.style.opacity = "1";
          el.style.clipPath = `inset(0 ${(1 - t) * 100}% 0 0)`;
          el.style.transform = `translateX(${(t - 1) * DRIFT_PX}px)`;
          el.style.filter = `blur(${blur}px)`;
        } else {
          el.style.opacity = "0";
        }
      });

      if (scanRef.current) {
        const edge = Math.min(t, 1 - t) * 2; // 0 at both ends, 1 at the midpoint
        scanRef.current.style.opacity = `${Math.min(1, edge * 3)}`;
        scanRef.current.style.left = `${t * 100}%`;
      }

      if (nameRef.current) {
        const frame = FRAMES[t < 0.5 ? index : index + 1];
        const label = `${frame.name} · ${frame.years}`;
        if (nameRef.current.textContent !== label) {
          nameRef.current.textContent = label;
        }
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

  if (FRAMES.length < 2) return null;

  return (
    <section ref={rootRef} className="relative min-h-[480vh] bg-[#020202]">
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-10 overflow-hidden px-6 py-28 sm:px-10">
        <SectionLabel
          kicker={dict.silhouette.kicker}
          title={dict.silhouette.title}
          titleAccent={dict.silhouette.titleAccent}
          subtitle={dict.silhouette.subtitle}
          className="relative z-10"
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6">
          <div
            className="relative w-full max-w-5xl overflow-hidden"
            style={{ aspectRatio: "1400 / 420" }}
          >
            {FRAMES.map((frame, i) => (
              <img
                key={frame.id}
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
                src={frame.src}
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
                style={{ opacity: i === 0 ? 1 : 0 }}
              />
            ))}
            <div
              ref={scanRef}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-px"
              style={{
                left: "0%",
                opacity: 0,
                background:
                  "linear-gradient(180deg, transparent, rgba(245,245,245,0.55) 30%, rgba(245,245,245,0.55) 70%, transparent)",
                boxShadow: "0 0 14px 1px rgba(245,245,245,0.25)",
              }}
            />
          </div>

          <span
            ref={nameRef}
            className="font-mono text-2xl tracking-[0.2em] text-neutral-400"
          >
            {FRAMES[0].name} · {FRAMES[0].years}
          </span>
        </div>
      </div>
    </section>
  );
}
