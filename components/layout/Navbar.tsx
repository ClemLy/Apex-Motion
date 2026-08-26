"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Box, Menu, Volume2, VolumeX, X } from "lucide-react";
import { useFPS } from "@/hooks/useFPS";
import { useUISound } from "@/hooks/useUISound";
import { useAppAudio } from "@/lib/audio/AudioProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useDebug } from "@/lib/debug/DebugProvider";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { cn } from "@/utils/cn";

/** How long a click waits for the next one before resolving as a single click. */
const LOGO_CLICK_WINDOW_MS = 500;

const links = [
  { href: "/", key: "home" as const },
  { href: "/configurator", key: "configurator" as const },
  { href: "/heritage", key: "heritage" as const },
];

export function Navbar() {
  const fps = useFPS();
  const { enabled, toggleEnabled } = useAppAudio();
  const { dict, locale, setLocale } = useLanguage();
  const playSound = useUISound();
  const pathname = usePathname();
  const router = useRouter();
  const {
    enabled: debugEnabled,
    toggle: toggleDebug,
    wireframe,
    toggleWireframe,
    triangles,
  } = useDebug();

  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const logoMagneticRef = useMagneticHover<HTMLAnchorElement>();

  // Route change closes an open mobile panel — otherwise it'd stay open,
  // covering the page that just loaded underneath it. Adjusted during render
  // (React's sanctioned pattern for "reset state when a prop changes")
  // rather than an effect, so it takes effect before the first paint of the
  // new route instead of flashing the old panel for a frame.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Left-clicks only, unmodified: middle-click / Ctrl+click / Cmd+click stay
  // native (new tab, etc.) rather than getting swallowed by the counter.
  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => {
      if (logoClickCount.current >= 3) {
        toggleDebug();
      } else {
        router.push("/");
      }
      logoClickCount.current = 0;
    }, LOGO_CLICK_WINDOW_MS);
  };

  // Escape closes the panel and returns focus to the button that opened it;
  // Tab is trapped inside the panel while it's open (a handful of links plus
  // the trigger button itself, closed loop).
  useEffect(() => {
    if (!mobileOpen) return;
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-auto fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              playSound("toggle");
              setMobileOpen(false);
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4">
        <nav className="pointer-events-auto mt-6 flex w-full max-w-4xl flex-col gap-2">
          <div className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-neutral-950/70 px-6 py-3 backdrop-blur-2xl">
            <Link
              ref={logoMagneticRef}
              href="/"
              onClick={handleLogoClick}
              data-cursor={dict.cursor.view}
              className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-neutral-100"
            >
              APEX <span className="text-neutral-500">{"//"}</span> MOTION
            </Link>

            <ul className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      onClick={() => playSound("select")}
                      data-cursor={dict.nav[link.key]}
                      className={cn(
                        "relative block px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors duration-300",
                        active
                          ? "text-neutral-50"
                          : "text-neutral-300 hover:text-neutral-50",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.06]"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 34,
                          }}
                        />
                      )}
                      <span className="relative z-10">
                        {dict.nav[link.key]}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-neutral-500 sm:flex">
                <Activity className="h-3 w-3 text-emerald-400" aria-hidden />
                <span className="font-mono tabular-nums">{fps} fps</span>
              </div>

              {debugEnabled && (
                <div className="hidden items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-neutral-500 sm:flex">
                  <span className="font-mono tabular-nums">
                    {triangles.toLocaleString()} tris
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("tick");
                      toggleWireframe();
                    }}
                    aria-pressed={wireframe}
                    aria-label="Wireframe"
                    data-cursor="Wireframe"
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border border-white/10 transition-colors duration-300",
                      wireframe
                        ? "bg-neutral-50 text-neutral-950"
                        : "text-neutral-400 hover:text-neutral-50",
                    )}
                  >
                    <Box className="h-3 w-3" aria-hidden />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  playSound("tick");
                  setLocale(locale === "fr" ? "en" : "fr");
                }}
                data-cursor={locale === "fr" ? "EN" : "FR"}
                className="flex h-10 w-10 items-center justify-center text-[11px] uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-50"
                aria-label={dict.nav.changeLanguage}
              >
                {locale}
              </button>

              <button
                type="button"
                onClick={toggleEnabled}
                aria-label={enabled ? dict.nav.audioOn : dict.nav.audioOff}
                aria-pressed={enabled}
                data-cursor={dict.cursor.audio}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-colors duration-300",
                  enabled
                    ? "bg-neutral-50 text-neutral-950"
                    : "text-neutral-400 hover:text-neutral-50",
                )}
              >
                {enabled ? (
                  <Volume2 className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" aria-hidden />
                )}
              </button>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => {
                  playSound("toggle");
                  setMobileOpen((v) => !v);
                }}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-panel"
                aria-label={mobileOpen ? dict.nav.menuClose : dict.nav.menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition-colors duration-300 hover:border-white/25 hover:text-neutral-50 md:hidden"
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" aria-hidden />
                ) : (
                  <Menu className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                id="mobile-nav-panel"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={dict.nav.menuOpen}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-1 rounded-3xl border border-white/10 bg-neutral-950/95 p-3 backdrop-blur-2xl md:hidden"
              >
                {links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => playSound("select")}
                      className={cn(
                        "rounded-2xl px-4 py-3 text-xs uppercase tracking-[0.2em] transition-colors duration-300",
                        active
                          ? "bg-white/[0.06] text-neutral-50"
                          : "text-neutral-400 hover:text-neutral-50",
                      )}
                    >
                      {dict.nav[link.key]}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </>
  );
}
