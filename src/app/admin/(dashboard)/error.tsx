"use client";

// Catches anything an admin action throws that it didn't turn into a
// banner itself (for example an expired sign-in), instead of a blank page.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="rounded-lg border border-red-400 bg-surface p-5">
      <p className="text-sm font-medium text-red-400">That didn&rsquo;t go through.</p>
      <p className="mt-1 text-sm text-muted">
        {error.message || "Something went wrong."} If you were signed out, sign in again and retry.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-line px-4 py-2 text-xs text-foreground transition-colors hover:border-accent"
      >
        Try again
      </button>
    </div>
  );
}
