"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Fraction of the pointer's offset from the element's centre it pulls
 * toward — same idea as CustomCursor's own `MAGNET_STRENGTH`, applied to the
 * element itself rather than the cursor ring. */
const PULL_STRENGTH = 0.25;
const MAX_PULL_PX = 14;
const HOVER_SCALE = 1.035;
const LERP_RATE = 0.2;

/**
 * Magnetic pull + cursor-tracking glow for a hoverable element: on
 * `pointermove` inside it, both a capped translate-toward-pointer and a
 * `--mx`/`--my` custom-property pair (consumed by the `.magnetic` glow in
 * app/globals.css) ease toward the pointer; on leave, everything eases back
 * to rest and the render loop stops itself rather than running idle forever.
 * Owns the element's hover transform outright (translate + a built-in
 * scale) — apply to elements that don't already carry their own
 * `hover:scale-*` class, or remove that class where they do, so the two
 * don't fight over `transform`. No-ops on touch (`pointer: coarse`) and
 * reduced-motion, matching CustomCursor's own touch exclusion.
 */
export function useMagneticHover<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rafId = 0;
    let hovering = false;
    const target = { x: 0, y: 0, scale: 1 };
    const current = { x: 0, y: 0, scale: 1 };

    const tick = () => {
      current.x += (target.x - current.x) * LERP_RATE;
      current.y += (target.y - current.y) * LERP_RATE;
      current.scale += (target.scale - current.scale) * LERP_RATE;
      el.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0) scale(${current.scale.toFixed(3)})`;

      const settled =
        !hovering &&
        Math.abs(current.x) < 0.05 &&
        Math.abs(current.y) < 0.05 &&
        Math.abs(current.scale - 1) < 0.0005;

      if (settled) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const ensureLoopRunning = () => {
      if (rafId === 0) rafId = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      hovering = true;
      const rect = el.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      target.x = Math.max(
        -MAX_PULL_PX,
        Math.min(MAX_PULL_PX, relX * PULL_STRENGTH),
      );
      target.y = Math.max(
        -MAX_PULL_PX,
        Math.min(MAX_PULL_PX, relY * PULL_STRENGTH),
      );
      target.scale = HOVER_SCALE;
      el.style.setProperty(
        "--mx",
        `${((event.clientX - rect.left) / rect.width) * 100}%`,
      );
      el.style.setProperty(
        "--my",
        `${((event.clientY - rect.top) / rect.height) * 100}%`,
      );
      ensureLoopRunning();
    };

    const onLeave = () => {
      hovering = false;
      target.x = 0;
      target.y = 0;
      target.scale = 1;
      ensureLoopRunning();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
  }, [reducedMotion]);

  return ref;
}
