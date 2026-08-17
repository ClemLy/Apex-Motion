import { cn } from "@/utils/cn";

export function TelemetryTag({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
        {label}
      </span>
      <span className="font-mono text-sm tabular-nums text-neutral-200">
        {value}
      </span>
    </div>
  );
}
