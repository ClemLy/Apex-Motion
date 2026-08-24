"use client";

import { useRef, type PointerEvent } from "react";
import { CARS } from "@/lib/three/carConfigs";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Real figures, not filler: the power/speed pair matches the 992 GT3 RS and
 * 959 entries in lib/heritage-data.ts, "decades" is the same span the site's
 * own copy already claims (hero/kinetic sections), and the model count reads
 * straight off the Studio's own car list rather than being hand-typed twice.
 */
function useStats() {
  const { dict } = useLanguage();
  return [
    { value: "7", unit: undefined, label: dict.heritage.stats.decades },
    { value: "525", unit: "ch", label: dict.heritage.stats.power },
    { value: "317", unit: "km/h", label: dict.heritage.stats.speed },
    {
      value: String(CARS.length),
      unit: undefined,
      label: dict.heritage.stats.models,
    },
  ];
}

/** Tilts toward the pointer within its own bounds — a cheap CSS-transform stand-in for the site's cursor-warp language, no shader needed for four static numbers. */
function StatCard({
  value,
  unit,
  label,
}: {
  value: string;
  unit?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${py * -7}deg) rotateY(${px * 7}deg) translateZ(4px)`;
  };

  const onPointerLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="flex flex-col gap-2 rounded-2xl border border-white/10 p-6 transition-transform duration-200 ease-out will-change-transform sm:p-8"
    >
      <span className="font-mono text-5xl leading-none tabular-nums text-neutral-50 sm:text-6xl">
        {value}
        {unit && <span className="ml-1 text-lg text-neutral-500">{unit}</span>}
      </span>
      <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        {label}
      </span>
    </div>
  );
}

export function HeritageStats() {
  const { dict } = useLanguage();
  const stats = useStats();

  return (
    <section className="relative flex flex-col gap-16 px-6 py-24 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
          {dict.heritage.story.kicker}
        </span>
        {dict.heritage.story.paragraphs.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-neutral-400">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-10">
        <SectionLabel
          kicker={dict.heritage.statsKicker}
          title={dict.heritage.statsTitle}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
