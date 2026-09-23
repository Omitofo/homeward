import Link from "next/link";
import { MotionToggle } from "@/motion/components/MotionToggle";
import { Reveal } from "@/motion/primitives/Reveal";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function IntroFooter() {
  return (
    <>
      <footer className="border-t border-border px-4 py-16">
        <Reveal>
          <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Ready when you are</h2>
            <p className="text-muted">
              No account needed to browse. Sign up only when you want to like, save, or message.
            </p>
            <Link
              href="/explore"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore animals
            </Link>
            <div className="pt-4">
              <MotionToggle />
            </div>
            <p className="text-xs text-muted">
              Homeward · mock data · motion optional
            </p>
          </div>
        </Reveal>
      </footer>
      <SiteFooter />
    </>
  );
}
