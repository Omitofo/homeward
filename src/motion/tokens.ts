/**
 * Single source of truth for motion numbers.
 * CSS counterparts live in src/styles/tokens.css (--duration-*, --ease-*, etc.).
 * Prefer these values in all GSAP timelines and hooks.
 */

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  cinematic: 1.2,
} as const;

export const ease = {
  out: "power3.out",
  inOut: "power2.inOut",
  spring: "back.out(1.6)",
  snap: "expo.out",
} as const;

export const stagger = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;

export const distance = {
  sm: 8,
  md: 16,
  lg: 32,
} as const;

export type DurationKey = keyof typeof duration;
export type EaseKey = keyof typeof ease;
