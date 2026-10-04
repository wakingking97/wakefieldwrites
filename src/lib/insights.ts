import { supabase } from "@/lib/supabase";

import { CATEGORIES, type InsightCategory } from "@/lib/insightCategories";

export { CATEGORIES, CATEGORY_LABELS, CATEGORY_FILTER_LABELS } from "@/lib/insightCategories";
export type { InsightCategory } from "@/lib/insightCategories";

export type Insight = {
  id: number;
  created_at: string;
  slug: string;
  title: string;
  hook_content: string;
  keywords: string[];
  meta_description: string;
  substack_url: string | null;
  substack_title: string | null;
  category: InsightCategory;
  status: "draft" | "published";
  published_at: string | null;
};

export const INSIGHT_COLUMNS =
  "id, created_at, slug, title, hook_content, keywords, meta_description, substack_url, substack_title, category, status, published_at";

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

// A string is either one-keyword-per-line (admin form -- keywords may
// themselves contain commas, e.g. "$5,000 check") or, for the API's
// convenience, a single comma-separated line. An array is used as-is.
export function parseKeywords(value: unknown): string[] {
  const parts: unknown[] = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? /[\r\n]/.test(value)
        ? value.split(/\r?\n/)
        : value.split(",")
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
  substack_url: string | null;
  substack_title: string | null;
  category: InsightCategory;
};

// Shared by the admin form, the machine endpoint and the weekly job so all
// three enforce the same rules. Returns an error message, or the cleaned
// input. A missing category means "substack" (the original payload shape).
export function validateInsightInput(
  raw: Record<string, unknown>,
): { error: string } | { value: InsightInput } {
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");

  const category = (str("category") || "substack") as InsightCategory;
  if (!CATEGORIES.includes(category)) {
    return { error: `category must be one of: ${CATEGORIES.join(", ")}` };
  }

  const required = ["title", "hook_content", "meta_description"];
  if (category === "substack") required.push("substack_url", "substack_title");
  const missing = required.filter((k) => !str(k));
  if (missing.length) return { error: `Missing required field(s): ${missing.join(", ")}` };

  const slug = slugify(str("slug") || str("title"));
  if (!slug) return { error: "Could not derive a valid slug" };

  let substackUrl: string | null = null;
  if (str("substack_url")) {
    let url: URL;
    try {
      url = new URL(str("substack_url"));
    } catch {
      return { error: "substack_url must be a valid URL" };
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { error: "substack_url must be an http(s) URL" };
    }
    substackUrl = url.toString();
  }

  return {
    value: {
      slug,
      title: str("title"),
      hook_content: str("hook_content").replace(/\r\n/g, "\n"),
      keywords: parseKeywords(raw.keywords),
      meta_description: str("meta_description"),
      substack_url: substackUrl,
      substack_title: str("substack_title") || null,
      category,
    },
  };
}
