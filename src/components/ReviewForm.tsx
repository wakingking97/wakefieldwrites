"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReviewForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setStatus("submitting");

    // No .select() chained after insert -- the RLS policy that keeps
    // unapproved reviews private also blocks reading the row straight
    // back after inserting it (verified directly against the live
    // project before writing this), so we just check for an error and
    // confirm using the values already in the form, not a DB round-trip.
    const { error } = await supabase.from("reviews").insert({
      name,
      role: role.trim() === "" ? null : role,
      review_text: reviewText,
    });

    if (error) {
      setStatus("error");
      return;
    }

    setStatus("done");
    setName("");
    setRole("");
    setReviewText("");
  };

  if (status === "done") {
    return (
      <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-sm text-muted">
        <p className="font-medium text-foreground">
          Thank you for sharing your review.
        </p>
        <p className="mt-2">
          It&rsquo;s been submitted and will appear here once it&rsquo;s
          reviewed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
      <div>
        <label
          htmlFor="review-name"
          className="block text-sm font-medium text-foreground"
        >
          Your Name
        </label>
        <input
          id="review-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-surface px-4 py-2.5 text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="review-role"
          className="block text-sm font-medium text-foreground"
        >
          Title / Role{" "}
          <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="review-role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Reader, Educator, Book Club Member..."
          className="mt-2 w-full rounded-md border border-line bg-surface px-4 py-2.5 text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="review-text"
          className="block text-sm font-medium text-foreground"
        >
          Your Review
        </label>
        <textarea
          id="review-text"
          required
          rows={5}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-surface px-4 py-2.5 text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">
          Something went wrong submitting your review. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
