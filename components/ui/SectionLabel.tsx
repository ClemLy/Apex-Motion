import { cn } from "@/utils/cn";

export function SectionLabel({
  kicker,
  title,
  titleAccent,
  subtitle,
  align = "left",
  className,
  as = "h2",
}: {
  kicker: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  /** The page's very first section should own the single `<h1>` — every other section stays an `<h2>`. */
  as?: "h1" | "h2";
}) {
  const Heading = as;

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
      <Heading
        data-text={title}
        className="glitch-title text-4xl font-semibold uppercase leading-[0.95] tracking-tighter text-neutral-50 sm:text-6xl"
      >
        {title}
        {titleAccent ? (
          <span className="block text-neutral-500">{titleAccent}</span>
        ) : null}
      </Heading>
      {subtitle ? (
        <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
