"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface IntroContextValue {
  /** True once the preloader has burst open and the hero is live. */
  hasEntered: boolean;
  enter: () => void;
}

const Ctx = createContext<IntroContextValue | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [hasEntered, setHasEntered] = useState(false);

  const enter = useCallback(() => setHasEntered(true), []);

  const value = useMemo<IntroContextValue>(
    () => ({ hasEntered, enter }),
    [hasEntered, enter],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIntro() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIntro must be used within IntroProvider");
  return ctx;
}
