"use client";

import { useEffect, useRef } from "react";
import { useUISound } from "@/hooks/useUISound";

const RING_IDLE = 26;
const RING_ACTIVE = 76;
const MAGNET_STRENGTH = 0.32;
const LENS_SIZE = 108;

/**
 * Hollow ring cursor that lerps toward the pointer, magnetically snaps to any
 * element carrying `data-cursor`, and surfaces that element's contextual label.
 * All per-frame work is direct DOM mutation so React never re-renders on move.
 *
 * Two more layers ride the same render loop: a fading light trail on a 2D
 * canvas, and a glass "lens" that actually refracts whatever sits behind it
 * via an SVG displacement filter — not an imitation, a real distortion of the
 * DOM/canvas content underneath, at CSS compositing cost rather than a
 * DOM-to-texture render.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);

  // Held in a ref so toggling audio does not change this hook's identity and
  // tear down the pointer listeners mid-session.
  const playSound = useUISound();
  const playSoundRef = useRef(playSound);
  useEffect(() => {
    playSoundRef.current = playSound;
  }, [playSound]);

  useEffect(() => {
    // Pointer-coarse devices (touch) get no custom cursor at all.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    const lens = lensRef.current;
    const trailCanvas = trailCanvasRef.current;
    if (!ring || !dot || !label || !lens || !trailCanvas) return;
    const trailCtx = trailCanvas.getContext("2d");

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pointer };
    const dotPos = { ...pointer };
    const lensPos = { ...pointer };
    const size = { current: RING_IDLE, target: RING_IDLE };

    let target: HTMLElement | null = null;
    let rafId = 0;

    // Local state starts at null, so the DOM has to start there too. Otherwise
    // a re-run inherits a stale label that the `hovered !== target` check can
    // never clear, because both sides are already null.
    label.textContent = "";
    ring.dataset.active = "false";

    const resizeTrail = () => {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    };
    resizeTrail();
    window.addEventListener("resize", resizeTrail);

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      const hovered = (
        event.target as HTMLElement | null
      )?.closest<HTMLElement>("[data-cursor]");

      if (hovered !== target) {
        target = hovered ?? null;
        const text = target?.dataset.cursor ?? "";
        label.textContent = text;
        size.target = target ? RING_ACTIVE : RING_IDLE;
        ring.dataset.active = target ? "true" : "false";
        if (target) playSoundRef.current("hover");
      }
    };

    const onDown = () => {
      size.target = size.target * 0.82;
    };
    const onUp = () => {
      size.target = target ? RING_ACTIVE : RING_IDLE;
    };

    const render = () => {
      // A hovered element can be removed from the page while the pointer sits
      // still (the preloader button is, on entry). Without this the ring would
      // stay expanded on a stale label until the next pointer move.
      if (target && !target.isConnected) {
        target = null;
        label.textContent = "";
        size.target = RING_IDLE;
        ring.dataset.active = "false";
      }

      // Magnetic pull: bias the ring toward the hovered element's centre.
      let goalX = pointer.x;
      let goalY = pointer.y;

      if (target) {
        const rect = target.getBoundingClientRect();
        const centreX = rect.left + rect.width / 2;
        const centreY = rect.top + rect.height / 2;
        goalX += (centreX - pointer.x) * MAGNET_STRENGTH;
        goalY += (centreY - pointer.y) * MAGNET_STRENGTH;
      }

      ringPos.x += (goalX - ringPos.x) * 0.16;
      ringPos.y += (goalY - ringPos.y) * 0.16;
      dotPos.x += (pointer.x - dotPos.x) * 0.42;
      dotPos.y += (pointer.y - dotPos.y) * 0.42;
      // Heavier than the dot, lighter than the ring — reads as the glass
      // itself trailing a beat behind the light it's bending.
      lensPos.x += (pointer.x - lensPos.x) * 0.1;
      lensPos.y += (pointer.y - lensPos.y) * 0.1;
      size.current += (size.target - size.current) * 0.18;

      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      ring.style.width = `${size.current}px`;
      ring.style.height = `${size.current}px`;
      dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
      lens.style.transform = `translate3d(${lensPos.x}px, ${lensPos.y}px, 0) translate(-50%, -50%)`;

      if (trailCtx) {
        // Painting a near-opaque rect each frame (instead of clearing) lets
        // the previous frame's glow persist and fade rather than vanish —
        // a light trail with no history array to maintain.
        trailCtx.fillStyle = "rgba(2, 2, 2, 0.13)";
        trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height);

        const gradient = trailCtx.createRadialGradient(
          dotPos.x,
          dotPos.y,
          0,
          dotPos.x,
          dotPos.y,
          14,
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        trailCtx.fillStyle = gradient;
        trailCtx.beginPath();
        trailCtx.arc(dotPos.x, dotPos.y, 14, 0, Math.PI * 2);
        trailCtx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    document.documentElement.dataset.customCursor = "true";
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", resizeTrail);
      delete document.documentElement.dataset.customCursor;
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] hidden md:block"
    >
      {/* Invisible filter def — feDisplacementMap is what actually bends the
          content behind the lens; feTurbulence just supplies its warp map. */}
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id="cursor-lens">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.009 0.014"
              numOctaves={2}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={30}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <canvas
        ref={trailCanvasRef}
        className="absolute inset-0 opacity-40 mix-blend-screen"
      />

      <div
        ref={lensRef}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: LENS_SIZE,
          height: LENS_SIZE,
          backdropFilter: "url(#cursor-lens)",
          WebkitBackdropFilter: "url(#cursor-lens)",
        }}
      />

      <div
        ref={ringRef}
        data-active="false"
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-white/70 mix-blend-difference transition-[background-color,border-color] duration-300 data-[active=true]:border-white data-[active=true]:bg-white/10"
        style={{ width: RING_IDLE, height: RING_IDLE }}
      >
        <span
          ref={labelRef}
          className="select-none whitespace-nowrap text-[9px] uppercase tracking-[0.25em] text-white opacity-0 transition-opacity duration-200 [[data-active=true]>&]:opacity-100"
        />
      </div>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1 w-1 rounded-full bg-white mix-blend-difference"
      />
    </div>
  );
}
