"use client";

import { useEffect, useRef } from "react";
import { useUISound } from "@/hooks/useUISound";

const RING_IDLE = 26;
const RING_ACTIVE = 76;
const MAGNET_STRENGTH = 0.32;

/**
 * Hollow ring cursor that lerps toward the pointer, magnetically snaps to any
 * element carrying `data-cursor`, and surfaces that element's contextual label.
 * All per-frame work is direct DOM mutation so React never re-renders on move.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const playSound = useUISound();

  useEffect(() => {
    // Pointer-coarse devices (touch) get no custom cursor at all.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!ring || !dot || !label) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pointer };
    const dotPos = { ...pointer };
    const size = { current: RING_IDLE, target: RING_IDLE };

    let target: HTMLElement | null = null;
    let rafId = 0;

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
        if (target) playSound("hover");
      }
    };

    const onDown = () => {
      size.target = size.target * 0.82;
    };
    const onUp = () => {
      size.target = target ? RING_ACTIVE : RING_IDLE;
    };

    const render = () => {
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
      size.current += (size.target - size.current) * 0.18;

      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      ring.style.width = `${size.current}px`;
      ring.style.height = `${size.current}px`;
      dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;

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
      delete document.documentElement.dataset.customCursor;
    };
  }, [playSound]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] hidden md:block"
    >
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
