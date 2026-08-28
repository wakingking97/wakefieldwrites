import type { Metadata } from "next";
import Link from "next/link";
import ArchiveList from "@/components/ArchiveList";
import { getHspArticles } from "@/lib/hspFeed";

export const metadata: Metadata = {
  title: "Archive — The Human Species Project | Kyler Wakefield",
  description:
    "Browse articles from The Human Species Project, sorted newest first.",
};

export default async function ArchivePage() {
  const articles = await getHspArticles();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">
        Archive
      </p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        The Full Record
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        Every article from The Human Species Project, browsable by date. New
        writing still goes out on Substack first — visit{" "}
        <Link href="/writing" className="text-accent hover:underline">
          Writing
        </Link>{" "}
        to read and subscribe there. This page is a richer, browsable
        companion to that page, not a replacement for it.
      </p>

      <div className="mt-12">
        {articles.length === 0 ? (
          <p className="text-sm text-muted">
            Couldn&rsquo;t load articles from Substack right now — try{" "}
            <Link href="/writing" className="text-accent hover:underline">
              reading on Substack
            </Link>{" "}
            directly instead.
          </p>
        ) : (
          <ArchiveList articles={articles} />
        )}
      </div>
    </div>
  );
}
