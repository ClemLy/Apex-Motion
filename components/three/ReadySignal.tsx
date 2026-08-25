"use client";

import { useEffect } from "react";

/**
 * Fires `onReady` once, the moment this mounts. Placed as a sibling inside a
 * `<Suspense>` boundary, its own mount only happens once every suspended
 * dependency in that boundary has actually resolved — a per-canvas stand-in
 * for drei's `useProgress().active`, which reflects the single global
 * `THREE.DefaultLoadingManager` shared by every canvas on the page. A
 * different canvas finishing its own unrelated load can leave that global
 * flag sitting at `false` well before *this* canvas's own model has
 * resolved, which is what let a loading overlay gated on it never show at
 * all for a load that was still genuinely in progress.
 */
export function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}
