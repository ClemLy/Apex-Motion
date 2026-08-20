"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Real testing grounds. The readout drifts between them the way a telemetry
 * feed would hand off between sessions.
 */
const TRACKS = [
  { name: "Nürburgring Nordschleife", lat: 50.3356, lon: 6.9475 },
  { name: "Weissach Development Centre", lat: 48.7719, lon: 8.9289 },
  { name: "Porsche Leipzig Circuit", lat: 51.4103, lon: 12.2969 },
] as const;

const CORNER_BASE =
  "absolute flex flex-col gap-1 text-[9px] uppercase leading-relaxed tracking-[0.3em] text-neutral-500";

/**
 * Live cockpit HUD.
 *
 * Every value is written straight into the DOM from one shared rAF loop rather
 * than through state, so a dashboard that updates sixty times a second costs
 * React nothing. Coolant and oil pressure are driven by layered sines at
 * different periods, which reads as a real sensor rather than a sweeping loop.
 */
export function HudFrame() {
  const { dict } = useLanguage();

  const fpsRef = useRef<HTMLSpanElement>(null);
  const coolantRef = useRef<HTMLSpanElement>(null);
  const oilRef = useRef<HTMLSpanElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const downforceRef = useRef<HTMLSpanElement>(null);
  const rpmRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId = 0;
    let frames = 0;
    let lastFpsSample = performance.now();
    const start = performance.now();

    const tick = (now: number) => {
      // The rAF timestamp is the frame's start time, which can predate the
      // `start` captured just above. Clamping keeps elapsed time non-negative,
      // otherwise the track index goes negative and lands off the array.
      const t = Math.max(0, (now - start) / 1000);

      // FPS is sampled twice a second, otherwise the digits are unreadable.
      frames += 1;
      const sinceSample = now - lastFpsSample;
      if (sinceSample >= 500) {
        const fps = Math.round((frames * 1000) / sinceSample);
        if (fpsRef.current) {
          fpsRef.current.textContent = `${Math.min(fps, 999)
            .toString()
            .padStart(3, "0")} FPS`;
        }
        frames = 0;
        lastFpsSample = now;
      }

      // Layered periods so no reading repeats on an obvious cycle.
      if (coolantRef.current) {
        const coolant =
          88.4 + Math.sin(t * 0.37) * 2.1 + Math.sin(t * 1.9) * 0.4;
        coolantRef.current.textContent = `${coolant.toFixed(1)} C`;
      }
      if (oilRef.current) {
        const oil =
          5.2 + Math.sin(t * 0.53 + 1.1) * 0.42 + Math.sin(t * 2.7) * 0.08;
        oilRef.current.textContent = `${oil.toFixed(2)} BAR`;
      }
      if (dragRef.current) {
        const drag = 0.311 + Math.sin(t * 0.29) * 0.013;
        dragRef.current.textContent = drag.toFixed(3);
      }
      if (downforceRef.current) {
        const downforce = 842 + Math.sin(t * 0.41 + 0.6) * 48;
        downforceRef.current.textContent = `${Math.round(downforce)} N`;
      }
      if (rpmRef.current) {
        const rpm = 6820 + Math.sin(t * 0.83) * 880 + Math.sin(t * 3.1) * 90;
        rpmRef.current.textContent = Math.round(rpm).toLocaleString("fr-FR");
      }

      // Hand off between testing grounds every twelve seconds.
      const track = TRACKS[Math.floor(t / 12) % TRACKS.length];
      if (trackRef.current && trackRef.current.textContent !== track.name) {
        trackRef.current.textContent = track.name;
      }
      if (coordsRef.current) {
        // Micro-drift on the last decimal, like a GPS fix settling.
        const lat = track.lat + Math.sin(t * 0.7) * 0.0004;
        const lon = track.lon + Math.cos(t * 0.6) * 0.0004;
        coordsRef.current.textContent = `${lat.toFixed(4)} N / ${lon.toFixed(4)} E`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

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

      <div className={`${CORNER_BASE} left-9 top-9`}>
        <span className="text-neutral-300">{dict.hud.system}</span>
        <span
          ref={fpsRef}
          className="font-mono tracking-[0.2em] text-neutral-500"
        >
          060 FPS
        </span>
        <span className="font-mono tracking-[0.2em] text-neutral-500">
          WEBGL / R3F
        </span>
      </div>

      <div className={`${CORNER_BASE} right-9 top-9 items-end text-right`}>
        <span className="text-neutral-300">{dict.hud.drag}</span>
        <span
          ref={dragRef}
          className="font-mono tracking-[0.2em] text-neutral-500"
        >
          0.311
        </span>
        <span className="font-mono tracking-[0.2em] text-neutral-500">
          {dict.hud.downforce}{" "}
          <span ref={downforceRef} className="tabular-nums">
            842 N
          </span>
        </span>
      </div>

      <div className={`${CORNER_BASE} bottom-9 left-9`}>
        <span className="text-neutral-300">{dict.hud.rpm}</span>
        <span className="font-mono tracking-[0.2em] text-neutral-500">
          <span ref={rpmRef} className="tabular-nums">
            6 820
          </span>{" "}
          tr/min
        </span>
        <span className="font-mono tracking-[0.2em] text-neutral-500">
          {dict.hud.coolant}{" "}
          <span ref={coolantRef} className="tabular-nums">
            88.4 C
          </span>
        </span>
        <span className="font-mono tracking-[0.2em] text-neutral-500">
          {dict.hud.oil}{" "}
          <span ref={oilRef} className="tabular-nums">
            5.20 BAR
          </span>
        </span>
      </div>

      <div className={`${CORNER_BASE} bottom-9 right-9 items-end text-right`}>
        <span className="flex items-center gap-2 text-neutral-300">
          <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
          {dict.hud.live}
        </span>
        <span ref={trackRef} className="tracking-[0.2em] text-neutral-500">
          {TRACKS[0].name}
        </span>
        <span
          ref={coordsRef}
          className="font-mono tabular-nums tracking-[0.2em] text-neutral-500"
        >
          50.3356 N / 6.9475 E
        </span>
      </div>
    </div>
  );
}
