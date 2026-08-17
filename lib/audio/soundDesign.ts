/**
 * Micro-haptic sound design, synthesized entirely with the Web Audio API.
 *
 * Every cue is built from oscillators, filtered noise and envelopes at call
 * time, so no audio files ship in the bundle. Each voice disconnects itself on
 * ended, which keeps the node graph from growing over a long session.
 */

/** One white-noise buffer per AudioContext, reused by every noise-based voice. */
const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

function getNoiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const cached = noiseBuffers.get(ctx);
  if (cached) return cached;

  const length = Math.floor(ctx.sampleRate * 0.6);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffers.set(ctx, buffer);
  return buffer;
}

/** Master bus so a single gain governs every cue and nothing clips together. */
const masterBuses = new WeakMap<BaseAudioContext, GainNode>();

function getMaster(ctx: AudioContext): GainNode {
  const cached = masterBuses.get(ctx);
  if (cached) return cached;

  const master = ctx.createGain();
  master.gain.value = 0.9;

  // Gentle limiting keeps stacked cues from distorting on cheap laptop speakers.
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.knee.value = 18;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.18;

  master.connect(compressor);
  compressor.connect(ctx.destination);
  masterBuses.set(ctx, master);
  return master;
}

interface NoiseBurstOptions {
  duration: number;
  gain: number;
  filterType: BiquadFilterType;
  startFreq: number;
  endFreq?: number;
  q?: number;
}

/** Filtered noise transient: the "attack" half of most mechanical sounds. */
function noiseBurst(
  ctx: AudioContext,
  destination: AudioNode,
  at: number,
  options: NoiseBurstOptions,
) {
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = options.filterType;
  filter.frequency.setValueAtTime(options.startFreq, at);
  if (options.endFreq !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(
      options.endFreq,
      at + options.duration,
    );
  }
  filter.Q.value = options.q ?? 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(options.gain, at + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + options.duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  source.start(at);
  source.stop(at + options.duration + 0.02);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

interface ToneOptions {
  type: OscillatorType;
  startFreq: number;
  endFreq: number;
  duration: number;
  gain: number;
  attack?: number;
}

/** Single enveloped oscillator, used for body and pitch content. */
function tone(
  ctx: AudioContext,
  destination: AudioNode,
  at: number,
  options: ToneOptions,
) {
  const osc = ctx.createOscillator();
  osc.type = options.type;
  osc.frequency.setValueAtTime(options.startFreq, at);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(options.endFreq, 0.0001),
    at + options.duration,
  );

  const gain = ctx.createGain();
  const attack = options.attack ?? 0.004;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(options.gain, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + options.duration);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(at);
  osc.stop(at + options.duration + 0.02);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

export type UICue =
  "hover" | "click" | "toggle" | "shift" | "confirm" | "ignition";

/**
 * Plays a named cue.
 *
 * - hover   : barely-there proximity tick
 * - click   : hard metallic contact, two inharmonic partials over a noise snap
 * - toggle  : sprung switch, a click plus a damped low body
 * - shift   : weighted gear-shift thud with mechanical noise
 * - confirm : short ascending metallic chime
 * - ignition: starter crank into a resonant bass drop
 */
export function playCue(ctx: AudioContext, cue: UICue) {
  const master = getMaster(ctx);
  const now = ctx.currentTime;

  switch (cue) {
    case "hover":
      tone(ctx, master, now, {
        type: "sine",
        startFreq: 2400,
        endFreq: 3000,
        duration: 0.04,
        gain: 0.015,
      });
      break;

    case "click": {
      // Inharmonic partials are what make a contact read as metal, not wood.
      noiseBurst(ctx, master, now, {
        duration: 0.035,
        gain: 0.07,
        filterType: "highpass",
        startFreq: 2600,
        q: 0.7,
      });
      tone(ctx, master, now, {
        type: "square",
        startFreq: 3100,
        endFreq: 2450,
        duration: 0.045,
        gain: 0.035,
        attack: 0.001,
      });
      tone(ctx, master, now, {
        type: "square",
        startFreq: 4730,
        endFreq: 4100,
        duration: 0.03,
        gain: 0.018,
        attack: 0.001,
      });
      break;
    }

    case "toggle": {
      noiseBurst(ctx, master, now, {
        duration: 0.03,
        gain: 0.06,
        filterType: "bandpass",
        startFreq: 3200,
        endFreq: 1800,
        q: 2.2,
      });
      tone(ctx, master, now + 0.006, {
        type: "triangle",
        startFreq: 420,
        endFreq: 190,
        duration: 0.13,
        gain: 0.075,
        attack: 0.002,
      });
      break;
    }

    case "shift": {
      // Heavy mechanical engagement: noise scrape, then a low damped thud.
      noiseBurst(ctx, master, now, {
        duration: 0.07,
        gain: 0.08,
        filterType: "bandpass",
        startFreq: 1900,
        endFreq: 520,
        q: 1.6,
      });
      tone(ctx, master, now + 0.008, {
        type: "sine",
        startFreq: 210,
        endFreq: 62,
        duration: 0.26,
        gain: 0.16,
        attack: 0.003,
      });
      tone(ctx, master, now + 0.008, {
        type: "triangle",
        startFreq: 640,
        endFreq: 240,
        duration: 0.1,
        gain: 0.045,
        attack: 0.002,
      });
      break;
    }

    case "confirm": {
      noiseBurst(ctx, master, now, {
        duration: 0.025,
        gain: 0.045,
        filterType: "highpass",
        startFreq: 3400,
      });
      tone(ctx, master, now, {
        type: "triangle",
        startFreq: 880,
        endFreq: 1760,
        duration: 0.16,
        gain: 0.06,
      });
      break;
    }

    case "ignition": {
      // Starter crank: a few rapid low pulses before the engine catches.
      for (let i = 0; i < 4; i += 1) {
        const at = now + i * 0.075;
        noiseBurst(ctx, master, at, {
          duration: 0.06,
          gain: 0.075,
          filterType: "bandpass",
          startFreq: 420,
          endFreq: 190,
          q: 3.4,
        });
        tone(ctx, master, at, {
          type: "sawtooth",
          startFreq: 78,
          endFreq: 48,
          duration: 0.07,
          gain: 0.09,
        });
      }

      // Catch: resonant sweep down into a sustained sub drop.
      const catchAt = now + 0.32;
      tone(ctx, master, catchAt, {
        type: "sawtooth",
        startFreq: 420,
        endFreq: 96,
        duration: 0.5,
        gain: 0.12,
        attack: 0.01,
      });
      tone(ctx, master, catchAt, {
        type: "sine",
        startFreq: 140,
        endFreq: 34,
        duration: 1.5,
        gain: 0.26,
        attack: 0.02,
      });
      noiseBurst(ctx, master, catchAt, {
        duration: 0.9,
        gain: 0.05,
        filterType: "lowpass",
        startFreq: 1400,
        endFreq: 220,
        q: 1.1,
      });
      break;
    }
  }
}
