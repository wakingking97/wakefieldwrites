import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kyler Wakefield — Pulling the Thread",
  description:
    "Author of Pulling the Thread: Perception, Control, and the System Behind Everything. Writing, the book, and the Human Species Project.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/book", label: "The Book" },
  { href: "/sample", label: "Read a Sample" },
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
            <Link
              href="/"
              className="shrink-0 whitespace-nowrap font-serif text-lg tracking-tight"
            >
              Kyler Wakefield
            </Link>
            <nav className="nav-scroll flex gap-4 overflow-x-auto text-sm text-muted sm:gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted">
            <div className="thread-rule mb-8" />
            <p>
              &copy; {new Date().getFullYear()} Kyler Wakefield. Pulling the
              Thread — Perception, Control, and the System Behind Everything.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
