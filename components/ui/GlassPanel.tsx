import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

export function GlassPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-neutral-950/70 backdrop-blur-2xl",
        className,
      )}
      {...props}
    />
  );
}
