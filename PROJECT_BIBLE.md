# wakefieldwrites.com — Project Bible

This is the running record for rebuilding wakefieldwrites.com. Every session works from this doc and updates it before finishing. It's also mirrored into the "Pulling the Thread" Claude Project so it's visible from any device.

---

## 1. Why this project exists

The old wakefieldwrites.com was built on Base44 (a no-code AI app builder). Kyler stopped paying for Base44, so the site went down. Rather than resubscribe, he's rebuilding it himself on infrastructure he owns outright: VS Code (editor), GitHub (version control + source of truth), Vercel (hosting/deploy), Supabase (database, if/when needed). Kyler owns the wakefieldwrites.com domain already.

**Cost after rebuild:** just domain renewal + PayPal's normal transaction fees. No monthly platform fee.

## 2. What the site needs to do

Confirmed with Kyler on 2026-08-27:

- **Online store** for his book, using PayPal Buttons (no full e-commerce backend needed — PayPal hosts the transaction)
- **Home base for his writing** — positions Kyler as a writer/author, not just a book landing page
- **Funnel to his Human Species Project (HSP) Substack** — writing/blog section links out to Substack rather than hosting posts natively (decided 2026-08-27: fastest path, Substack stays source of truth)
- Open to it growing into a **general personal/creator hub** advertising his other projects, with writing front and center

## 3. Key decisions log

| Date | Decision |
|---|---|
| 2026-08-27 | Rebuild stack: Next.js + GitHub + Vercel + Supabase (Supabase only if/when dynamic features are needed — not required for launch) |
| 2026-08-27 | Blog approach: funnel to Substack, not a native CMS |
| 2026-08-27 | No Base44 export — costs another month's subscription to access, so building fresh instead |
| 2026-08-27 | Site copy/design theme pulled directly from the *Pulling the Thread* manuscript (project docs), not generic placeholder text |
| 2026-08-27 | Build location: `C:\Users\wakin\wakefieldwrites` on Kyler's machine (device: kylerwakefield), built via the device bridge / device_bash where possible |

## 4. The book (source material for site copy)

**Title:** Pulling the Thread: Perception, Control, and the System Behind Everything
**Author:** Kyler Wakefield
**Published:** Amazon, June 2026 (ASIN B0HFVXC1JC)

Core thesis: a documented, sourced argument that the same architecture of control — Education, Finance, Religion, Media, and Law — has been used across every empire and era in recorded history to manage perception and belief, not through secret conspiracy but through open, self-sustaining systems. The book is structured to mirror that architecture, moving from global scale down to the personal, then handing the reader five tools back (attention, money, identity, voice, community) in the final chapter.

Tone: plain language, no academic gatekeeping, evidence-first ("this book builds a picture, it does not tell you what to see in it"), personal and lived-in (written live, during real events, from a hotel front desk in Santa Rosa, NM).

Related project: **The Human Species Project (HSP)** — Kyler's brand/Substack for this writing.

## 5. Build log

### Session 1 — 2026-08-27
- Scaffolded Next.js 15 project (TypeScript, Tailwind, App Router, src/ dir) in cloud workspace
- Built 4 pages themed directly on the book's own language/thesis (pulled from Pulling_The_Thread_Master_v20.docx in the project):
  - `/` — home, hero + method + architecture + pull quote
  - `/book` — book detail page with PayPal Buy button (graceful fallback to an Amazon link until real PayPal credentials are set)
  - `/writing` — funnels to the Human Species Project Substack (placeholder URL, needs real one)
  - `/projects` — bio + project directory, built to grow
