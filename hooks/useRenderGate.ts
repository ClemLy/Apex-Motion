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
 */
export function useRenderGate<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let onScreen = true;
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
  }, []);

  return { ref, active, mounted };
}
