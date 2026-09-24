import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth";
import { getConversationMessages, ChatThread } from "@/features/chat";

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
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-danger" role="alert">
          {result.error}
        </p>
      </main>
    );
  }

  const { messages, peerName, postCards } = result.data;

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-6"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm">
            <Link href="/messages" className="text-primary hover:underline">
              ← Messages
            </Link>
          </p>
          <h1 className="text-xl font-semibold tracking-tight">{peerName}</h1>
          <p className="text-xs text-muted">
            One thread with this rescue. Animal cards appear when you contact
            from a post.
          </p>
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
      />
    </main>
  );
}
