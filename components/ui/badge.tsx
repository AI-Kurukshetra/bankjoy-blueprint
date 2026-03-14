import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-surge/20 bg-surge/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-surge",
        className,
      )}
      {...props}
    />
  );
}
