"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/motion/register";
import { duration, ease, distance } from "@/motion/tokens";
import { useMotionPreference } from "@/motion/hooks/useMotionPreference";

type RevealProps = {
  children: ReactNode;
  /** Delay in seconds before the reveal starts */
  delay?: number;
  /** Y offset in px (positive = from below) */
  y?: number;
  className?: string;
  /** If true, only animate once when entering viewport */
  once?: boolean;
};

/**
 * Simple fade + slight translate reveal.
 * Honors motion preference: off → no animation; reduced → instant opacity only.
 */
export function Reveal({
  children,
  delay = 0,
  y = distance.md,
  className,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { level, enabled } = useMotionPreference();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (level === "off") {
        gsap.set(el, { autoAlpha: 1, y: 0 });
        return;
      }

      if (level === "reduced") {
        gsap.fromTo(
          el,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: duration.instant, delay, ease: ease.out },
        );
        return;
      }

      // Full
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration.base,
          delay,
          ease: ease.out,
          scrollTrigger: once
            ? {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none none",
              }
            : undefined,
        },
      );
    },
    { scope: ref, dependencies: [level, enabled, delay, y, once] },
  );

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