- Removed Google Fonts dependency (used system font stacks instead) after confirming the cloud sandbox couldn't reach fonts.googleapis.com — this also means zero external font fetch dependency in production, which is a plus, not just a workaround
- Verified clean production build (`npm run build`) in the cloud workspace — all 4 routes render as static pages
- Transferred full source to Kyler's machine at `C:\Users\wakin\wakefieldwrites` (zipped, sent, committed via device bridge, unzipped in place)
- **Known issue:** installing `node_modules` directly through the device-bridge shell (`device_bash`) is unreliable — that shell has a ~45s hard cap per call, doesn't persist background/`nohup` processes between calls, and npm's install over the mounted network folder is slow enough to get interrupted mid-write (caused one corrupted install, cleaned up). **Conclusion: `npm install` and `npm run dev`/`npm run build` need to be run by Kyler directly in his own terminal (VS Code's integrated terminal or a normal command prompt/PowerShell), not through this bridge.** The bridge is fine for file edits, just not long-running installs.
- Next: Kyler runs `npm install` + `npm run dev` locally to confirm it works on his machine; then push to GitHub; then import in Vercel; then fill in real PayPal/Substack/bio details from section 6.

## 5a. Workflow correction — 2026-08-27

Kyler's intent: this project should be driven from **VS Code with Claude Code**, running locally on his machine — not built remotely and handed over as a finished drop. The source code already placed at `C:\Users\wakin\wakefieldwrites` is a legitimate starting point (real, working, themed on the book) — no need to redo it. From here, next steps happen in VS Code's own terminal / Claude Code, not through the remote device-bridge shell (which is unreliable for long-running installs — see known issue above).

Domain connection (wakefieldwrites.com → Vercel) is the last step, after: local dev confirmed working → pushed to GitHub → imported into Vercel. Kyler asked to be told when it's time for that step.

## 5b. Session 2 — 2026-08-27 (continued)

- Domain connected: wakefieldwrites.com DNS moved from IONOS (old Base44 records removed) to Vercel; Vercel Domains shows green/Valid Configuration. Live.
- Real PayPal integration wired in by Claude Code (running locally in VS Code): hosted button ID `J2UPDTDR7L3GC`, client ID set in `.env.local` and in Vercel env vars (Production/Preview/Development, type "Config" not "Secret" since these are NEXT_PUBLIC_ values meant to be client-readable). Venmo funding enabled. Verified live via headless browser screenshot on `/book` — real PayPal checkout renders ("Pulling the Thread - Signed," $25.00 USD, hardcover/paperback selector). Committed as `2746f0b`.
- Amazon listing updated site-wide to current ASIN **B0HFVXC1JC** (replacing the earlier B0H2HL3WDK, which was superseded — likely a KDP pre-order/rep issue per earlier book-marketing notes).
- **Confirmed: book's ebook is enrolled in KDP Select.** Checked whether that blocks posting a website excerpt — it does not. Select's exclusivity clause covers the ebook file/full text on other retailers, not a promotional excerpt of front matter on the author's own site (equivalent to Amazon's own "Look Inside"). Full front-matter-through-start-of-Part-One text is fair game as a sample; just never post the complete book text.
- Decided: add a "Read a Sample" page with an animated page-flip UI (Kyler's choice over a plain scrolling excerpt) showing the book's front matter — About This Book, Dedication, Epigraph, Thesis, Introduction ("I Couldn't Unsee It"), through the start of Part One / "The View From 30,000 Feet." Exact source text saved to `sample-content.md` in the project root — use that verbatim, do not paraphrase.
- **Built the "Read a Sample" flipbook at `/sample`** using `react-pageflip`. Verbatim front-matter text split into pages at natural section boundaries, plus a dark cover page and an "End of Sample" closer — in `src/components/sampleContent.ts` (data) and `src/components/FlipbookViewer.tsx` (rendering); `sample-content.md` deleted once absorbed. SSR handled via `dynamic(() => import("react-pageflip"), { ssr: false })`. Added "Read a Sample" to nav and a button on `/book`.
- **Built `src/components/BookCover.tsx`**: the cover-art image as a "floating" 3D treatment — radial CSS mask feathers the flat photo background into the page, plus a slow `rotateY` swing + bob animation. Used on the homepage hero and `/book`. This is the "3D floating book" mockup referenced in 5c0 below.

## 5c0. IMPORTANT — protect the 3D floating book on /book — 2026-08-27

The live site (checked directly at wakefieldwrites.com/book on 2026-08-27) now has a 3D-rendered hardcover book mockup — angled, with realistic shadow/lighting, showing the gold-thread cover art on a physical-looking book — in the "Get the book" area of the /book page. This is `BookCover.tsx` (see the build-log entry directly above this section) — a real, logged piece of work, not an unexplained gap; it just landed in a session whose build-log updates repeatedly got clobbered by stale-base edits before being restored (recurring issue — see the note at the very end of this file).

**Kyler explicitly wants this 3D floating book KEPT — do not replace it with the old Base44 site's flat/static hero cover image treatment.** When doing the Store section redesign, keep this existing 3D book visual as-is; only add the new copy/structure around it. Reconfirmed directly by Kyler multiple times across sessions. This is a specific instance of the general "don't remove existing content without asking" rule, called out by name because it's the one thing Kyler flagged directly.

## 5c. Bug report — sample page blank — 2026-08-27

Kyler reports `/sample` (the react-pageflip flipbook) loads to a mostly blank screen — flipbook not rendering. Likely causes to check first (standard react-pageflip + Next.js App Router issues): (1) SSR/hydration — HTMLFlipBook must be dynamically imported with `ssr: false`; (2) the flipbook's parent container has no explicit width/height, so the library measures 0x0 on mount and renders invisible; (3) a silent client-side JS error that doesn't show in the terminal, only the browser console. Needs real debugging (headless browser + console read + DOM inspection), not a guess-and-patch.

**Resolved.** Root cause was neither of the two most obvious guesses — both checked and ruled out with direct evidence: the raw prerendered HTML correctly showed React's `BAILOUT_TO_CLIENT_SIDE_RENDERING` marker exactly where `ssr:false` should put it, and the mounted flipbook's own DOM measured a correct non-zero size in every test. The actual cause: `react-pageflip` code-splits into ~10 separate JS chunks, and the wrapper had no `min-height` and the `dynamic()` import had no `loading` fallback — so for however long those chunks take to fetch, the container had nothing rendered into it and collapsed to ~48px of padding, leaving a large empty void exactly where the book belongs. Fixed with a `min-height` on the wrapper and a loading fallback. Separately also fixed: text getting cut off on several pages (react-pageflip forces `display:block` + `position:absolute` via inline style on its own page wrapper, silently breaking a flex-based scroll container — fixed with `position:absolute` + `inset` instead). Also rebalanced pagination, added gold prev/next controls, added the site logo/favicon, and did a page-fullness pass. Re-verified working repeatedly since across multiple sessions (most recently: fresh `npm run dev` + real browser screenshot + click-to-flip, zero console errors).

## 5d. New content captured — 2026-08-27 (NOT YET BUILT — backlog only, Kyler said "not this min")

Two new site sections requested: **About the Author** (expand/replace the placeholder bio on `/projects`, or its own page) and a **Reviews/Testimonials** section, seeded with a review from Margaret Manos. Kyler explicitly said don't build this right now — just capture it so it's not lost. Content below is final, ready to use whenever this gets built.

### Review — Margaret Manos

> "Brilliantly simple, clear-headed, and well-constructed. You have tied together so many threads I simply hadn't tied. In the end, your book gives me hope for this country."

**Attribution:** Margaret Manos, Professional Editor — 25+ years (90+ books)

### About the Author — full bio (Kyler confirmed: use this FULL version verbatim on the public website, not a shortened one — this is a deliberate choice, already discussed and confirmed with him on 2026-08-27, don't second-guess it in a future session)

> I work weekdays on my family's ranch, and the night shift on weekends at a hotel in Santa Rosa, New Mexico. I am two years sober.
>
> The years leading up to this book were the roughest of my life — and almost ended it a few times. Starting around 2020 I began struggling with addiction. Cocaine. Fentanyl. Heroin. Meth. What started as experimentation did what addiction always does — it escalated into something I couldn't control and didn't recognize as myself anymore. My morals went out the window. My self-esteem followed. I had owned a house at twenty-two and was running my own construction company. Within a year and a half I was homeless and broke. The person I had been went somewhere I couldn't find for a long time.
>
> Between January and May of 2024 I overdosed three times. The last time I woke up in a hospital. That was the moment. What followed was a year moving between rehab facilities — fighting for the version of myself that was still in there somewhere. On May 8, 2024, I got sober. I have stayed sober since.
>
> When I came out the other side the world looked different. Not just spiritually — though I did get closer to my God. Everything looked different. Truths I couldn't see before became visible. Patterns emerged that I couldn't unsee once I saw them. The years on the street had given me something no classroom teaches — an understanding of how systems work on people. How they capture and hold and exhaust the most vulnerable. How the gap between what we are told and what is real shows up first in the lives of the people who have nothing left to protect them from it.
>
> In January of 2025 I went back to school. I earned my ASBA degree in eleven months, graduating with honors and an invitation to the National Society of Leadership and Success.
>
> This book started the same year. Not because I had credentials. Because I couldn't stop asking questions. Because once you see the pattern you can't unsee it. Because I always wanted to write something — and somewhere between the hospital bed and the hotel front desk I realized that finding the truth was never going to be enough. The mission had to be sharing it.
>
> I am not a professor. I am not a journalist or a politician or a Washington insider. I am a person who almost didn't make it — and decided that making it wasn't enough if it didn't mean something.

No photo provided yet — still needed whenever this section gets built.

## 5e. Old Base44 site research — 2026-08-27

Kyler pointed to the live Base44 site (https://wakefieldwrites.base44.app/) — still reachable despite him no longer paying for Base44, worth knowing (may be on a delayed/free-tier shutdown rather than truly gone). Reviewed it via WebFetch + Chrome browser screenshots to pull forward ideas worth keeping. Findings:

**Structure:** single-page app with anchor-scrolled sections (Book/Store/About/Project/Contact all on one page via #hash links) plus two real separate routes: `/archive` and `/review`.

**Book cover art:** a striking hero image — a single gold "thread" running down into root-like tendrils, on a dark navy/black gradient, with the title in an elegant serif over it. On-theme and worth reusing IF Kyler owns the source file outright (need to confirm — if it was generated inside Base44's own tools as part of the subscription, treat that as an open question before treating it as a permanent asset). A screenshot capture is saved for reference (`public/old-site-cover-reference.png`) but is not final-quality — get the original file from Kyler if possible.

**Resolved:** this is the same image Kyler already dropped in as a real source file (`assets/images/1062.jpg`, not a screenshot capture) — already in use site-wide as the logo/favicon and as the source for the `BookCover.tsx` 3D treatment (see 5c0). Confirmed he has the actual file, not just something trapped in Base44's tools.

**Store section — worth adopting almost as-is:** two-tier structure. Tier 1 up top: "Available wherever you prefer to shop" with retailer buttons (Amazon Kindle eBook, Barnes & Noble paperback/hardcover). Tier 2 below: "Prefer to support the author directly? Buy a signed copy from Kyler" — "Every copy ordered here is personally signed and ships directly from the author. Same book — can't get this on Amazon." Two cards: Paperback — signed ($20 + shipping), Hardcover — signed ($30 + shipping, was cut off in the screenshot but same pattern), each with its own Add to Cart. This reframes the direct-purchase option as a deliberate reader choice, not just "the checkout" — much stronger than what the current `/book` page has.

**Reviews (`/review`):** NOT just a static list — a live, interactive page. Header: "What Readers Are Saying" / "Read what others thought of the book, then share your own experience below." Shows existing reviews (Margaret's is the first), then a real submission form below: Your Name (required), Title/Role (optional, placeholder examples "Reader, Educator, Book Club Member..."), Your Review (required textarea), Submit Review button. This needs a real backend to store submissions — first legitimate use case for wiring up Supabase in this project.

**Archive (`/archive`):** "The Full Record" — "Every article from The Human Species Project and all books by Kyler Wakefield — browse by date or topic." Toggle between Articles/Books, sort dropdown ("Newest First"), each article shown as a card with HSP logo, title, one-line blurb, date, and Share buttons. Example seen: "A Rich Man's War" — "Two governments, 160 years apart, ran out of volunteers and reached for the same instrument." — July 26, 2026. This is a much richer version of the current `/writing` page (which just link-outs to Substack blind). Needs a way to source article data — either manual entries Kyler adds himself, or pulling from Substack's RSS feed.

**Kyler's direction for the rebuild (2026-08-27):** build all three of the above (Store redesign, interactive Reviews w/ Supabase, Article Archive) — blend the best of the old Base44 site's ideas with the new build's existing style, don't just copy one or the other wholesale. **Hard rule, repeat this to Claude Code every time: never remove or replace existing content/pages/sections without asking Kyler first** — additive and careful, not a rewrite.

**Confirmed why the old site is being fully replaced, not just re-pointed:** the Base44 site being reachable at wakefieldwrites.base44.app is just Base44's free-tier subdomain still running — it is NOT evidence the old build could still serve wakefieldwrites.com. Kyler confirmed Base44 requires paying for their "builder package" to use a custom domain at all, which is exactly the subscription cost he's avoiding by building this himself with Claude Code + Next.js + Vercel + Supabase. The Base44 site is being used purely as a reference/idea source (design, copy, structure) — not as something to keep paying for or migrate back to.

## 5f. Supabase project created — 2026-08-27

Kyler has a separate Supabase **organization** called "Wakefield Writes" (distinct from the "Korale" org used by his other side project — kept intentionally separate, not shared). Created a new project inside it via the Supabase dashboard directly.

Project URL: `https://kpyyvuvqonykzzdcxtmd.supabase.co`. Anon/public key: verified by decoding the JWT payload — confirmed `"role": "anon"`, safe to expose client-side. Not repeating the key value here since it's already in `.env.local` / Vercel env vars. Handed to Claude Code to wire up as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the interactive Reviews feature.

**Correction/refinement from later the same session:** the Supabase MCP tools' `list_projects` and `list_organizations` only surfaced the "Korale" org, but `get_project`, `list_tables`, and `apply_migration` all worked directly against this project when called with its project ID explicitly — project-scoped access apparently isn't gated by the org-listing calls. Don't conclude a project is inaccessible just because it's missing from `list_projects`; try a direct `get_project` call with the known ID first.

## 5g. Session 3 — 2026-08-27 — five-step build (bug fix + 4 new features)

Kyler asked for all remaining open items in one pass, in order, each verified with real browser checks (not just "it compiled") and committed separately so any step can be reviewed/rolled back independently. Hard rule followed throughout: additive only, never remove/replace existing content without asking first.

**Step 1 — `/sample` blank page:** already fixed in a prior session (see 5c above) — re-verified working before starting anything else.

**Step 2 — `/book` Store redesign:** restructured the purchase panel into the old Base44 site's two-tier pattern (5e), in this site's own copy/visual style. Tier 1: "Available wherever you prefer to shop" — Amazon + Barnes & Noble buttons. Tier 2: "Prefer to support the author directly?" / "Buy a signed copy from Kyler" — framing copy, then the existing `PayPalButton` component completely unchanged, just given better context, not rebuilt. The 3D `BookCover` visual untouched per 5c0. Verified via headless browser: both retailer links correct, PayPal still renders 4 live iframes (real checkout) after the restructure.

**Step 3 — `/about` page:** dedicated new page (not added into `/projects`) — the bio is long and personal, and a new page is purely additive. Full verbatim bio, photo area a clearly marked placeholder at the time. Added to nav and as a new card on `/projects` (existing cards untouched). Found and fixed a real CSS Grid bug during verification: `grid-cols-[1fr_1.6fr]` rendered as `1200px 115px` instead of a proportional split — classic "implied minimum size" issue from an `aspect-square` placeholder with no intrinsic content. Fixed with `min-w-0` on both grid children.

**Step 5 — `/archive` page (original version):** launched with hardcoded placeholder article data (one real example from the old Base44 site, "A Rich Man's War," plus illustrative placeholders) since there was no live data source wired up yet — see 5h below for why and how this got replaced with real Substack data the next day. Added "Archive" to nav.

**Step 4 — `/reviews` page + Supabase:** table schema: id, name, role (nullable), review_text, approved (bool, default false), created_at. RLS enabled: anon can INSERT anything, but can only SELECT rows where `approved = true` — enforced at the database level, not just filtered in app code. Verified this actually holds by inserting an unapproved test row directly and confirming the public REST endpoint didn't return it. Margaret's review seeded as pre-approved (a real row, not hardcoded in the page).

Found and fixed two real bugs via direct REST testing *before* writing any page code: (1) a plain `CREATE TABLE` doesn't grant the `anon` role table-level privileges the way Supabase's dashboard UI does — needed explicit `GRANT SELECT, INSERT ... TO anon` (plus sequence `USAGE`) on top of the RLS policies; (2) requesting the row back after insert (`.select()` in the JS client) failed with an RLS violation, because a freshly-submitted row defaults to `approved=false` and the read-back is itself subject to the SELECT policy — `ReviewForm.tsx`'s insert deliberately omits `.select()`. `/reviews` is `export const dynamic = "force-dynamic"` — confirmed via build output (○ static → ƒ dynamic) that without this, newly-approved reviews would never show until the next deploy. Full flow verified end-to-end via Playwright driving the real form. Added "Reviews" to nav.

**Follow-up same session — images.** Kyler dropped three images into `assets/images/`: the HSP emblem logo, a decorative gold "Kyler Wakefield" signature graphic, and a promotional "Thank You" flyer. Used the first two (cropped an icon-only version of the HSP emblem for small-badge use on `/writing` and per-article on `/archive` cards; cropped the signature tighter and placed it on `/book`'s signed-copy tier and `/about`'s closing flourish, both masked to blend at the time — mask later removed, see 5i). Skipped the flyer — too much baked-in text/CTAs to work as a responsive site element.

## 5h. Real Substack URL + Archive page must be live-synced, not hardcoded — 2026-08-28

Kyler confirmed the real HSP Substack URL: **https://thehumanspeciesproject.substack.com** (this replaces the placeholder `humanspeciesproject.substack.com` used earlier on `/writing` — that placeholder needs updating too, not just the new Archive page).

Kyler also corrected the Archive page plan from step 5 of section 5e: it must NOT launch with hardcoded placeholder articles. It needs to show the actual most recent HSP articles, with real working links to each article, and the Share button on each card must share that specific article's real URL (not a generic site link).

**Confirmed working approach: Substack's public RSS feed.** Verified live at `https://thehumanspeciesproject.substack.com/feed` — valid RSS 2.0, returns real titles/links/dates, publishes roughly weekly. Sample of what it returns (as of 2026-08-28, will change as Kyler publishes more):
- The Fourth Room — /p/the-fourth-room — Aug 16, 2026
- What Attention Costs — /p/what-attention-costs — Aug 9, 2026
- What the Count Is For — /p/what-the-count-is-for — Aug 2, 2026
- A Rich Man's War — /p/a-rich-mans-war — Jul 26, 2026 (this one matches the example seen on the old Base44 archive page, confirming it's the right feed)
- The Ones Behind the Ones You See — /p/the-ones-behind-the-ones-you-see — Jul 19, 2026
- When a System Outgrows Its Own Eyes — /p/when-a-system-outgrows-its-own-eyes — Jul 12, 2026
- The Veto That Ate Itself — /p/the-veto-that-ate-itself — Jul 5, 2026
- The Story Was Always a Sales Pitch — /p/the-story-was-always-a-sales-pitch — Jun 28, 2026

**Implementation note for whoever builds this:** fetch and parse the RSS feed server-side (a Next.js Server Component or a route handler that fetches on request/at build time with revalidation — don't fetch client-side, and don't hardcode the article list, since the whole point is it needs to stay current automatically as Kyler publishes new HSP posts). Use each item's real `<link>` for both the card's click-through and the Share button — no placeholder/generic URLs anywhere on this page.

**Resolved same day.** `src/lib/hspFeed.ts` fetches and parses the feed server-side via `fast-xml-parser`, `next: { revalidate: 3600 }`. Verified item structure against the live feed directly before writing the parser (not guessed) — found the feed embeds numeric HTML entities inside CDATA text (e.g. `&#8212;` for an em dash), which XML parsers correctly leave untouched since CDATA is nominally literal; added a small decoder so blurbs don't show raw entity codes. Build output confirmed `/archive` picked up the revalidate config (`Revalidate 1h`) and a real fetch succeeded during `npm run build`. Verified end-to-end via headless browser: all 19 real titles render — including every one from the sample list above — sorted newest-first; each card's title links to its real Substack URL; Share button verified (via forcing the clipboard-fallback path with `navigator.share` stubbed out) to put that specific article's real URL on the clipboard, not a generic site link. `/writing`'s Substack URL fixed to the real one at the same time. Committed `78dae4d`.

## 5i. Session 4 — 2026-08-28 — layout swap, author photo, signature fix

**`/book` layout swap.** Kyler's written instructions and hand-drawn note (`book-page-layout-note.png`) both described the layout that was already live (cover+store cards left, description right) — rather than guess whether he meant "no change" or had misdescribed a swap, asked directly. He wanted the actual opposite: description moves into the left column with the cover (reads as one "about the book" block), store/purchase cards become a dedicated right-column buy-box sidebar. Grid ratio flipped to `[1.3fr_1fr]` to match. Verified at both desktop and mobile — mobile's stacking order (cover → description → purchase cards → Read a Sample) reads sensibly on its own. Committed `adbdf9b`.

**Signature mask removed.** The radial-mask feathering on the "Kyler Wakefield" signature graphic (added in 5g to blend it into its surface box) was clipping the ascender on "K" and the descender on "d." Removed from both `/book` and `/about`; deleted the now-unused `.signature-img` CSS rule. Verified via a cropped screenshot of just the signature that both letterforms render in full. Same commit (`adbdf9b`).

**Author photo.** Kyler provided `assets/images/mme.png` (2.8MB, 1085×1449 full-body portrait). Resized to 900px wide (~297KB) via `sharp` before handing to `next/image`. Replaced the `/about` placeholder's `aspect-square` container with the photo's actual ~3:4 ratio instead of force-cropping a full-body shot into a square. Explicit width/height to avoid layout shift; alt text "Kyler Wakefield." Verified via screenshot: renders uncropped, undistorted. Committed `52adf66`.

## 6. Open items / needs from Kyler

- [x] ~~Real book description/back-cover copy~~ — using manuscript's own "About This Book" text, confirmed
- [x] ~~PayPal Business account button ID(s)~~ — done, live
- [x] ~~GitHub account ready for a new repo~~ — done, `github.com/wakingking97/wakefieldwrites`
- [x] ~~Vercel account ready to import that repo~~ — done, deployed
- [x] ~~Domain connected~~ — done, wakefieldwrites.com live via IONOS DNS → Vercel
- [x] ~~Author bio text~~ — full bio captured in section 5d, confirmed ready to use as-is
- [x] ~~Margaret's review~~ — captured in section 5d, ready to use as-is
- [x] ~~Author photo for the site~~ — done, real photo live on `/about` (see 5i)
- [x] ~~HSP Substack URL~~ — done, real URL (`thehumanspeciesproject.substack.com`) live everywhere it's used (see 5h)
- [ ] Confirm final scope: book-store-first vs. broader personal hub
- [x] ~~Fix the blank `/sample` flipbook page~~ — resolved, re-verified repeatedly since (see 5c)
- [x] ~~Build "About the Author" section~~ — done, live at `/about` (see 5g/5i)
- [x] ~~Build interactive Reviews section w/ submission form + Supabase storage~~ — done, live at `/reviews` (see 5f/5g)
- [x] ~~Redesign `/book` Store section~~ — done, two-tier layout live, later swapped to a buy-box sidebar layout per Kyler's follow-up (see 5g/5i)
- [x] ~~Build Article Archive page~~ — done, live at `/archive`, pulling real articles from Substack's RSS feed with per-article Share links (see 5h)
- [x] ~~Confirm whether Kyler owns the book cover art source file from Base44~~ — yes, `assets/images/1062.jpg`, in use as logo/favicon + `BookCover.tsx` (see 5c0/5e)

## 7. How to pick this back up

Read this file first. Then check the live code at `C:\Users\wakin\wakefieldwrites` (or wherever it's since moved) for current state vs. what's logged here. Update section 5 (Build log) and section 3 (Decisions) every session before ending.

**Recurring issue worth knowing about:** this file has repeatedly been edited from a stale base by a concurrent session (mirrored to the "Pulling the Thread" Claude Project, per the note at the top) — each time, new content from that session was genuinely valuable and got kept, but it also silently reverted several already-resolved items (the ASIN in section 4, the `/sample` fix writeup, build-log entries for whole sessions of work) back to earlier states. If you're picking this up and something here looks like it contradicts the live code or a commit that clearly already happened, check `git log`/the actual code before trusting the doc — and merge rather than overwrite when reconciling, since both sides usually have something worth keeping.
