import "server-only";

import { ABOUT_BIO } from "@/lib/aboutBio";
import {
  BARNES_NOBLE_URL,
  BOOK_DESCRIPTION,
  BOOK_PAGES,
  EDITOR_ATTRIBUTION,
  EDITOR_QUOTE,
  HARDCOVER_PRICE,
  HARDCOVER_URL,
  KINDLE_PRICE,
  KINDLE_UNLIMITED_NOTE,
  KINDLE_URL,
  PAPERBACK_PRICE,
  PAPERBACK_URL,
  PUBLISHED_DATE,
  SIGNED_COPY_OPTIONS,
} from "@/lib/book";
import { getHspArticles } from "@/lib/hspFeed";
import { CATEGORY_LABELS, displayDate, getPublishedInsights } from "@/lib/insights";
import { SITE_URL } from "@/lib/metadata";
import { OTHER_PROJECTS } from "@/lib/otherProjects";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PAGES } from "@/components/sampleContent";
import type { ChatbotConfig } from "./types";

// The ONE file to edit when moving the chatbot to another site: copy, theme,
// model, limits, allowed origins and the knowledge builder all live here.

const CONTACT_EMAIL = "kyler@wakefieldwrites.com";
const SUBSTACK_URL = "https://thehumanspeciesproject.substack.com";

const SITE_MAP: { path: string; description: string }[] = [
  { path: "/", description: "Home: the book, the editor's quote, the latest News post, and a Substack subscribe button." },
  { path: "/book", description: "The book page: description, Kindle/Amazon/Barnes & Noble links, and signed copies bought direct from Kyler (PayPal checkout)." },
  { path: "/sample", description: "Read a Sample: a flipbook of the book's front matter and the opening of Part One." },
  { path: "/writing", description: "Writing: The Human Species Project on Substack, with the full archive of articles." },
  { path: "/insights", description: "News: short posts about new Substack pieces, book updates, and notes from Kyler." },
  { path: "/reviews", description: "Reviews: approved reader reviews, plus a form to submit your own." },
  { path: "/about", description: "About: Kyler's bio in his own words." },
  { path: "/contact", description: `Contact: Kyler's email address, ${CONTACT_EMAIL}.` },
  { path: "/projects", description: "Projects: Kyler's writing projects and other ventures, including Korale." },
  { path: "/privacy", description: "Privacy Policy: what the site collects, including how site chat works." },
];

