import Link from "next/link";
import BookCover from "@/components/BookCover";
import SubscribeBlock from "@/components/SubscribeBlock";
import {
  EDITOR_ATTRIBUTION,
  EDITOR_QUOTE,
  KINDLE_PRICE,
  KINDLE_UNLIMITED_NOTE,
  KINDLE_URL,
} from "@/lib/book";
import { CATEGORY_LABELS, displayDate, getPublishedInsights, teaser } from "@/lib/insights";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Kyler Wakefield — Pulling the Thread",
  description:
    "Author of Pulling the Thread: Perception, Control, and the System Behind Everything. Writing, the book, and the Human Species Project.",
  path: "/",
});

export default async function Home() {
  const [latestInsight] = await getPublishedInsights(1);

  return (
    <div>
      <section className="mx-auto grid max-w-5xl gap-12 px-6 pt-20 pb-16 sm:pt-28 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <p className="mb-6 text-sm uppercase tracking-[0.2em] text-accent">
            Author &middot; Researcher &middot; The Human Species Project
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
            The most powerful forces in history are the ones no one notices
            until they fail.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            I&rsquo;m Kyler Wakefield. I write about the architecture of power
            and control — how it has operated across every empire, every era,
            and how it operates on all of us right now. My book,{" "}
            <em className="text-foreground not-italic font-medium whitespace-nowrap">
              Pulling the Thread
            </em>
            , is where that argument is laid out in full: sourced,
            documented, and built so you can see it for yourself.
          </p>
          <div className="mt-10 flex flex-wrap items-start gap-x-4 gap-y-4">
            <div>
              <a
                href={KINDLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                Read it on Kindle &mdash; {KINDLE_PRICE}
              </a>
              <p className="mt-2 pl-2 text-xs text-muted">
                {KINDLE_UNLIMITED_NOTE}.
              </p>
            </div>
            <Link
              href="/book"
              className="rounded-full border border-line px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
            >
              Print &amp; signed copies
            </Link>
            <Link
              href="/writing"
              className="py-3 text-sm text-muted transition-colors hover:text-accent"
            >
              Read the Writing &rarr;
            </Link>
          </div>
        </div>

        <Link href="/book" className="block transition-opacity hover:opacity-90">
          <BookCover priority />
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <blockquote className="border-l-2 border-accent pl-6">
          <p className="font-serif text-xl italic leading-snug text-foreground sm:text-2xl">
            &ldquo;{EDITOR_QUOTE}&rdquo;
          </p>
          <footer className="mt-3 text-sm text-muted">
            &mdash; {EDITOR_ATTRIBUTION}
          </footer>
        </blockquote>
      </section>

      <div className="thread-rule mx-auto max-w-5xl" />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <h2 className="font-serif text-xl">The Method</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              This book builds a picture. It does not tell you what to see in
              it. Every chapter lays out documented evidence and honest
              questions — then steps back. What you conclude belongs to you.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl">The Architecture</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Five tools appear consistently across every system of organized
              power in recorded history: Education, Finance, Religion, Media,
              and Law. Once you can see them, you see them everywhere.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl">The Human Species Project</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Ongoing writing and research beyond the book — dispatches,
              patterns, and the questions still being pulled apart, one
              thread at a time.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <SubscribeBlock heading="Follow The Human Species Project" />
      </section>

      {latestInsight && (
        <>
          <div className="thread-rule mx-auto max-w-5xl" />
          <section className="mx-auto max-w-5xl px-6 py-12">
            <Link
              href={`/insights/${latestInsight.slug}`}
              className="block rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-accent">
                Latest News &middot; {CATEGORY_LABELS[latestInsight.category]}
                {displayDate(latestInsight) && (
                  <span className="text-muted">
                    {" "}
                    &middot;{" "}
                    {new Date(displayDate(latestInsight)!).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" },
                    )}
                  </span>
                )}
              </p>
              <h2 className="mt-2 font-serif text-xl">{latestInsight.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {teaser(latestInsight)}
              </p>
              <span className="mt-3 inline-block text-sm text-accent">
                Read more &rarr;
              </span>
            </Link>
          </section>
        </>
      )}

      <div className="thread-rule mx-auto max-w-5xl" />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <blockquote className="border-l-2 border-accent pl-6 font-serif text-2xl leading-snug text-foreground">
          &ldquo;Before you are American or Russian, Democrat or Republican,
          rich or poor — you are human. That is the oldest truth there is.
          And it is the one the system has always needed you to
          forget.&rdquo;
        </blockquote>
        <p className="mt-4 text-sm text-muted">
          — from the Introduction,{" "}
          <em className="whitespace-nowrap">Pulling the Thread</em>
        </p>
      </section>
    </div>
  );
}
