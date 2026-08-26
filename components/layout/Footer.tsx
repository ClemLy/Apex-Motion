"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AUTHOR_NAME, AUTHOR_URL } from "@/lib/site";
import { cn } from "@/utils/cn";

const links = [
  { href: "/", key: "home" as const },
  { href: "/configurator", key: "configurator" as const },
  { href: "/heritage", key: "heritage" as const },
] as const;

export function Footer() {
  const { dict } = useLanguage();
  const pathname = usePathname();

  return (
    <footer className="border-t border-white/10 px-6 pb-10 pt-12">
      <div className="mx-auto max-w-6xl flex flex-col gap-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-100">
            APEX <span className="text-neutral-500">{"//"}</span> MOTION
          </span>

          <nav aria-label={dict.footer.navLabel}>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-[11px] uppercase tracking-[0.2em] transition-colors duration-300",
                        active
                          ? "text-neutral-100"
                          : "text-neutral-500 hover:text-neutral-100",
                      )}
                    >
                      {dict.nav[link.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[11px] leading-relaxed text-neutral-500">
            {dict.footer.disclaimer}
          </p>
          <div className="flex shrink-0 flex-col items-start gap-1 text-[11px] uppercase tracking-[0.2em] sm:items-end">
            <span className="text-neutral-500">
              {dict.footer.credit}{" "}
              <a
                href={AUTHOR_URL}
                target="_blank"
                rel="author noopener noreferrer"
                data-cursor={dict.cursor.view}
                className="text-neutral-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-neutral-50 hover:decoration-white/60"
              >
                {AUTHOR_NAME}
              </a>
            </span>
            <span className="text-neutral-700">
              2026 — {dict.footer.rights}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
