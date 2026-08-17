"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Eye, DoorOpen } from "lucide-react";
import { useConfigurator } from "@/lib/configurator/store";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  caliperColors,
  paintOptions,
  wheelOptions,
} from "@/lib/configurator/types";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/utils/cn";

type Tab = "paint" | "aero" | "wheels" | "interior";

export function ConfiguratorPanel() {
  const { dict } = useLanguage();
  const [tab, setTab] = useState<Tab>("paint");
  const {
    state,
    setPaint,
    toggleWing,
    toggleSplitter,
    toggleWidebody,
    setWheel,
    setCaliperColor,
    setInteriorTrim,
    toggleRollCage,
    setCabinView,
    setFocus,
    reset,
  } = useConfigurator();

  const tabs: { id: Tab; label: string; focus: Parameters<typeof setFocus>[0] }[] = [
    { id: "paint", label: dict.configurator.tabs.paint, focus: "exterior" },
    { id: "aero", label: dict.configurator.tabs.aero, focus: "rear" },
    { id: "wheels", label: dict.configurator.tabs.wheels, focus: "wheels" },
    { id: "interior", label: dict.configurator.tabs.interior, focus: "cabin" },
  ];

  const handleTab = (next: Tab, focus: Parameters<typeof setFocus>[0]) => {
    setTab(next);
    if (next === "interior") {
      setCabinView(true);
    } else {
      setCabinView(false);
      setFocus(focus);
    }
  };

  return (
    <GlassPanel className="flex w-full max-w-md flex-col gap-6 p-6">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTab(t.id, t.focus)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors",
              tab === t.id
                ? "bg-neutral-50 text-neutral-950"
                : "text-neutral-400 hover:text-neutral-100",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col gap-5"
        >
          {tab === "paint" && (
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {dict.configurator.paint.title}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {paintOptions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaint(p.id)}
                    className="group flex flex-col items-center gap-2"
                  >
                    <span
                      className={cn(
                        "h-10 w-10 rounded-full border-2 transition-transform group-hover:scale-105",
                        state.paintId === p.id
                          ? "border-neutral-50"
                          : "border-white/15",
                      )}
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-center text-[9px] uppercase tracking-wide text-neutral-500">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "aero" && (
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {dict.configurator.aero.title}
              </span>
              <ToggleRow
                label={dict.configurator.aero.wing}
                active={state.wing}
                onClick={toggleWing}
              />
              <ToggleRow
                label={dict.configurator.aero.splitter}
                active={state.splitter}
                onClick={toggleSplitter}
              />
              <ToggleRow
                label={dict.configurator.aero.widebody}
                active={state.widebody}
                onClick={toggleWidebody}
              />
            </div>
          )}

          {tab === "wheels" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  {dict.configurator.wheels.title}
                </span>
                <div className="flex flex-col gap-2">
                  {wheelOptions.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWheel(w.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-xs uppercase tracking-wide transition-colors",
                        state.wheelId === w.id
                          ? "border-neutral-50 text-neutral-50"
                          : "border-white/10 text-neutral-400 hover:border-white/25",
                      )}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  {dict.configurator.wheels.calipers}
                </span>
                <div className="flex gap-3">
                  {(Object.keys(caliperColors) as (keyof typeof caliperColors)[]).map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCaliperColor(c)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-transform hover:scale-105",
                          state.caliperColor === c
                            ? "border-neutral-50"
                            : "border-white/15",
                        )}
                        style={{ backgroundColor: caliperColors[c] }}
                        aria-label={c}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "interior" && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {dict.configurator.interior.title}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInteriorTrim("leather")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs uppercase tracking-wide transition-colors",
                    state.interiorTrim === "leather"
                      ? "border-neutral-50 text-neutral-50"
                      : "border-white/10 text-neutral-400",
                  )}
                >
                  {dict.configurator.interior.leather}
                </button>
                <button
                  type="button"
                  onClick={() => setInteriorTrim("alcantara")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs uppercase tracking-wide transition-colors",
                    state.interiorTrim === "alcantara"
                      ? "border-neutral-50 text-neutral-50"
                      : "border-white/10 text-neutral-400",
                  )}
                >
                  {dict.configurator.interior.alcantara}
                </button>
              </div>
              <ToggleRow
                label={dict.configurator.interior.rollcage}
                active={state.rollCage}
                onClick={toggleRollCage}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => setCabinView(!state.cabinView)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-100"
        >
          {state.cabinView ? (
            <Eye className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <DoorOpen className="h-3.5 w-3.5" aria-hidden />
          )}
          {state.cabinView
            ? dict.configurator.viewExterior
            : dict.configurator.viewCabin}
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-100"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {dict.configurator.resetLabel}
        </button>
      </div>
    </GlassPanel>
  );
}

function ToggleRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2.5 text-xs uppercase tracking-wide text-neutral-300 transition-colors hover:border-white/25"
    >
      {label}
      <span
        className={cn(
          "flex h-5 w-9 items-center rounded-full border border-white/15 p-0.5 transition-colors",
          active ? "bg-neutral-50" : "bg-transparent",
        )}
      >
        <span
          className={cn(
            "h-3.5 w-3.5 rounded-full bg-neutral-500 transition-transform",
            active && "translate-x-4 bg-neutral-950",
          )}
        />
      </span>
    </button>
  );
}
