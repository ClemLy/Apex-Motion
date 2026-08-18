"use client";

import { useMemo } from "react";
import { useConfigurator } from "@/lib/configurator/store";
import {
  caliperColors,
  paintOptions,
  wheelFinishOptions,
} from "@/lib/configurator/types";
import type { CarConfig } from "@/lib/three/carConfigs";
import { GltfCar, type PaintSpec } from "./GltfCar";

/** Bridges configurator state to the selected car's mesh via GltfCar. */
export function ConfiguratorCar({ car }: { car: CarConfig }) {
  const { state } = useConfigurator();

  const paint = useMemo<PaintSpec>(() => {
    const option =
      paintOptions.find((p) => p.id === state.paintId) ?? paintOptions[0];
    return {
      color: option.color,
      roughness: option.roughness,
      metalness: option.metalness,
      clearcoat: option.clearcoat,
      clearcoatRoughness: option.clearcoatRoughness,
    };
  }, [state.paintId]);

  const wheelColor = useMemo(
    () =>
      wheelFinishOptions.find((w) => w.id === state.wheelFinish)?.color ??
      wheelFinishOptions[0].color,
    [state.wheelFinish],
  );

  return (
    <GltfCar
      config={car}
      paint={paint}
      wheelColor={wheelColor}
      caliperColor={caliperColors[state.caliperColor]}
      hidden={state.wing ? [] : ["wing"]}
    />
  );
}
