import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Tokens",
  robots: { index: false, follow: false },
};

const colorGroups = [
  {
    title: "Base",
    tokens: [
      "background",
      "foreground",
      "muted",
      "muted-foreground",
      "border",
      "card",
      "popover",
    ],
  },
  {
    title: "Brand",
    tokens: ["primary", "primary-foreground", "secondary", "accent"],
  },
  {
    title: "Semantic",
    tokens: [
      "success",
      "warning",
      "danger",
      "info",
      "verified",
      "status-available",
      "status-reserved",
      "status-adopted",
    ],
  },
] as const;

const radii = ["sm", "md", "lg", "xl", "full"] as const;
const spaces = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16] as const;
const typeSteps = [
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
] as const;

export default function TokensPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight">Design Tokens</h1>
        <p className="mt-2 text-muted">
          Living reference for Homeward. Values live in{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-sm">
            src/styles/tokens.css
          </code>
          .
        </p>
      </header>

      {/* Colors */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold">Color</h2>
        <div className="space-y-10">
          {colorGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
                {group.title}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {group.tokens.map((name) => (
                  <div
                    key={name}
                    className="overflow-hidden rounded-md border border-border bg-card"
                  >
                    <div
                      className="h-16 w-full"
                      style={{
                        backgroundColor: `var(--color-${name})`,
                      }}
                    />
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted">--color-{name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold">Typography</h2>
        <p className="mb-4 text-sm text-muted">
          Plus Jakarta Sans · modular scale ≈ 1.25
        </p>
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          {typeSteps.map((step) => (
            <div key={step} className="flex items-baseline gap-4">
              <span className="w-12 shrink-0 text-xs text-muted">{step}</span>
              <p
                className="font-medium text-foreground"
                style={{ fontSize: `var(--text-${step})` }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold">Spacing</h2>
        <div className="space-y-2">
          {spaces.map((n) => (
            <div key={n} className="flex items-center gap-4">
              <span className="w-16 text-xs text-muted">space-{n}</span>
              <div
                className="h-4 rounded-sm bg-primary"
                style={{ width: `var(--space-${n})` }}
              />
              <span className="text-xs text-muted">
                {n * 4}px / var(--space-{n})
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Radius */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold">Radius</h2>
        <div className="flex flex-wrap gap-6">
          {radii.map((r) => (
            <div key={r} className="text-center">
              <div
                className="mx-auto mb-2 h-16 w-16 border-2 border-primary bg-secondary"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <p className="text-sm font-medium">{r}</p>
              <p className="text-xs text-muted">--radius-{r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Motion */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold">Motion</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-sm font-medium">Durations</p>
            <ul className="space-y-1 text-sm text-muted">
              <li>fast · 150ms</li>
              <li>normal · 250ms</li>
              <li>slow · 400ms</li>
              <li>slower · 600ms</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-sm font-medium">Eases</p>
            <ul className="space-y-1 text-sm text-muted">
              <li>ease-out (default exits)</li>
              <li>ease-in-out</li>
              <li>ease-spring (playful micro)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Live examples */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">Live examples</h2>
        <div className="flex flex-wrap items-center gap-4">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Primary button
          </button>
          <button className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            Secondary
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-verified/15 px-2.5 py-1 text-xs font-medium text-verified-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-verified" />
            Verified rescue
          </span>
          <span className="rounded-full bg-status-available/15 px-2.5 py-1 text-xs font-medium text-status-available">
            Available
          </span>
          <span className="rounded-full bg-status-reserved/15 px-2.5 py-1 text-xs font-medium text-status-reserved">
            Reserved
          </span>
        </div>
      </section>
    </main>
  );
}
