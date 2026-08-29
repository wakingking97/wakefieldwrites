import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "Orders" };

type Order = {
  id: number;
  created_at: string;
  format: "paperback" | "hardcover";
  quantity: number;
  buyer_name: string | null;
  amount: string | null;
  currency: string | null;
  status: string;
};

type Inventory = {
  format: "paperback" | "hardcover";
  signed_copies_on_hand: number;
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const [{ data: orderData }, { data: inventoryData }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, created_at, format, quantity, buyer_name, amount, currency, status")
      .order("created_at", { ascending: false }),
    supabase.from("inventory").select("format, signed_copies_on_hand"),
  ]);

  const orders = (orderData ?? []) as Order[];
  const inventory = (inventoryData ?? []) as Inventory[];

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Orders</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {["paperback", "hardcover"].map((format) => {
          const row = inventory.find((i) => i.format === format);
          const count = row?.signed_copies_on_hand ?? null;
          return (
            <div
              key={format}
              className="rounded-lg border border-line bg-surface p-5"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-accent">
                {format} on hand
              </p>
              <p
                className={`mt-2 font-serif text-3xl ${
                  count !== null && count < 0 ? "text-red-400" : "text-foreground"
                }`}
              >
                {count !== null && count < 0 ? "0" : (count ?? "—")}
              </p>
              {count !== null && count < 0 && (
                <p className="mt-1 text-xs text-red-400">
                  Oversold by {Math.abs(count)} — restock needed.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 space-y-3">
        {orders.length === 0 && (
          <p className="text-sm text-muted">
            No orders yet. Orders appear here automatically once the PayPal
            webhook is live and receiving real purchases.
          </p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4 text-sm"
          >
            <div>
              <p className="font-medium text-foreground">
                {order.buyer_name || "Unknown buyer"}
              </p>
              <p className="text-xs text-muted">
                {order.format} &middot; qty {order.quantity} &middot;{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-foreground">
                {order.amount ? `${order.amount} ${order.currency ?? ""}` : "—"}
              </p>
              <p className="text-xs uppercase tracking-[0.1em] text-muted">
                {order.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
