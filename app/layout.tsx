import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AudioProvider } from "@/lib/audio/AudioProvider";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HudFrame } from "@/components/layout/HudFrame";
import { Preloader } from "@/components/layout/Preloader";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { FluidBackground } from "@/components/three/FluidBackground";
import { IntroProvider } from "@/lib/intro/IntroProvider";
import { DebugProvider } from "@/lib/debug/DebugProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APEX // MOTION",
  description:
    "APEX // MOTION - une exploration immersive de l'ingenierie Porsche. Studio de personnalisation 3D en temps reel, laboratoire sonore et archives heritage.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#020202] text-neutral-100">
        <LanguageProvider>
          <AudioProvider>
            <DebugProvider>
              <IntroProvider>
                <SmoothScrollProvider>
                  <FluidBackground />
                  <Preloader />
                  <div aria-hidden className="grain-overlay" />
                  <CustomCursor />
                  <HudFrame />
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </SmoothScrollProvider>
              </IntroProvider>
            </DebugProvider>
          </AudioProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
