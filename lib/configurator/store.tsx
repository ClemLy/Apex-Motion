"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultConfiguratorState,
  type CameraFocus,
  type CaliperColor,
  type ConfiguratorState,
  type WheelFinish,
} from "./types";

interface ConfiguratorContextValue {
  state: ConfiguratorState;
  setCar: (carId: string) => void;
  setPaint: (paintId: string) => void;
  toggleWing: () => void;
  setWheelFinish: (finish: WheelFinish) => void;
  setCaliperColor: (color: CaliperColor) => void;
  setFocus: (focus: CameraFocus) => void;
  reset: () => void;
  startCompare: (image: string) => void;
  exitCompare: () => void;
  toggleVisualizer: () => void;
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | null>(
  null,
);

export function ConfiguratorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfiguratorState>(
    defaultConfiguratorState,
  );

  const value = useMemo<ConfiguratorContextValue>(
    () => ({
      state,
      // A frozen before/after comparison from one car never means anything
      // once the studio is showing a different car.
      setCar: (carId) =>
        setState((s) => ({
          ...s,
          carId,
          focus: "exterior",
          compareImage: null,
        })),
      setPaint: (paintId) => setState((s) => ({ ...s, paintId })),
      toggleWing: () => setState((s) => ({ ...s, wing: !s.wing })),
      setWheelFinish: (wheelFinish) => setState((s) => ({ ...s, wheelFinish })),
      setCaliperColor: (caliperColor) =>
        setState((s) => ({ ...s, caliperColor })),
      setFocus: (focus) => setState((s) => ({ ...s, focus })),
      reset: () => setState(defaultConfiguratorState),
      // Freezes the current look as the slider's "before" image; the studio
      // keeps rendering the live ("after") state on the other side.
      startCompare: (image) => setState((s) => ({ ...s, compareImage: image })),
      exitCompare: () => setState((s) => ({ ...s, compareImage: null })),
      toggleVisualizer: () =>
        setState((s) => ({ ...s, visualizerOpen: !s.visualizerOpen })),
    }),
    [state],
  );

  return (
    <ConfiguratorContext.Provider value={value}>
      {children}
    </ConfiguratorContext.Provider>
  );
}

export function useConfigurator() {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx)
    throw new Error("useConfigurator must be used within ConfiguratorProvider");
  return ctx;
}
