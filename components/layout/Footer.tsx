"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-100">
          APEX <span className="text-neutral-600">{"//"}</span> MOTION
        </span>
        <p className="max-w-xl text-[11px] leading-relaxed text-neutral-500">
          {dict.footer.disclaimer}
        </p>
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          2026 - {dict.footer.rights}
        </span>
      </div>
    </footer>
  );
}
