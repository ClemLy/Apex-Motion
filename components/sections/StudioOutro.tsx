"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useMagneticHover } from "@/hooks/useMagneticHover";

/**
 * Closing beat for the homepage: after the particle-assembly finale, a
 * deliberate full stop rather than the page just trailing off, pointing the
 * one place left to go. Same reveal + magnetic-hover primitives as every
 * other CTA on the site (Hero's own primary button), just a bigger moment
 * for it since this is the last thing a visitor sees before either leaving
 * or continuing into the Studio.
 */
export function StudioOutro() {
  const { dict } = useLanguage();
  const revealRef = useScrollReveal<HTMLDivElement>({ y: 30 });
  const ctaRef = useMagneticHover<HTMLAnchorElement>();

  return (
    <section className="relative flex flex-col items-center gap-8 px-6 py-32 text-center sm:px-10 sm:py-40">
      <div ref={revealRef} className="flex flex-col items-center gap-6">
        <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
          {dict.outro.kicker}
        </span>
        <h2 className="text-4xl font-semibold uppercase leading-[0.95] tracking-tighter text-neutral-50 sm:text-6xl">
          {dict.outro.title}
          <span className="block text-neutral-500">
            {dict.outro.titleAccent}
          </span>
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-neutral-400">
          {dict.outro.subtitle}
        </p>
      </div>

      <Link
        ref={ctaRef}
        href="/configurator"
        data-cursor={dict.cursor.explore}
        className="group flex items-center gap-2 rounded-full bg-neutral-50 px-8 py-4 text-xs uppercase tracking-[0.2em] text-neutral-950"
      >
        {dict.hero.cta}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </section>
  );
}
