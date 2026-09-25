import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AdminNav, requireAdminContext } from "@/features/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await requireAdminContext();
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ??
    headersList.get("x-invoke-path") ??
    "/admin";

  // Prefer referer path when available for active nav highlighting
  let path = pathname;
  const referer = headersList.get("x-url") ?? headersList.get("referer");
  if (referer) {
    try {
      const u = new URL(referer);
      if (u.pathname.startsWith("/admin")) {
        path = u.pathname;
      }
    } catch {
      // ignore
    }
  }

  if (!ctx) {
    return <div className="min-h-full bg-background">{children}</div>;
  }

  return (
    <div className="min-h-full bg-background">
      <AdminNav pathname={path} displayName={ctx.profile.displayName} />
      {children}
    </div>
  );
}
