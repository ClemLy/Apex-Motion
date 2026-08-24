"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The "fade + rise in once, on scroll into view" entrance every section on
 * the site hand-rolled independently (8 near-identical `gsap.context` +
 * `ScrollTrigger` setups). One-shot reveals only — scroll-scrub sections
 * (LapTelemetry, AeroFlow, SilhouetteEvolution, HeritageFleet, Heritage)
 * stay bespoke, since their content is driven continuously by scroll
 * position rather than revealed once and left alone.
 */
export function useScrollReveal<T extends HTMLElement>({
  y = 30,
  duration = 1,
  delay = 0,
  start = "top 75%",
}: {
  /** Starting offset in px, eased back to 0. */
  y?: number;
  duration?: number;
  delay?: number;
  /** ScrollTrigger `start` position. */
  start?: string;
} = {}) {
  const ref = useRef<T>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start },
        },
      );
    });

    return () => ctx.revert();
  }, [reducedMotion, y, duration, delay, start]);

  return ref;
}
