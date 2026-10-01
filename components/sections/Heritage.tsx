"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heritageEras } from "@/lib/heritage-data";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FlatEngineDiagram } from "@/components/ui/FlatEngineDiagram";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

export function Heritage() {
  const { dict, locale } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current || !wrapperRef.current) return;
    const track = trackRef.current;
    const wrapper = wrapperRef.current;

    // Measured lazily (function-based values + invalidateOnRefresh) so a
    // phone rotating between portrait and landscape re-derives the travel
    // from the new card widths instead of keeping the first measurement.
    const scrollDistance = () =>
      Math.max(0, track.scrollWidth - document.documentElement.clientWidth);

    const ctx = gsap.context(() => {
      if (scrollDistance() <= 0) return;

      gsap.to(track, {
        x: () => -scrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: () => `+=${scrollDistance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <section id="heritage" ref={wrapperRef} className="relative">
      <div className="flex h-[100svh] flex-col justify-center gap-8 overflow-hidden pb-10 pt-24 sm:gap-10 sm:py-16 short:gap-4 short:pb-4 short:pt-16">
        <SectionLabel
          as="h1"
          kicker={dict.heritage.kicker}
          title={dict.heritage.title}
          subtitle={dict.heritage.subtitle}
          className="px-6 sm:px-10"
        />

        <div
          ref={trackRef}
          data-cursor={dict.cursor.drag}
          className="flex gap-6 px-6 will-change-transform sm:px-10"
        >
          {heritageEras.map((era) => (
            <article
              key={era.id}
              data-cursor={era.model}
              className="group relative flex h-[42svh] min-h-[19rem] w-[80vw] max-w-sm flex-none flex-col justify-end overflow-hidden rounded-3xl border border-white/10 p-6 transition-colors duration-500 hover:border-white/25 sm:w-[38vw] sm:max-w-none sm:p-8 lg:w-[28vw] short:h-[54svh] short:min-h-0 short:w-[36vw] short:p-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 60%), linear-gradient(160deg, #111213 0%, #030303 70%)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />
              <FlatEngineDiagram
                cylinders={era.cylinders}
                className="pointer-events-none absolute right-[-10%] top-[8%] w-[85%] text-white/[0.07] transition-colors duration-500 group-hover:text-white/[0.14]"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                {era.years}
              </span>
              <h3 className="mt-2 text-3xl font-semibold uppercase tracking-tighter text-neutral-50 short:text-2xl">
                {era.model}
              </h3>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-neutral-400 short:hidden">
                {era.tagline[locale]}
              </p>
              <div className="mt-5 flex gap-6 border-t border-white/10 pt-4 font-mono text-[11px] text-neutral-400 short:mt-3 short:pt-3">
                <span>{era.power}</span>
                <span>{era.topSpeed}</span>
              </div>
              <span className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600">
                {era.cylinders} {dict.heritage.cylinders} ·{" "}
                {dict.heritage.cooling[era.cooling]}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
