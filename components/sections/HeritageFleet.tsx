"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGLTF } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { CARS, type CarConfig } from "@/lib/three/carConfigs";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/utils/cn";

gsap.registerPlugin(ScrollTrigger);

/** Scroll distance (px) dedicated to each step between two consecutive cars. */
const SCROLL_PER_CAR = 700;

/**
 * Pinned scroll-driven fleet timeline. One `HeroCanvas` stays mounted for the
 * whole section — scrolling swaps which car it renders (a hard cut, the same
 * way picking a car in the Studio's own switcher is a hard cut, not a
 * cross-fade) rather than mounting a second WebGL context per car. The two
 * neighbouring cars are preloaded as the active one changes, so the swap
 * never waits on a cold GLTF fetch.
 */
export function HeritageFleet() {
  const { dict } = useLanguage();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const totalScroll = SCROLL_PER_CAR * (CARS.length - 1);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: () => `+=${totalScroll}`,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const index = Math.min(
            CARS.length - 1,
            Math.round(self.progress * (CARS.length - 1)),
          );
          setActiveIndex((previous) => (previous === index ? previous : index));
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  // Starts fetching the fleet's first car the moment this section mounts —
  // this page's own Heritage/HeritageStats sections sit above it, giving the
  // model a real head start over the scroll instead of only starting once
  // HeroCanvas's render gate lets the section's Canvas itself mount.
  useEffect(() => {
    useGLTF.preload(CARS[0].url);
  }, []);

  // Warms whichever car scrolling to is about to reach next, in either
  // direction — the same idle-preload idea as the Studio's car switcher.
  useEffect(() => {
    const neighbours = [CARS[activeIndex - 1], CARS[activeIndex + 1]].filter(
      (c): c is CarConfig => !!c,
    );
    for (const c of neighbours) useGLTF.preload(c.url);
  }, [activeIndex]);

  const car = CARS[activeIndex];

  return (
    <section
      ref={wrapperRef}
      aria-label={dict.a11y.sections.heritageFleet}
      className="relative h-screen overflow-hidden bg-[#020202]"
    >
      <div className="absolute inset-0">
        <HeroCanvas car={car} />
      </div>

      <div className="pointer-events-none relative flex h-full flex-col justify-between p-6 sm:p-10">
        <SectionLabel
          kicker={dict.heritage.fleet.kicker}
          title={dict.heritage.fleet.title}
          subtitle={dict.heritage.fleet.subtitle}
        />

        <div className="flex items-end justify-between gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
                {car.years}
              </span>
              <h3 className="text-4xl font-semibold uppercase tracking-tighter text-neutral-50 sm:text-6xl">
                {car.name}
              </h3>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1.5 pb-2">
            {CARS.map((c, index) => (
              <span
                key={c.id}
                className={cn(
                  "h-1 w-8 rounded-full transition-colors duration-500",
                  index === activeIndex ? "bg-neutral-50" : "bg-white/15",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
