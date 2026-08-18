"use client";

import { useProgress } from "@react-three/drei";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Real download progress for the active .glb, tracked via three's global
 * loading manager (drei's useProgress hooks into it automatically — no
 * manual wiring needed against GltfCar). Lives outside the Canvas so it
 * keeps rendering crisp HTML text while the WebGL context is still booting.
 */
export function ModelLoadOverlay() {
  const { active, progress } = useProgress();
  const { dict } = useLanguage();

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#020202]">
      <div className="flex flex-col items-center gap-4">
        <span className="font-mono text-3xl tabular-nums text-neutral-100">
          {Math.round(progress).toString().padStart(3, "0")}%
        </span>
        <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
          {dict.configurator.loadingModel}
        </span>
      </div>
    </div>
  );
}
