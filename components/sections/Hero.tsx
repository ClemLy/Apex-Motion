"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { TelemetryTag } from "@/components/ui/TelemetryTag";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Hero() {
  const { dict } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-title-line",
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.08,
          delay: 0.2,
        },
      );
      gsap.fromTo(
        ".hero-fade",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.7, stagger: 0.06 },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="home"
      className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden pb-16 pt-32"
    >
      <div className="absolute inset-0">
        <HeroCanvas />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/40" />

      <div className="relative z-10 flex flex-col gap-10 px-6 sm:px-10">
        <span className="hero-fade text-[10px] uppercase tracking-[0.35em] text-neutral-500">
          {dict.hero.kicker}
        </span>

        <h1 className="flex flex-col text-[16vw] font-semibold uppercase leading-[0.82] tracking-tighter text-neutral-50 sm:text-[9vw]">
          <span className="overflow-hidden">
            <span className="hero-title-line block">{dict.hero.title1}</span>
          </span>
          <span className="overflow-hidden text-neutral-500">
            <span className="hero-title-line block">{dict.hero.title2}</span>
          </span>
        </h1>

        <div className="hero-fade flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-neutral-400">
            {dict.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/configurator"
              className="group flex items-center gap-2 rounded-full bg-neutral-50 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-neutral-950 transition-transform hover:scale-[1.02]"
            >
              {dict.hero.cta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/heritage"
              className="rounded-full border border-white/15 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-white/40 hover:text-neutral-50"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="hero-fade grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
          <TelemetryTag label={dict.hero.telemetry.rpm} value="7 900 tr/min" />
          <TelemetryTag label={dict.hero.telemetry.gforce} value="1.2 G" />
          <TelemetryTag label={dict.hero.telemetry.downforce} value="860 N" />
          <TelemetryTag label={dict.hero.telemetry.topSpeed} value="296 km/h" />
        </div>
      </div>
    </section>
  );
}
