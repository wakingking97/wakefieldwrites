import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28">
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
          <em className="text-foreground not-italic font-medium">
            Pulling the Thread
          </em>
          , is where that argument is laid out in full: sourced, documented,
          and built so you can see it for yourself.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/book"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Get the Book
          </Link>
          <Link
            href="/writing"
            className="rounded-full border border-line px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
          >
            Read the Writing
          </Link>
        </div>
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

      <div className="thread-rule mx-auto max-w-5xl" />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <blockquote className="border-l-2 border-accent pl-6 font-serif text-2xl leading-snug text-foreground">
          &ldquo;Before you are American or Russian, Democrat or Republican,
          rich or poor — you are human. That is the oldest truth there is.
          And it is the one the system has always needed you to
          forget.&rdquo;
        </blockquote>
        <p className="mt-4 text-sm text-muted">
          — from the Introduction, <em>Pulling the Thread</em>
        </p>
      </section>
    </div>
  );
}
