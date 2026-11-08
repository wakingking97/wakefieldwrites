"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { setAdminFlash } from "@/lib/adminFlash";

// Server Actions can be invoked directly and don't pass through proxy.ts's
// matcher, so each one re-checks auth itself rather than relying solely on
// the proxy redirect or the layout's render-time check.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

export async function approveReview(id: number) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
  if (error) return setAdminFlash("error", `Approving failed: ${error.message}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  await setAdminFlash("success", "Review approved. It's live on the Reviews page.");
}

export async function rejectReview(id: number) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return setAdminFlash("error", `Rejecting failed: ${error.message}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  await setAdminFlash("success", "Review rejected and removed.");
}
