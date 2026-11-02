// Tests for src/lib/orders.ts (format detection, order recording, the
// new-order email). Run with:  node --test scripts/test-orders.mjs
//
// Uses an in-memory stand-in for Supabase that mimics the unique
// paypal_order_id upsert and apply_order_inventory. The real SQL functions
// and RLS are tested against the database by
// supabase/tests/orders_inventory_test.sql.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseFormat,
  buildOrderRow,
  recordOrder,
  sendNewOrderEmail,
  buildNewOrderEmail,
} from "../src/lib/orders.ts";

function fakeDb(stock) {
  const db = { orders: [], inventory: { ...stock }, rpcCalls: 0, nextId: 1 };
  db.client = {
    from(table) {
      assert.equal(table, "orders");
      return {
        upsert(row, opts) {
          assert.equal(opts.onConflict, "paypal_order_id");
          assert.equal(opts.ignoreDuplicates, true);
          return {
            async select() {
              if (db.orders.some((o) => o.paypal_order_id === row.paypal_order_id)) {
                return { data: [], error: null };
              }
              const saved = { ...row, id: db.nextId++, inventory_applied: false, shortfall: 0 };
              db.orders.push(saved);
              return { data: [{ id: saved.id }], error: null };
            },
          };
        },
      };
    },
    async rpc(name, args) {
      assert.equal(name, "apply_order_inventory");
      db.rpcCalls++;
      const order = db.orders.find((o) => o.id === args.p_order_id);
      if (!order || order.inventory_applied || !order.format) return { data: null, error: null };
      order.inventory_applied = true;
      db.inventory[order.format] -= order.quantity;
      const onHand = db.inventory[order.format];
      if (onHand < 0) order.shortfall = Math.min(order.quantity, -onHand);
      return { data: onHand, error: null };
    },
  };
  return db;
}

function paypalOrder(item, extra = {}) {
  return {
    id: "PP-1",
    payer: { name: { given_name: "Jane", surname: "Reader" }, email_address: "jane@example.com" },
    purchase_units: [
      {
        amount: { value: "25.00", currency_code: "USD" },
        items: item ? [item] : [],
        shipping: {
          name: { full_name: "Jane Reader" },
          address: {
            address_line_1: "1 Main St",
            admin_area_2: "Santa Rosa",
            admin_area_1: "NM",
            postal_code: "88435",
            country_code: "US",
          },
        },
        ...extra,
      },
    ],
  };
}

// Silence the expected warnings from recordOrder/sendNewOrderEmail.
for (const level of ["log", "warn", "error"]) console[level] = () => {};

// --- Format detection -------------------------------------------------------

test("parseFormat matches the three exact button names, case-insensitive", () => {
  assert.equal(parseFormat(["Paperback"]), "paperback");
  assert.equal(parseFormat(["HARDCOVER CASE LAMINATE"]), "hardcover_laminate");
  assert.equal(parseFormat(["hardcover w/paper sleeve"]), "hardcover_sleeve");
  assert.equal(parseFormat(["Hardcover w/Paper Sleeve - $40.00 USD"]), "hardcover_sleeve");
  assert.equal(parseFormat(["Hardcover  w/ Paper   Sleeve"]), "hardcover_sleeve");
});

test("parseFormat checks description and sku when the name has no format", () => {
  assert.equal(parseFormat(["Pulling the Thread (Signed)", "Hardcover Case Laminate - $35.00 USD", undefined]), "hardcover_laminate");
  assert.equal(parseFormat(["Signed copy", undefined, "paperback"]), "paperback");
});

test("parseFormat ignores a field listing every option", () => {
  assert.equal(
    parseFormat(["Signed: Paperback / Hardcover Case Laminate / Hardcover w/Paper Sleeve", "Paperback - $25.00 USD"]),
    "paperback",
  );
});

test("parseFormat flags anything unrecognized, ambiguous or conflicting", () => {
  assert.equal(parseFormat(["Hardcover"]), null);
  assert.equal(parseFormat(["Signed copy"]), null);
  assert.equal(parseFormat([]), null);
  assert.equal(parseFormat(["Paperback", "Hardcover Case Laminate"]), null);
});

test("buildOrderRow flags multi-item orders and keeps the raw item text", () => {
  const order = paypalOrder({ name: "Paperback", quantity: "1" });
  order.purchase_units[0].items.push({ name: "Paperback", quantity: "1" });
  const row = buildOrderRow("PP-1", order);
  assert.equal(row.format, null);
  assert.match(row.raw_item, /item 1: name: Paperback/);
  assert.match(row.raw_item, /item 2: name: Paperback/);
});

// --- Recording --------------------------------------------------------------

test("known format: records the order and decrements once", async () => {
  const db = fakeDb({ paperback: 10, hardcover_laminate: 5, hardcover_sleeve: 1 });
  const result = await recordOrder(db.client, "PP-1", paypalOrder({ name: "Paperback", quantity: "1" }));
  assert.equal(result.status, "recorded");
  assert.equal(result.row.format, "paperback");
  assert.equal(result.onHand, 9);
  assert.equal(db.orders.length, 1);
  assert.equal(db.inventory.paperback, 9);
  assert.equal(db.orders[0].raw_item, "item 1: name: Paperback | qty: 1");
});

