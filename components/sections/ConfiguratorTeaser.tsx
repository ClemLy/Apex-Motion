"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { TURBO_930_CONFIG } from "@/lib/three/carConfigs";

export function ConfiguratorTeaser() {
  const { dict } = useLanguage();
  const revealRef = useScrollReveal<HTMLAnchorElement>({ y: 40 });

  return (
    <section
      id="configurator"
      aria-label={dict.a11y.sections.configuratorTeaser}
      className="relative flex flex-col gap-10 px-6 py-24 sm:px-10 sm:py-28 short:gap-6 short:py-16"
    >
      <SectionLabel
        kicker={dict.configurator.kicker}
        title={dict.configurator.title}
        titleAccent={dict.configurator.titleAccent}
        subtitle={dict.configurator.subtitle}
      />

      <Link
        ref={revealRef}
        href="/configurator"
        className="group relative block h-[62svh] w-full overflow-hidden rounded-3xl border border-white/10 sm:h-[70vh] short:h-[78svh]"
      >
        <div className="absolute inset-0">
          <HeroCanvas
            car={TURBO_930_CONFIG}
            decorative
            portraitLift={0.1}
            loadingCtaLabel={dict.hero.cta}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex flex-col items-start gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-300 sm:text-xs">
            {dict.configurator.tabs.paint} / {dict.configurator.tabs.aero} /{" "}
            {dict.configurator.tabs.wheels}
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-100 backdrop-blur-xl transition-all duration-300 group-hover:scale-105 group-hover:gap-3 group-hover:border-white/30">
            {dict.hero.cta}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </section>
  );
}
