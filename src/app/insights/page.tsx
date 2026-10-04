import Link from "next/link";
import { getPublishedInsights, teaser } from "@/lib/insights";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Insights — Kyler Wakefield",
  description:
    "Short reads on power, control, and the systems shaping everyday life — drawn from The Human Species Project and the book Pulling the Thread.",
  path: "/insights",
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function InsightsPage() {
  const insights = await getPublishedInsights();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">Insights</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        Short Reads
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        A short angle on each week&rsquo;s piece from The Human Species
        Project, with a link to the full article. The full argument lives in{" "}
        <Link href="/book" className="text-accent hover:underline">
          the book
        </Link>
        .
      </p>

      <div className="mt-12">
        {insights.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing here yet — new insights are added weekly. In the meantime,
            browse the{" "}
            <Link href="/archive" className="text-accent hover:underline">
              archive
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {insights.map((insight) => (
              <article
                key={insight.id}
                className="rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
              >
                {insight.published_at && (
                  <p className="text-xs uppercase tracking-[0.15em] text-accent">
                    {formatDate(insight.published_at)}
                  </p>
                )}
                <h2 className="mt-2 font-serif text-xl">
                  <Link href={`/insights/${insight.slug}`} className="hover:text-accent">
                    {insight.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">{teaser(insight)}</p>
                <Link
                  href={`/insights/${insight.slug}`}
                  className="mt-4 inline-block text-sm text-accent hover:underline"
                >
                  Read more &rarr;
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
