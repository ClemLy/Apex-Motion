"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { gsap } from "gsap";
import { useIntro } from "@/lib/intro/IntroProvider";
import { useAppAudio } from "@/lib/audio/AudioProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { playCue } from "@/lib/audio/soundDesign";

/** Columns and rows of the microscopic technical grid. */
const GRID_COLS = 32;
const GRID_ROWS = 18;
const CELL_COUNT = GRID_COLS * GRID_ROWS;

/** Minimum time on screen, so the sequence reads as deliberate, not as a stall. */
const MIN_DURATION_MS = 2200;

export function Preloader() {
  const { enter } = useIntro();
  const { getContext, setEnabled } = useAppAudio();
  const { dict } = useLanguage();

  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Unmount is driven locally, not by `hasEntered`, so the curtain can keep
  // animating while the hero is already coming alive behind it.
  const [finished, setFinished] = useState(false);

  // Drive the counter, bar and grid straight through the DOM: a hundred
  // re-renders per load would be pure waste for a purely visual readout.
  useEffect(() => {
    const counter = counterRef.current;
    const bar = barRef.current;
    const stage = stageRef.current;
    const grid = gridRef.current;
    if (!counter || !bar || !stage || !grid) return;

    const cells = Array.from(grid.children) as HTMLElement[];
    const stages = dict.preloader.stages;
    const start = performance.now();
    let assetsReady = false;
    let rafId = 0;

    // Real readiness signal: fonts decoded means the type will not reflow.
    // `fonts.ready` can hang indefinitely in some sandboxed/headless
    // environments, so it races against a hard cap — otherwise the entry
    // gate would never reach 100% and the button would never appear.
    const fontsReady =
      "fonts" in document ? document.fonts.ready : Promise.resolve();
    const fontsTimeout = new Promise((resolve) => setTimeout(resolve, 4000));
    void Promise.race([fontsReady, fontsTimeout]).then(() => {
      assetsReady = true;
    });

    const tick = (now: number) => {
      // The rAF timestamp can predate `start`, so clamp before easing.
      const elapsed = Math.max(0, now - start);
      const timeRatio = Math.min(1, elapsed / MIN_DURATION_MS);

      // Ease out so the count decelerates into 100 rather than snapping.
      const eased = 1 - Math.pow(1 - timeRatio, 3);
      const ceiling = assetsReady ? 1 : 0.92;
      const progress = Math.min(eased, ceiling);
      const percent = progress * 100;

      counter.textContent = percent.toFixed(1).padStart(5, "0");
      bar.style.transform = `scaleX(${progress})`;

      const stageIndex = Math.max(
        0,
        Math.min(stages.length - 1, Math.floor(progress * stages.length)),
      );
      if (stage.textContent !== stages[stageIndex]) {
        stage.textContent = stages[stageIndex];
      }

      // Cells light up in sequence, like a sensor array coming online.
      const litCount = Math.floor(progress * CELL_COUNT);
      for (let i = 0; i < cells.length; i += 1) {
        const lit = i < litCount;
        const current = cells[i].dataset.lit === "true";
        if (lit !== current) {
          cells[i].dataset.lit = lit ? "true" : "false";
        }
      }

      if (progress >= 1) {
        setReady(true);
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [dict.preloader.stages]);

  const handleEnter = useCallback(() => {
    if (dismissed) return;
    setDismissed(true);

    // The click is the gesture that unlocks audio, so the bass drop is the
    // first thing the browser lets us play.
    const ctx = getContext();
    if (ctx) {
      setEnabled(true);
      playCue(ctx, "ignition");
    }

    const root = rootRef.current;
    if (!root) {
      enter();
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const timeline = gsap.timeline({ onComplete: () => setFinished(true) });

    if (reduced) {
      enter();
      timeline.to(root, { opacity: 0, duration: 0.3 });
      return;
    }

    timeline
      .to(".preloader-content", {
        opacity: 0,
        scale: 0.94,
        duration: 0.32,
        ease: "power2.in",
      })
      .to(
        ".preloader-flash",
        { opacity: 1, duration: 0.12, ease: "power2.out" },
        "-=0.08",
      )
      .to(".preloader-flash", { opacity: 0, duration: 0.5, ease: "power2.in" })
      // Curtain split: the two halves pull apart onto the live hero. The hero
      // entrance is released on the same beat, so the two read as one move.
      .to(
        ".preloader-half-top",
        {
          yPercent: -100,
          duration: 1.05,
          ease: "expo.inOut",
          onStart: enter,
        },
        "-=0.42",
      )
      .to(
        ".preloader-half-bottom",
        { yPercent: 100, duration: 1.05, ease: "expo.inOut" },
        "<",
      );
  }, [dismissed, enter, getContext, setEnabled]);

  // Keyboard parity: Enter or Space triggers the same sequence.
  useEffect(() => {
    if (!ready || dismissed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, dismissed, handleEnter]);

  if (finished) return null;

  // The whole screen is the hit target once ready, not just the small
  // button — a visitor shouldn't have to hunt for a precise click point.
  // Right-click is accepted too (context menu suppressed), since "any
  // gesture gets you in" beats a visitor bouncing off a menu they didn't want.
  const handleScreenClick = () => {
    if (ready) handleEnter();
  };
  const handleScreenContextMenu = (event: MouseEvent) => {
    if (!ready) return;
    event.preventDefault();
    handleEnter();
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] overflow-hidden"
      role="dialog"
      aria-label={dict.preloader.title}
      onClick={handleScreenClick}
      onContextMenu={handleScreenContextMenu}
    >
      {/* Two solid halves that split apart on exit. */}
      <div className="preloader-half-top absolute inset-x-0 top-0 h-1/2 bg-[#020202]" />
      <div className="preloader-half-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[#020202]" />

      <div className="preloader-flash pointer-events-none absolute inset-0 bg-white opacity-0" />

      <div className="preloader-content absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Microscopic technical grid */}
        <div
          ref={gridRef}
          aria-hidden
          className="mb-14 grid w-full max-w-3xl gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: CELL_COUNT }).map((_, i) => (
            <span
              key={i}
              data-lit="false"
              className="h-[3px] w-full bg-white/[0.06] transition-colors duration-200 data-[lit=true]:bg-white/70"
            />
          ))}
        </div>

        <div className="flex w-full max-w-3xl flex-col gap-5">
          <div className="flex items-end justify-between gap-6">
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-100">
              APEX <span className="text-neutral-600">{"//"}</span> MOTION
            </span>
            <span className="font-mono text-5xl leading-none tabular-nums text-neutral-50 sm:text-7xl">
              <span ref={counterRef}>000.0</span>
              <span className="ml-2 text-base text-neutral-600">%</span>
            </span>
          </div>

          {/* Progress rule */}
          <span className="block h-px w-full bg-white/10">
            <span
              ref={barRef}
              className="block h-px w-full origin-left scale-x-0 bg-white"
            />
          </span>

          <div className="flex items-center justify-between gap-6">
            <span
              ref={stageRef}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500"
            >
              {dict.preloader.stages[0]}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
              WEISSACH / DE
            </span>
          </div>
        </div>

        {/* Entry gate. The click also unlocks the AudioContext. The parent
            screen already handles the click/right-click, so this button is
            the visual focal point rather than the only hit target. */}
        <div className="mt-14 flex h-16 flex-col items-center gap-3">
          {ready && !dismissed && (
            <>
              <button
                type="button"
                data-cursor={dict.preloader.enter}
                className="group relative flex items-center gap-4 rounded-full border border-white/20 px-9 py-3.5 text-[11px] uppercase tracking-[0.35em] text-neutral-100 transition-colors duration-300 hover:border-white/60"
              >
                <span className="absolute inset-0 animate-ping rounded-full border border-white/20 [animation-duration:2.4s]" />
                <span className="relative">{dict.preloader.enter}</span>
                <span className="relative h-1 w-1 rounded-full bg-emerald-400" />
              </button>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-600">
                {dict.preloader.hint}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
