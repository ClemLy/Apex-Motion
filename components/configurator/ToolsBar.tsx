"use client";

import { Camera, Orbit, SquareSplitHorizontal } from "lucide-react";
import { useConfigurator } from "@/lib/configurator/store";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useUISound } from "@/hooks/useUISound";
import { useCapture } from "@/lib/capture/CaptureProvider";
import { cn } from "@/utils/cn";

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-cursor={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-300",
        active
          ? "border-neutral-50 bg-white/10 text-neutral-50"
          : "border-white/10 text-neutral-400 hover:border-white/25 hover:text-neutral-100",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Compact icon row for the Studio's "view" tools. Reset lives outside this
 * bar: it's a distinct, destructive action, not a "view" tool.
 */
export function ToolsBar() {
  const { dict } = useLanguage();
  const playSound = useUISound();
  const { requestCapture, requestCompareCapture } = useCapture();
  const { state, startCompare, exitCompare, toggleVisualizer } =
    useConfigurator();

  return (
    <div className="flex items-center gap-2">
      <ToolButton
        active={!!state.compareImage}
        onClick={() => {
          playSound("toggle");
          if (state.compareImage) {
            exitCompare();
          } else {
            const image = requestCompareCapture();
            if (image) startCompare(image);
          }
        }}
        label={dict.configurator.compare.button}
      >
        <SquareSplitHorizontal className="h-4 w-4" aria-hidden />
      </ToolButton>

      <ToolButton
        active={state.visualizerOpen}
        onClick={() => {
          playSound("toggle");
          toggleVisualizer();
        }}
        label={dict.configurator.visualizer.button}
      >
        <Orbit className="h-4 w-4" aria-hidden />
      </ToolButton>

      <ToolButton
        active={false}
        onClick={() => {
          playSound("toggle");
          requestCapture();
        }}
        label={dict.configurator.capture}
      >
        <Camera className="h-4 w-4" aria-hidden />
      </ToolButton>
    </div>
  );
}
