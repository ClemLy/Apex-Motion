"use client";

import { useEffect, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { useCapture } from "@/lib/capture/CaptureProvider";
import {
  caliperColors,
  defaultConfiguratorState,
  paintOptions,
  wheelFinishOptions,
} from "@/lib/configurator/types";
import type { GltfCarHandle } from "./GltfCar";

/** HD upscale factor over the live display resolution — capped so a very
 * high-DPI display doesn't demand an absurd render target. */
const CAPTURE_PIXEL_RATIO = 3;

const DEFAULT_PAINT =
  paintOptions.find((p) => p.id === defaultConfiguratorState.paintId) ??
  paintOptions[0];
const DEFAULT_WHEEL_COLOR =
  wheelFinishOptions.find((w) => w.id === defaultConfiguratorState.wheelFinish)
    ?.color ?? wheelFinishOptions[0].color;
const DEFAULT_CALIPER_COLOR =
  caliperColors[defaultConfiguratorState.caliperColor];
const DEFAULT_HIDDEN = defaultConfiguratorState.wing ? [] : ["wing"];

/**
 * Registers the "Capturer" handler for as long as this canvas is mounted.
 * Renders one frame at a higher pixel ratio than the live view uses, grabs
 * it, then restores — the live frameloop's own next tick re-syncs the
 * renderer to whatever AdaptiveDpr/PerformanceMonitor already had it at.
 *
 * Only one canvas should be capture-active at a time — e.g. when the
 * Visualizer opens, its own CaptureHandler should take over from the
 * Studio's. `registerCaptureHandler` returns an identity-checked unregister
 * specifically so that handoff is safe regardless of which canvas's effects
 * happen to run first (see CaptureProvider for why that order isn't
 * guaranteed across two separate R3F Canvases).
 */
export function CaptureHandler({
  carRef,
}: {
  /** The Studio's car mesh — used only for the compare snapshot's instant
   * jump to factory-default paint/wheels/calipers/wing, never for downloads.
   * The Visualizer has no "Comparer" button, so it mounts this without one. */
  carRef?: RefObject<GltfCarHandle | null>;
}) {
  const { registerCaptureHandler, registerCompareCaptureHandler } =
    useCapture();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    const unregister = registerCaptureHandler(() => {
      const canvas = gl.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const previousRatio = gl.getPixelRatio();
      const hdRatio = Math.min(
        window.devicePixelRatio * 2,
        CAPTURE_PIXEL_RATIO,
      );

      gl.setPixelRatio(hdRatio);
      gl.setSize(width, height, false);
      gl.render(scene, camera);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `apex-motion-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");

      gl.setPixelRatio(previousRatio);
      gl.setSize(width, height, false);
    });
    return unregister;
  }, [registerCaptureHandler, gl, scene, camera]);

  // Grabs a still frame of the car in its factory-default look (stock paint,
  // wheels, calipers, wing up) — the comparison slider's frozen "before"
  // side, "after" being whatever the live canvas is showing underneath.
  // GltfCarHandle.setInstant jumps materials there with no lerp, renders,
  // then jumps them back, all synchronously — the live view never visibly
  // shows the default look.
  useEffect(() => {
    const unregister = registerCompareCaptureHandler(() => {
      const restore = carRef?.current?.setInstant(
        DEFAULT_PAINT,
        DEFAULT_WHEEL_COLOR,
        DEFAULT_CALIPER_COLOR,
        DEFAULT_HIDDEN,
      );
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");
      restore?.();
      return dataUrl;
    });
    return unregister;
  }, [registerCompareCaptureHandler, gl, scene, camera, carRef]);

  return null;
}
