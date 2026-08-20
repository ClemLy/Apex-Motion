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

interface DebugContextValue {
  enabled: boolean;
  toggle: () => void;
  wireframe: boolean;
  toggleWireframe: () => void;
  triangles: number;
  /** Called once per frame by whichever canvas is active; no-op unless `enabled`. */
  reportTriangles: (count: number) => void;
}

const DebugContext = createContext<DebugContextValue | null>(null);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [triangles, setTriangles] = useState(0);
  const lastReport = useRef(0);

  const toggle = useCallback(() => setEnabled((v) => !v), []);
  const toggleWireframe = useCallback(() => setWireframe((v) => !v), []);

  // Same 500ms sample cadence as useFPS, so a 60Hz canvas doesn't force the
  // Navbar to re-render 60x/sec for a number nobody reads that fast.
  const reportTriangles = useCallback((count: number) => {
    const now = performance.now();
    if (now - lastReport.current < 500) return;
    lastReport.current = now;
    setTriangles(count);
  }, []);

  const value = useMemo<DebugContextValue>(
    () => ({
      enabled,
      toggle,
      wireframe,
      toggleWireframe,
      triangles,
      reportTriangles,
    }),
    [enabled, toggle, wireframe, toggleWireframe, triangles, reportTriangles],
  );

  return (
    <DebugContext.Provider value={value}>{children}</DebugContext.Provider>
  );
}

export function useDebug() {
  const ctx = useContext(DebugContext);
  if (!ctx) throw new Error("useDebug must be used within DebugProvider");
  return ctx;
}
