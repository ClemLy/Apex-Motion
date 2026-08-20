"use client";

import type { ReactNode } from "react";
import { useIntro } from "@/lib/intro/IntroProvider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/**
 * Wraps the real page chrome so it can go `inert` while the Preloader's
 * dialog is up front — otherwise a keyboard/screen-reader user could Tab
 * past the "Démarrer" gate straight into the Navbar, main content, and
 * Footer sitting mounted (but visually covered) underneath it.
 * `display: contents` keeps this transparent to `body`'s flex layout, since
 * `inert` only affects interactivity, not box generation.
 */
export function AppContent({ children }: { children: ReactNode }) {
  const { hasEntered } = useIntro();

  return (
    <div className="contents" inert={!hasEntered}>
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
