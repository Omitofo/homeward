"use client";

/**
 * Register GSAP plugins once on the client.
 * Import only the plugins we actually use; add more as features need them.
 * Call this from MotionProvider (or any single client entry) so it runs once.
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Core plugins we know we will need early. Heavy ones (SplitText, Flip, etc.)
// can be registered dynamically later if bundle size becomes a concern.
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

let registered = false;

export function registerGSAP() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);
  registered = true;
}

export { gsap, useGSAP, ScrollTrigger, Flip };
