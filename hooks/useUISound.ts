"use client";

import { useCallback } from "react";
import { useAppAudio } from "@/lib/audio/AudioProvider";

export type UISoundVariant = "tick" | "toggle" | "select" | "hover";

interface SoundSpec {
  frequency: number;
  endFrequency: number;
  duration: number;
  gain: number;
  type: OscillatorType;
}

const SPECS: Record<UISoundVariant, SoundSpec> = {
  hover: {
    frequency: 1800,
    endFrequency: 2200,
    duration: 0.05,
    gain: 0.02,
    type: "sine",
  },
  tick: {
    frequency: 900,
    endFrequency: 1400,
    duration: 0.07,
    gain: 0.05,
    type: "triangle",
  },
  toggle: {
    frequency: 420,
    endFrequency: 780,
    duration: 0.11,
    gain: 0.06,
    type: "square",
  },
  select: {
    frequency: 320,
    endFrequency: 1100,
    duration: 0.16,
    gain: 0.055,
    type: "sawtooth",
  },
};

/**
 * Short synthesized UI feedback blips. Everything is generated on the fly with
 * the Web Audio API so no sample files ship with the bundle.
 */
export function useUISound() {
  const { getContext, enabled } = useAppAudio();

  return useCallback(
    (variant: UISoundVariant = "tick") => {
      if (!enabled) return;
      const ctx = getContext();
      if (!ctx) return;

      const spec = SPECS[variant];
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.frequency, now);
      osc.frequency.exponentialRampToValueAtTime(
        spec.endFrequency,
        now + spec.duration,
      );

      // Band-pass keeps the blips thin and metallic rather than buzzy.
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = spec.endFrequency;
      filter.Q.value = 1.4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(spec.gain, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + spec.duration + 0.02);
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    },
    [enabled, getContext],
  );
}
