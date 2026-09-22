import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth";
import {
  getConversationMessages,
  MessageComposer,
} from "@/features/chat";

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
    if (result.error === "Conversation not found" || result.error === "Access denied") {
      notFound();
    }
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-danger">{result.error}</p>
      </main>
    );
  }

  const { messages, peerName, postId } = result.data;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm">
            <Link href="/messages" className="text-primary hover:underline">
              ← Messages
            </Link>
          </p>
          <h1 className="text-xl font-semibold tracking-tight">{peerName}</h1>
          {postId ? (
            <p className="text-xs text-muted">
              About{" "}
              <Link
                href={`/post/${postId}`}
                className="font-medium text-primary hover:underline"
              >
                this animal
              </Link>
            </p>
          ) : null}
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

      <ul className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <li className="text-sm text-muted">No messages yet. Say hello.</li>
        ) : null}
        {messages.map((m) => {
          const mine = m.senderId === profile.id;
          return (
            <li
              key={m.id}
              className={
                mine
                  ? "ml-8 self-end rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "mr-8 self-start rounded-lg border border-border bg-card px-3 py-2 text-sm"
              }
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <time
                className={
                  mine
                    ? "mt-1 block text-[10px] opacity-80"
                    : "mt-1 block text-[10px] text-muted"
                }
                dateTime={m.createdAt}
              >
                {new Date(m.createdAt).toLocaleString()}
              </time>
            </li>
          );
        })}
      </ul>

      <MessageComposer conversationId={id} />
    </main>
  );
}
