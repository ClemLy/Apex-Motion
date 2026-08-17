"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Kinetic editorial band.
 *
 * Two massive marquee rows counter-scroll against each other while a third
 * layer slices across in `mix-blend-difference`, so the type inverts wherever
 * the layers overlap. Everything is scrubbed off scroll position rather than
 * time, which keeps it locked to the Lenis inertia instead of fighting it.
 */
export function KineticStatement() {
  const { dict } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  const words = dict.kinetic.words;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const common = {
        ease: "none" as const,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
        },
      };

      // Counter-running rows: the shear between them is the whole effect.
      gsap.fromTo(
        ".kinetic-row-a",
        { xPercent: 6 },
        { xPercent: -26, ...common },
      );
      gsap.fromTo(
        ".kinetic-row-b",
        { xPercent: -28 },
        { xPercent: 8, ...common },
      );
      gsap.fromTo(
        ".kinetic-slice",
        { xPercent: 22 },
        { xPercent: -32, ...common },
      );

      // The statement resolves into place as the band centres in the viewport.
      gsap.fromTo(
        ".kinetic-statement",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 60%" },
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-label={dict.kinetic.statement}
      className="relative isolate overflow-hidden py-20"
    >
      {/* Row A: outlined type, the quieter layer. */}
      <div className="kinetic-row-a flex w-max gap-10 whitespace-nowrap will-change-transform">
        {[...words, ...words].map((word, i) => (
          <span
            key={`a-${i}`}
            className="text-[13vw] font-semibold uppercase leading-[0.85] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.16)]"
          >
            {word}
          </span>
        ))}
      </div>

      {/* Row B: solid type running the other way. */}
      <div className="kinetic-row-b -mt-[3vw] flex w-max gap-10 whitespace-nowrap will-change-transform">
        {[...words, ...words].map((word, i) => (
          <span
            key={`b-${i}`}
            className="text-[13vw] font-semibold uppercase leading-[0.85] tracking-[-0.05em] text-neutral-900"
          >
            {word}
          </span>
        ))}
      </div>

      {/* Slice layer: inverts everything it crosses. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center mix-blend-difference">
        <div className="kinetic-slice flex w-max gap-10 whitespace-nowrap will-change-transform">
          {[...words, ...words].map((word, i) => (
            <span
              key={`c-${i}`}
              className="text-[13vw] font-semibold uppercase leading-[0.85] tracking-[-0.05em] text-white"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <p className="kinetic-statement relative mx-auto mt-10 max-w-2xl px-6 text-center text-sm leading-relaxed text-neutral-400">
        {dict.kinetic.statement}
      </p>
    </section>
  );
}
