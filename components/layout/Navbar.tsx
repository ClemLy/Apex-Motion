"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Volume2, VolumeX } from "lucide-react";
import { useFPS } from "@/hooks/useFPS";
import { useUISound } from "@/hooks/useUISound";
import { useAppAudio } from "@/lib/audio/AudioProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/utils/cn";

const links = [
  { href: "/", key: "home" as const },
  { href: "/configurator", key: "configurator" as const },
  { href: "/heritage", key: "heritage" as const },
  { href: "/garage", key: "garage" as const },
];

export function Navbar() {
  const fps = useFPS();
  const { enabled, toggleEnabled } = useAppAudio();
  const { dict, locale, setLocale } = useLanguage();
  const playSound = useUISound();
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <nav className="mt-6 flex w-full max-w-4xl items-center justify-between gap-4 rounded-full border border-white/10 bg-neutral-950/70 px-6 py-3 backdrop-blur-2xl">
        <Link
          href="/"
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
                      : "text-neutral-400 hover:text-neutral-50",
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
                  <span className="relative z-10">{dict.nav[link.key]}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500 sm:flex">
            <Activity className="h-3 w-3 text-emerald-400" aria-hidden />
            <span className="font-mono tabular-nums">{fps} fps</span>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound("tick");
              setLocale(locale === "fr" ? "en" : "fr");
            }}
            data-cursor={locale === "fr" ? "EN" : "FR"}
            className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-50"
            aria-label="Changer de langue"
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
              "flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition-colors duration-300",
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
        </div>
      </nav>
    </header>
  );
}
