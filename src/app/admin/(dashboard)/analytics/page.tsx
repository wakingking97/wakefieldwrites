import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

const VERCEL_ANALYTICS_URL =
  "https://vercel.com/kyler-wakefields-projects/wakefieldwrites/analytics";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Analytics</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Site traffic is tracked with Vercel Analytics — page views, top
        pages, and visitor counts over time. Vercel&rsquo;s own dashboard
        already renders all of that, so rather than rebuild it here, this
        just links straight to it. It requires your Vercel login, so
        it&rsquo;s access-controlled the same way this admin section is.
      </p>
      <a
        href={VERCEL_ANALYTICS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
      >
        Open Vercel Analytics &rarr;
      </a>
    </div>
  );
}
