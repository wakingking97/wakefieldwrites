import { XMLParser } from "fast-xml-parser";

const FEED_URL = "https://thehumanspeciesproject.substack.com/feed";

export type HspArticle = {
  title: string;
  blurb: string | null;
  link: string;
  date: string; // ISO string
};

type RssItem = {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
};

// Fetched server-side only (Server Component), never from the client --
// Substack's feed changes roughly weekly, so an hour of caching keeps
// pages fast without ever needing a redeploy to pick up a new post.
export async function getHspArticles(): Promise<HspArticle[]> {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: true,
      cdataPropName: "__cdata",
    });
    const parsed = parser.parse(xml);

    const rawItems: RssItem[] = parsed?.rss?.channel?.item ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    return items
      .filter((item) => item?.title && item?.link)
      .map((item) => {
        const title = decodeEntities(extractText(item.title).trim());
        const blurb = item.description
          ? decodeEntities(extractText(item.description).trim())
          : null;
        const link = extractText(item.link).trim();
        const pubDate = item.pubDate ? extractText(item.pubDate) : null;
        const date = pubDate ? new Date(pubDate).toISOString() : new Date(0).toISOString();

        return { title, blurb: blurb || null, link, date };
      });
  } catch {
    return [];
  }
}

// fast-xml-parser returns CDATA content nested under __cdata; plain text
// nodes come through as-is. Handle both without assuming which one a
// given field used.
function extractText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "__cdata" in value) {
    const cdata = (value as { __cdata: unknown }).__cdata;
    return typeof cdata === "string" ? cdata : String(cdata ?? "");
  }
  return String(value ?? "");
}

// Substack embeds numeric/named HTML entities inside CDATA text (e.g. an
// em dash as "&#8212;"), which XML parsers correctly leave untouched
// since CDATA content is nominally literal -- decode the common ones
// ourselves so they don't render as raw entity codes on the page.
function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}
