"use client";

/**
 * Register GSAP plugins once on the client.
 * Import only the plugins we actually use; add more as features need them.
 * Call this from MotionProvider (or any single client entry) so it runs once.
 *
 * Flip is not registered here — no feature uses it yet. When shared-element
 * or grid Flip lands, register it dynamically in that feature to keep `/` lean.
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerGSAP() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  registered = true;
}

export { gsap, useGSAP, ScrollTrigger };
