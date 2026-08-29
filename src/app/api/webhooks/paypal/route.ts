import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase-service";

// PayPal webhook: verifies the signature, then on a completed capture
// records the order and decrements signed-copy inventory.
//
// UNVERIFIED as of this writing -- see PROJECT_BIBLE.md build log for
// what this needs before it can be trusted in production:
//   1. PAYPAL_CLIENT_ID/SECRET, PAYPAL_WEBHOOK_ID, SUPABASE_SERVICE_ROLE_KEY
//      env vars (none are set yet)
//   2. Confirmation of the actual item/variation name(s) PayPal sends for
//      this book's Hosted Button -- FORMAT_KEYWORDS below is a best-guess
//      substring match ("paperback"/"hardcover" in the item name), not
//      confirmed against a real payload
//   3. A live PayPal Sandbox test for both formats (see 3e in the spec)

const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

type PayPalOrder = {
  id: string;
  payer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
  purchase_units?: Array<{
    amount?: { value?: string; currency_code?: string };
    items?: Array<{ name?: string; sku?: string; quantity?: string }>;
    shipping?: {
      name?: { full_name?: string };
      address?: Record<string, string>;
    };
  }>;
};

function parseFormat(itemName: string): "paperback" | "hardcover" | null {
  const name = itemName.toLowerCase();
  if (name.includes("hardcover")) return "hardcover";
  if (name.includes("paperback")) return "paperback";
  return null;
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not configured");
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal OAuth token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function verifySignature(
  request: NextRequest,
  rawBody: string,
  accessToken: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error("PAYPAL_WEBHOOK_ID not configured");
  }

  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: request.headers.get("paypal-auth-algo"),
        cert_url: request.headers.get("paypal-cert-url"),
        transmission_id: request.headers.get("paypal-transmission-id"),
        transmission_sig: request.headers.get("paypal-transmission-sig"),
        transmission_time: request.headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    },
  );

  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

async function getOrderDetails(
  orderId: string,
  accessToken: string,
): Promise<PayPalOrder> {
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch PayPal order ${orderId}: ${res.status}`);
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  if (!isSupabaseServiceConfigured) {
    console.error("PayPal webhook: Supabase service role not configured");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  let event: { event_type?: string; resource?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    console.error("PayPal webhook: failed to get access token", err);
    return NextResponse.json({ error: "auth failed" }, { status: 500 });
  }

  const verified = await verifySignature(request, rawBody, accessToken).catch(
    (err) => {
      console.error("PayPal webhook: signature verification errored", err);
      return false;
    },
  );

  if (!verified) {
    console.error("PayPal webhook: signature verification failed");
    return NextResponse.json({ error: "signature invalid" }, { status: 400 });
  }

  // Only act on a completed capture -- that's the actual "money received"
  // signal. Other subscribed event types (e.g. CHECKOUT.ORDER.APPROVED)
  // are acknowledged but intentionally not processed, so we don't record
  // an order or decrement inventory before the capture confirms it.
  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true, skipped: event.event_type });
  }

  const resource = event.resource as {
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
  const orderId = resource?.supplementary_data?.related_ids?.order_id;

  if (!orderId) {
    console.error("PayPal webhook: capture event missing order_id", event);
    return NextResponse.json({ received: true, error: "no order_id" });
  }

  let order: PayPalOrder;
  try {
    order = await getOrderDetails(orderId, accessToken);
  } catch (err) {
    console.error("PayPal webhook: failed to fetch order details", err);
    return NextResponse.json({ error: "order fetch failed" }, { status: 500 });
  }

  const unit = order.purchase_units?.[0];
  const item = unit?.items?.[0];
  const itemName = item?.name ?? "";
  const format = parseFormat(itemName);
  const quantity = Number(item?.quantity ?? 1) || 1;

  if (!format) {
    console.error(
      `PayPal webhook: could not determine format from item name "${itemName}" (order ${orderId}). Not recorded -- needs manual reconciliation.`,
    );
    return NextResponse.json({ received: true, error: "unrecognized format" });
  }

  const supabase = createServiceClient();

  const { data: inserted, error: insertError } = await supabase
    .from("orders")
    .upsert(
      {
        paypal_order_id: orderId,
        format,
        quantity,
        buyer_name:
          order.payer?.name?.given_name && order.payer?.name?.surname
            ? `${order.payer.name.given_name} ${order.payer.name.surname}`
            : (unit?.shipping?.name?.full_name ?? null),
        buyer_email: order.payer?.email_address ?? null,
        shipping_address: unit?.shipping?.address ?? null,
        amount: unit?.amount?.value ?? null,
        currency: unit?.amount?.currency_code ?? "USD",
        status: "completed",
      },
      { onConflict: "paypal_order_id", ignoreDuplicates: true },
    )
    .select("id");

  if (insertError) {
    console.error("PayPal webhook: order insert failed", insertError);
    return NextResponse.json({ error: "db insert failed" }, { status: 500 });
  }

  // Empty array means the upsert hit the unique constraint and was
  // ignored -- this is a PayPal retry of an order we've already recorded,
  // so skip the decrement to avoid double-counting.
  if (!inserted || inserted.length === 0) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const { error: decrementError } = await supabase.rpc("decrement_inventory", {
    p_format: format,
    p_qty: quantity,
  });

  if (decrementError) {
    console.error(
      `PayPal webhook: order ${orderId} recorded but inventory decrement failed`,
      decrementError,
    );
  }

  return NextResponse.json({ received: true });
}
