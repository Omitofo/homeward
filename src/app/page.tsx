import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/motion/primitives/Reveal";
import { MotionToggle } from "@/motion/components/MotionToggle";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <Reveal>
          <p className="mb-3 text-sm font-medium tracking-wide text-muted uppercase">
            Phase 0–2 · Foundation + Explore
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {siteConfig.name}
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {siteConfig.description}
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore animals
            </Link>
            <Link
              href="/tokens"
              className="text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Design tokens
            </Link>
            <Link
              href="/ui"
              className="text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              UI kit
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 flex justify-center">
          <MotionToggle />
        </div>
      </div>
    </main>
  );
}
