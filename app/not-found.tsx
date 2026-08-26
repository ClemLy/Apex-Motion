"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Gauge } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { TelemetryTag } from "@/components/ui/TelemetryTag";

/**
 * Root 404. Renders inside the normal root layout (Navbar, Footer, HudFrame,
 * FluidBackground all still mount around it - see Next's not-found.js
 * convention), so it only needs to supply the centre content, the same way
 * every homepage section only supplies its own slice of the page.
 *
 * Framed as a car that has left the racing line rather than a generic
 * "page missing" notice - same telemetry vocabulary (SectionLabel-style
 * kicker/title, TelemetryTag readouts) as the rest of the site, so a wrong
 * URL still reads as part of the same cockpit rather than a dead end.
 */
export default function NotFound() {
  const { dict } = useLanguage();
  const primaryCtaRef = useMagneticHover<HTMLAnchorElement>();
  const secondaryCtaRef = useMagneticHover<HTMLAnchorElement>();
  const numeralRef = useRef<HTMLSpanElement>(null);

  // One-shot glitch pulse on arrival, same timing as SectionLabel's own
  // scroll-triggered version - this content is already in view on load, so
  // there's no scroll to trigger off. Deliberately *not* driven by
  // usePrefersReducedMotion()'s reactive value: that hook flips from its
  // SSR placeholder to the real value right after hydration, which would
  // re-fire this effect on a dependency change and cancel the cleanup
  // timeout without it ever having removed the class - leaving the glitch
  // stuck permanently "on" for reduced-motion users, the opposite of the
  // intent. Reading matchMedia directly, once, on mount avoids that.
  useEffect(() => {
    const el = numeralRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("glitch-entry");
    const timer = setTimeout(() => el.classList.remove("glitch-entry"), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center gap-10 px-6 py-32 text-center sm:px-10">
      <span
        ref={numeralRef}
        data-text="404"
        className="glitch-title font-mono text-[28vw] font-semibold leading-none tracking-tighter text-neutral-50 sm:text-[16vw]"
      >
        404
      </span>

      <div className="flex flex-col items-center gap-5">
        <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">
          {dict.notFound.kicker}
        </span>
        <h1 className="text-4xl font-semibold uppercase leading-[0.95] tracking-tighter text-neutral-50 sm:text-6xl">
          {dict.notFound.title}
          <span className="block text-neutral-500">
            {dict.notFound.titleAccent}
          </span>
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-neutral-400">
          {dict.notFound.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-8 rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-4">
        <TelemetryTag
          label={dict.notFound.sectorLabel}
          value={dict.notFound.sectorValue}
        />
        <div className="h-8 w-px bg-white/10" />
        <TelemetryTag
          label={dict.notFound.statusLabel}
          value={dict.notFound.statusValue}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          ref={primaryCtaRef}
          href="/"
          data-cursor={dict.cursor.view}
          className="group flex items-center gap-2 rounded-full bg-neutral-50 px-8 py-4 text-xs uppercase tracking-[0.2em] text-neutral-950 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]"
        >
          {dict.notFound.cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <Link
          ref={secondaryCtaRef}
          href="/configurator"
          data-cursor={dict.cursor.explore}
          className="magnetic flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-xs uppercase tracking-[0.2em] text-neutral-300 transition duration-300 hover:border-white/40 hover:scale-[1.02] hover:text-neutral-50 active:scale-[0.97]"
        >
          <Gauge className="h-4 w-4" aria-hidden />
          {dict.notFound.ctaSecondary}
        </Link>
      </div>
    </section>
  );
}
