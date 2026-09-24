import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-stone-900 text-white hover:bg-stone-800",
        variant === "outline" &&
          "border border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100",
        variant === "ghost" && "text-stone-700 hover:bg-stone-100",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "default" && "px-4 py-2 text-sm",
        className,
      )}
      {...props}
    />
  );
}