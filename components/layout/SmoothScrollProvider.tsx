"use client";

import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIntro } from "@/lib/intro/IntroProvider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll.
 *
 * Lenis drives the page and GSAP's ticker drives Lenis, so there is exactly one
 * rAF loop for scroll and animation combined. Two loops fighting each other is
 * the usual source of scrub jank, and this removes it by construction.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const { hasEntered } = useIntro();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const lenis = new Lenis({
      // Quartic ease-out: fast pickup, long heavy settle.
      duration: 1.35,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      // Reduced-motion visitors get native scrolling, no interpolation at all.
      smoothWheel: !reduced,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      // GSAP's ticker reports seconds, Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    // Disable lag smoothing so a dropped frame does not warp scrub positions.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // The page stays locked under the preloader, then releases on entry.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (hasEntered) {
      lenis.start();
      // Measurements taken behind the preloader can be stale, so re-measure.
      ScrollTrigger.refresh();
    } else {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true });
    }
  }, [hasEntered]);

  return children;
}
