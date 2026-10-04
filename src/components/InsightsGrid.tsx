"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_FILTER_LABELS,
  CATEGORY_LABELS,
  type InsightCategory,
} from "@/lib/insightCategories";

export type InsightCard = {
  id: number;
  slug: string;
  title: string;
  meta_description: string;
  category: InsightCategory;
  published_at: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function InsightsGrid({ insights }: { insights: InsightCard[] }) {
  const [filter, setFilter] = useState<InsightCategory | "all">("all");

  // Only offer filters for categories that actually have posts.
  const present = CATEGORIES.filter((c) => insights.some((i) => i.category === c));
  const visible = filter === "all" ? insights : insights.filter((i) => i.category === filter);

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? "border-accent text-accent"
        : "border-line text-muted hover:border-accent hover:text-foreground"
    }`;

  return (
    <div>
      {present.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button type="button" onClick={() => setFilter("all")} className={pill(filter === "all")}>
            All
          </button>
          {present.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={pill(filter === c)}
            >
              {CATEGORY_FILTER_LABELS[c]}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {visible.map((insight) => (
          <article
            key={insight.id}
            className="rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-accent">
              {CATEGORY_LABELS[insight.category]}
              {insight.published_at && (
                <span className="text-muted"> &middot; {formatDate(insight.published_at)}</span>
              )}
            </p>
            <h2 className="mt-2 font-serif text-xl">
              <Link href={`/insights/${insight.slug}`} className="hover:text-accent">
                {insight.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">{insight.meta_description}</p>
            <Link
              href={`/insights/${insight.slug}`}
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              Read more &rarr;
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
