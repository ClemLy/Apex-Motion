"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppAudio } from "@/lib/audio/AudioProvider";

export type ExhaustLine = "oem" | "titanium" | "straight";

const IDLE_RPM = 850;
const MAX_RPM = 9000;

const EXHAUST_PROFILES: Record<
  ExhaustLine,
  {
    filterFreq: number;
    distortion: number;
    oscType: OscillatorType;
    gain: number;
  }
> = {
  oem: { filterFreq: 2200, distortion: 0.15, oscType: "sawtooth", gain: 0.22 },
  titanium: {
    filterFreq: 3600,
    distortion: 0.4,
    oscType: "sawtooth",
    gain: 0.28,
  },
  straight: {
    filterFreq: 5200,
    distortion: 0.65,
    oscType: "square",
    gain: 0.32,
  },
};

interface EngineGraph {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  noise: AudioBufferSourceNode;
  noiseGain: GainNode;
  filter: BiquadFilterNode;
  masterGain: GainNode;
  analyser: AnalyserNode;
}

export function useEngineAudio(exhaustLine: ExhaustLine) {
  const { getContext, enabled } = useAppAudio();
  const [rpm, setRpm] = useState(IDLE_RPM);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const graphRef = useRef<EngineGraph | null>(null);
  const rafRef = useRef<number | null>(null);
  const revvingRef = useRef(false);
  const loopRef = useRef<() => void>(() => {});

  const ensureGraph = useCallback(() => {
    const ctx = getContext();
    if (!ctx || graphRef.current) return graphRef.current;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc2.detune.value = 9;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.8;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    osc1.connect(filter);
    osc2.connect(filter);
    noise.connect(noiseGain);
    noiseGain.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    osc1.type = "sawtooth";
    osc2.type = "sawtooth";
    osc1.start();
    osc2.start();
    noise.start();

    const graph: EngineGraph = {
      osc1,
      osc2,
      noise,
      noiseGain,
      filter,
      masterGain,
      analyser,
    };
    graphRef.current = graph;
    setAnalyser(analyser);
    return graph;
  }, [getContext]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const graph = graphRef.current;
      if (graph) {
        graph.osc1.stop();
        graph.osc2.stop();
        graph.noise.stop();
      }
    };
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    const ctx = getContext();
    if (!graph || !ctx) return;
    const profile = EXHAUST_PROFILES[exhaustLine];
    graph.filter.type = "lowpass";
    graph.osc1.type = profile.oscType;
    graph.osc2.type = profile.oscType;
    graph.filter.frequency.setTargetAtTime(
      profile.filterFreq,
      ctx.currentTime,
      0.05,
    );
  }, [exhaustLine, getContext]);

  useEffect(() => {
    const graph = graphRef.current;
    const ctx = getContext();
    if (!graph || !ctx) return;

    const profile = EXHAUST_PROFILES[exhaustLine];
    const baseFreq = 40 + (rpm / MAX_RPM) * 260;
    graph.osc1.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.02);
    graph.osc2.frequency.setTargetAtTime(baseFreq * 1.5, ctx.currentTime, 0.02);

    const intensity = rpm / MAX_RPM;
    const targetGain = enabled ? profile.gain * (0.35 + intensity * 0.65) : 0;
    graph.masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.08);
    graph.noiseGain.gain.setTargetAtTime(
      enabled ? profile.distortion * intensity * 0.5 : 0,
      ctx.currentTime,
      0.08,
    );
  }, [rpm, exhaustLine, enabled, getContext]);

  useEffect(() => {
    loopRef.current = () => {
      setRpm((current) => {
        const target = revvingRef.current ? MAX_RPM : IDLE_RPM;
        const speed = revvingRef.current ? 0.05 : 0.035;
        const next = current + (target - current) * speed;
        return Math.abs(next - target) < 5 ? target : next;
      });
      rafRef.current = requestAnimationFrame(() => loopRef.current());
    };
  });

  const setRevving = useCallback(
    (active: boolean) => {
      if (!enabled) return;
      ensureGraph();
      revvingRef.current = active;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => loopRef.current());
      }
    },
    [enabled, ensureGraph],
  );

  return {
    rpm: Math.round(rpm),
    maxRpm: MAX_RPM,
    idleRpm: IDLE_RPM,
    setRevving,
    analyser,
  };
}
