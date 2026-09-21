"use client";

import { Reveal } from "@/motion/primitives/Reveal";

const BEATS = [
  {
    title: "Find",
    body: "Filter by species, size, age, and place. Share a link — the feed stays in sync with the URL.",
  },
  {
    title: "Trust",
    body: "Verified rescues, clear availability status, and safe messaging. Trust is the product.",
  },
  {
    title: "Connect",
    body: "Like, save, and chat with shelters when you’re ready to take the next step.",
  },
] as const;

export function StoryBeats() {
  return (
    <section className="border-t border-border bg-card/40 px-4 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3 sm:gap-8">
        {BEATS.map((beat, i) => (
          <Reveal key={beat.title} delay={i * 0.06}>
            <div className="space-y-3 text-center sm:text-left">
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {beat.title}
              </h2>
              <p className="text-muted leading-relaxed">{beat.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
