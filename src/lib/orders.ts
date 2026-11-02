import type { SupabaseClient } from "@supabase/supabase-js";

// Signed-copy orders: format detection and recording for the PayPal webhook,
// shared with /admin. No "@/" imports here so scripts/test-orders.mjs can
// load this file directly with Node.

// Must match the orders/inventory check constraints
// (supabase/migrations/20261102000000_orders_safety_three_formats.sql).
export const FORMATS = [
  "paperback",
  "hardcover_laminate",
  "hardcover_sleeve",
] as const;

export type BookFormat = (typeof FORMATS)[number];

// The exact option names on the /book PayPal button (seen 2026-10-15).
export const FORMAT_LABELS: Record<BookFormat, string> = {
  paperback: "Paperback",
  hardcover_laminate: "Hardcover Case Laminate",
  hardcover_sleeve: "Hardcover w/Paper Sleeve",
};

export function isBookFormat(value: unknown): value is BookFormat {
  return FORMATS.includes(value as BookFormat);
}

export type PayPalItem = {
  name?: string;
  description?: string;
  sku?: string;
  quantity?: string;
};

export type PayPalAddress = Record<string, string>;

export type PayPalOrder = {
  id: string;
  payer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
  purchase_units?: Array<{
    description?: string;
    amount?: { value?: string; currency_code?: string };
    items?: PayPalItem[];
    shipping?: {
      name?: { full_name?: string };
      address?: PayPalAddress;
    };
  }>;
};

// Lowercase, collapse whitespace, and drop spaces around "/" so
// "Hardcover w/ Paper Sleeve" still matches "Hardcover w/Paper Sleeve".
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/")
    .trim();
}

function formatsMentioned(text: string): BookFormat[] {
  const haystack = normalize(text);
  return FORMATS.filter((format) =>
    haystack.includes(normalize(FORMAT_LABELS[format])),
  );
}

// Works out which edition was bought from whatever text PayPal sent (item
// name, description, SKU, then the purchase unit's description). A field
// that names exactly one format counts as a vote; a field naming several
// (e.g. a product title listing every option) is ignored. Returns null --
// "unconfirmed", flagged in /admin -- unless the votes agree on one format.
// A bare "Hardcover" is deliberately not enough: there are two hardcovers.
export function parseFormat(texts: Array<string | undefined>): BookFormat | null {
  const votes = new Set<BookFormat>();
  for (const text of texts) {
    if (!text) continue;
    const found = formatsMentioned(text);
    if (found.length === 1) votes.add(found[0]);
  }
  return votes.size === 1 ? [...votes][0] : null;
}

// What PayPal sent, kept verbatim on the order row so Kyler can see it.
export function describeRawItem(order: PayPalOrder): string | null {
  const unit = order.purchase_units?.[0];
  const parts: string[] = [];
  (unit?.items ?? []).forEach((item, i) => {
    const fields = [
      item.name && `name: ${item.name}`,
      item.description && `description: ${item.description}`,
      item.sku && `sku: ${item.sku}`,
      item.quantity && `qty: ${item.quantity}`,
    ].filter(Boolean);
    parts.push(`item ${i + 1}: ${fields.join(" | ") || "(empty)"}`);
  });
  if (unit?.description) parts.push(`purchase description: ${unit.description}`);
  return parts.length ? parts.join("\n") : null;
}

