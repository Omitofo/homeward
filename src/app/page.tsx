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
            Phase 0 · Foundation
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
          <p className="mt-8 text-sm text-muted-foreground">
            Motion infrastructure is live. Toggle below or use{" "}
            <code className="rounded bg-secondary px-1 py-0.5 text-xs">?motion=off</code>
            . Tokens at{" "}
            <Link
              href="/tokens"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              /tokens
            </Link>
            .
          </p>
        </Reveal>

        <div className="mt-10 flex justify-center">
          <MotionToggle />
        </div>
      </div>
    </main>
  );
}
