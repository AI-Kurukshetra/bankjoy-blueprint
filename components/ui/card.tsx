import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-white/70 bg-white/88 p-6 shadow-panel backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
