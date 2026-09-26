"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MotionLevel = "full" | "reduced" | "off";

type MotionContextValue = {
  level: MotionLevel;
  /** No-op in product; preference is automatic (full, or reduced via OS). */
  setLevel: (level: MotionLevel) => void;
  /** True when animations should run (level === "full") */
  enabled: boolean;
  /** True when we should use reduced variants (crossfades, no staggers) */
  isReduced: boolean;
};

const MotionContext = createContext<MotionContextValue | null>(null);

function systemPrefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Product default is full motion.
 * - OS "prefers-reduced-motion" → reduced (a11y)
 * - `?motion=full|reduced|off` still works for e2e / demos
 * Manual Full/Reduced/Off toggle was a lab control and is no longer exposed.
 */
function resolveInitial(): MotionLevel {
  if (typeof window === "undefined") return "full";
  const param = new URLSearchParams(window.location.search).get("motion");
  if (param === "off" || param === "reduced" || param === "full") return param;
  return systemPrefersReduced() ? "reduced" : "full";
}

function applyToDocument(level: MotionLevel) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.motion = level;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<MotionLevel>("full");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = resolveInitial();
    setLevelState(initial);
    applyToDocument(initial);
    setReady(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      const param = new URLSearchParams(window.location.search).get("motion");
      if (param === "off" || param === "reduced" || param === "full") return;
      const next: MotionLevel = mq.matches ? "reduced" : "full";
      setLevelState(next);
      applyToDocument(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo<MotionContextValue>(
    () => ({
      level,
      setLevel: () => {
        /* product UI no longer exposes a toggle */
      },
      enabled: level === "full",
      isReduced: level === "reduced" || level === "off",
    }),
    [level],
  );

  // Avoid flash of wrong motion setting
  if (!ready) {
    return (
      <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
    );
  }

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotionPreference(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) {
    return {
      level: "full",
      setLevel: () => {},
      enabled: true,
      isReduced: false,
    };
  }
  return ctx;
}
