"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

// Server Actions can be invoked directly and don't pass through proxy.ts's
// matcher, so each one re-checks auth itself (same as reviews/actions.ts).
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

export async function deleteChatSession(id: string) {
  const supabase = await requireAdmin();
  await supabase.from("chat_messages").delete().eq("session_id", id);
  await supabase.from("chat_sessions").delete().eq("id", id);
  revalidatePath("/admin/chats");
}
