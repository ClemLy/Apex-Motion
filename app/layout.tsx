import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AudioProvider } from "@/lib/audio/AudioProvider";
import { ConfiguratorProvider } from "@/lib/configurator/store";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HudFrame } from "@/components/layout/HudFrame";
import { CustomCursor } from "@/components/ui/CustomCursor";

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
      <body className="flex min-h-full flex-col bg-[#030303] text-neutral-100">
        <LanguageProvider>
          <AudioProvider>
            <ConfiguratorProvider>
              <SmoothScrollProvider>
                <div aria-hidden className="grain-overlay" />
                <div aria-hidden className="scanlines" />
                <CustomCursor />
                <HudFrame />
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </SmoothScrollProvider>
            </ConfiguratorProvider>
          </AudioProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
