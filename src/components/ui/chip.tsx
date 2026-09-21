import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  /** Optional count shown after the label */
  count?: number;
};

/**
 * Filter-style chip. Use as a toggle button in filter bars.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected = false, count, children, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-foreground hover:bg-secondary",
          className,
        )}
        {...props}
      >
        {children}
        {typeof count === "number" && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
              selected ? "bg-primary-foreground/20" : "bg-secondary text-muted",
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  },
);
Chip.displayName = "Chip";
