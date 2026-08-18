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
      setCar: (carId) => setState((s) => ({ ...s, carId, focus: "exterior" })),
      setPaint: (paintId) => setState((s) => ({ ...s, paintId })),
      toggleWing: () => setState((s) => ({ ...s, wing: !s.wing })),
      setWheelFinish: (wheelFinish) => setState((s) => ({ ...s, wheelFinish })),
      setCaliperColor: (caliperColor) =>
        setState((s) => ({ ...s, caliperColor })),
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
