import type { AnimalPost } from "@/types/domain";
import { PostCard } from "./PostCard";

export function FeedGrid({ posts }: { posts: AnimalPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <p className="text-lg font-medium text-foreground">No animals match</p>
        <p className="mt-1 text-sm text-muted">Try clearing some filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
