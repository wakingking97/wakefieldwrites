import Image from "next/image";
import ArchiveList from "@/components/ArchiveList";
import SubstackEmbed from "@/components/SubstackEmbed";
import { getHspArticles } from "@/lib/hspFeed";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Writing — The Human Species Project | Kyler Wakefield",
  description:
    "Ongoing writing from Kyler Wakefield via the Human Species Project on Substack, with the full archive of articles, newest first.",
  path: "/writing",
});

const SUBSTACK_URL = "https://thehumanspeciesproject.substack.com";

export default async function WritingPage() {
  const articles = await getHspArticles();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center gap-5">
        <Image
          src="/images/hsp-icon.png"
          alt="The Human Species Project"
          width={240}
          height={218}
          className="h-[72px] w-[72px] rounded-full border border-line object-cover"
        />
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent">
            Writing
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-tight sm:text-5xl">
            The Human Species Project
          </h1>
        </div>
      </div>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        The book is where the full argument is laid out. The Human Species
        Project is where the thread keeps getting pulled — ongoing dispatches,
        patterns, and questions, published on Substack.
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        New pieces go out on Substack first. Subscribe there to get them by
        email, or browse everything below.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
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

      <div className="mt-10">
        <SubstackEmbed />
      </div>

      <div className="thread-rule my-16" />

      <section id="archive" className="scroll-mt-8">
        <h2 className="font-serif text-3xl">The Full Archive</h2>
        <div className="mt-8">
          {articles.length === 0 ? (
            <p className="text-sm text-muted">
              Couldn&rsquo;t load articles right now — you can read them
              directly on{" "}
              <a
                href="https://thehumanspeciesproject.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Substack
              </a>
              .
            </p>
          ) : (
            <ArchiveList articles={articles} />
          )}
        </div>
      </section>
    </div>
  );
}
