"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useConfigurator } from "@/lib/configurator/store";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useUISound } from "@/hooks/useUISound";
import {
  caliperColors,
  paintOptions,
  wheelFinishOptions,
  type CameraFocus,
  type PaintFinish,
} from "@/lib/configurator/types";
import { CARS, getCarConfig } from "@/lib/three/carConfigs";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/utils/cn";

type Tab = "paint" | "aero" | "wheels";

const PAINT_CATEGORY_ORDER: PaintFinish[] = [
  "solid",
  "metallic",
  "satin",
  "matte",
  "pts",
];

export function ConfiguratorPanel() {
  const { dict } = useLanguage();
  const playSound = useUISound();
  const [tab, setTab] = useState<Tab>("paint");
  const {
    state,
    setCar,
    setPaint,
    toggleWing,
    setWheelFinish,
    setCaliperColor,
    setFocus,
    reset,
  } = useConfigurator();

  const car = getCarConfig(state.carId);
  const hasWing = !!car.toggleNodes?.wing;
  const hasCalipers = !!car.caliperMaterial;

  const paintGroups = useMemo(
    () =>
      PAINT_CATEGORY_ORDER.map((finish) => ({
        finish,
        label: dict.configurator.paint[finish],
        options: paintOptions.filter((p) => p.finish === finish),
      })).filter((group) => group.options.length > 0),
    [dict],
  );

  const tabs = useMemo(() => {
    const list: { id: Tab; label: string; focus: CameraFocus }[] = [
      { id: "paint", label: dict.configurator.tabs.paint, focus: "exterior" },
    ];
    if (hasWing) {
      list.push({
        id: "aero",
        label: dict.configurator.tabs.aero,
        focus: "rear",
      });
    }
    list.push({
      id: "wheels",
      label: dict.configurator.tabs.wheels,
      focus: "wheels",
    });
    return list;
  }, [dict, hasWing]);

  // A tab from the previous car (e.g. Aéro) may not exist on the new one —
  // derived at render time rather than synced back with an effect.
  const activeTab = tabs.some((t) => t.id === tab) ? tab : "paint";

  // Each tab retargets the camera spring, which flies rather than cuts.
  const handleTab = (next: Tab, focus: CameraFocus) => {
    if (next === tab) return;
    playSound("select");
    setTab(next);
    setFocus(focus);
  };

  return (
    <GlassPanel className="flex w-full max-w-md flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          {dict.configurator.carSwitcher}
        </span>
        <div className="flex gap-2">
          {CARS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (c.id === state.carId) return;
                playSound("select");
                setCar(c.id);
              }}
              data-cursor={dict.cursor.view}
              className={cn(
                "flex flex-1 flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors duration-300",
                state.carId === c.id
                  ? "border-neutral-50 bg-white/5"
                  : "border-white/10 hover:border-white/25",
              )}
            >
              <span
                className={cn(
                  "text-xs uppercase tracking-wide",
                  state.carId === c.id ? "text-neutral-50" : "text-neutral-300",
                )}
              >
                {c.name}
              </span>
              <span className="text-[9px] uppercase tracking-wide text-neutral-600">
                {c.years}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTab(t.id, t.focus)}
            data-cursor={dict.cursor.view}
            className={cn(
              "relative flex-1 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300",
              activeTab === t.id
                ? "text-neutral-950"
                : "text-neutral-400 hover:text-neutral-100",
            )}
          >
            {activeTab === t.id && (
              <motion.span
                layoutId="configurator-tab"
                className="absolute inset-0 rounded-full bg-neutral-50"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5"
        >
          {activeTab === "paint" && (
            <div
              data-lenis-prevent
              className="flex max-h-[52vh] flex-col gap-5 overflow-y-auto pr-1 lg:max-h-[46vh]"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {dict.configurator.paint.title}
              </span>
              {paintGroups.map((group) => (
                <div key={group.finish} className="flex flex-col gap-2.5">
                  <span className="text-[9px] uppercase tracking-wide text-neutral-600">
                    {group.label}
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {group.options.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playSound("tick");
                          setPaint(p.id);
                        }}
                        data-cursor={p.label}
                        className="group flex flex-col items-center gap-2"
                      >
                        <span
                          className={cn(
                            "h-10 w-10 rounded-full border-2 transition-all duration-300 group-hover:scale-110",
                            state.paintId === p.id
                              ? "border-neutral-50 shadow-[0_0_18px_-2px_rgba(255,255,255,0.45)]"
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
              ))}
            </div>
          )}

          {activeTab === "aero" && hasWing && (
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {dict.configurator.aero.title}
              </span>
              <ToggleRow
                label={dict.configurator.aero.wing}
                cursorLabel={dict.cursor.toggle}
                active={state.wing}
                onClick={() => {
                  playSound("toggle");
                  toggleWing();
                }}
              />
            </div>
          )}

          {activeTab === "wheels" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  {dict.configurator.wheels.title}
                </span>
                <div className="flex gap-3">
                  {wheelFinishOptions.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        playSound("tick");
                        setWheelFinish(w.id);
                      }}
                      data-cursor={w.label}
                      className="group flex flex-col items-center gap-2"
                    >
                      <span
                        className={cn(
                          "h-9 w-9 rounded-full border-2 transition-all duration-300 group-hover:scale-110",
                          state.wheelFinish === w.id
                            ? "border-neutral-50 shadow-[0_0_18px_-2px_rgba(255,255,255,0.45)]"
                            : "border-white/15",
                        )}
                        style={{ backgroundColor: w.color }}
                      />
                      <span className="text-center text-[9px] uppercase tracking-wide text-neutral-500">
                        {w.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {hasCalipers && (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    {dict.configurator.wheels.calipers}
                  </span>
                  <div className="flex gap-3">
                    {(
                      Object.keys(
                        caliperColors,
                      ) as (keyof typeof caliperColors)[]
                    ).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          playSound("tick");
                          setCaliperColor(c);
                        }}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-transform duration-300 hover:scale-110",
                          state.caliperColor === c
                            ? "border-neutral-50"
                            : "border-white/15",
                        )}
                        style={{ backgroundColor: caliperColors[c] }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-end border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => {
            playSound("toggle");
            reset();
          }}
          data-cursor={dict.configurator.resetLabel}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-100"
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
  cursorLabel,
  active,
  onClick,
}: {
  label: string;
  cursorLabel: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor={cursorLabel}
      className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2.5 text-xs uppercase tracking-wide text-neutral-300 transition-colors duration-300 hover:border-white/25"
    >
      {label}
      <span
        className={cn(
          "flex h-5 w-9 items-center rounded-full border border-white/15 p-0.5 transition-colors duration-300",
          active ? "bg-neutral-50" : "bg-transparent",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "h-3.5 w-3.5 rounded-full",
            active ? "translate-x-4 bg-neutral-950" : "bg-neutral-500",
          )}
        />
      </span>
    </button>
  );
}
