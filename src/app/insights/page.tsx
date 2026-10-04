import Link from "next/link";
import InsightsGrid from "@/components/InsightsGrid";
import { getPublishedInsights } from "@/lib/insights";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Insights — Kyler Wakefield",
  description:
    "News and short reads from Kyler Wakefield: angles on each new Human Species Project piece, updates on the book Pulling the Thread, and notes on the work behind it.",
  path: "/insights",
});

export default async function InsightsPage() {
  const insights = await getPublishedInsights();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">Insights</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        News &amp; Short Reads
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        Short reads and news from me: a quick angle on each new Human Species
        Project piece, plus updates on the book and on the work behind it. The
        full argument lives in{" "}
        <Link href="/book" className="text-accent hover:underline">
          the book
        </Link>
        .
      </p>

      <div className="mt-12">
        {insights.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing here yet — new posts are added regularly. In the meantime,
            browse the{" "}
            <Link href="/archive" className="text-accent hover:underline">
              archive
            </Link>
            .
          </p>
        ) : (
          <InsightsGrid
            insights={insights.map((i) => ({
              id: i.id,
              slug: i.slug,
              title: i.title,
              meta_description: i.meta_description,
              category: i.category,
              published_at: i.published_at,
            }))}
          />
        )}
      </div>
    </div>
  );
}
