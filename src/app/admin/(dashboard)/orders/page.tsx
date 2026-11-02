import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { OrdersView, type AdminInventory, type AdminOrder } from "./OrdersView";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const [{ data: orderData }, { data: inventoryData }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, created_at, paypal_order_id, format, quantity, buyer_name, buyer_email, shipping_address, amount, currency, status, raw_item, inventory_applied, shortfall, format_set_manually_at",
      )
      .order("created_at", { ascending: false }),
    supabase.from("inventory").select("format, signed_copies_on_hand, updated_at"),
  ]);

  return (
    <OrdersView
      orders={(orderData ?? []) as AdminOrder[]}
      inventory={(inventoryData ?? []) as AdminInventory[]}
    />
  );
}
