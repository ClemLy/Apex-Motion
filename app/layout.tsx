import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AudioProvider } from "@/lib/audio/AudioProvider";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { AppContent } from "@/components/layout/AppContent";
import { HudFrame } from "@/components/layout/HudFrame";
import { Preloader } from "@/components/layout/Preloader";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { FluidBackground } from "@/components/three/FluidBackground";
import { IntroProvider } from "@/lib/intro/IntroProvider";
import { DebugProvider } from "@/lib/debug/DebugProvider";
import { AUTHOR_NAME, AUTHOR_URL, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Exploration numérique immersive de l'ingénierie Porsche : studio de personnalisation 3D en temps réel, télémétrie de circuit et archives héritage. Aucun prix, aucune transaction.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "Porsche",
    "911 GT3 RS",
    "configurateur 3D",
    "Three.js",
    "React Three Fiber",
    "WebGL",
    "personnalisation automobile",
    "Nürburgring Nordschleife",
  ],
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
    languages: { fr: "/", en: "/", de: "/" },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    locale: "fr_FR",
    alternateLocale: ["en_US", "de_DE"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: ["fr", "en", "de"],
  author: { "@type": "Person", name: AUTHOR_NAME, url: AUTHOR_URL },
  creator: { "@type": "Person", name: AUTHOR_NAME, url: AUTHOR_URL },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#020202] text-neutral-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[300] focus-visible:rounded-full focus-visible:border focus-visible:border-white/20 focus-visible:bg-neutral-950 focus-visible:px-5 focus-visible:py-2.5 focus-visible:text-xs focus-visible:uppercase focus-visible:tracking-[0.2em] focus-visible:text-neutral-50"
        >
          Aller au contenu
        </a>
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
                  <AppContent>{children}</AppContent>
                </SmoothScrollProvider>
              </IntroProvider>
            </DebugProvider>
          </AudioProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
