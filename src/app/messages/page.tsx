import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, EmptyStateLink } from "@/components/ui";
import { getCurrentProfile } from "@/features/auth";
import { listConversations } from "@/features/chat";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/messages");
  }

  const result = await listConversations();
  const items = result.ok ? result.data : [];

  return (
    <div className="min-h-full">
      <AppHeader
        profile={profile}
        active="messages"
        maxWidthClassName="max-w-2xl"
        showMotionToggle={false}
        loginNext="/messages"
      />

      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted">
          Private chats between adopters and rescues. Never send money before
          meeting the animal.
        </p>

        {!result.ok ? (
          <p className="mt-8 text-sm text-danger" role="alert">
            {result.error}
          </p>
        ) : null}

        {result.ok && items.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No conversations yet"
              description="Open a post and tap Contact shelter to start a chat."
              action={
                <EmptyStateLink href="/explore">Browse animals</EmptyStateLink>
              }
            />
          </div>
        ) : null}

        {items.length > 0 ? (
          <ul className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {items.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{c.peerName}</span>
                    {c.unreadCount > 0 ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                        {c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-muted">
                    {c.lastMessagePreview ?? "No messages yet"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  );
}
