"use client";

import { useEffect, useState } from "react";

function readPref() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Single shared `matchMedia` listener — reused everywhere instead of each
 * consumer re-querying and re-subscribing on its own. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(readPref);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
