import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

// Where PayPal sends buyers after a signed-copy purchase. Kyler sets this URL
// as the return URL in the PayPal button settings (it used to point at the old
// Base44 site). Copy is Kyler's own, carried over from the Base44 page.
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Thank You | Kyler Wakefield",
    description: "Thank you for ordering a signed copy of Pulling the Thread.",
    path: "/thank-you",
  }),
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <p aria-hidden="true" className="font-serif text-6xl text-accent">
        &#10003;
      </p>
      <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
        Thank you &mdash; genuinely.
      </h1>

      <div className="mt-10 rounded-lg border border-line bg-surface p-8 text-left text-base leading-8 text-muted sm:p-10">
        <p>
          You didn&rsquo;t have to buy directly from me, and the fact that you
          did means more than a sale. Every copy I send out myself is one I get
          to sign, pack, and ship knowing exactly where it&rsquo;s going.
        </p>
        <p className="mt-6">
          I&rsquo;ll get your order out within a few days. If you left a note
          for a personalized inscription, I&rsquo;ve got it &mdash; if not and
          you&rsquo;d like one, just reach out on the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact page
          </Link>{" "}
          before it ships (usually within a day or two).
        </p>
        <p className="mt-6">I hope the book earns your time.</p>
        <p className="mt-8 font-serif text-xl text-foreground">
          &mdash; Kyler Wakefield
        </p>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block rounded-full border border-line px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
      >
        Back to the site
      </Link>
    </div>
  );
}
