"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/motion/register";
import { duration, ease } from "@/motion/tokens";
import { useMotionPreference } from "@/motion/hooks/useMotionPreference";
import { Reveal } from "@/motion/primitives/Reveal";

type StatsProps = {
  animals: number;
  shelters: number;
  countries: number;
};

function Stat({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { level } = useMotionPreference();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (level === "off") {
        el.textContent = String(value);
        return;
      }

      const obj = { n: 0 };
      gsap.to(obj, {
        n: value,
        duration: level === "reduced" ? duration.instant : duration.slow,
        ease: ease.out,
        onUpdate: () => {
          el.textContent = String(Math.round(obj.n));
        },
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
      });
    },
    { dependencies: [value, level] },
  );

  return (
    <div className="text-center">
      <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        <span ref={ref}>0</span>
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

export function Stats({ animals, shelters, countries }: StatsProps) {
  return (
    <section className="px-4 py-16">
      <Reveal>
        <div className="mx-auto flex max-w-3xl justify-around gap-6">
          <Stat value={animals} label="Animals listed" />
          <Stat value={shelters} label="Rescue centers" />
          <Stat value={countries} label="Countries" />
        </div>
      </Reveal>
    </section>
  );
}
