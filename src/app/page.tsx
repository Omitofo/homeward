import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-muted uppercase">
          Phase 0 · Foundation
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {siteConfig.description}
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          Design tokens are live. Preview them at{" "}
          <Link
            href="/tokens"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            /tokens
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
