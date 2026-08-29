import Link from "next/link";
import FlipbookViewer from "@/components/FlipbookViewer";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Read a Sample — Pulling the Thread | Kyler Wakefield",
  description:
    "Read the front matter of Pulling the Thread: Perception, Control, and the System Behind Everything, by Kyler Wakefield — free, before you buy.",
  path: "/sample",
});

export default function SamplePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">
        Read a Sample
      </p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        Pulling the Thread
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        The front matter — About This Book, the Dedication, the Epigraph,
        the Thesis, the Introduction, and the opening of Part One — exactly
        as it appears in the book. Flip through it below, or swipe on
        mobile.
      </p>

      <div className="mt-12">
        <FlipbookViewer />
      </div>

      <div className="thread-rule mx-auto mt-16 max-w-3xl" />

      <div className="mx-auto mt-16 max-w-2xl rounded-lg border border-line bg-surface p-10 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">
          That&rsquo;s the sample
        </p>
        <h2 className="mt-4 font-serif text-2xl sm:text-3xl">
          The rest of the argument is in the book.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Part One continues from here, moving from the global scale down to
          how the same architecture operates on you personally — and the
          final chapter hands the five tools back to you.
        </p>
        <Link
          href="/book"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Get the Book
        </Link>
      </div>
    </div>
  );
}
