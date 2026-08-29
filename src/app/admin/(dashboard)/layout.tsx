import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { signOut } from "./actions";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-suspenders: proxy.ts already redirects unauthenticated
  // requests before they reach this layout, but Server Actions can be
  // called directly without going through the proxy matcher, so every
  // data-mutating action re-checks auth itself too (see reviews/actions.ts).
  // This check covers the read path for this layout's own render.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/admin" className="font-serif text-lg tracking-tight text-foreground">
            Admin
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-muted">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
