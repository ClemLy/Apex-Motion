"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

/**
 * Caps how often this canvas actually renders, independent of the display's
 * refresh rate. Requires the Canvas to use `frameloop="demand"` — R3F then
 * renders only when `invalidate()` is called, which this drives on its own
 * throttled schedule instead of every RAF tick (natively up to 120Hz+ on
 * modern displays, forever, for scenes that are mostly a slow drift or a
 * settled camera). Every animation in this app already advances by `delta`
 * (springs, lerps, shader time uniforms), so rendering less often doesn't
 * change the motion itself, only how often the GPU is asked to redraw it.
 * User-triggered interaction (OrbitControls dragging, etc.) still calls its
 * own `invalidate()` and renders immediately — this only throttles the
 * otherwise-continuous idle/ambient render loop.
 */
export function FrameLimiter({ fps }: { fps: number }) {
  const invalidate = useThree((s) => s.invalidate);
  const last = useRef(0);

  useEffect(() => {
    const interval = 1000 / fps;
    let rafId: number;

    const tick = (time: number) => {
      if (time - last.current >= interval) {
        last.current = time;
        invalidate();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [fps, invalidate]);

  return null;
}
