import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projects | Kyler Wakefield",
  description: "Projects and work from Kyler Wakefield.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">About</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        Kyler Wakefield
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        {/* PLACEHOLDER BIO — replace with your own bio copy. */}
        Writer and researcher. Author of{" "}
        <em className="text-foreground not-italic font-medium">
          Pulling the Thread: Perception, Control, and the System Behind
          Everything
        </em>
        . This started as a question — is this actually what it looks like? —
        and turned into a documented argument about how power manages
        perception, and how to see it clearly.
      </p>

      <div className="thread-rule my-16" />

      <h2 className="font-serif text-2xl">Projects</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <Link
          href="/book"
          className="block rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h3 className="font-serif text-xl">Pulling the Thread</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            The book. Published June 2026. The full documented argument.
          </p>
        </Link>
        <Link
          href="/writing"
          className="block rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h3 className="font-serif text-xl">The Human Species Project</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Ongoing writing and research on Substack.
          </p>
        </Link>
      </div>

      <p className="mt-10 text-xs text-muted">
        {/* PLACEHOLDER: add more project cards here as you want to feature
        other work. */}
        More projects coming. This page is built to grow — new cards can be
        added here anytime.
      </p>
    </div>
  );
}
