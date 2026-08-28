import type { Metadata } from "next";
import Link from "next/link";
import ArchiveList from "@/components/ArchiveList";
import { ARCHIVE_ARTICLES } from "@/components/archiveArticles";

export const metadata: Metadata = {
  title: "Archive — The Human Species Project | Kyler Wakefield",
  description:
    "Browse articles from The Human Species Project, sorted newest first.",
};

export default function ArchivePage() {
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

      <div className="mt-6 rounded-lg border border-dashed border-line bg-surface p-4 text-sm text-muted">
        <strong className="text-foreground">Example data below.</strong>{" "}
        These articles aren&rsquo;t pulled from a live feed yet — they&rsquo;re
        placeholder entries showing how this page will look once real
        articles are added (manually or via an RSS pull from Substack).
      </div>

      <div className="mt-12">
        <ArchiveList articles={ARCHIVE_ARTICLES} />
      </div>
    </div>
  );
}
