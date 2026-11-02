import { after, NextResponse, type NextRequest } from "next/server";
import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase-service";
import { recordOrder, sendNewOrderEmail, type PayPalOrder } from "@/lib/orders";

// PayPal webhook: verifies the signature, then on a completed capture
// records the order (always, even if the edition can't be identified),
// applies it to signed-copy inventory exactly once, and emails Kyler.
// Format detection, recording and the email live in src/lib/orders.ts.
//
// Env: PAYPAL_CLIENT_ID/SECRET (the Live REST app "wakefieldwrites", not
// the button's NEXT_PUBLIC_PAYPAL_CLIENT_ID), PAYPAL_WEBHOOK_ID,
// PAYPAL_API_BASE, SUPABASE_SERVICE_ROLE_KEY, and optionally
// RESEND_API_KEY for the email.

// Defaults to Sandbox; production sets https://api-m.paypal.com explicitly.
const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

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
  console.log(
    `PayPal webhook: using ${PAYPAL_API_BASE} (${PAYPAL_API_BASE.includes("sandbox") ? "Sandbox" : "Live"})`,
  );

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

  let result;
  try {
    result = await recordOrder(createServiceClient(), orderId, order);
  } catch (err) {
    // Not recorded: return 5xx so PayPal retries the delivery.
    console.error(`PayPal webhook: failed to record order ${orderId}`, err);
    return NextResponse.json({ error: "db insert failed" }, { status: 500 });
  }

  if (result.status === "duplicate") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Only a newly inserted order gets an email. after() runs it once the
  // response is sent, and sendNewOrderEmail never throws, so the email can't
  // change what PayPal sees.
  const { row, onHand } = result;
  after(() => sendNewOrderEmail(row, onHand));

  return NextResponse.json({
    received: true,
    format: row.format ?? "unconfirmed",
  });
}
