"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

export function ConfiguratorTeaser() {
  const { dict } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".teaser-reveal",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="configurator"
      className="relative flex flex-col gap-10 px-6 py-28 sm:px-10"
    >
      <SectionLabel
        kicker={dict.configurator.kicker}
        title={dict.configurator.title}
        titleAccent={dict.configurator.titleAccent}
        subtitle={dict.configurator.subtitle}
        className="teaser-reveal"
      />

      <Link
        href="/configurator"
        className="teaser-reveal group relative block h-[70vh] w-full overflow-hidden rounded-3xl border border-white/10"
      >
        <div className="absolute inset-0">
          <HeroCanvas />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-300">
            {dict.configurator.tabs.paint} / {dict.configurator.tabs.aero} /{" "}
            {dict.configurator.tabs.wheels} / {dict.configurator.tabs.interior}
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-100 backdrop-blur-xl transition-transform group-hover:scale-105">
            {dict.hero.cta}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </section>
  );
}
