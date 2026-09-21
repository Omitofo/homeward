import Link from "next/link";
import { Button } from "@/components/ui";

export default function PostNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Animal not found</h1>
      <p className="max-w-sm text-muted">
        This listing may have been removed or the link is incorrect.
      </p>
      <Button asChild={false}>
        <Link href="/explore" className="inline-flex items-center justify-center">
          Back to Explore
        </Link>
      </Button>
    </div>
  );
}
