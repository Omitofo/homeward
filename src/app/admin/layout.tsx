import type { ReactNode } from "react";
import {
  AdminNav,
  getAdminQueueCounts,
  requireAdminContext,
} from "@/features/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await requireAdminContext();

  if (!ctx) {
    return <div className="min-h-full bg-background">{children}</div>;
  }

  const counts = await getAdminQueueCounts();

  return (
    <div className="min-h-full bg-background">
      <AdminNav displayName={ctx.profile.displayName} counts={counts} />
      {children}
    </div>
  );
}
