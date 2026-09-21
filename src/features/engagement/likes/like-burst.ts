import gsap from "gsap";
import { duration, ease } from "@/motion/tokens";

/**
 * Light heart feedback (M10). Particles can be added later;
 * this stays cheap and reduced-motion friendly when skipped by the caller.
 */
export function playLikeBurst(el: HTMLElement | null): void {
  if (!el) return;
  gsap.fromTo(
    el,
    { scale: 1 },
    {
      scale: 1.25,
      duration: duration.instant,
      ease: ease.spring,
      yoyo: true,
      repeat: 1,
    },
  );
}
