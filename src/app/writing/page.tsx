import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing — The Human Species Project | Kyler Wakefield",
  description:
    "Ongoing writing from Kyler Wakefield via the Human Species Project on Substack.",
};

// PLACEHOLDER: replace with your actual Substack URL.
const SUBSTACK_URL = "https://humanspeciesproject.substack.com";

export default function WritingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">
        Writing
      </p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        The Human Species Project
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        The book is where the full argument is laid out. The Human Species
        Project is where the thread keeps getting pulled — ongoing dispatches,
        patterns, and questions, published on Substack.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href={SUBSTACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Read on Substack
        </a>
        <a
          href={`${SUBSTACK_URL}/subscribe`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
        >
          Subscribe
        </a>
      </div>

      {SUBSTACK_URL.includes("PLACEHOLDER") && (
        <p className="mt-6 text-xs text-muted">
          Note for Kyler: set the real Substack URL in{" "}
          <code className="text-accent">src/app/writing/page.tsx</code>.
        </p>
      )}

      <div className="thread-rule my-16" />

      <div className="max-w-2xl">
        <h2 className="font-serif text-2xl">Why it&rsquo;s on Substack</h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Substack is where new writing goes out first, to people who&rsquo;ve
          chosen to follow it directly. This page just points you there. If
          you want a native archive built into this site later, that&rsquo;s
          a straightforward addition — this link-out is the fast version to
          get the site back up.
        </p>
      </div>
    </div>
  );
}
