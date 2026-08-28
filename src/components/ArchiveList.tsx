"use client";

import { useMemo, useState } from "react";
import ShareButton from "./ShareButton";
import type { ArchiveArticle } from "./archiveArticles";

const SUBSTACK_URL = "https://humanspeciesproject.substack.com";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArchiveList({
  articles,
}: {
  articles: ArchiveArticle[];
}) {
  const [order, setOrder] = useState<"newest" | "oldest">("newest");

  const sorted = useMemo(() => {
    const copy = [...articles];
    copy.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return order === "newest" ? -diff : diff;
    });
    return copy;
  }, [articles, order]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {sorted.length} article{sorted.length === 1 ? "" : "s"}
        </p>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "newest" | "oldest")}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-foreground"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      <div className="mt-6 divide-y divide-line border-t border-line">
        {sorted.map((article) => (
          <article key={article.slug} className="flex flex-wrap items-start justify-between gap-4 py-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.15em] text-accent">
                {formatDate(article.date)}
              </p>
              <h2 className="mt-2 font-serif text-xl">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {article.blurb}
              </p>
            </div>
            <ShareButton
              title={article.title}
              text={article.blurb}
              url={SUBSTACK_URL}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
