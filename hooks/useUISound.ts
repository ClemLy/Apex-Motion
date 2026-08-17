"use client";

import { useCallback } from "react";
import { useAppAudio } from "@/lib/audio/AudioProvider";
import { playCue, type UICue } from "@/lib/audio/soundDesign";

/** Legacy names kept so call sites read in interface terms, not audio terms. */
const ALIASES = {
  tick: "click",
  select: "shift",
  hover: "hover",
  toggle: "toggle",
  confirm: "confirm",
  ignition: "ignition",
} as const;

export type UISoundVariant = keyof typeof ALIASES;

/**
 * Plays a micro-haptic interface cue. Silent until the visitor enables audio
 * from the navigation, since browsers block autoplay before a gesture anyway.
 */
export function useUISound() {
  const { getContext, enabled } = useAppAudio();

  return useCallback(
    (variant: UISoundVariant = "tick") => {
      if (!enabled) return;
      const ctx = getContext();
      if (!ctx) return;
      playCue(ctx, ALIASES[variant] as UICue);
    },
    [enabled, getContext],
  );
}
