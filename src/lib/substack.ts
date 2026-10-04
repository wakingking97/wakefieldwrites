// Server-only helpers for reading Kyler's Substack. Uses Substack's JSON
// API rather than /feed: the archive endpoint lists newest-first with the
// canonical URL, and /api/v1/posts/{slug} returns the full body HTML.

const SUBSTACK = "https://thehumanspeciesproject.substack.com";

export type SubstackPost = {
  title: string;
  slug: string;
  url: string;
  publishedAt: string;
  audience: string;
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    headers: { "User-Agent": "wakefieldwrites-insights-job" },
  });
  if (!res.ok) throw new Error(`Substack ${url} -> ${res.status}`);
  return (await res.json()) as T;
}

export async function getRecentPosts(limit = 3): Promise<SubstackPost[]> {
  const items = await getJson<
    Array<{
      title: string;
      slug: string;
      canonical_url: string;
      post_date: string;
      audience: string;
      type?: string;
    }>
  >(`${SUBSTACK}/api/v1/archive?sort=new&limit=${limit}`);

  return items
    .filter((p) => p.title && p.slug && p.canonical_url && (!p.type || p.type === "newsletter"))
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      url: p.canonical_url,
      publishedAt: p.post_date,
      audience: p.audience,
    }));
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  mdash: "—",
  ndash: "–",
  hellip: "…",
};

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|figure)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Plain-text body of a post, or null when it's empty / paywalled (we only
// ever see a teaser for those and shouldn't draft from it).
export async function getPostText(post: SubstackPost): Promise<string | null> {
  if (post.audience !== "everyone") return null;
  const data = await getJson<{ body_html?: string | null }>(
    `${SUBSTACK}/api/v1/posts/${encodeURIComponent(post.slug)}`,
  );
  if (!data.body_html) return null;
  const text = htmlToText(data.body_html);
  return text.length > 200 ? text : null;
}

// Normalize for dedupe: drop query/hash and any trailing slash.
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
