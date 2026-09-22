import type { ReactNode } from "react";

/**
 * Studio segment layout. Auth is enforced in middleware + per-page guards.
 * Pages render their own StudioNav so we can pass pathname/org name.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-background">{children}</div>;
}
