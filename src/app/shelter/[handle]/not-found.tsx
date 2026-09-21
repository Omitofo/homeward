import Link from "next/link";

export default function ShelterNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Shelter not found</h1>
      <p className="max-w-sm text-muted">
        This profile may have moved or the handle is incorrect.
      </p>
      <Link
        href="/explore"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Back to Explore
      </Link>
    </div>
  );
}
