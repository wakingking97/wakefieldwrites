import Anthropic from "@anthropic-ai/sdk";
import { validateInsightInput } from "@/lib/insights";
import { buildUserMessage, INSIGHTS_SYSTEM_PROMPT } from "@/lib/insightsPrompt";
import { getPostText, getRecentPosts, normalizeUrl, type SubstackPost } from "@/lib/substack";
import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase-service";

// Shared by the cron route and the admin "Check Substack now" button, so
// both run exactly the same logic. Server-only (reads ANTHROPIC_API_KEY2 and
// uses the service-role Supabase client).

// Current Sonnet (Sonnet 5.5). Web search type from Anthropic's server-tool
// docs: web_search_20260209 (dynamic filtering), supported on Sonnet 5.5.
const MODEL = "claude-sonnet-5-5";
const WEB_SEARCH_TOOL = { type: "web_search_20260209", name: "web_search", max_uses: 5 } as const;
const POSTS_TO_CHECK = 3;
const MAX_CONTINUATIONS = 3;
// Hobby plan functions max out at 300s. Don't start another post once we've
// used this much, so the run ends cleanly instead of being killed mid-call.
const TIME_BUDGET_MS = 180_000;

export type PostResult = {
  title: string;
  url: string;
  outcome: "drafted" | "skipped";
  reason?: string;
  slug?: string;
};

export type DraftJobSummary = {
  ok: boolean;
  checked: number;
  drafted: number;
  skipped: number;
  results: PostResult[];
  error?: string;
};

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    hook_content: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    meta_description: { type: "string" },
  },
  required: ["title", "slug", "hook_content", "keywords", "meta_description"],
  additionalProperties: false,
} as const;

async function generateDraft(client: Anthropic, post: SubstackPost, text: string) {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: buildUserMessage({
        title: post.title,
        url: post.url,
        date: post.publishedAt.slice(0, 10),
        text,
      }),
    },
  ];

  const request = (useSchema: boolean) => async () => {
    let response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: INSIGHTS_SYSTEM_PROMPT,
      tools: [WEB_SEARCH_TOOL],
      messages,
      output_config: {
        effort: "medium",
        ...(useSchema ? { format: { type: "json_schema", schema: OUTPUT_SCHEMA } } : {}),
      },
    });
    // Server-side tool loops can pause; resume by sending the paused turn back.
    for (let i = 0; i < MAX_CONTINUATIONS && response.stop_reason === "pause_turn"; i++) {
      messages.push({ role: "assistant", content: response.content });
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: INSIGHTS_SYSTEM_PROMPT,
        tools: [WEB_SEARCH_TOOL],
        messages,
        output_config: {
          effort: "medium",
          ...(useSchema ? { format: { type: "json_schema", schema: OUTPUT_SCHEMA } } : {}),
        },
      });
    }
    return response;
  };

  let response: Anthropic.Message;
  try {
    response = await request(true)();
  } catch (err) {
    // If the API rejects structured output combined with web search, retry
    // once asking for bare JSON in the prompt instead (still validated).
    if (err instanceof Anthropic.BadRequestError && /output|format|schema|citation/i.test(err.message)) {
      console.warn("insights job: structured output rejected, retrying with prompt-only JSON", err.message);
      messages.length = 1;
      messages[0] = {
        role: "user",
        content: `${messages[0].content as string}\n\nReturn ONLY a JSON object with keys title, slug, hook_content, keywords (array of strings), meta_description. No other text.`,
      };
      response = await request(false)();
    } else {
      throw err;
    }
  }

  if (response.stop_reason === "refusal") throw new Error("model refused");
  if (response.stop_reason === "max_tokens") throw new Error("model output cut off (max_tokens)");
  if (response.stop_reason === "pause_turn") throw new Error("still paused after continuations");

  const text_ = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  const start = text_.indexOf("{");
  const end = text_.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON in model output");
  return JSON.parse(text_.slice(start, end + 1)) as Record<string, unknown>;
}

export async function runInsightsDraftJob(): Promise<DraftJobSummary> {
  const started = Date.now();
  const results: PostResult[] = [];
  const summarize = (extra: Partial<DraftJobSummary> = {}): DraftJobSummary => {
    const summary: DraftJobSummary = {
      ok: true,
      checked: results.length,
      drafted: results.filter((r) => r.outcome === "drafted").length,
      skipped: results.filter((r) => r.outcome === "skipped").length,
      results,
      ...extra,
    };
    console.log("insights-draft job:", JSON.stringify(summary));
    return summary;
  };

  if (!isSupabaseServiceConfigured) return summarize({ ok: false, error: "Supabase service role not configured" });
  if (!process.env.ANTHROPIC_API_KEY2) return summarize({ ok: false, error: "ANTHROPIC_API_KEY2 not configured" });

  let posts: SubstackPost[];
  try {
    posts = await getRecentPosts(POSTS_TO_CHECK);
  } catch (err) {
    console.error("insights-draft job: Substack archive fetch failed", err);
    return summarize({ ok: false, error: "could not fetch Substack archive" });
  }

  const supabase = createServiceClient();
  // Explicit key: the SDK would otherwise read ANTHROPIC_API_KEY, which is Korale's key.
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY2 });

  const existing = async () => {
    const { data, error } = await supabase.from("insights").select("substack_url").not("substack_url", "is", null);
    if (error) throw error;
    return new Set((data ?? []).map((r) => normalizeUrl(r.substack_url as string)));
  };

  let known: Set<string>;
  try {
    known = await existing();
  } catch (err) {
    console.error("insights-draft job: could not read existing insights", err);
    return summarize({ ok: false, error: "could not read existing insights" });
  }

  for (const post of posts) {
    const skip = (reason: string) => {
      results.push({ title: post.title, url: post.url, outcome: "skipped", reason });
    };

    if (known.has(normalizeUrl(post.url))) {
      skip("already has an insight (draft or published)");
      continue;
    }
    if (Date.now() - started > TIME_BUDGET_MS) {
      skip("deferred: time budget used up (will be picked up next run)");
      continue;
    }

    try {
      const text = await getPostText(post);
      if (!text) {
        skip(post.audience !== "everyone" ? "paywalled post" : "empty body");
        continue;
      }

      const draft = await generateDraft(client, post, text);
      const validated = validateInsightInput({
        ...draft,
        category: "substack",
        substack_url: post.url, // from Substack, never from the model
        substack_title: post.title,
      });
      if ("error" in validated) {
        console.error("insights-draft job: validation failed", post.url, validated.error);
        skip(`model output failed validation: ${validated.error}`);
        continue;
      }

      // Re-check right before insert in case a concurrent run got there first.
      known = await existing();
      if (known.has(normalizeUrl(post.url))) {
        skip("already has an insight (concurrent run)");
        continue;
      }

      const { data, error } = await supabase
        .from("insights")
        .insert({ ...validated.value, status: "draft" })
        .select("slug")
        .single();
      if (error) {
        skip(error.code === "23505" ? `slug already exists: ${validated.value.slug}` : `insert failed: ${error.message}`);
        continue;
      }
      known.add(normalizeUrl(post.url));
      results.push({ title: post.title, url: post.url, outcome: "drafted", slug: data.slug });
    } catch (err) {
      console.error("insights-draft job: post failed", post.url, err);
      skip(`error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return summarize();
}
