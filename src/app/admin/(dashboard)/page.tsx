import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { FORMATS, FORMAT_LABELS } from "@/lib/orders";

export const metadata: Metadata = { title: "Dashboard" };

const CARDS = [
  {
    href: "/admin/reviews",
    label: "Reviews",
    description: "Approve or reject reader review submissions.",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Signed-copy orders and current inventory.",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    description: "Site traffic, via Vercel Analytics.",
  },
];

function sevenDaysAgoIso() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

function thirtyDaysAgoIso() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminHomePage() {
  const supabase = await createClient();
  const cutoff = thirtyDaysAgoIso();

  const weekAgo = sevenDaysAgoIso();

  const [
    { count: pendingCount },
    { count: recentOrderCount },
    { data: inventory },
    { count: weeklyChatCount },
    { count: flaggedOrderCount },
  ] = await Promise.all([
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("approved", false),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", cutoff),
      supabase.from("inventory").select("format, signed_copies_on_hand"),
      supabase
        .from("chat_sessions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .is("format", null),
    ]);

  const stats = [
    { label: "Pending reviews", value: pendingCount ?? "—", warn: false },
    { label: "Orders (30 days)", value: recentOrderCount ?? "—", warn: false },
    ...FORMATS.map((format) => {
      const count = inventory?.find((i) => i.format === format)
        ?.signed_copies_on_hand as number | undefined;
      return {
        label: `${FORMAT_LABELS[format]} on hand`,
        value: count ?? "—",
        warn: count !== undefined && count < 0,
      };
    }),
  ];

  const oversold = FORMATS.filter((format) => {
    const count = inventory?.find((i) => i.format === format)?.signed_copies_on_hand;
    return typeof count === "number" && count < 0;
  });

  const cards = [
    ...CARDS,
    {
      href: "/admin/chats",
      label: "Chats",
      description: `${weeklyChatCount ?? "—"} chat${weeklyChatCount === 1 ? "" : "s"} this week.`,
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Dashboard</h1>

      {((flaggedOrderCount ?? 0) > 0 || oversold.length > 0) && (
        <Link
          href="/admin/orders"
          className="mt-6 block space-y-1 rounded-lg border border-red-400 p-4 text-sm text-red-400 transition-opacity hover:opacity-90"
        >
          {(flaggedOrderCount ?? 0) > 0 && (
            <p>
              {flaggedOrderCount} order{flaggedOrderCount === 1 ? "" : "s"}{" "}
              with an unconfirmed format. Set the format in Orders.
            </p>
          )}
          {oversold.map((format) => (
            <p key={format}>{FORMAT_LABELS[format]} is oversold. Restock needed.</p>
          ))}
        </Link>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <p
              className={`font-serif text-2xl ${
                stat.warn ? "text-red-400" : "text-foreground"
              }`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
          >
            <h2 className="font-serif text-xl text-foreground">{card.label}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
