export type ArchiveArticle = {
  slug: string;
  title: string;
  blurb: string;
  date: string; // ISO date
};

// PLACEHOLDER / EXAMPLE DATA — none of this is wired to a real feed yet.
// "A Rich Man's War" is the one real example Kyler's old Base44 site showed
// (see PROJECT_BIBLE.md 5e); the rest are illustrative placeholders in the
// same voice, not real published articles. Replace this whole file once
// there's a real data source (manual entries or a Substack RSS pull —
// see the open question in PROJECT_BIBLE.md).
export const ARCHIVE_ARTICLES: ArchiveArticle[] = [
  {
    slug: "a-rich-mans-war",
    title: "A Rich Man's War",
    blurb:
      "Two governments, 160 years apart, ran out of volunteers and reached for the same instrument.",
    date: "2026-07-26",
  },
  {
    slug: "the-classroom-was-never-neutral",
    title: "The Classroom Was Never Neutral",
    blurb:
      "What gets called civics is usually just the system teaching you which questions not to ask.",
    date: "2026-06-14",
  },
  {
    slug: "who-gets-to-print-money",
    title: "Who Gets to Print Money",
    blurb:
      "The oldest form of control doesn't need an army. It just needs a printing press and your trust.",
    date: "2026-05-02",
  },
  {
    slug: "the-sermon-and-the-census",
    title: "The Sermon and the Census",
    blurb:
      "Every empire that ever counted its people first told them a story about why counting was holy.",
    date: "2026-03-19",
  },
];
