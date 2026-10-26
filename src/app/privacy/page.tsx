import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy | Kyler Wakefield",
  description: "How wakefieldwrites.com handles the information you share here.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">
        Privacy Policy
      </p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-muted">Last updated October 26, 2026.</p>

      <div className="mt-10 space-y-8 text-base leading-8 text-muted">
        <div>
          <h2 className="font-serif text-xl text-foreground">
            What this site collects
          </h2>
          <p className="mt-3">
            If you submit a review on the{" "}
            <Link href="/reviews" className="text-accent hover:underline">
              Reviews
            </Link>{" "}
            page, we store the name, optional title/role, and review text you
            enter. That information is stored in a Supabase database and is
            reviewed before it&rsquo;s published publicly on this site.
          </p>
          <p className="mt-3">
            Apart from that and the site chat described below, browsing the
            site doesn&rsquo;t submit any of your information to us.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-foreground">
            Payment information
          </h2>
          <p className="mt-3">
            No payment or card information is collected or stored on this
            site. Purchases made through the &ldquo;Buy a signed copy&rdquo;
            option on the{" "}
            <Link href="/book" className="text-accent hover:underline">
              book page
            </Link>{" "}
            are processed entirely by PayPal, on PayPal&rsquo;s own systems,
            under PayPal&rsquo;s own privacy policy. We never see or store
            your payment details.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-foreground">
            Email signup
          </h2>
          <p className="mt-3">
            The &ldquo;Subscribe free&rdquo; buttons on the Home and Writing
            pages take you to Substack. Subscribing happens on
            Substack&rsquo;s own site, under Substack&rsquo;s privacy policy.
            This site does not receive or store email addresses.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-foreground">
            Site chat
          </h2>
          <p className="mt-3">
            The chat assistant on this site is AI, not Kyler, and its answers
            can be wrong. When you send a message, it&rsquo;s sent to
            Anthropic, the company that makes the AI, to generate a reply.
          </p>
          <p className="mt-3">
            Conversations are saved in this site&rsquo;s database for up to 90
            days to improve answers, then deleted. Your IP address is stored
            only as a one-way hash, used for rate limiting; the address itself
            is never saved. Please don&rsquo;t share personal or sensitive
            information in the chat.
          </p>
          <p className="mt-3">
            To have a conversation deleted, email Kyler at{" "}
            <a href="mailto:kyler@wakefieldwrites.com" className="text-accent hover:underline">
              kyler@wakefieldwrites.com
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-foreground">
            Other retailers and outside links
          </h2>
          <p className="mt-3">
            Links to Amazon, Barnes &amp; Noble, Substack, and other outside
            sites take you to their platforms, each governed by its own
            privacy policy. We don&rsquo;t control and aren&rsquo;t
            responsible for how those sites handle your information.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-foreground">
            Questions
          </h2>
          <p className="mt-3">
            If you have questions about this policy or want a review removed,{" "}
            <Link href="/contact" className="text-accent hover:underline">
              get in touch
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
