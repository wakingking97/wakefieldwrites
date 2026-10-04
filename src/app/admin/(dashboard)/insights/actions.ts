"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { validateInsightInput } from "@/lib/insights";

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

function fail(message: string): never {
  redirect(`/admin/insights?error=${encodeURIComponent(message)}`);
}

function fields(formData: FormData) {
  return validateInsightInput(Object.fromEntries(formData));
}

// New manual draft.
export async function createDraft(formData: FormData) {
  const supabase = await requireAdmin();
  const result = fields(formData);
  if ("error" in result) fail(result.error);

  const { error } = await supabase
    .from("insights")
    .insert({ ...result.value, status: "draft" });
  if (error) fail(error.code === "23505" ? "That slug already exists" : error.message);
  refresh();
}

// Save edits without changing status.
export async function saveInsight(formData: FormData) {
  const supabase = await requireAdmin();
  const id = Number(formData.get("id"));
  const result = fields(formData);
  if ("error" in result) fail(result.error);

  const { error } = await supabase.from("insights").update(result.value).eq("id", id);
  if (error) fail(error.code === "23505" ? "That slug already exists" : error.message);
  refresh();
}

// Save edits, then publish. published_at is only set the first time, so
// re-publishing an edited post doesn't reshuffle its date.
export async function publishInsight(formData: FormData) {
  const supabase = await requireAdmin();
  const id = Number(formData.get("id"));
  const result = fields(formData);
  if ("error" in result) fail(result.error);

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
  if (error) fail(error.code === "23505" ? "That slug already exists" : error.message);
  refresh();
}

export async function deleteInsight(formData: FormData) {
  const supabase = await requireAdmin();
  const id = Number(formData.get("id"));
  const { error } = await supabase.from("insights").delete().eq("id", id);
  if (error) fail(error.message);
  refresh();
}
