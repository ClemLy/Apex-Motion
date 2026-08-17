"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Gates a WebGL canvas on visibility.
 *
 * Returns a ref to attach to the canvas wrapper and whether that canvas should
 * be rendering at all. A scene that is scrolled off screen, or sitting in a
 * background tab, drops to zero GPU work instead of burning frames nobody sees.
 */
export function useRenderGate<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let onScreen = true;
    let tabVisible = document.visibilityState === "visible";

    const sync = () => setActive(onScreen && tabVisible);

    // A small negative margin means the scene wakes just before it scrolls in.
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px" },
    );
    observer.observe(element);

    const onVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { ref, active };
}
