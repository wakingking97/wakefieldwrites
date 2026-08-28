import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import PayPalButton from "@/components/PayPalButton";

export const metadata: Metadata = {
  title: "Pulling the Thread — The Book | Kyler Wakefield",
  description:
    "Pulling the Thread: Perception, Control, and the System Behind Everything, by Kyler Wakefield.",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">
        The Book
      </p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        Pulling the Thread
      </h1>
      <p className="mt-2 font-serif text-xl text-muted">
        Perception, Control, and the System Behind Everything
      </p>

      <div className="mt-12 grid gap-12 sm:grid-cols-[1.3fr_1fr]">
        <div>
          <BookCover priority />

          <div className="mt-8 space-y-6 text-base leading-8 text-muted">
            <p>
              <em className="text-foreground not-italic font-medium whitespace-nowrap">
                Pulling the Thread
              </em>{" "}
              is written for anyone willing to listen — a professor and a
              ranch hand should both be able to pick it up and be unable to
              put it down, not because it talks down to one or over the head
              of the other, but because truth and emotional honesty hit
              every human being the same way when they&rsquo;re delivered
              clearly enough.
            </p>
            <p>
              The book documents an architecture of power that has operated
              across every empire, every ruling class, and every system of
              organized power in recorded history — through five tools:{" "}
              <strong className="text-foreground">Education</strong>,{" "}
              <strong className="text-foreground">Finance</strong>,{" "}
              <strong className="text-foreground">Religion</strong>,{" "}
              <strong className="text-foreground">Media</strong>, and{" "}
              <strong className="text-foreground">Law</strong>. Every claim
              is sourced. Every pattern is documented. The book builds the
              picture; it does not tell you what to see in it.
            </p>
            <p>
              The final chapter before the conclusion returns those same
              five tools to the reader, pointed in a different direction:
              your attention, your money, your identity, your voice, and
              your community.
            </p>
            <p className="text-sm text-foreground">
              &mdash; Kyler Wakefield, from a hotel front desk in Santa Rosa,
              New Mexico, where much of this book was written live.
            </p>
          </div>
        </div>

        <div>
          <div className="rounded-lg border border-line bg-surface p-8">
            <p className="text-sm font-medium text-foreground">
              Available wherever you prefer to shop
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://www.amazon.com/dp/B0HFVXC1JC"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full border border-line px-5 py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-accent"
              >
                Amazon
              </a>
              <a
                href="https://www.barnesandnoble.com/w/pulling-the-thread-kyler-wakefield/1150213186?ean=9798256364335"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full border border-line px-5 py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-accent"
              >
                Barnes &amp; Noble
              </a>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-line bg-surface p-8">
            <p className="text-sm font-medium text-foreground">
              Prefer to support the author directly?
            </p>
            <p className="mt-1 font-serif text-lg text-foreground">
              Buy a signed copy from Kyler
            </p>
            <Image
              src="/images/kyler-signature.png"
              alt=""
              width={640}
              height={150}
              className="mt-3 h-auto w-40 opacity-90"
            />
            <p className="mt-3 text-sm leading-6 text-muted">
              Every copy ordered here is personally signed and ships
              directly from the author. Same book &mdash; you just
              can&rsquo;t get this one on Amazon.
            </p>
            <div className="mt-5">
              <PayPalButton />
            </div>
          </div>

          <Link
            href="/sample"
            className="mt-4 block rounded-full border border-line px-6 py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-accent"
          >
            Read a Sample
          </Link>
        </div>
      </div>
    </div>
  );
}
