"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, MoveDown } from "lucide-react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useIntro } from "@/lib/intro/IntroProvider";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { GT3RS_CONFIG } from "@/lib/three/carConfigs";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const { dict } = useLanguage();
  const { hasEntered } = useIntro();
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const primaryCtaRef = useMagneticHover<HTMLAnchorElement>();
  const secondaryCtaRef = useMagneticHover<HTMLAnchorElement>();

  // Park the entrance elements in their start state immediately, so nothing
  // flashes in its final position while the curtain is still pulling apart.
  // When reduced motion is preferred, skip straight to the final state.
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".hero-line", { yPercent: 0, skewY: 0 });
        gsap.set(".hero-rule", { scaleX: 1 });
        gsap.set(".hero-fade", { opacity: 1, y: 0 });
      } else {
        gsap.set(".hero-line", { yPercent: 115, skewY: 5 });
        gsap.set(".hero-rule", { scaleX: 0 });
        gsap.set(".hero-fade", { opacity: 0, y: 22 });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  // Fade out the scroll hint once the user has actually scrolled.
  useEffect(() => {
    const el = scrollHintRef.current;
    const trigger = rootRef.current;
    if (!el || !trigger) return;
    const st = ScrollTrigger.create({
      trigger,
      start: "top+=80 top",
      once: true,
      onEnter: () => {
        gsap.to(el, { opacity: 0, y: 6, duration: 0.5, ease: "power2.out" });
      },
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    // The entrance is choreographed against the preloader curtain, so it only
    // fires once that has burst open.
    if (!hasEntered) return;

    // When the user prefers reduced motion, the set-effect above has already
    // shown the final state — nothing more to animate here.
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });

      intro
        .fromTo(
          ".hero-line",
          { yPercent: 115, skewY: 5 },
          { yPercent: 0, skewY: 0, duration: 1.25, stagger: 0.09 },
          0.15,
        )
        .fromTo(
          ".hero-rule",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "expo.out" },
          0.5,
        )
        .fromTo(
          ".hero-fade",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.07 },
          0.65,
        );

      // Headline drifts up and fades as the page scrolls away.
      gsap.to(".hero-parallax", {
        yPercent: -22,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [hasEntered, reducedMotion]);

  return (
    <section
      ref={rootRef}
      id="home"
      aria-label={dict.a11y.sections.hero}
      className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden pb-14 pt-32 lg:pb-40"
    >
      <div className="absolute inset-0" data-cursor={dict.cursor.orbit}>
        <HeroCanvas car={GT3RS_CONFIG} eager />
      </div>

      {/* Grounds the type without hiding the car. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/25 to-[#020202]/60" />

      <div className="hero-parallax relative z-10 flex flex-col gap-8 px-6 sm:px-10">
        <div className="hero-fade flex items-center gap-4">
          <span className="h-px w-10 bg-white/25" />
          <span className="text-[11px] uppercase tracking-[0.4em] text-neutral-400">
            {dict.hero.kicker}
          </span>
        </div>

        {/*
          mix-blend-difference makes the type invert over the bodywork.
          Leading stays loose enough that the reveal mask never clips the
          accent on capitals such as the E of EVOLUTION.
        */}
        <h1 className="flex flex-col text-[19vw] font-semibold uppercase leading-[0.92] tracking-[-0.055em] text-white mix-blend-difference sm:text-[13vw]">
          <span className="block overflow-hidden">
            <span className="hero-line block origin-left">
              {dict.hero.title1}
            </span>
          </span>
          <span className="block overflow-hidden pl-[8vw]">
            <span className="hero-line block origin-left">
              {dict.hero.title2}
            </span>
          </span>
        </h1>

        <div className="hero-rule h-px w-full origin-left bg-white/12" />

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="hero-fade max-w-sm text-sm leading-relaxed text-neutral-400">
            {dict.hero.subtitle}
          </p>

          {/* Telemetry strip, race-dashboard style. */}
          <div className="hero-fade grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-4">
            {[
              {
                label: dict.hero.telemetry.rpm,
                value: "7 900",
                unit: "tr/min",
              },
              { label: dict.hero.telemetry.gforce, value: "1.2", unit: "G" },
              { label: dict.hero.telemetry.downforce, value: "860", unit: "N" },
              {
                label: dict.hero.telemetry.topSpeed,
                value: "296",
                unit: "km/h",
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                  {item.label}
                </span>
                <span className="font-mono text-lg tabular-nums leading-none text-neutral-100">
                  {item.value}
                  <span className="ml-1 text-[11px] text-neutral-500">
                    {item.unit}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="hero-fade flex flex-wrap items-center gap-3">
            <Link
              ref={primaryCtaRef}
              href="/configurator"
              data-cursor={dict.cursor.explore}
              className="group flex items-center gap-2 rounded-full bg-neutral-50 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-neutral-950 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]"
            >
              {dict.hero.cta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              ref={secondaryCtaRef}
              href="/heritage"
              data-cursor={dict.cursor.view}
              className="magnetic rounded-full border border-white/15 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-neutral-300 transition duration-300 hover:border-white/40 hover:scale-[1.02] hover:text-neutral-50 active:scale-[0.97]"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <div ref={scrollHintRef} className="hero-fade flex items-center gap-2 pt-2 text-[11px] uppercase tracking-[0.35em] text-neutral-500">
          <MoveDown className="h-3 w-3" aria-hidden />
          {dict.hud.scroll}
        </div>
      </div>
    </section>
  );
}
