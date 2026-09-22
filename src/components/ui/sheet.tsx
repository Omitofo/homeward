"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** Optional footer actions */
  footer?: ReactNode;
  className?: string;
};

/**
 * Bottom sheet (mobile-first). On larger screens it still docks to the bottom
 * for consistency with the filter UX described in the design principles.
 * Escape closes; focus is trapped while open and restored on close.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
}: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Focus the panel (or first focusable) after paint
    const focusTarget =
      panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? panelRef.current;
    focusTarget?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      // Focus trap
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

      if (focusable.length === 0) {
        e.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === panelRef.current) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-foreground/40"
        onClick={close}
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-xl bg-card shadow-lg",
          "focus:outline-none",
          className,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={close} aria-label="Close sheet">
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </Button>
        </div>

        <div className="px-4 py-4">{children}</div>

        {footer && (
          <div className="sticky bottom-0 border-t border-border bg-card px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
