"use client";

import { useEffect, useState } from "react";

export function useFPS() {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();
    let rafId: number;

    const tick = (time: number) => {
      frame += 1;
      const delta = time - lastTime;
      if (delta >= 500) {
        setFps(Math.round((frame * 1000) / delta));
        frame = 0;
        lastTime = time;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
}
