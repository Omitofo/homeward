import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-zinc-500 uppercase">
          Phase 0 · Foundation
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          {siteConfig.description}
        </p>
        <p className="mt-8 text-sm text-zinc-400">
          Scaffold is live. Next: design tokens, motion infrastructure, and the
          explore feed with mock data.
        </p>
      </div>
    </main>
  );
}
