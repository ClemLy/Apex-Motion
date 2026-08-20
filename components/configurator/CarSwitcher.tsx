"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useGLTF } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useUISound } from "@/hooks/useUISound";
import { CARS } from "@/lib/three/carConfigs";
import { cn } from "@/utils/cn";

/**
 * Collapsed dropdown car picker — a full keyboard-accessible listbox
 * (roving tabindex, arrow/Home/End navigation, Escape returns focus to the
 * trigger) rather than a native `<select>`, since it needs the two-line
 * name/year layout the rest of the Studio's car cards use.
 */
export function CarSwitcher({
  carId,
  onSelect,
}: {
  carId: string;
  onSelect: (carId: string) => void;
}) {
  const { dict } = useLanguage();
  const playSound = useUISound();
  const car = CARS.find((c) => c.id === carId) ?? CARS[0];

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Closes the switcher on an outside click, the standard dropdown contract.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keyboard entry point: opening moves focus straight to the active car
  // (roving tabindex below), so arrow keys work immediately without a
  // spurious extra Tab stop.
  useEffect(() => {
    if (!open) return;
    const activeIndex = CARS.findIndex((c) => c.id === carId);
    optionRefs.current[Math.max(activeIndex, 0)]?.focus();
  }, [open, carId]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const handleListKeyDown = (event: KeyboardEvent) => {
    const options = optionRefs.current;
    const currentIndex = options.findIndex(
      (el) => el === document.activeElement,
    );
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      options[(currentIndex + 1 + options.length) % options.length]?.focus();
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      options[(currentIndex - 1 + options.length) % options.length]?.focus();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      options[0]?.focus();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      options[options.length - 1]?.focus();
    }
  };

  return (
    <div ref={rootRef} className="flex flex-col gap-2">
      <span
        id="car-switcher-label"
        className="text-[10px] uppercase tracking-[0.2em] text-neutral-500"
      >
        {dict.configurator.carSwitcher}
      </span>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            playSound("select");
            setOpen((v) => !v);
          }}
          onKeyDown={(event) => {
            if (
              !open &&
              (event.key === "ArrowDown" || event.key === "ArrowUp")
            ) {
              event.preventDefault();
              setOpen(true);
            }
          }}
          data-cursor={dict.cursor.toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border bg-white/5 px-3 py-2.5 text-left transition-colors duration-300",
            open
              ? "border-neutral-50"
              : "border-white/10 hover:border-white/25",
          )}
        >
          <span className="flex items-baseline gap-2.5">
            <span className="text-xs uppercase tracking-wide text-neutral-50">
              {car.name}
            </span>
            <span className="text-[9px] uppercase tracking-wide text-neutral-500">
              {car.years}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "h-3.5 w-3.5 text-neutral-400 transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="listbox"
              aria-labelledby="car-switcher-label"
              onKeyDown={handleListKeyDown}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full z-30 mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl"
            >
              {CARS.map((c, index) => (
                <button
                  key={c.id}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={carId === c.id}
                  tabIndex={carId === c.id ? 0 : -1}
                  onClick={() => {
                    playSound("select");
                    if (c.id !== carId) onSelect(c.id);
                    close(false);
                  }}
                  onPointerEnter={() => useGLTF.preload(c.url)}
                  data-cursor={dict.cursor.view}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors duration-300",
                    carId === c.id
                      ? "border-neutral-50 bg-white/5"
                      : "border-white/10 hover:border-white/25",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs uppercase tracking-wide",
                      carId === c.id ? "text-neutral-50" : "text-neutral-300",
                    )}
                  >
                    {c.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-wide text-neutral-500">
                    {c.years}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
