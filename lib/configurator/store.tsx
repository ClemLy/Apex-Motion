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
  type WheelId,
} from "./types";

interface ConfiguratorContextValue {
  state: ConfiguratorState;
  setPaint: (paintId: string) => void;
  toggleWing: () => void;
  toggleSplitter: () => void;
  toggleWidebody: () => void;
  setWheel: (wheelId: WheelId) => void;
  setCaliperColor: (color: CaliperColor) => void;
  setInteriorTrim: (trim: ConfiguratorState["interiorTrim"]) => void;
  toggleRollCage: () => void;
  setCabinView: (value: boolean) => void;
  setFocus: (focus: CameraFocus) => void;
  reset: () => void;
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
      setPaint: (paintId) => setState((s) => ({ ...s, paintId })),
      toggleWing: () => setState((s) => ({ ...s, wing: !s.wing })),
      toggleSplitter: () =>
        setState((s) => ({ ...s, splitter: !s.splitter })),
      toggleWidebody: () =>
        setState((s) => ({ ...s, widebody: !s.widebody })),
      setWheel: (wheelId) => setState((s) => ({ ...s, wheelId })),
      setCaliperColor: (caliperColor) =>
        setState((s) => ({ ...s, caliperColor })),
      setInteriorTrim: (interiorTrim) =>
        setState((s) => ({ ...s, interiorTrim })),
      toggleRollCage: () =>
        setState((s) => ({ ...s, rollCage: !s.rollCage })),
      setCabinView: (cabinView) =>
        setState((s) => ({
          ...s,
          cabinView,
          focus: cabinView ? "cabin" : "exterior",
        })),
      setFocus: (focus) => setState((s) => ({ ...s, focus })),
      reset: () => setState(defaultConfiguratorState),
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
