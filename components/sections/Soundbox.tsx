"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAppAudio } from "@/lib/audio/AudioProvider";
import { useEngineAudio, type ExhaustLine } from "@/hooks/useEngineAudio";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/utils/cn";

const LINES: ExhaustLine[] = ["oem", "titanium", "straight"];
const MAX_RPM = 9000;
const GAUGE_RADIUS = 110;
const GAUGE_CIRCUMFERENCE = Math.PI * GAUGE_RADIUS;

function Visualizer({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const barWidth = width / data.length;
        ctx.fillStyle = "rgba(245,245,245,0.85)";
        data.forEach((value, i) => {
          const barHeight = (value / 255) * height;
          ctx.fillRect(i * barWidth, height - barHeight, barWidth * 0.7, barHeight);
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} width={480} height={120} className="w-full" />;
}

export function Soundbox() {
  const { dict } = useLanguage();
  const { enabled, toggleEnabled } = useAppAudio();
  const [line, setLine] = useState<ExhaustLine>("oem");
  const { rpm, setRevving, analyser } = useEngineAudio(line);

  const progress = Math.min(1, rpm / MAX_RPM);
  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - progress);

  return (
    <section
      id="soundbox"
      className="relative flex flex-col gap-10 px-6 py-28 sm:px-10"
    >
      <SectionLabel
        kicker={dict.soundbox.kicker}
        title={dict.soundbox.title}
        titleAccent={dict.soundbox.titleAccent}
        subtitle={dict.soundbox.subtitle}
      />

      <GlassPanel className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 p-8 sm:p-12">
        <div className="flex gap-2 rounded-full border border-white/10 bg-black/30 p-1">
          {LINES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setLine(id)}
              className={cn(
                "rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors",
                line === id
                  ? "bg-neutral-50 text-neutral-950"
                  : "text-neutral-400 hover:text-neutral-100",
              )}
            >
              {dict.soundbox.lines[id]}
            </button>
          ))}
        </div>

        <div className="relative flex items-center justify-center">
          <svg width={260} height={150} viewBox="0 0 260 150">
            <path
              d="M 20 140 A 110 110 0 0 1 240 140"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={10}
              strokeLinecap="round"
            />
            <path
              d="M 20 140 A 110 110 0 0 1 240 140"
              fill="none"
              stroke="#f5f5f5"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={GAUGE_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.05s linear" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center gap-1">
            <span className="font-mono text-4xl tabular-nums text-neutral-50">
              {rpm.toLocaleString("fr-FR")}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              tr / min
            </span>
          </div>
        </div>

        <button
          type="button"
          onPointerDown={() => {
            if (!enabled) toggleEnabled();
            setRevving(true);
          }}
          onPointerUp={() => setRevving(false)}
          onPointerLeave={() => setRevving(false)}
          className="select-none rounded-full border border-white/15 bg-neutral-50 px-10 py-4 text-[11px] uppercase tracking-[0.25em] text-neutral-950 transition-transform active:scale-95"
        >
          {dict.soundbox.rev}
        </button>
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          {dict.soundbox.release}
        </span>

        <Visualizer analyser={analyser} />
      </GlassPanel>
    </section>
  );
}
