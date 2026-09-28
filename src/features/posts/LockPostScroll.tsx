"use client";

import { useEffect } from "react";

/**
 * On lg+ viewports, prevent document scroll while the post detail shell
 * is mounted. Only the right column (sheet-scroll) should scroll.
 */
export function LockPostScroll() {
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const apply = () => {
      if (mq.matches) {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.height = "100%";
      } else {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.height = "";
      }
    };

    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  return null;
}
