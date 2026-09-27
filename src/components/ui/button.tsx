import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
  | "primary"
  | "default"
  | "accent"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "destructive-outline"
  | "link";
  size?: "xs" | "sm" | "md" | "lg" | "default" | "icon" | "icon-sm" | "icon-xs";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const normalizedVariant = variant === "default" ? "primary" : variant;
    const normalizedSize = size === "default" ? "md" : size;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative inline-flex items-center justify-center font-medium select-none transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-1",

          normalizedVariant === "primary" &&
          "bg-stone-900 text-stone-50 hover:bg-stone-800 active:bg-stone-950 border border-stone-800/80 shadow-xs [&>svg]:text-amber-400 [&_.btn-icon]:text-amber-400",
          normalizedVariant === "accent" &&
          "bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 border border-amber-600 shadow-xs font-semibold",
          normalizedVariant === "secondary" &&
          "bg-stone-100 text-stone-800 hover:bg-stone-200 active:bg-stone-300 border border-stone-200/90",
          normalizedVariant === "outline" &&
          "bg-white text-stone-700 hover:bg-stone-50 active:bg-stone-100 border border-stone-300 shadow-xs",
          normalizedVariant === "ghost" &&
          "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-transparent",
          normalizedVariant === "destructive" &&
          "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-rose-600 shadow-xs font-semibold",
          normalizedVariant === "destructive-outline" &&
          "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200/90 active:bg-rose-100/70 shadow-xs",
          normalizedVariant === "link" &&
          "bg-transparent text-amber-700 hover:text-amber-800 underline-offset-4 hover:underline p-0 h-auto font-medium border-0 active:scale-100",

          normalizedSize === "xs" && "h-7 px-2.5 text-[11px] rounded-md gap-1",
          normalizedSize === "sm" && "h-8 px-3 py-1 text-xs rounded-lg gap-1.5",
          normalizedSize === "md" && "h-9 px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-lg gap-2",
          normalizedSize === "lg" && "h-10 px-4 py-2 text-sm font-semibold rounded-lg gap-2",
          normalizedSize === "icon-xs" && "size-7 p-0 rounded-md shrink-0",
          normalizedSize === "icon-sm" && "size-8 p-0 rounded-lg shrink-0",
          normalizedSize === "icon" && "size-9 p-0 rounded-lg shrink-0",

          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-3.5 animate-spin shrink-0 text-current" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="btn-icon shrink-0 inline-flex items-center">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="btn-icon shrink-0 inline-flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
