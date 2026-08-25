"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// The server (and the client's very first, pre-hydration render) can never
// know the real browser preference, so both have to agree on the same
// placeholder - `useSyncExternalStore`'s `getServerSnapshot` is built for
// exactly this, unlike a plain `useState` + effect pair, which reads the
// real value in a synchronous `setState` inside the effect and so still
// forces an extra render right after mount. Harmless for a consumer that
// only gates animation logic inside its own effect, but a real hydration
// mismatch for one that branches its JSX tree on the value (as
// ParticleAssembly.tsx does for its reduced-motion end state).
function getServerSnapshot() {
  return false;
}

/** Single shared `matchMedia` subscription — reused everywhere instead of
 * each consumer re-querying and re-subscribing on its own. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
