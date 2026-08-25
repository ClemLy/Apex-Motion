"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Gates a WebGL canvas on visibility, at two levels.
 *
 * `active` pauses the render loop for a scene that is merely scrolled off
 * screen. `mounted` goes further: once a scene is far enough away, the
 * `<Canvas>` itself should unmount so its GPU resources (render targets,
 * compiled programs, textures) are freed rather than idling — otherwise two
 * such scenes sitting warm at once (e.g. the hero and a teaser further down
 * the same page) can spike memory pressure and trigger a GC pause that
 * shows up as a stutter wherever the scroll happens to be a moment later.
 * The unmount margin is generous so ordinary back-and-forth scrolling near
 * one viewport's distance doesn't thrash remounts (and their shader
 * recompilation cost).
 *
 * `eager` controls the *initial* value of `mounted`, before the observer's
 * first callback has had a chance to run. It must default to `false`: every
 * canvas on a page mounts in the same tick, so if more than one defaulted to
 * `true` they'd all kick off a GLTF fetch + shader compile simultaneously
 * regardless of position — on a slow, software-rendered runner (CI, no GPU)
 * that's enough main-thread contention to stall unrelated UI (the preloader
 * has stalled from exactly this). Only content guaranteed to be the first
 * thing on screen (the hero, a page's own primary canvas) should pass
 * `eager: true` to skip the one-tick flash of nothing.
 *
 * Note this hook's `mounted` is inherently scroll-position-based, so it can
 * only ever be a *soft* early-warning: a jump-scroll (End key, scrollbar
 * drag, a hard fling) crosses any margin in one event, with no intermediate
 * frames for the observer to fire on ahead of arrival. A scene that must be
 * ready the instant it's reached regardless of scroll speed needs a
 * scroll-independent mount trigger instead (see ParticleAssembly.tsx, which
 * mounts on the Preloader curtain opening rather than on this hook's
 * `mounted`).
 */
export function useRenderGate<T extends HTMLElement>({
  eager = false,
}: { eager?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(eager);
  const [mounted, setMounted] = useState(eager);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let onScreen = eager;
    let tabVisible = document.visibilityState === "visible";

    const sync = () => setActive(onScreen && tabVisible);

    // Tight margin: two scenes close together on the same page (e.g. the
    // hero and a teaser further down) should not both be rendering at once.
    const activeObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "30px" },
    );
    activeObserver.observe(element);

    // Wide margin: only unmounts once well clear of the viewport.
    const mountObserver = new IntersectionObserver(
      ([entry]) => setMounted(entry.isIntersecting),
      { rootMargin: "800px" },
    );
    mountObserver.observe(element);

    const onVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      activeObserver.disconnect();
      mountObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [eager]);

  return { ref, active, mounted };
}
