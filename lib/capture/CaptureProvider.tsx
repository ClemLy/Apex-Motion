"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

interface CaptureContextValue {
  /** Called by the panel's "Capturer" button. No-op until a canvas has registered a handler. */
  requestCapture: () => void;
  /** Called by the Canvas-side handler to publish its capture function. Returns an unregister callback. */
  registerCaptureHandler: (fn: () => void) => () => void;
  /** Called by the "Comparer" button to freeze the current frame as the
   * slider's "before" image. Returns null until a canvas has registered. */
  requestCompareCapture: () => string | null;
  /** Called by the Canvas-side handler to publish its still-frame function. Returns an unregister callback. */
  registerCompareCaptureHandler: (fn: () => string) => () => void;
}

const CaptureContext = createContext<CaptureContextValue | null>(null);

/**
 * Bridges the "Capturer" button (in ConfiguratorPanel, outside the R3F tree)
 * to the active canvas's renderer (inside it) — the two have no shared
 * component ancestor closer than this provider. A ref, not state: the
 * capture handler changes on every car/canvas remount but nothing should
 * ever re-render because of that.
 */
export function CaptureProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<(() => void) | null>(null);
  const compareHandlerRef = useRef<(() => string) | null>(null);

  // Returns an identity-checked unregister: a Canvas mounted inside R3F's own
  // reconciler doesn't commit in lockstep with the outer React tree, so when
  // the Studio swaps to the Visualizer's canvas, the old canvas's cleanup can
  // fire either before or after the new one's registration. Clearing
  // unconditionally on cleanup would let a late-arriving old cleanup wipe out
  // a handler a newer canvas already registered; comparing identity first
  // means a stale cleanup only ever clears itself.
  const registerCaptureHandler = useCallback((fn: () => void) => {
    handlerRef.current = fn;
    return () => {
      if (handlerRef.current === fn) handlerRef.current = null;
    };
  }, []);

  const requestCapture = useCallback(() => {
    handlerRef.current?.();
  }, []);

  const registerCompareCaptureHandler = useCallback((fn: () => string) => {
    compareHandlerRef.current = fn;
    return () => {
      if (compareHandlerRef.current === fn) compareHandlerRef.current = null;
    };
  }, []);

  const requestCompareCapture = useCallback(() => {
    return compareHandlerRef.current?.() ?? null;
  }, []);

  return (
    <CaptureContext.Provider
      value={{
        requestCapture,
        registerCaptureHandler,
        requestCompareCapture,
        registerCompareCaptureHandler,
      }}
    >
      {children}
    </CaptureContext.Provider>
  );
}

export function useCapture() {
  const ctx = useContext(CaptureContext);
  if (!ctx) throw new Error("useCapture must be used within CaptureProvider");
  return ctx;
}
