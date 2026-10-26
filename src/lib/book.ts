// Single source of truth for Kindle pricing shown on the site. Update here
// if the price changes in KDP. Never fetched at runtime.
export const KINDLE_URL = "https://www.amazon.com/dp/B0H1G4SSJP";
export const KINDLE_PRICE = "$2.99";
export const KINDLE_UNLIMITED_NOTE = "Free with Kindle Unlimited";
export const BOOK_PAGES = 307;

// Margaret Manos's editor review, shown on the homepage.
export const EDITOR_QUOTE =
  "Brilliantly simple, clear-headed, and well-constructed. You have tied together so many threads I simply hadn't tied. In the end, your book gives me hope for this country.";
export const EDITOR_ATTRIBUTION =
  "Margaret Manos, editor of Pulling the Thread (via Reedsy) · 25+ years, 90+ books";

// Print prices on Amazon (checked live 2026-10-15, PROJECT_BIBLE 5ab).
export const PAPERBACK_URL = "https://www.amazon.com/dp/B0HFVRZQD6";
export const PAPERBACK_PRICE = "$12.99";
export const HARDCOVER_URL = "https://www.amazon.com/dp/B0HFVXC1JC";
export const HARDCOVER_PRICE = "$23.89";
export const BARNES_NOBLE_URL =
  "https://www.barnesandnoble.com/w/pulling-the-thread-kyler-wakefield/1150213186?ean=9798256364335";
export const PUBLISHED_DATE = "June 4, 2026";

// Signed copies sold direct through the PayPal widget on /book. Shipping is
// added at PayPal checkout and is not known here.
export const SIGNED_COPY_OPTIONS = [
  { name: "Paperback", price: "$25" },
  { name: "Hardcover Case Laminate", price: "$35" },
  { name: "Hardcover w/Paper Sleeve", price: "$40" },
];

// Plain-text copy of the /book description, for the site chat assistant's
// knowledge pack. Keep in sync with src/app/book/page.tsx.
export const BOOK_DESCRIPTION = [
  "Pulling the Thread is written for anyone willing to listen — a professor and a ranch hand should both be able to pick it up and be unable to put it down, not because it talks down to one or over the head of the other, but because truth and emotional honesty hit every human being the same way when they're delivered clearly enough.",
  "The book documents an architecture of power that has operated across every empire, every ruling class, and every system of organized power in recorded history — through five tools: Education, Finance, Religion, Media, and Law. Every claim is sourced. Every pattern is documented. The book builds the picture; it does not tell you what to see in it.",
  "The final chapter before the conclusion returns those same five tools to the reader, pointed in a different direction: your attention, your money, your identity, your voice, and your community.",
  "— Kyler Wakefield, from a hotel front desk in Santa Rosa, New Mexico, where much of this book was written.",
];
