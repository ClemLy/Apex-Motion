"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface AudioContextValue {
  enabled: boolean;
  toggleEnabled: () => void;
  getContext: () => AudioContext | null;
}

const Ctx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!contextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      contextRef.current = new AudioCtx();
    }
    if (contextRef.current.state === "suspended") {
      void contextRef.current.resume();
    }
    return contextRef.current;
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) getContext();
      return next;
    });
  }, [getContext]);

  const value = useMemo<AudioContextValue>(
    () => ({ enabled, toggleEnabled, getContext }),
    [enabled, toggleEnabled, getContext],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppAudio must be used within AudioProvider");
  return ctx;
}
