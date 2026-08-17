"use client";

import { useState } from "react";
import { Download, Check, Copy } from "lucide-react";
import { garageBuilds } from "@/lib/garage-data";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/utils/cn";

export function CommunityGarage() {
  const { dict } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <section id="garage" className="relative flex flex-col gap-10 px-6 py-28 sm:px-10">
      <SectionLabel
        kicker={dict.garage.kicker}
        title={dict.garage.title}
        titleAccent={dict.garage.titleAccent}
        subtitle={dict.garage.subtitle}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {garageBuilds.map((build) => (
          <article
            key={build.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10"
          >
            <div
              className={cn(
                "flex h-56 items-end bg-gradient-to-br p-6 transition-transform duration-500 group-hover:scale-[1.03]",
                build.gradient,
              )}
            >
              <div>
                <h3 className="text-2xl font-semibold uppercase tracking-tighter text-neutral-50">
                  {build.model}
                </h3>
                <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-300/80">
                  {build.paint}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 bg-neutral-950/70 p-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {build.author}
              </span>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy(build.id, build.code)}
                  className="flex flex-1 items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-neutral-300 transition-colors hover:border-white/25"
                >
                  {build.code}
                  {copiedId === build.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-white/25"
                  aria-label={dict.garage.download}
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
