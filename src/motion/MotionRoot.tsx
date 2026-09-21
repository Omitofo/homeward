"use client";

import { useEffect, type ReactNode } from "react";
import { registerGSAP } from "./register";
import { MotionProvider } from "./hooks/useMotionPreference";

/**
 * Client boundary that registers GSAP once and provides motion preference.
 * Mount this once in the root layout.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    registerGSAP();
  }, []);

  return <MotionProvider>{children}</MotionProvider>;
}
