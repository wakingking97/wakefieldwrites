import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import InsightBody from "@/components/InsightBody";
import { CATEGORY_LABELS, getPublishedInsight } from "@/lib/insights";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getPublishedInsight(slug);
  if (!insight) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    title: `${insight.title} | Kyler Wakefield`,
    description: insight.meta_description,
    path: `/insights/${insight.slug}`,
    keywords: insight.keywords,
  });
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const insight = await getPublishedInsight(slug);
  if (!insight) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/insights" className="text-sm text-accent hover:underline">
        &larr; All insights
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.15em] text-accent">
        {CATEGORY_LABELS[insight.category]}
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
        {insight.title}
      </h1>
      {insight.published_at && (
        <p className="mt-4 text-sm text-muted">
          {new Date(insight.published_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      <div className="mt-10">
        <InsightBody content={insight.hook_content} />
      </div>

      <div className="mt-14 flex flex-wrap gap-4 border-t border-line pt-8">
        {insight.substack_url && (
          <a
            href={insight.substack_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Read the full piece on The Human Species Project
          </a>
        )}
        <Link
          href="/book"
          className={
            insight.substack_url
              ? "rounded-full border border-line px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
              : "rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
          }
        >
          Get the book: Pulling the Thread
        </Link>
      </div>
    </article>
  );
}
