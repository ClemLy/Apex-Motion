"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useIntro } from "@/lib/intro/IntroProvider";

/** Matches the envelope FluidBackground's uWipe uniform animates over. */
const WIPE_DURATION_MS = 550;
const WIPE_PEAK_AT = 0.35;

/**
 * Remounts fresh on every client-side navigation (the Next.js App Router
 * contract for this filename) — which is what makes it the right place to
 * cover a page transition: the new route's content is guaranteed to still be
 * at `initial` before paint, so there's no flash frame to race against the
 * way there would be reacting to a `usePathname()` change after the fact.
 */
export default function Template({ children }: { children: ReactNode }) {
  const { hasEntered } = useIntro();
  // Captured once, via a lazy initializer — not reactive. `hasEntered` is
  // false only on the very first mount, before the Preloader is dismissed
  // (which has its own curtain animation already); every later mount of
  // this component is a real navigation. Reading it reactively would also
  // fire the wipe when the Preloader is dismissed mid-session, which isn't
  // a navigation.
  const [isRealNavigation] = useState(() => hasEntered);

  useEffect(() => {
    if (!isRealNavigation) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.dispatchEvent(
      new CustomEvent("apex:page-wipe", {
        detail: { duration: WIPE_DURATION_MS },
      }),
    );
  }, [isRealNavigation]);

  return (
    <motion.div
      initial={isRealNavigation ? { opacity: 0, y: 12 } : false}
      animate={
        isRealNavigation ? { opacity: [0, 0, 1], y: [12, 12, 0] } : undefined
      }
      transition={{
        duration: WIPE_DURATION_MS / 1000,
        times: [0, WIPE_PEAK_AT, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
