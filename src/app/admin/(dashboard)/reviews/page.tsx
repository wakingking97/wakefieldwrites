import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { approveReview, rejectReview } from "./actions";

export const metadata: Metadata = { title: "Reviews" };

type Review = {
  id: number;
  name: string;
  role: string | null;
  review_text: string;
  approved: boolean;
  created_at: string;
};

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, name, role, review_text, approved, created_at")
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as Review[];
  const pendingCount = reviews.filter((r) => !r.approved).length;

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Reviews</h1>
      <p className="mt-2 text-sm text-muted">
        {pendingCount} pending &middot; {reviews.length - pendingCount} approved
      </p>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-muted">No reviews yet.</p>
        )}

        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`text-xs font-medium uppercase tracking-[0.15em] ${
                  review.approved ? "text-accent" : "text-muted"
                }`}
              >
                {review.approved ? "Approved" : "Pending"}
              </span>
              <span className="text-xs text-muted">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="mt-3 text-foreground">&ldquo;{review.review_text}&rdquo;</p>
            <p className="mt-2 text-sm text-muted">
              &mdash; {review.name}
              {review.role ? `, ${review.role}` : ""}
            </p>

            <div className="mt-4 flex gap-3">
              {!review.approved && (
                <form action={approveReview.bind(null, review.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90"
                  >
                    Approve
                  </button>
                </form>
              )}
              <form action={rejectReview.bind(null, review.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-line px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-red-400 hover:text-red-400"
                >
                  {review.approved ? "Delete" : "Reject"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
