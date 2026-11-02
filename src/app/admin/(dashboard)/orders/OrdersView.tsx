import {
  FORMATS,
  FORMAT_LABELS,
  formatAddress,
  type BookFormat,
  type PayPalAddress,
} from "@/lib/orders";
import { setOrderFormat, updateInventoryCount } from "./actions";

export type AdminOrder = {
  id: number;
  created_at: string;
  paypal_order_id: string;
  format: BookFormat | null;
  quantity: number;
  buyer_name: string | null;
  buyer_email: string | null;
  shipping_address: PayPalAddress | null;
  amount: string | number | null;
  currency: string | null;
  status: string;
  raw_item: string | null;
  inventory_applied: boolean;
  shortfall: number;
  format_set_manually_at: string | null;
};

export type AdminInventory = {
  format: BookFormat;
  signed_copies_on_hand: number;
  updated_at: string;
};

const inputClass =
  "rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground";
const buttonClass =
  "rounded-full bg-accent px-4 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90";

export function OrdersView({
  orders,
  inventory,
}: {
  orders: AdminOrder[];
  inventory: AdminInventory[];
}) {
  const flagged = orders.filter((o) => o.format === null);
  const oversold = inventory.filter((i) => i.signed_copies_on_hand < 0);

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Orders</h1>

      {(flagged.length > 0 || oversold.length > 0) && (
        <div className="mt-6 space-y-2 rounded-lg border border-red-400 p-4 text-sm text-red-400">
          {flagged.length > 0 && (
            <p>
              {flagged.length} order{flagged.length === 1 ? "" : "s"} with an
              unconfirmed format. Set the format below so inventory is
              counted.
            </p>
          )}
          {oversold.map((i) => (
            <p key={i.format}>
              {FORMAT_LABELS[i.format]} is oversold by{" "}
              {Math.abs(i.signed_copies_on_hand)}. Restock, or correct the
              count below.
            </p>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {FORMATS.map((format) => {
          const row = inventory.find((i) => i.format === format);
          const count = row?.signed_copies_on_hand ?? null;
          const negative = count !== null && count < 0;
          return (
            <div
              key={format}
              className="rounded-lg border border-line bg-surface p-5"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-accent">
                {FORMAT_LABELS[format]} on hand
              </p>
              <p
                className={`mt-2 font-serif text-3xl ${
                  negative ? "text-red-400" : "text-foreground"
                }`}
              >
                {count ?? "—"}
              </p>
              {negative && (
                <p className="mt-1 text-xs text-red-400">
                  Oversold by {Math.abs(count)}. Restock needed.
                </p>
              )}
              {row && (
                <form action={updateInventoryCount} className="mt-4">
                  <input type="hidden" name="format" value={format} />
                  <label className="text-xs text-muted" htmlFor={`count-${format}`}>
                    Edit on-hand count
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id={`count-${format}`}
                      name="count"
                      type="number"
                      step={1}
                      required
                      defaultValue={count ?? 0}
                      className={`${inputClass} w-24`}
                    />
                    <button type="submit" className={buttonClass}>
                      Save
                    </button>
                  </div>
                </form>
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

        {orders.map((order) => {
          const address = formatAddress(order.shipping_address);
          return (
            <div
              key={order.id}
              className={`rounded-lg border bg-surface p-4 text-sm ${
                order.format === null ? "border-red-400" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {order.buyer_name || "Unknown buyer"}
                  </p>
                  <p className="text-xs text-muted">
                    {order.format === null ? (
                      <span className="font-medium text-red-400">
                        FORMAT UNCONFIRMED
                      </span>
                    ) : (
                      FORMAT_LABELS[order.format]
                    )}{" "}
                    &middot; qty {order.quantity} &middot;{" "}
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  {order.buyer_email && (
                    <p className="text-xs text-muted">{order.buyer_email}</p>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="text-foreground">
                    {order.amount ? `${order.amount} ${order.currency ?? ""}` : "—"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.1em] text-muted">
                    {order.status}
                  </p>
                </div>
              </div>

              {address && (
                <p className="mt-3 whitespace-pre-line text-xs text-muted">
                  {address}
                </p>
              )}

              {order.shortfall > 0 && (
                <p className="mt-3 text-xs text-red-400">
                  Oversold: {order.shortfall} cop
                  {order.shortfall === 1 ? "y" : "ies"} short when this order
                  came in.
                </p>
              )}

              {order.format_set_manually_at && (
                <p className="mt-3 text-xs text-muted">
                  Format set by hand{" "}
                  {new Date(order.format_set_manually_at).toLocaleString()}.
                </p>
              )}

              {order.format === null && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-xs text-muted">PayPal sent:</p>
                  <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                    {order.raw_item ?? "(nothing)"}
                  </pre>
                  <form
                    action={setOrderFormat}
                    className="mt-3 flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="format"
                      required
                      defaultValue=""
                      aria-label="Format"
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Choose format…
                      </option>
                      {FORMATS.map((f) => (
                        <option key={f} value={f}>
                          {FORMAT_LABELS[f]}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className={buttonClass}>
                      Set format
                    </button>
                  </form>
                  <p className="mt-2 text-xs text-muted">
                    Subtracts {order.quantity} from that format&rsquo;s on-hand
                    count, once.
                  </p>
                </div>
              )}

              <p className="mt-3 text-[11px] text-muted">
                PayPal order {order.paypal_order_id}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
