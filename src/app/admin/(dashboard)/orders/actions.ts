"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-service";
import { isBookFormat } from "@/lib/orders";

// Server Actions bypass the proxy matcher, so each one re-checks auth
// itself (same pattern as reviews/actions.ts). The accounts build will
// tighten this to an admin-role check.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

function refresh() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

// Kyler's hand correction of an on-hand count. Runs as the signed-in admin
// through the "Admin can update inventory counts" RLS policy. Negative
// values are allowed so an oversold count can be entered as-is.
export async function updateInventoryCount(formData: FormData) {
  const supabase = await requireAdmin();

  const format = formData.get("format");
  const count = Number(formData.get("count"));
  if (!isBookFormat(format)) throw new Error("Unknown format");
  if (!Number.isInteger(count) || count < -1000 || count > 100000) {
    throw new Error("On-hand count must be a whole number");
  }

  const { data, error } = await supabase
    .from("inventory")
    .update({ signed_copies_on_hand: count, updated_at: new Date().toISOString() })
    .eq("format", format)
    .select("format");

  if (error) throw new Error(`Inventory update failed: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Inventory row not found");

  refresh();
}

// Sets the edition on a flagged (unconfirmed) order and applies it to
// inventory. set_order_format only acts while the order is still
// unconfirmed and un-applied, so it can never decrement twice. It's
// executable by service_role only, hence the service client -- called
// only after requireAdmin() above has checked the session.
export async function setOrderFormat(formData: FormData) {
  await requireAdmin();

  const orderId = Number(formData.get("orderId"));
  const format = formData.get("format");
  if (!Number.isInteger(orderId)) throw new Error("Bad order id");
  if (!isBookFormat(format)) throw new Error("Choose a format");

  const { error } = await createServiceClient().rpc("set_order_format", {
    p_order_id: orderId,
    p_format: format,
  });

  if (error) throw new Error(`Setting the format failed: ${error.message}`);

  refresh();
}
