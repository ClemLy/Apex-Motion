import { cn } from "@/utils/cn";

export function SectionLabel({
  kicker,
  title,
  titleAccent,
  subtitle,
  align = "left",
  className,
}: {
  kicker: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
        {kicker}
      </span>
      <h2 className="text-4xl font-semibold uppercase leading-[0.95] tracking-tighter text-neutral-50 sm:text-6xl">
        {title}
        {titleAccent ? (
          <span className="block text-neutral-500">{titleAccent}</span>
        ) : null}
      </h2>
      {subtitle ? (
        <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
