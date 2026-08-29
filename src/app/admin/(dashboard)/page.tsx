import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

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

function thirtyDaysAgoIso() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminHomePage() {
  const supabase = await createClient();
  const cutoff = thirtyDaysAgoIso();

  const [{ count: pendingCount }, { count: recentOrderCount }, { data: inventory }] =
    await Promise.all([
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("approved", false),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", cutoff),
      supabase.from("inventory").select("format, signed_copies_on_hand"),
    ]);

  const paperback = inventory?.find((i) => i.format === "paperback");
  const hardcover = inventory?.find((i) => i.format === "hardcover");

  const stats = [
    { label: "Pending reviews", value: pendingCount ?? "—" },
    { label: "Orders (30 days)", value: recentOrderCount ?? "—" },
    {
      label: "Paperback on hand",
      value: paperback?.signed_copies_on_hand ?? "—",
    },
    {
      label: "Hardcover on hand",
      value: hardcover?.signed_copies_on_hand ?? "—",
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <p className="font-serif text-2xl text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => (
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
