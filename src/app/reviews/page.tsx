import type { Metadata } from "next";
import ReviewForm from "@/components/ReviewForm";
import { isSupabaseConfigured, supabase, type Review } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Reviews — Pulling the Thread | Kyler Wakefield",
  description:
    "Read what others thought of Pulling the Thread, then share your own experience.",
};

// Reviews are moderated in Supabase directly (no redeploy involved), so
// this page must fetch fresh on every request -- otherwise a newly
// approved review wouldn't appear until the next build/deploy.
export const dynamic = "force-dynamic";

async function getApprovedReviews(): Promise<Review[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, role, review_text, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">
        Reviews
      </p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        What Readers Are Saying
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        Read what others thought of the book, then share your own experience
        below.
      </p>

      <div className="mt-12 max-w-2xl space-y-10">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted">
            No reviews yet — be the first to share one below.
          </p>
        ) : (
          reviews.map((review) => (
            <blockquote
              key={review.id}
              className="border-l-2 border-accent pl-6"
            >
              <p className="font-serif text-xl leading-relaxed text-foreground">
                &ldquo;{review.review_text}&rdquo;
              </p>
              <footer className="mt-3 text-sm text-muted">
                &mdash; {review.name}
                {review.role ? `, ${review.role}` : ""}
              </footer>
            </blockquote>
          ))
        )}
      </div>

      <div className="thread-rule my-16 max-w-2xl" />

      <h2 className="font-serif text-2xl">Share Your Review</h2>

      {isSupabaseConfigured ? (
        <ReviewForm />
      ) : (
        <p className="mt-4 max-w-xl text-sm text-muted">
          Review submissions aren&rsquo;t configured yet — set
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in{" "}
          <code className="text-accent">.env.local</code>.
        </p>
      )}
    </div>
  );
}