export function formatAddress(address: PayPalAddress | null | undefined): string {
  if (!address) return "";
  const cityLine = [
    address.admin_area_2,
    [address.admin_area_1, address.postal_code].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  return [
    address.address_line_1,
    address.address_line_2,
    cityLine,
    address.country_code,
  ]
    .filter(Boolean)
    .join("\n");
}

export type NewOrderRow = {
  paypal_order_id: string;
  format: BookFormat | null;
  quantity: number;
  buyer_name: string | null;
  buyer_email: string | null;
  shipping_address: PayPalAddress | null;
  amount: string | null;
  currency: string;
  status: string;
  raw_item: string | null;
};

export function buildOrderRow(orderId: string, order: PayPalOrder): NewOrderRow {
  const unit = order.purchase_units?.[0];
  const items = unit?.items ?? [];
  const item = items[0];

  // A hosted button sells one option per checkout. More than one line item
  // is unexpected, so flag it rather than guess which one to count.
  const format =
    items.length > 1
      ? null
      : parseFormat([item?.name, item?.description, item?.sku, unit?.description]);

  const givenName = order.payer?.name?.given_name;
  const surname = order.payer?.name?.surname;

  return {
    paypal_order_id: orderId,
    format,
    quantity: Number(item?.quantity ?? 1) || 1,
    buyer_name:
      givenName && surname
        ? `${givenName} ${surname}`
        : (unit?.shipping?.name?.full_name ?? null),
    buyer_email: order.payer?.email_address ?? null,
    shipping_address: unit?.shipping?.address ?? null,
    amount: unit?.amount?.value ?? null,
    currency: unit?.amount?.currency_code ?? "USD",
    status: "completed",
    raw_item: describeRawItem(order),
  };
}

export type RecordOrderResult =
  | { status: "duplicate" }
  | {
      status: "recorded";
      orderDbId: number;
      row: NewOrderRow;
      // On-hand count after this order, or null if inventory wasn't applied
      // (format unconfirmed, or the decrement errored).
      onHand: number | null;
    };

// Records a completed PayPal order. Always inserts the order, even when the
// format is unconfirmed. Inventory is applied only for a known format, and
// only on the first insert: a PayPal retry hits the unique paypal_order_id
// and returns "duplicate" without touching inventory. apply_order_inventory
// is itself exactly-once per order and never clamps below zero.
// Throws only if the insert fails, so the caller can return a 5xx and let
// PayPal retry.
export async function recordOrder(
  supabase: SupabaseClient,
  orderId: string,
  order: PayPalOrder,
): Promise<RecordOrderResult> {
  const row = buildOrderRow(orderId, order);

  const { data: inserted, error: insertError } = await supabase
    .from("orders")
    .upsert(row, { onConflict: "paypal_order_id", ignoreDuplicates: true })
    .select("id");

  if (insertError) {
    throw new Error(`order insert failed: ${insertError.message}`);
  }

  // Empty array means the upsert hit the unique constraint and was ignored:
  // a PayPal retry of an order already recorded.
  if (!inserted || inserted.length === 0) {
    return { status: "duplicate" };
  }

  const orderDbId = inserted[0].id as number;

  if (!row.format) {
    console.warn(
      `PayPal webhook: order ${orderId} recorded with UNCONFIRMED format (no inventory change). PayPal sent: ${row.raw_item ?? "(nothing)"}`,
    );
    return { status: "recorded", orderDbId, row, onHand: null };
  }

  const { data: onHand, error: applyError } = await supabase.rpc(
    "apply_order_inventory",
    { p_order_id: orderDbId },
  );

  if (applyError) {
    console.error(
      `PayPal webhook: order ${orderId} recorded but inventory update failed`,
      applyError,
    );
    return { status: "recorded", orderDbId, row, onHand: null };
  }

  if (typeof onHand === "number" && onHand < 0) {
    console.warn(
      `PayPal webhook: order ${orderId} oversold ${row.format}: on hand is now ${onHand}`,
    );
  }

  return {
    status: "recorded",
    orderDbId,
    row,
    onHand: typeof onHand === "number" ? onHand : null,
  };
}

// ---------------------------------------------------------------------------
// New-order email to Kyler
// ---------------------------------------------------------------------------

const ORDER_EMAIL_TO = "kyler@wakefieldwrites.com";
const ORDER_EMAIL_FROM = "Wakefield Writes Orders <orders@wakefieldwrites.com>";
const ADMIN_ORDERS_URL = "https://wakefieldwrites.com/admin/orders";

export function buildNewOrderEmail(
  row: NewOrderRow,
  onHand: number | null,
): { subject: string; text: string } {
  const formatLabel = row.format ? FORMAT_LABELS[row.format] : "UNCONFIRMED";
  const amount = row.amount ? `${row.amount} ${row.currency}` : "unknown";
  const address = formatAddress(row.shipping_address) || "(none sent)";

  const lines = [
    `Buyer: ${row.buyer_name ?? "unknown"}${row.buyer_email ? ` <${row.buyer_email}>` : ""}`,
    `Format: ${formatLabel}`,
    `Quantity: ${row.quantity}`,
    `Amount: ${amount}`,
    "",
    "Ship to:",
    address,
    "",
  ];

  if (!row.format) {
    lines.push(
      "FORMAT UNCONFIRMED: the site couldn't tell which edition this is, so inventory was not changed. Set it in admin.",
      `PayPal sent: ${row.raw_item ?? "(nothing)"}`,
      "",
    );
  } else if (onHand !== null && onHand < 0) {
    lines.push(
      `OVERSOLD: ${formatLabel} on hand is now ${onHand}.`,
      "",
    );
  }

  lines.push(`PayPal order: ${row.paypal_order_id}`, ADMIN_ORDERS_URL);

  return {
    subject: `New signed-copy order: ${formatLabel} x${row.quantity}${row.buyer_name ? ` (${row.buyer_name})` : ""}`,
    text: lines.join("\n"),
  };
}

// Never throws. A failed email must not change what the webhook tells
// PayPal, so every failure is logged and swallowed.
export async function sendNewOrderEmail(
  row: NewOrderRow,
  onHand: number | null,
): Promise<"sent" | "skipped" | "failed"> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `PayPal webhook: RESEND_API_KEY not set, skipping new-order email for ${row.paypal_order_id}`,
    );
    return "skipped";
  }

  try {
    const { subject, text } = buildNewOrderEmail(row, onHand);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ORDER_EMAIL_FROM,
        to: [ORDER_EMAIL_TO],
        reply_to: row.buyer_email ?? undefined,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(
        `PayPal webhook: new-order email failed (${res.status}) for ${row.paypal_order_id}`,
        await res.text().catch(() => ""),
      );
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error(
      `PayPal webhook: new-order email errored for ${row.paypal_order_id}`,
      err,
    );
    return "failed";
  }
}
