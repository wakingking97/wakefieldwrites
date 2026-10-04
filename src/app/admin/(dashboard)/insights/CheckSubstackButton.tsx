"use client";

import { useActionState } from "react";
import type { DraftJobSummary } from "@/lib/insightsDraftJob";
import { checkSubstackNow } from "./actions";

export default function CheckSubstackButton() {
  const [summary, run, pending] = useActionState<DraftJobSummary | null>(
    () => checkSubstackNow(),
    null,
  );

  return (
    <div className="mt-6 rounded-lg border border-line bg-surface p-5">
      <form action={run} className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Checking Substack…" : "Check Substack now"}
        </button>
        <p className="text-xs text-muted">
          Drafts a teaser for any of the 3 newest posts that doesn&rsquo;t have one yet. Takes up to
          a minute or two.
        </p>
      </form>

      {summary && (
        <div className="mt-4 text-sm">
          {summary.error ? (
            <p className="text-red-400">Run failed: {summary.error}</p>
          ) : (
            <p className="text-foreground">
              Checked {summary.checked} &middot; drafted {summary.drafted} &middot; skipped{" "}
              {summary.skipped}
              {summary.drafted > 0 && " — reload the page to review the new draft."}
            </p>
          )}
          {summary.results.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {summary.results.map((r) => (
                <li key={r.url}>
                  <span className={r.outcome === "drafted" ? "text-accent" : ""}>
                    {r.outcome === "drafted" ? "Drafted" : "Skipped"}
                  </span>
                  : {r.title}
                  {r.reason ? ` (${r.reason})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
