import { supabase } from "@/lib/supabase";

export type Insight = {
  id: number;
  created_at: string;
  slug: string;
  title: string;
  hook_content: string;
  keywords: string[];
  meta_description: string;
  substack_url: string;
  substack_title: string;
  status: "draft" | "published";
  published_at: string | null;
};

export const INSIGHT_COLUMNS =
  "id, created_at, slug, title, hook_content, keywords, meta_description, substack_url, substack_title, status, published_at";

// Public reads use the anon client. RLS already limits anon to
// status = 'published'; the explicit .eq() is a second guard so a policy
// mistake can never leak a draft through these pages.
export async function getPublishedInsights(limit?: number): Promise<Insight[]> {
  if (!supabase) return [];
  let query = supabase
    .from("insights")
    .select(INSIGHT_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error("getPublishedInsights failed", error);
    return [];
  }
  return (data ?? []) as Insight[];
}

export async function getPublishedInsight(slug: string): Promise<Insight | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("insights")
    .select(INSIGHT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    console.error("getPublishedInsight failed", error);
    return null;
  }
  return (data as Insight | null) ?? null;
}

export function teaser(insight: Pick<Insight, "meta_description">): string {
  return insight.meta_description;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export function parseKeywords(value: unknown): string[] {
  const parts = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return [
    ...new Set(
      parts
        .filter((p): p is string => typeof p === "string")
        .map((p) => p.trim())
        .filter(Boolean),
    ),
  ];
}

export type InsightInput = {
  slug: string;
  title: string;
  hook_content: string;
  keywords: string[];
  meta_description: string;
  substack_url: string;
  substack_title: string;
};

const REQUIRED = [
  "title",
  "hook_content",
  "meta_description",
  "substack_url",
  "substack_title",
] as const;

// Shared by the admin form and the machine endpoint so both enforce the
// same rules. Returns an error message, or the cleaned input.
export function validateInsightInput(
  raw: Record<string, unknown>,
): { error: string } | { value: InsightInput } {
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");

  const missing = REQUIRED.filter((k) => !str(k));
  if (missing.length) return { error: `Missing required field(s): ${missing.join(", ")}` };

  const slug = slugify(str("slug") || str("title"));
  if (!slug) return { error: "Could not derive a valid slug" };

  let url: URL;
  try {
    url = new URL(str("substack_url"));
  } catch {
    return { error: "substack_url must be a valid URL" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { error: "substack_url must be an http(s) URL" };
  }

  return {
    value: {
      slug,
      title: str("title"),
      hook_content: str("hook_content"),
      keywords: parseKeywords(raw.keywords),
      meta_description: str("meta_description"),
      substack_url: url.toString(),
      substack_title: str("substack_title"),
    },
  };
}
