"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RotateCcw } from "lucide-react";
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
import {
  CARS,
  getCarConfig,
  isShowroomOnly,
  type CarConfig,
} from "@/lib/three/carConfigs";
import type { dictionaries, Locale } from "@/lib/i18n/dictionaries";
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
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
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
  const hasPaint = car.paintMaterials.length > 0;
  const hasWing = !!car.toggleNodes?.wing;
  const hasWheelColor = !!car.wheelMaterial;
  const hasCalipers = !!car.caliperMaterial;
  const showroomOnly = isShowroomOnly(car);

  // Closes the switcher on an outside click, the standard dropdown contract.
  useEffect(() => {
    if (!switcherOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [switcherOpen]);

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
    const list: { id: Tab; label: string; focus: CameraFocus }[] = [];
    if (hasPaint) {
      list.push({
        id: "paint",
        label: dict.configurator.tabs.paint,
        focus: "exterior",
      });
    }
    if (hasWing) {
      list.push({
        id: "aero",
        label: dict.configurator.tabs.aero,
        focus: "rear",
      });
    }
    if (hasWheelColor || hasCalipers) {
      list.push({
        id: "wheels",
        label: dict.configurator.tabs.wheels,
        focus: "wheels",
      });
    }
    return list;
  }, [dict, hasPaint, hasWing, hasWheelColor, hasCalipers]);

  // A tab from the previous car (e.g. Aéro) may not exist on the new one —
  // derived at render time rather than synced back with an effect. Falls
  // back to whichever tab this car actually has first, since "paint" is no
  // longer guaranteed to exist or lead the list.
  const activeTab = tabs.some((t) => t.id === tab)
    ? tab
    : (tabs[0]?.id ?? "paint");

  // Each tab retargets the camera spring, which flies rather than cuts.
  const handleTab = (next: Tab, focus: CameraFocus) => {
    if (next === tab) return;
    playSound("select");
    setTab(next);
    setFocus(focus);
  };

  return (
    <GlassPanel className="flex w-full max-w-md flex-col gap-6 p-6">
      <div ref={switcherRef} className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          {dict.configurator.carSwitcher}
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              playSound("select");
              setSwitcherOpen((open) => !open);
            }}
            data-cursor={dict.cursor.toggle}
            aria-expanded={switcherOpen}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border bg-white/5 px-3 py-2.5 text-left transition-colors duration-300",
              switcherOpen
                ? "border-neutral-50"
                : "border-white/10 hover:border-white/25",
            )}
          >
            <span className="flex items-baseline gap-2.5">
              <span className="text-xs uppercase tracking-wide text-neutral-50">
                {car.name}
              </span>
              <span className="text-[9px] uppercase tracking-wide text-neutral-600">
                {car.years}
              </span>
            </span>
            <ChevronDown
              aria-hidden
              className={cn(
                "h-3.5 w-3.5 text-neutral-400 transition-transform duration-300",
                switcherOpen && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence>
            {switcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-full z-30 mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl"
              >
                {CARS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      playSound("select");
                      if (c.id !== state.carId) setCar(c.id);
                      setSwitcherOpen(false);
                    }}
                    data-cursor={dict.cursor.view}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors duration-300",
                      state.carId === c.id
                        ? "border-neutral-50 bg-white/5"
                        : "border-white/10 hover:border-white/25",
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs uppercase tracking-wide",
                        state.carId === c.id
                          ? "text-neutral-50"
                          : "text-neutral-300",
                      )}
                    >
                      {c.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-wide text-neutral-600">
                      {c.years}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showroomOnly ? (
        <ShowroomSection
          car={car}
          focus={state.focus}
          onFocus={(focus) => {
            playSound("select");
            setFocus(focus);
          }}
          dict={dict}
        />
      ) : (
        <>
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
                  {hasWheelColor && (
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
                  )}
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
        </>
      )}

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

const SHOWROOM_FOCUS_OPTIONS: CameraFocus[] = ["exterior", "rear", "wheels"];

/** Cars with no repaintable material (917K, Mission R) skip the tab system entirely — camera framing and a real spec sheet instead of inert controls. */
function ShowroomSection({
  car,
  focus,
  onFocus,
  dict,
}: {
  car: CarConfig;
  focus: CameraFocus;
  onFocus: (focus: CameraFocus) => void;
  dict: (typeof dictionaries)[Locale];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
        {SHOWROOM_FOCUS_OPTIONS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFocus(f)}
            data-cursor={dict.cursor.view}
            className={cn(
              "relative flex-1 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300",
              focus === f
                ? "text-neutral-950"
                : "text-neutral-400 hover:text-neutral-100",
            )}
          >
            {focus === f && (
              <motion.span
                layoutId="showroom-focus"
                className="absolute inset-0 rounded-full bg-neutral-50"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">
              {dict.configurator.showroom[f]}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        {dict.configurator.showroom.notice}
      </p>

      {car.specs && (
        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          <SpecField
            label={dict.configurator.showroom.displacement}
            value={car.specs.displacement}
          />
          <SpecField
            label={dict.configurator.showroom.power}
            value={car.specs.power}
          />
          <SpecField
            label={dict.configurator.showroom.weight}
            value={car.specs.weight}
          />
        </div>
      )}
    </div>
  );
}

function SpecField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] uppercase tracking-wide text-neutral-600">
        {label}
      </span>
      <span className="text-xs text-neutral-300">{value}</span>
    </div>
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