test("unknown format: records the order, flagged, no decrement", async () => {
  const db = fakeDb({ paperback: 10, hardcover_laminate: 5, hardcover_sleeve: 1 });
  const result = await recordOrder(db.client, "PP-2", paypalOrder({ name: "Signed copy", description: "Hardcover", quantity: "1" }));
  assert.equal(result.status, "recorded");
  assert.equal(result.row.format, null);
  assert.equal(result.onHand, null);
  assert.equal(db.orders.length, 1);
  assert.equal(db.rpcCalls, 0);
  assert.deepEqual(db.inventory, { paperback: 10, hardcover_laminate: 5, hardcover_sleeve: 1 });
  assert.equal(db.orders[0].raw_item, "item 1: name: Signed copy | description: Hardcover | qty: 1");
});

test("duplicate retry: no second insert or decrement", async () => {
  const db = fakeDb({ paperback: 10, hardcover_laminate: 5, hardcover_sleeve: 1 });
  const order = paypalOrder({ name: "Hardcover Case Laminate", quantity: "2" });
  const first = await recordOrder(db.client, "PP-3", order);
  const retry = await recordOrder(db.client, "PP-3", order);
  assert.equal(first.status, "recorded");
  assert.deepEqual(retry, { status: "duplicate" });
  assert.equal(db.orders.length, 1);
  assert.equal(db.rpcCalls, 1);
  assert.equal(db.inventory.hardcover_laminate, 3);
});

test("stock below zero: records the order, count goes negative, shortfall kept", async () => {
  const db = fakeDb({ paperback: 10, hardcover_laminate: 5, hardcover_sleeve: 1 });
  const result = await recordOrder(db.client, "PP-4", paypalOrder({ name: "Hardcover w/Paper Sleeve", quantity: "3" }));
  assert.equal(result.status, "recorded");
  assert.equal(result.onHand, -2);
  assert.equal(db.inventory.hardcover_sleeve, -2);
  assert.equal(db.orders[0].shortfall, 2);
  assert.match(buildNewOrderEmail(result.row, result.onHand).text, /OVERSOLD: Hardcover w\/Paper Sleeve on hand is now -2/);
});

test("inventory error still leaves the order recorded", async () => {
  const db = fakeDb({ paperback: 10 });
  db.client.rpc = async () => ({ data: null, error: { message: "boom" } });
  const result = await recordOrder(db.client, "PP-5", paypalOrder({ name: "Paperback" }));
  assert.equal(result.status, "recorded");
  assert.equal(result.onHand, null);
  assert.equal(db.orders.length, 1);
});

test("insert failure throws so the webhook returns 5xx and PayPal retries", async () => {
  const client = {
    from: () => ({ upsert: () => ({ select: async () => ({ data: null, error: { message: "down" } }) }) }),
  };
  await assert.rejects(recordOrder(client, "PP-6", paypalOrder({ name: "Paperback" })), /order insert failed/);
});

// --- Email ------------------------------------------------------------------

test("email skips quietly without RESEND_API_KEY and never calls fetch", async () => {
  delete process.env.RESEND_API_KEY;
  const realFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
  };
  try {
    const row = buildOrderRow("PP-7", paypalOrder({ name: "Paperback" }));
    assert.equal(await sendNewOrderEmail(row, 9), "skipped");
    assert.equal(called, false);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("email failures are swallowed", async () => {
  process.env.RESEND_API_KEY = "test-key";
  const realFetch = globalThis.fetch;
  try {
    const row = buildOrderRow("PP-8", paypalOrder({ name: "Paperback" }));
    globalThis.fetch = async () => {
      throw new Error("network down");
    };
    assert.equal(await sendNewOrderEmail(row, 9), "failed");
    globalThis.fetch = async () => new Response("bad domain", { status: 403 });
    assert.equal(await sendNewOrderEmail(row, 9), "failed");

    let sent;
    globalThis.fetch = async (url, init) => {
      sent = { url, body: JSON.parse(init.body), auth: init.headers.Authorization };
      return new Response("{}", { status: 200 });
    };
    assert.equal(await sendNewOrderEmail(row, 9), "sent");
    assert.equal(sent.url, "https://api.resend.com/emails");
    assert.deepEqual(sent.body.to, ["kyler@wakefieldwrites.com"]);
    assert.equal(sent.auth, "Bearer test-key");
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
  }
});

test("email content: buyer, format, quantity, amount, address, admin link", () => {
  const known = buildNewOrderEmail(buildOrderRow("PP-9", paypalOrder({ name: "Paperback", quantity: "2" })), 8);
  assert.match(known.subject, /Paperback x2 \(Jane Reader\)/);
  for (const part of ["Jane Reader <jane@example.com>", "Format: Paperback", "Quantity: 2", "Amount: 25.00 USD", "1 Main St", "Santa Rosa, NM 88435", "https://wakefieldwrites.com/admin/orders"]) {
    assert.ok(known.text.includes(part), `missing "${part}"`);
  }

  const flagged = buildNewOrderEmail(buildOrderRow("PP-10", paypalOrder({ name: "Signed copy" })), null);
  assert.match(flagged.subject, /UNCONFIRMED/);
  assert.match(flagged.text, /Format: UNCONFIRMED/);
  assert.match(flagged.text, /PayPal sent: item 1: name: Signed copy/);
});
