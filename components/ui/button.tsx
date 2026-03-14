import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-ink text-white shadow-panel",
        variant === "secondary" && "border border-line bg-white text-ink",
        variant === "ghost" && "text-ink",
        className,
      )}
      {...props}
    />
  );
}
