import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import {
  CATEGORIES,
  CATEGORY_FILTER_LABELS,
  CATEGORY_LABELS,
  INSIGHT_COLUMNS,
  displayDate,
  type Insight,
  type InsightCategory,
} from "@/lib/insights";
import CheckSubstackButton from "./CheckSubstackButton";
import { createDraft, deleteInsight, publishInsight, saveInsight } from "./actions";

export const metadata: Metadata = { title: "Insights" };

// "Check Substack now" runs the AI drafting job inside this route's action.
export const maxDuration = 300;

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground";
const labelClass = "block text-xs uppercase tracking-[0.15em] text-muted";

function Fields({
  insight,
  defaultCategory = "substack",
}: {
  insight?: Insight;
  defaultCategory?: InsightCategory;
}) {
  return (
    <div className="grid gap-4">
      <label className={labelClass}>
        Category
        <select
          name="category"
          defaultValue={insight?.category ?? defaultCategory}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_FILTER_LABELS[c]} — {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Title
        <input name="title" required defaultValue={insight?.title} className={inputClass} />
      </label>
      <label className={labelClass}>
        Slug (blank = generated from title)
        <input name="slug" defaultValue={insight?.slug} className={inputClass} />
      </label>
      <label className={labelClass}>
        Content (blank line = new paragraph; &quot;## &quot; = subheading)
        <textarea
          name="hook_content"
          required
          rows={12}
          defaultValue={insight?.hook_content}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Keywords (one per line)
        <textarea
          name="keywords"
          rows={5}
          defaultValue={insight?.keywords.join(String.fromCharCode(10))}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Meta description
        <textarea
          name="meta_description"
          required
          rows={2}
          defaultValue={insight?.meta_description}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Substack URL (required for Substack posts)
        <input
          name="substack_url"
          type="url"
          defaultValue={insight?.substack_url ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Substack title (required for Substack posts)
        <input
          name="substack_title"
          defaultValue={insight?.substack_title ?? ""}
          className={inputClass}
        />
      </label>
    </div>
  );
}

const primaryBtn =
  "rounded-full bg-accent px-4 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90";
const secondaryBtn =
  "rounded-full border border-line px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent";
const dangerBtn =
  "rounded-full border border-line px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-red-400 hover:text-red-400";

function InsightCard({ insight }: { insight: Insight }) {
  const published = insight.status === "published";
  return (
    <form className="rounded-lg border border-line bg-surface p-5">
      <input type="hidden" name="id" value={insight.id} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className={`text-xs font-medium uppercase tracking-[0.15em] ${
            published ? "text-accent" : "text-muted"
          }`}
        >
          {published ? "Published" : "Draft"} &middot; {CATEGORY_LABELS[insight.category]}
        </span>
        <span className="text-xs text-muted">
          {insight.source_published_at && (
            <>Source post: {new Date(insight.source_published_at).toLocaleDateString()} &middot; </>
          )}
          {published ? "Published" : "Created"}{" "}
          {new Date(insight.published_at ?? insight.created_at).toLocaleDateString()}
        </span>
      </div>
      <Fields insight={insight} />
      <div className="mt-5 flex flex-wrap gap-3">
        {!published && (
          <button formAction={publishInsight} className={primaryBtn}>
            Publish
          </button>
        )}
        <button formAction={saveInsight} className={secondaryBtn}>
          Save edits
        </button>
        {published && (
          <a href={`/insights/${insight.slug}`} className={secondaryBtn}>
            View page
          </a>
        )}
        <button formAction={deleteInsight} formNoValidate className={dangerBtn}>
          Delete
        </button>
      </div>
    </form>
  );
}

export default async function AdminInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("insights")
    .select(INSIGHT_COLUMNS)
    .order("created_at", { ascending: false });

  const all = (data ?? []) as Insight[];
  const drafts = all.filter((i) => i.status === "draft");
  const published = all
    .filter((i) => i.status === "published")
    .sort(
      (a, b) =>
        new Date(displayDate(b) ?? 0).getTime() - new Date(displayDate(a) ?? 0).getTime(),
    );

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Insights</h1>
      <p className="mt-2 text-sm text-muted">
        {drafts.length} pending &middot; {published.length} published
      </p>

      <CheckSubstackButton />

      {error && (
        <p className="mt-4 rounded-md border border-red-400 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <h2 className="mt-10 font-serif text-xl text-foreground">Pending Review</h2>
      <div className="mt-4 space-y-4">
        {drafts.length === 0 && <p className="text-sm text-muted">No drafts waiting.</p>}
        {drafts.map((i) => (
          <InsightCard key={i.id} insight={i} />
        ))}
      </div>

      <h2 className="mt-12 font-serif text-xl text-foreground">Published</h2>
      <div className="mt-4 space-y-4">
        {published.length === 0 && <p className="text-sm text-muted">Nothing published yet.</p>}
        {published.map((i) => (
          <InsightCard key={i.id} insight={i} />
        ))}
      </div>

      <h2 className="mt-12 font-serif text-xl text-foreground">New Draft</h2>
      <p className="mt-1 text-sm text-muted">
        Manual fallback if the weekly automated submission is down.
      </p>
      <form action={createDraft} className="mt-4 rounded-lg border border-line bg-surface p-5">
        <Fields defaultCategory="author" />
        <div className="mt-5">
          <button type="submit" className={primaryBtn}>
            Create draft
          </button>
        </div>
      </form>
    </div>
  );
}
