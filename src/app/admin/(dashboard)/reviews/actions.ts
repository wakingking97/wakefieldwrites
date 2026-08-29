"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

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
  await supabase.from("reviews").update({ approved: true }).eq("id", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function rejectReview(id: number) {
  const supabase = await requireAdmin();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}
