// Pure constants (no server imports) so client components can use them.
export const CATEGORIES = ["substack", "book", "author"] as const;
export type InsightCategory = (typeof CATEGORIES)[number];

// Label shown on cards and post pages.
export const CATEGORY_LABELS: Record<InsightCategory, string> = {
  substack: "From the Substack",
  book: "Book update",
  author: "From Kyler",
};

// Short names for the /insights filter pills and the admin selector.
export const CATEGORY_FILTER_LABELS: Record<InsightCategory, string> = {
  substack: "Substack",
  book: "Book",
  author: "Kyler",
};
