"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MotionLevel = "full" | "reduced" | "off";

const STORAGE_KEY = "homeward-motion";

type MotionContextValue = {
  level: MotionLevel;
  setLevel: (level: MotionLevel) => void;
  /** True when animations should run (level === "full") */
  enabled: boolean;
  /** True when we should use reduced variants (crossfades, no staggers) */
  isReduced: boolean;
};

const MotionContext = createContext<MotionContextValue | null>(null);

function readStored(): MotionLevel | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "full" || v === "reduced" || v === "off") return v;
  } catch {
    // private mode / SSR
  }
  return null;
}

function systemPrefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveInitial(): MotionLevel {
  if (typeof window === "undefined") return "full";
  // Query param wins for A/B and e2e
  const param = new URLSearchParams(window.location.search).get("motion");
  if (param === "off" || param === "reduced" || param === "full") return param;
  const stored = readStored();
  if (stored) return stored;
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
  }, []);

  const setLevel = useCallback((next: MotionLevel) => {
    setLevelState(next);
    applyToDocument(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<MotionContextValue>(
    () => ({
      level,
      setLevel,
      enabled: level === "full",
      isReduced: level === "reduced" || level === "off",
    }),
    [level, setLevel],
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
    // Safe fallback when used outside provider (e.g. during SSR of a leaf)
    return {
      level: "full",
      setLevel: () => {},
      enabled: true,
      isReduced: false,
    };
  }
  return ctx;
}
