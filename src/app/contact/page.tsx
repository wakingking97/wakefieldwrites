import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact | Kyler Wakefield",
  description: "Get in touch with Kyler Wakefield, author of Pulling the Thread.",
  path: "/contact",
});

const CONTACT_EMAIL = "kyler@wakefieldwrites.com";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">Contact</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        Get in Touch
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        Questions about the book, press inquiries, or anything else — the
        fastest way to reach me is email.
      </p>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="mt-10 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
      >
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}
