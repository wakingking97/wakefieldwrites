import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { pageMetadata, SITE_URL } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: "Kyler Wakefield — Pulling the Thread",
    description:
      "Author of Pulling the Thread: Perception, Control, and the System Behind Everything. Writing, the book, and the Human Species Project.",
    path: "/",
  }),
};

const OUTBOUND_LINKS = [
  { href: "https://thehumanspeciesproject.substack.com", label: "Substack" },
  {
    href: "https://www.amazon.com/stores/Kyler-Wakefield/author/B0H6H2N9ZC",
    label: "Amazon Author Page",
  },
  {
    href: "https://www.linkedin.com/in/kyler-wakefield-48200b403/",
    label: "LinkedIn",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61590903470323",
    label: "HSP on Facebook",
  },
];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/book", label: "The Book" },
  { href: "/sample", label: "Read a Sample" },
  { href: "/reviews", label: "Reviews" },
  { href: "/writing", label: "Writing" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" },
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
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap font-serif text-lg tracking-tight"
            >
              <Image
                src="/images/logo.png"
                alt=""
                width={28}
                height={28}
                className="rounded-full"
              />
              Kyler Wakefield
            </Link>
            <nav className="nav-scroll flex gap-4 overflow-x-auto pr-6 text-sm text-muted sm:gap-6">
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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {OUTBOUND_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p className="mt-6">
              &copy; {new Date().getFullYear()} Kyler Wakefield. Pulling the
              Thread — Perception, Control, and the System Behind Everything.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
