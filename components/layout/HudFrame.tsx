"use client";

import { useEffect, useState } from "react";
import { useFPS } from "@/hooks/useFPS";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/** Deterministic-looking telemetry that drifts slowly, purely decorative. */
function useDriftingTelemetry() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 900);
    return () => window.clearInterval(id);
  }, []);

  const phase = tick * 0.35;
  return {
    drag: (0.31 + Math.sin(phase) * 0.014).toFixed(3),
    downforce: Math.round(842 + Math.sin(phase * 0.7) * 46),
    temp: Math.round(88 + Math.sin(phase * 0.45) * 4),
    rpm: Math.round(6800 + Math.sin(phase * 1.1) * 900),
  };
}

function Corner({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute flex flex-col gap-1 text-[9px] uppercase leading-relaxed tracking-[0.3em] text-neutral-500 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Aerospace-style HUD pinned to the viewport corners. Sits above the canvas but
 * below the navigation, and never intercepts pointer events.
 */
export function HudFrame() {
  const { dict } = useLanguage();
  const fps = useFPS();
  const telemetry = useDriftingTelemetry();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 hidden select-none lg:block"
    >
      {/* Hairline frame */}
      <div className="absolute inset-5 border border-white/[0.06]" />

      {/* Corner ticks */}
      <div className="absolute left-5 top-5 h-3 w-3 border-l border-t border-white/25" />
      <div className="absolute right-5 top-5 h-3 w-3 border-r border-t border-white/25" />
      <div className="absolute bottom-5 left-5 h-3 w-3 border-b border-l border-white/25" />
      <div className="absolute bottom-5 right-5 h-3 w-3 border-b border-r border-white/25" />

      <Corner className="left-9 top-9">
        <span className="text-neutral-300">{dict.hud.system}</span>
        <span className="font-mono tracking-[0.2em] text-neutral-500">
          {fps.toString().padStart(3, "0")} FPS
        </span>
        <span className="font-mono tracking-[0.2em] text-neutral-600">
          WEBGL / R3F
        </span>
      </Corner>

      <Corner className="right-9 top-9 items-end text-right">
        <span className="text-neutral-300">{dict.hud.drag}</span>
        <span className="font-mono tracking-[0.2em] text-neutral-500">
          {telemetry.drag}
        </span>
        <span className="font-mono tracking-[0.2em] text-neutral-600">
          {dict.hud.downforce} {telemetry.downforce} N
        </span>
      </Corner>

      <Corner className="bottom-9 left-9">
        <span className="text-neutral-300">{dict.hud.rpm}</span>
        <span className="font-mono tracking-[0.2em] text-neutral-500">
          {telemetry.rpm.toLocaleString("fr-FR")} tr/min
        </span>
        <span className="font-mono tracking-[0.2em] text-neutral-600">
          {dict.hud.temp} {telemetry.temp} C
        </span>
      </Corner>

      <Corner className="bottom-9 right-9 items-end text-right">
        <span className="flex items-center gap-2 text-neutral-300">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          {dict.hud.live}
        </span>
        <span className="font-mono tracking-[0.2em] text-neutral-600">
          {dict.hud.chassis} 992
        </span>
      </Corner>
    </div>
  );
}