function formatDate(iso: string | null): string {
  if (!iso) return "date unknown";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Each source is independent: one failing (Substack down, Supabase
// unreachable) drops that section, not the whole pack.
async function section(title: string, build: () => Promise<string> | string): Promise<string> {
  try {
    const body = (await build()).trim();
    return body ? `## ${title}\n\n${body}` : "";
  } catch (err) {
    console.error(`chatbot knowledge: section "${title}" failed`, err);
    return "";
  }
}

async function buildKnowledge(): Promise<string> {
  const sections = await Promise.all([
    section("The book: Pulling the Thread", () =>
      [
        "Full title: Pulling the Thread: Perception, Control, and the System Behind Everything, by Kyler Wakefield.",
        `Published ${PUBLISHED_DATE}. ${BOOK_PAGES} pages. Formats: Hardcover, Paperback, Kindle.`,
        "Book page: /book. Free sample: /sample.",
        "",
        "Description, as published on /book:",
        ...BOOK_DESCRIPTION,
        "",
        `Editor's review, shown on the homepage: "${EDITOR_QUOTE}" — ${EDITOR_ATTRIBUTION}`,
      ].join("\n"),
    ),
    section("Buying the book", () =>
      [
        `- Kindle: ${KINDLE_PRICE} on Amazon. ${KINDLE_UNLIMITED_NOTE}. ${KINDLE_URL}`,
        `- Paperback: ${PAPERBACK_PRICE} on Amazon. ${PAPERBACK_URL}`,
        `- Hardcover: ${HARDCOVER_PRICE} on Amazon. ${HARDCOVER_URL}`,
        `- Barnes & Noble: ${BARNES_NOBLE_URL}`,
        "",
        "Signed copies, bought directly from Kyler on /book (personally signed, shipped directly from the author, paid through PayPal):",
        ...SIGNED_COPY_OPTIONS.map((o) => `- ${o.name}: ${o.price}`),
        "",
        `Shipping for signed copies: the cost is NOT known here. The total, including shipping, is shown at PayPal checkout on /book. For questions, email ${CONTACT_EMAIL}.`,
      ].join("\n"),
    ),
    section("About Kyler Wakefield (the /about page, in his own words)", () => ABOUT_BIO.join("\n\n")),
    section("Free sample (public front matter, as shown on /sample)", () =>
      SAMPLE_PAGES.map((page) =>
        [
          page.heading ? `### ${page.eyebrow ? `${page.eyebrow}: ` : ""}${page.heading}` : "",
          ...(page.paragraphs ?? []).map((p) => p.text),
          ...(page.list ?? []).map((item, i) => `${(page.listStart ?? 1) + i}. ${item.label} — ${item.text}`),
        ]
          .filter(Boolean)
          .join("\n"),
      ).join("\n\n"),
    ),
    section("Reader reviews (approved, from /reviews)", async () => {
      if (!supabase) return "";
      const { data, error } = await supabase
        .from("reviews")
        .select("name, role, review_text, created_at")
        .eq("approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((r) => `- "${r.review_text}" — ${r.name}${r.role ? `, ${r.role}` : ""}`)
        .join("\n");
    }),
    section("News posts (published, from /insights)", async () => {
      const now = Date.now();
      const posts = (await getPublishedInsights()).filter(
        (p) => p.published_at && new Date(p.published_at).getTime() <= now,
      );
      return posts
        .map((p) =>
          [
            `### ${p.title}`,
            `Date: ${formatDate(displayDate(p))}. Category: ${CATEGORY_LABELS[p.category]}. Link: /insights/${p.slug}`,
            p.substack_url ? `Based on the Substack piece "${p.substack_title ?? p.title}": ${p.substack_url}` : "",
            // Flatten the post's own markdown headings so they don't read as pack sections.
            p.hook_content.replace(/^#{1,6}\s+/gm, ""),
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n");
    }),
    section("Substack articles (The Human Species Project, as listed on /writing; titles and subtitles only)", async () => {
      const articles = await getHspArticles();
      return articles
        .map((a) => `- "${a.title}"${a.blurb ? ` — ${a.blurb}` : ""} (${formatDate(a.date)}) ${a.link}`)
        .join("\n");
    }),
    section("Site map (pages on this site)", () => SITE_MAP.map((p) => `- ${p.path} — ${p.description}`).join("\n")),
    section("Contact, subscribing, and other projects", () =>
      [
        `- Email Kyler: ${CONTACT_EMAIL} (also on /contact).`,
        `- Subscribe to The Human Species Project (free, on Substack; the site never collects emails): ${SUBSTACK_URL}/subscribe`,
        `- Substack home: ${SUBSTACK_URL}`,
        ...OTHER_PROJECTS.map((p) => `- ${p.name}: ${p.description} ${p.url}`),
      ].join("\n"),
    ),
  ]);

  return sections.filter(Boolean).join("\n\n");
}

export const chatbotConfig: ChatbotConfig = {
  ui: {
    storageKey: "wakefieldwrites:chat:v1",
    title: "Ask about the book & site",
    tag: "AI assistant",
    greeting:
      "Hi. I'm an AI assistant for this site. I can help you find your way around Pulling the Thread, Kyler's writing, and how to get a copy.",
    placeholder: "Ask a question…",
    starters: [
      "What's the book about?",
      "How do I get a signed copy?",
      "What's the latest from the Substack?",
      "Who is Kyler?",
    ],
    smallPrint: "AI assistant — answers can be wrong. Chats are saved to improve answers.",
    privacyHref: "/privacy",
    privacyLabel: "Privacy",
    messages: {
      offline: `Chat is offline right now. Email ${CONTACT_EMAIL}.`,
      rateLimited: `You've hit the chat limit for now. Try again later, or email ${CONTACT_EMAIL}.`,
      error: `Sorry, something went wrong. Please try again, or email ${CONTACT_EMAIL}.`,
      refusal: "Sorry, I can't help with that. I can answer questions about the book and this site.",
    },
    // Same tokens as SubscribeBlock and the hero buttons (globals.css).
    theme: {
      surface: "var(--surface)",
      background: "var(--background)",
      foreground: "var(--foreground)",
      muted: "var(--muted)",
      line: "var(--line)",
      accent: "var(--accent)",
      accentText: "#000",
      headingFont: "var(--font-serif)",
      bodyFont: "var(--font-sans)",
    },
    hiddenPathPrefixes: ["/admin"],
    quietPaths: ["/book"],
    // PayPal's Checkout/Venmo buttons on /book render wider than their card.
    keepClearSelectors: [".paypal-buttons"],
    mobileBreakpoint: 768,
    defaultCorner: { desktop: { right: 24, bottom: 24 }, mobile: { right: 8, bottom: 16 } },
    maxStoredMessages: 20,
    maxMessageChars: 500,
  },
  persona: {
    siteName: "wakefieldwrites.com",
    siteDescription:
      "the author site of Kyler Wakefield, who wrote the book Pulling the Thread: Perception, Control, and the System Behind Everything, and writes The Human Species Project on Substack",
    ownerName: "Kyler",
    contactEmail: CONTACT_EMAIL,
    aboutPath: "/about",
    crisisLine: "988, the US Suicide & Crisis Lifeline (call or text 988)",
  },
  // Cheapest current Haiku. $0.10 / $0.50 per million input / output tokens.
  model: { id: "claude-haiku-5-5", maxTokens: 500, effort: "low" },
  env: { apiKey: "ANTHROPIC_API_KEY_CHAT", ipSalt: "CHAT_IP_SALT" },
  limits: {
    maxMessageChars: 500,
    historyTurns: 10,
    perVisitorShort: 15,
    shortWindowMinutes: 10,
    perVisitorDay: 60,
    globalDay: 1000,
    knowledgeTtlMs: 10 * 60 * 1000,
    retentionDays: 90,
    purgeChance: 0.01,
  },
  allowedOrigins: [
    new RegExp(`^${SITE_URL.replace(/\./g, "\\.").replace("https://", "https://(www\\.)?")}$`),
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    // Vercel previews for this project: wakefieldwrites-<hash>-<scope>.vercel.app
    // and wakefieldwrites-git-<branch>-<scope>.vercel.app.
    /^https:\/\/wakefieldwrites(-[a-z0-9-]+)?\.vercel\.app$/,
  ],
  buildKnowledge,
};
