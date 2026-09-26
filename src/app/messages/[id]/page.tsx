import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth";
import {
  getConversationMessages,
  ChatThread,
  CloseConversationButton,
  HideConversationButton,
} from "@/features/chat";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?next=/messages/${id}`);
  }

  const result = await getConversationMessages(id);
  if (!result.ok) {
    if (
      result.error === "Conversation not found" ||
      result.error === "Access denied"
    ) {
      notFound();
    }
    return (
      <div className="min-h-full">
        <AppHeader
          profile={profile}
          active="messages"
          maxWidthClassName="max-w-2xl"
          loginNext={`/messages/${id}`}
        />
        <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
          <p className="text-sm text-danger" role="alert">
            {result.error}
          </p>
        </main>
      </div>
    );
  }

  const { messages, peerName, postCards, status, closedBy } = result.data;
  const canReopen =
    status === "closed" &&
    (closedBy === profile.id ||
      profile.role === "admin" ||
      closedBy == null);

  return (
    <div className="min-h-full">
      <AppHeader
        profile={profile}
        active="messages"
        maxWidthClassName="max-w-2xl"
        loginNext={`/messages/${id}`}
      />

      <main
        id="main-content"
        className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm">
              <Link
                href="/messages"
                className="text-muted hover:text-foreground hover:underline"
              >
                ← Messages
              </Link>
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              {peerName}
            </h1>
            <p className="text-xs text-muted">
              {status === "closed"
                ? closedBy === profile.id
                  ? "You closed this conversation"
                  : "Conversation closed"
                : "Private thread. Never send money before meeting in person."}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <CloseConversationButton
              conversationId={id}
              status={status}
              canReopen={canReopen}
            />
            <HideConversationButton conversationId={id} status={status} />
          </div>
        </div>

        <div
          className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground"
          role="note"
        >
          <strong className="font-medium">Stay safe:</strong> Never send money or
          personal financial details before meeting the animal and the rescue in
          person. Homeward does not process payments.
        </div>

        <ChatThread
          conversationId={id}
          initialMessages={messages}
          currentUserId={profile.id}
          peerName={peerName}
          postCards={postCards}
          status={status}
        />
      </main>
    </div>
  );
}
