import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, EmptyStateLink } from "@/components/ui";
import { getCurrentProfile } from "@/features/auth";
import {
  listConversations,
  listBlockedPeers,
  UnblockPeerButton,
  type MessagesTab,
} from "@/features/chat";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

function parseTab(raw: string | undefined): MessagesTab {
  if (raw === "archived" || raw === "blocked") return raw;
  return "inbox";
}

export default async function MessagesPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/messages");
  }

  const params = await searchParams;
  const tab = parseTab(params.tab);

  const convResult =
    tab === "blocked"
      ? { ok: true as const, data: [] }
      : await listConversations(tab);
  const blockedResult =
    tab === "blocked" ? await listBlockedPeers() : { ok: true as const, data: [] };

  const items = convResult.ok ? convResult.data : [];
  const blocked = blockedResult.ok ? blockedResult.data : [];

  const tabs: { id: MessagesTab; label: string }[] = [
    { id: "inbox", label: "Inbox" },
    { id: "archived", label: "Archived" },
    { id: "blocked", label: "Blocked" },
  ];

  return (
    <div className="min-h-full">
      <AppHeader
        profile={profile}
        active="messages"
        maxWidthClassName="max-w-2xl"
        loginNext="/messages"
      />

      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted">
          Archive hides a chat from Inbox only. Block stops messaging — manage
          that under Blocked.
        </p>

        <nav
          className="mt-6 flex gap-1 border-b border-border"
          aria-label="Message folders"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            const href =
              t.id === "inbox" ? "/messages" : `/messages?tab=${t.id}`;
            return (
              <Link
                key={t.id}
                href={href}
                className={
                  active
                    ? "-mb-px border-b-2 border-primary px-3 py-2 text-sm font-medium text-foreground"
                    : "px-3 py-2 text-sm text-muted hover:text-foreground"
                }
                aria-current={active ? "page" : undefined}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        {!convResult.ok ? (
          <p className="mt-8 text-sm text-danger" role="alert">
            {convResult.error}
          </p>
        ) : null}
        {tab === "blocked" && !blockedResult.ok ? (
          <p className="mt-8 text-sm text-danger" role="alert">
            {blockedResult.error}
          </p>
        ) : null}

        {tab === "blocked" ? (
          blocked.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="No blocked people"
                description="When you block someone, they appear here so you can unblock anytime — even if the chat was archived."
              />
            </div>
          ) : (
            <ul className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {blocked.map((b) => (
                <li
                  key={b.peerId}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{b.peerName}</p>
                    <p className="text-xs text-muted">
                      Blocked{" "}
                      {new Date(b.blockedAt).toLocaleDateString("en-GB")}
                      {b.conversationId ? (
                        <>
                          {" · "}
                          <Link
                            href={`/messages/${b.conversationId}`}
                            className="underline hover:text-foreground"
                          >
                            Open chat
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <UnblockPeerButton peerId={b.peerId} />
                </li>
              ))}
            </ul>
          )
        ) : items.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title={
                tab === "archived"
                  ? "No archived chats"
                  : "No conversations yet"
              }
              description={
                tab === "archived"
                  ? "Archive a chat from the thread to move it here. New messages bring it back to Inbox."
                  : profile.role === "shelter"
                    ? "Adopters contact you from a post. You can also message another rescue from their profile."
                    : "Open a post and tap Contact shelter to start a chat."
              }
              action={
                tab === "inbox" ? (
                  <EmptyStateLink href="/explore">Browse animals</EmptyStateLink>
                ) : undefined
              }
            />
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {items.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {c.peerName}
                      {c.blockedByMe ? (
                        <span className="ml-2 text-xs font-normal text-muted">
                          · Blocked
                        </span>
                      ) : null}
                    </span>
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
        )}
      </main>
    </div>
  );
}
