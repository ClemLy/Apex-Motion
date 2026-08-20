"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * The Studio's only heading — the page itself is app-like (a stage + a
 * control panel, not editorial sections), so there's no SectionLabel to
 * carry the page's `<h1>`. Visually hidden: the visible "MODÈLE" label in
 * ConfiguratorPanel already orients sighted users.
 */
export function StudioHeading() {
  const { dict } = useLanguage();
  return (
    <h1 className="sr-only">
      {dict.configurator.title} {dict.configurator.titleAccent}
    </h1>
  );
}
