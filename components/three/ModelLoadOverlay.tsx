"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Loading indicator for the active .glb. Deliberately not a percentage:
 * three.js's global loading manager only reports itemsLoaded/itemsTotal,
 * which for a single .glb request jumps straight from 0 to 100 rather than
 * climbing smoothly, in practice reading as visibly stuck at one number for
 * most of a real load. An indeterminate sweep doesn't claim to know how far
 * along it is, but still reads unmistakably as "working on it" - which is
 * what actually matters here - rather than a frozen, misleading readout.
 * Lives outside the Canvas so it keeps rendering crisp HTML while the WebGL
 * context is still booting.
 *
 * Deliberately does *not* self-gate on `useProgress().active` - that flag
 * reflects the single `THREE.DefaultLoadingManager` shared by every canvas
 * on the page, so a different canvas finishing its own unrelated load can
 * leave it sitting at `false` well before *this* canvas's own model has
 * resolved, which used to mean this never showed at all for a load that was
 * still genuinely in progress. The caller mounts/unmounts this instead,
 * timed off its own Suspense boundary (see ReadySignal.tsx) rather than the
 * global flag.
 */
export function ModelLoadOverlay({
  ctaLabel,
}: {
  /** When set, renders a much bigger indicator plus a visual "button"
   * instead of the default compact one — for a large decorative preview
   * (like the homepage's studio teaser) sitting inside its own link, where
   * a visitor scrolling past shouldn't be able to miss that something is
   * loading, or lose the option to just go straight to the real page
   * instead of waiting. Purely visual, not a second `<a>`: the caller is
   * already one big link, so this only needs to look like a button -
   * nesting a real anchor inside it would be invalid HTML. */
  ctaLabel?: string;
}) {
  const { dict } = useLanguage();

  if (ctaLabel) {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-10 bg-[#020202]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1.5 w-64 overflow-hidden rounded-full bg-white/10 sm:w-80">
            <div className="loading-sweep h-full w-1/3 rounded-full bg-neutral-50" />
          </div>
          <span className="text-xs uppercase tracking-[0.35em] text-neutral-400">
            {dict.configurator.loadingModel}
          </span>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-neutral-50 px-8 py-4 text-xs uppercase tracking-[0.2em] text-neutral-950">
          {ctaLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#020202]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div className="loading-sweep h-full w-1/3 rounded-full bg-neutral-100" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
          {dict.configurator.loadingModel}
        </span>
      </div>
    </div>
  );
}
