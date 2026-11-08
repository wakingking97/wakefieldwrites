"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { validateInsightInput } from "@/lib/insights";
import { runInsightsDraftJob, type DraftJobSummary } from "@/lib/insightsDraftJob";
import { setAdminFlash } from "@/lib/adminFlash";

// Server Actions bypass the proxy matcher, so each one re-checks auth
// itself (same pattern as reviews/actions.ts).
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

function refresh() {
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
  revalidatePath("/insights/[slug]", "page");
  revalidatePath("/");
}

// Shows the reason in the admin banner and reloads the page.
async function fail(message: string): Promise<never> {
  await setAdminFlash("error", message);
  redirect("/admin/insights");
}

function fields(formData: FormData) {
  return validateInsightInput(Object.fromEntries(formData));
}

// New manual draft.
export async function createDraft(formData: FormData) {
  const supabase = await requireAdmin();
  const result = fields(formData);
  if ("error" in result) return fail(result.error);

  const { error } = await supabase
    .from("insights")
    .insert({ ...result.value, status: "draft" });
  if (error) return fail(error.code === "23505" ? "That slug already exists" : error.message);
  refresh();
  await setAdminFlash("success", "Draft created.");
}

// Save edits without changing status.
export async function saveInsight(formData: FormData) {
  const supabase = await requireAdmin();
  const id = Number(formData.get("id"));
  const result = fields(formData);
  if ("error" in result) return fail(result.error);

  const { error } = await supabase.from("insights").update(result.value).eq("id", id);
  if (error) return fail(error.code === "23505" ? "That slug already exists" : error.message);
  refresh();
  await setAdminFlash("success", "Edits saved.");
}

// Save edits, then publish. published_at is only set the first time, so
// re-publishing an edited post doesn't reshuffle its date.
export async function publishInsight(formData: FormData) {
  const supabase = await requireAdmin();
  const id = Number(formData.get("id"));
  const result = fields(formData);
  if ("error" in result) return fail(result.error);

  const { data: existing } = await supabase
    .from("insights")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("insights")
    .update({
      ...result.value,
      status: "published",
      published_at: existing?.published_at ?? new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return fail(error.code === "23505" ? "That slug already exists" : error.message);
  refresh();
  await setAdminFlash("success", "Published. It's live on the News page.");
}

export async function deleteInsight(formData: FormData) {
  const supabase = await requireAdmin();
  const id = Number(formData.get("id"));
  const { error } = await supabase.from("insights").delete().eq("id", id);
  if (error) return fail(error.message);
  refresh();
  await setAdminFlash("success", "Deleted.");
}

// Manual trigger for the weekly Substack -> draft job. Calls the shared job
// function directly (not the cron URL), behind the same admin auth check.
export async function checkSubstackNow(): Promise<DraftJobSummary> {
  await requireAdmin();
  const summary = await runInsightsDraftJob();
  revalidatePath("/admin/insights");
  if (summary.error) {
    await setAdminFlash("error", `Substack check failed: ${summary.error}`);
  } else {
    await setAdminFlash(
      "success",
      summary.drafted > 0
        ? `Substack checked. ${summary.drafted} new draft${summary.drafted === 1 ? "" : "s"} ready to review.`
        : "Substack checked. Nothing new to draft.",
    );
  }
  return summary;
}
