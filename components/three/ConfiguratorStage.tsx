"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useConfigurator } from "@/lib/configurator/store";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ConfiguratorCanvas } from "./ConfiguratorCanvas";
import { cn } from "@/utils/cn";

/**
 * The Studio's viewing area — a thin wrapper around the interactive canvas,
 * plus the before/after comparison slider overlaid on top of it.
 */
export function ConfiguratorStage() {
  const { state } = useConfigurator();

  return (
    <div
      className={cn(
        "relative h-full w-full",
        // Kept mounted (not unmounted) while the Visualizer is open: tearing
        // this canvas down at the exact moment the Visualizer's own canvas
        // stands one up is a real WebGL context-creation race on constrained
        // GPUs — see ConfiguratorCanvas's own `rendering` guard, which pauses
        // its frameloop instead. `invisible` keeps it out of the way without
        // touching layout or triggering that race.
        state.visualizerOpen && "invisible",
      )}
    >
      <ConfiguratorCanvas />
      {state.compareImage && (
        <CompareSlider key={state.compareImage} image={state.compareImage} />
      )}
    </div>
  );
}

/**
 * A photo-comparison-style slider: the frozen "before" image sits on top,
 * clipped to the divider's position; the live canvas underneath (rendering
 * "after" in real time) shows through on the other side. CameraRig freezes
 * the camera for as long as this is open so the two stay pixel-aligned.
 *
 * Keyed by `image` from the parent, so a new comparison remounts this (and
 * recenters the slider) instead of reaching for an effect to reset state.
 */
function CompareSlider({ image }: { image: string }) {
  const { dict } = useLanguage();
  const { exitCompare } = useConfigurator();
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  useEffect(() => {
    const updateFromClientX = (clientX: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setPosition(Math.min(100, Math.max(0, pct)));
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      updateFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <img
        src={image}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      <span className="pointer-events-none absolute bottom-4 left-4 text-[11px] uppercase tracking-[0.2em] text-neutral-300">
        {dict.configurator.compare.before}
      </span>
      <span className="pointer-events-none absolute bottom-4 right-4 text-[11px] uppercase tracking-[0.2em] text-neutral-300">
        {dict.configurator.compare.after}
      </span>

      <div
        role="slider"
        tabIndex={0}
        aria-label={dict.configurator.compare.button}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-orientation="horizontal"
        className="absolute inset-y-0 w-px cursor-ew-resize bg-white/70"
        style={{ left: `${position}%` }}
        onPointerDown={() => {
          dragging.current = true;
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setPosition((p) => Math.max(0, p - 5));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setPosition((p) => Math.min(100, p + 5));
          } else if (e.key === "Home") {
            e.preventDefault();
            setPosition(0);
          } else if (e.key === "End") {
            e.preventDefault();
            setPosition(100);
          }
        }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/60 backdrop-blur-sm">
          <div className="h-3 w-px bg-white/70" />
        </div>
      </div>

      <button
        type="button"
        onClick={exitCompare}
        aria-label={dict.configurator.compare.exit}
        data-cursor={dict.configurator.compare.exit}
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-white/40 hover:text-neutral-50"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
