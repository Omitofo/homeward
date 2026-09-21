"use client";

import { useMotionPreference, type MotionLevel } from "@/motion/hooks/useMotionPreference";

const OPTIONS: { value: MotionLevel; label: string }[] = [
  { value: "full", label: "Full" },
  { value: "reduced", label: "Reduced" },
  { value: "off", label: "Off" },
];

/**
 * Visible control for the GSAP Impact Lab.
 * Place in footer or a floating dev overlay.
 */
export function MotionToggle({ className }: { className?: string }) {
  const { level, setLevel } = useMotionPreference();

  return (
    <div
      className={className}
      role="group"
      aria-label="Motion preference"
    >
      <span className="mr-2 text-xs text-muted">Motion</span>
      <div className="inline-flex rounded-md border border-border bg-card p-0.5">
        {OPTIONS.map((opt) => {
          const active = level === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLevel(opt.value)}
              aria-pressed={active}
              className={
                active
                  ? "rounded-sm bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                  : "rounded-sm px-2.5 py-1 text-xs font-medium text-muted hover:text-foreground"
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
