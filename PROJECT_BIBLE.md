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
**Published:** Amazon, June 2026 (ASIN B0H2HL3WDK)

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

## 5c0. IMPORTANT — protect the 3D floating book on /book — 2026-08-27

The live site (checked directly at wakefieldwrites.com/book on 2026-08-27) now has a 3D-rendered hardcover book mockup — angled, with realistic shadow/lighting, showing the gold-thread cover art on a physical-looking book — in the "Get the book" area of the /book page. This was built at some point after the original scaffold (likely by Claude Code locally, not reflected in earlier build log entries — the record has a gap here worth noting for future sessions: the build log should be updated every time Claude Code makes a meaningful change, and it clearly wasn't for whatever added this).

**Kyler explicitly wants this 3D floating book KEPT — do not replace it with the old Base44 site's flat/static hero cover image treatment.** When doing the Store section redesign (tiered "shop anywhere" / "buy signed direct" restructure, see 5e), keep this existing 3D book visual as-is; only add the new copy/structure around it. This is a specific instance of the general "don't remove existing content without asking" rule, called out by name because it's the one thing Kyler flagged directly.

## 5c. Bug report — sample page blank — 2026-08-27

Kyler reports `/sample` (the react-pageflip flipbook) loads to a mostly blank screen — flipbook not rendering. Not yet fixed as of this writing. Likely causes to check first (standard react-pageflip + Next.js App Router issues): (1) SSR/hydration — HTMLFlipBook must be dynamically imported with `ssr: false`; (2) the flipbook's parent container has no explicit width/height, so the library measures 0x0 on mount and renders invisible; (3) a silent client-side JS error that doesn't show in the terminal, only the browser console. Needs real debugging (headless browser + console read + DOM inspection), not a guess-and-patch.

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

**Book cover art:** a striking hero image — a single gold "thread" running down into root-like tendrils, on a dark navy/black gradient, with the title in an elegant serif over it. On-theme and worth reusing IF Kyler owns the source file outright (need to confirm — if it was generated inside Base44's own tools as part of the subscription, treat that as an open question before treating it as a permanent asset). A screenshot capture is saved for reference but is not final-quality — get the original file from Kyler if possible.

**Store section — worth adopting almost as-is:** two-tier structure. Tier 1 up top: "Available wherever you prefer to shop" with retailer buttons (Amazon Kindle eBook, Barnes & Noble paperback/hardcover). Tier 2 below: "Prefer to support the author directly? Buy a signed copy from Kyler" — "Every copy ordered here is personally signed and ships directly from the author. Same book — can't get this on Amazon." Two cards: Paperback — signed ($20 + shipping), Hardcover — signed ($30 + shipping, was cut off in the screenshot but same pattern), each with its own Add to Cart. This reframes the direct-purchase option as a deliberate reader choice, not just "the checkout" — much stronger than what the current `/book` page has.

**Reviews (`/review`):** NOT just a static list — a live, interactive page. Header: "What Readers Are Saying" / "Read what others thought of the book, then share your own experience below." Shows existing reviews (Margaret's is the first), then a real submission form below: Your Name (required), Title/Role (optional, placeholder examples "Reader, Educator, Book Club Member..."), Your Review (required textarea), Submit Review button. This needs a real backend to store submissions — first legitimate use case for wiring up Supabase in this project.

**Archive (`/archive`):** "The Full Record" — "Every article from The Human Species Project and all books by Kyler Wakefield — browse by date or topic." Toggle between Articles/Books, sort dropdown ("Newest First"), each article shown as a card with HSP logo, title, one-line blurb, date, and Share buttons. Example seen: "A Rich Man's War" — "Two governments, 160 years apart, ran out of volunteers and reached for the same instrument." — July 26, 2026. This is a much richer version of the current `/writing` page (which just link-outs to Substack blind). Needs a way to source article data — either manual entries Kyler adds himself, or pulling from Substack's RSS feed.

**Kyler's direction for the rebuild (2026-08-27):** build all three of the above (Store redesign, interactive Reviews w/ Supabase, Article Archive) — blend the best of the old Base44 site's ideas with the new build's existing style, don't just copy one or the other wholesale. **Hard rule, repeat this to Claude Code every time: never remove or replace existing content/pages/sections without asking Kyler first** — additive and careful, not a rewrite.

**Confirmed why the old site is being fully replaced, not just re-pointed:** the Base44 site being reachable at wakefieldwrites.base44.app is just Base44's free-tier subdomain still running — it is NOT evidence the old build could still serve wakefieldwrites.com. Kyler confirmed Base44 requires paying for their "builder package" to use a custom domain at all, which is exactly the subscription cost he's avoiding by building this himself with Claude Code + Next.js + Vercel + Supabase. The Base44 site is being used purely as a reference/idea source (design, copy, structure) — not as something to keep paying for or migrate back to.

## 5g. Real Substack URL + Archive page must be live-synced, not hardcoded — 2026-08-28

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

## 5f. Supabase project created — 2026-08-27

Kyler has a separate Supabase **organization** called "Wakefield Writes" (distinct from the "Korale" org used by his other side project — kept intentionally separate, not shared). Created a new project inside it via the Supabase dashboard directly (not through this session's Supabase MCP connection, which only had access to the Korale org — worth knowing for future sessions: don't assume MCP tool access covers all of Kyler's orgs, verify first).

Project URL: `https://kpyyvuvqonykzzdcxtmd.supabase.co`
Anon/public key: verified by decoding the JWT payload — confirmed `"role": "anon"`, safe to expose client-side. Not repeating the key value here since it's already in `.env.local` / Vercel env vars; if it's ever needed again, Kyler can pull it fresh from Supabase Settings → API on that project.

Handed to Claude Code to wire up as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the interactive Reviews feature (step 4 in the 5e build plan).

## 5h. Sample flipbook cover — 2026-08-28

Kyler wants the /sample flipbook's first page to show the ACTUAL book cover image (the gold-thread design used elsewhere on the site, e.g. the 3D book mockup on /book) instead of a plain text title page — makes the flipbook read more like an actual physical book being opened. The cover image asset should already exist somewhere in the project (used for the /book 3D mockup and possibly assets/images/) — reuse it, don't regenerate/re-source it.

Originally logged as backlog-only ("not now"), but Kyler then shared a screenshot of the current plain-text title page and asked to send the fix now instead of waiting — sent to Claude Code same day.

## 5i. Site credibility/SEO pass — 2026-08-28

Kyler shared a list of Copilot suggestions for strengthening the site. Went through each one:

1. **Structured metadata (OpenGraph, Twitter cards, SEO tags)** — pure engineering, no content decisions needed. Approved, sent to Claude Code (see prompt below).
2. **Backlinks to LinkedIn, Substack, Amazon Author Page** — Substack URL already confirmed (5g). **LinkedIn confirmed:** `https://www.linkedin.com/in/kyler-wakefield-48200b403/`. Amazon Author Page confirmed real: `https://www.amazon.com/stores/Kyler-Wakefield/author/B0H6H2N9ZC` (note: this URL has tracking/session query params attached — strip those down to the clean stores URL before using it as a permanent site link).
3. **Brand identity as "author, builder, founder, legacy-maker"** — Kyler explicitly rejected stacking these buzzy titles; his own bio (see 5d) already carries the positioning honestly and matches the book's plain-spoken voice. Do NOT add title-stacking language anywhere on the site.
4. **Trust markers — About, Contact, Privacy Policy, book page, "ranch-management app" page** — About and book page already exist/in progress. Contact page and Privacy Policy are new, real additions — approved. The "ranch-management app" was NOT a Copilot hallucination — it's real: **Korale** (getkorale.com), a separate project Kyler is building (also has its own Supabase project, seen earlier under the "Korale" org). Add a link to it from `/projects` as one of Kyler's other ventures — do NOT build a dedicated page for it on wakefieldwrites.com itself, it's a separate live product with its own site; just link out.

## 5j. Other Projects section + Korale description — 2026-08-28

Kyler flagged that a bare Korale link on `/projects` needs real context, or it doesn't make sense to a visitor. Read Korale's own project files directly (connected folder `C:\Users\wakin\korale`) — it's a real, actively developed Expo/React Native ranch-management app with a genuinely substantial feature set: finance/net-worth tracking, GPS pasture boundary mapping with auto-calculated acreage, livestock/animal records, gate and grazing/pasture management, equipment valuation, employee tracking. Confirmed with Kyler this description is accurate for site use:

> "Korale is a ranch management app I'm building — finances, herd records, pasture mapping, and day-to-day operations, all in one place, built for real working ranches."

Build this as a proper "Other Projects" section on `/projects` (not just a bare link) — Korale gets its own card/block with that description and a link to getkorale.com, styled consistent with how the existing book/HSP project cards on that page look. This section can hold future projects too, not just Korale — build it as a genuinely reusable pattern, not a one-off.

## 5k. SEO/social metadata, Contact, Privacy, Other Projects, outbound links — 2026-08-28

Built all five items from the 5i/5j credibility pass, all additive, nothing removed:

1. **Site-wide SEO/social metadata.** Added `src/lib/metadata.ts` — a `pageMetadata()` helper every page now calls, so title/description/OpenGraph/Twitter Card/canonical URL stay in sync from one place instead of being hand-duplicated per page. Root layout (`src/app/layout.tsx`) sets `metadataBase` (`https://wakefieldwrites.com`) so relative image/URL fields resolve to absolute ones in the rendered `<head>`. Every existing page kept its own already-accurate title/description text (nothing invented) — just routed it through the helper, which now also emits matching `og:title`/`og:description`/`og:url`/`twitter:*` tags. og:image site-wide is `/images/book-cover-flat.jpg` — the flat 2D cover art (1536×1024), not the 3D-tilted CSS mockup used on `/book`'s hero, since a static OG card needs a flat image. `/about`'s og:image overrides to the author photo instead. Verified by curling the dev server's rendered HTML for `/book` and `/projects` — full tag set confirmed present with correct absolute URLs (see build log; not just asserted).
2. **`/contact` page.** Static page, single mailto: link. **Email address confirmed directly by Kyler this session: `kyler@wakefieldwrites.com`** (wasn't in any project file, so it was asked for rather than guessed — update section 6 below, this closes that open item).
3. **`/privacy` page.** Plain-language policy, kept short. States exactly what's real: review submissions (name, optional role, review text) go to Supabase and are moderated before publishing; no payment info is collected or stored on this site — PayPal handles all of that on their own systems; outbound links (Amazon, B&N, Substack) go to their own privacy policies. **Flagging for Kyler, not guessing:** this is plain-English and accurate to current site behavior, but it is not attorney-reviewed and doesn't address GDPR/CCPA-style formal requirements (no cookies/analytics are in use today, so none of that boilerplate was added — if that changes, e.g. adding Vercel Analytics, this page needs a matching update).
4. **"Other Projects" section on `/projects`.** Built as a reusable pattern, not a Korale-only block: `src/lib/otherProjects.ts` holds a typed `OtherProject[]` array (name/description/url), rendered by `src/components/OtherProjectCard.tsx`, styled to match the existing project cards on that page. Korale is the only entry today, using Kyler's confirmed description verbatim, linking to `getkorale.com`. Adding a future project is a one-line addition to that array — no page-template edits needed.
5. **Outbound trust links.** Added to the site footer (visible on every page): Substack, Amazon Author Page (clean URL, no tracking params — `https://www.amazon.com/stores/Kyler-Wakefield/author/B0H6H2N9ZC`), LinkedIn. Also added Contact / Privacy Policy links in the footer's legal row.

No "founder / builder / legacy-maker" language was added anywhere, per Kyler's explicit instruction in 5i.

**Verification:** `npm run build` — clean, all 14 routes (12 previous + `/contact` + `/privacy`) compile and prerender as static content except `/reviews` (unchanged, still force-dynamic for moderation). Also ran the dev server and did a real headless-browser pass (Playwright driving local Edge, since no project-specific run skill or `chromium-cli` existed yet) — screenshots taken of `/projects` (Other Projects/Korale card), `/contact`, `/privacy`, and the home page footer; all matched the intended design and content. Confirmed via curl against the dev server that `/book`'s rendered `<head>` contains the full og:/twitter: tag set with correct absolute URLs.

## 5l. Fixed: /reviews showing "not configured" on live site — 2026-08-29

Kyler reported wakefieldwrites.com/reviews was showing the "Review submissions aren't configured yet" fallback in production, meaning `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` weren't reaching the app at runtime.

**Root cause, confirmed by checking each layer in order:**
1. `.env.local` — correct. URL matches the right project (`kpyyvuvqonykzzdcxtmd`), and the anon key's JWT payload decodes to `"role": "anon"` (not `service_role`).
2. `src/lib/supabase.ts` — correct. Exact var names, read via direct `process.env.NEXT_PUBLIC_...` (not a dynamic/computed key, so Next.js's build-time inlining works as expected).
3. **Vercel production env vars — this was the actual cause.** `vercel env ls` showed only the PayPal `NEXT_PUBLIC_*` vars existed in the project at all; the two Supabase vars had never been added to Vercel in any environment (not "missing from Production specifically" — missing everywhere). They were set locally but never pushed to Vercel.

**Fix:** installed the Vercel CLI (`npx vercel`), linked the project (`kyler-wakefields-projects/wakefieldwrites`), and added both vars via `vercel env add ... --no-sensitive` to Production, Preview, and Development — same "Config" (non-secret) type as the existing PayPal vars, since these are meant to be client-readable. Then ran `vercel deploy --prod` to bake them into a fresh build (adding a Vercel env var doesn't retroactively affect an already-built deployment).

**Verified against the live site**, not just curl (Supabase client init is client-side): drove real Edge via Playwright to wakefieldwrites.com/reviews — the "not configured" message is gone, the form renders, no console errors. Margaret's review was already present and approved in the `reviews` table (seeded earlier, `id 1`, `created_at` 2026-08-28 — nothing further needed there). Filled out and submitted the actual live form as a real end-to-end test; confirmed via direct SQL against the Supabase project that the row landed (`id 7`, `approved: false`, exactly the text submitted) — proving the full path (browser → anon key → Supabase insert → RLS) works.

**Left for Kyler:** that `id 7` test row needs deleting — Claude Code's Supabase MCP connection to this project is read-only, and (correctly, by design) the anon-key RLS policy on `reviews` only allows `INSERT` and `SELECT` of `approved = true` rows, no `DELETE` — so this had to stop short of self-cleaning. See open items.

## 5m. Password-protected /admin section — 2026-08-29

Built a new `/admin` area: auth, reviews moderation, orders/inventory schema + PayPal webhook (unverified, see below), analytics link-out, and a dashboard home. Fully additive — no existing public route's file was touched except `src/app/layout.tsx` (added `<Analytics />` and widened the nav's trailing padding per a separate small request mid-session, see diff). `/admin` is not linked anywhere in the public nav/footer — confirmed by grepping the rendered homepage HTML for the word "admin" (no matches).

**Auth (Part 1).** Supabase Auth, email+password, `@supabase/ssr` (not custom auth). Next.js 16 renamed `middleware.ts` to `proxy.ts` — used the new convention (`src/proxy.ts`), matcher scoped to `/admin/:path*`. It calls `supabase.auth.getUser()` (revalidates against Supabase's server, not just trusting the cookie) and redirects unauthenticated requests to `/admin/login`. The `(dashboard)` route group's layout re-checks auth server-side too, and each reviews Server Action re-checks auth independently — the proxy's own doc warns that Server Actions can bypass a proxy matcher, so this isn't optional defense-in-depth. **No admin user exists yet** — per the original instructions, Claude Code did not generate a password. Kyler needs to create exactly one user via Supabase dashboard → this project (`kpyyvuvqonykzzdcxtmd`) → Authentication → Users → Add user, using `kyler@wakefieldwrites.com`, and set the password directly there.

**One layout limitation, flagged rather than worked around:** Next.js's root layout (`src/app/layout.tsx`, with the public header/nav/footer) unavoidably wraps every route, `/admin/*` included — there's no way to opt a subtree out of an ancestor layout's JSX without moving the *existing* public pages into a route group, which the hard "don't restructure existing pages" rule for this task ruled out. So every `/admin` page currently shows the public site's header and footer around the admin content. It's not broken (confirmed no visual glitch after fixing the login page's centering, which the shared header exposed — see mobile screenshot), just not a fully isolated app shell. If Kyler wants that later, it's a purely mechanical, content-preserving move (route groups don't change URLs) — worth a separate explicitly-approved pass, not done unilaterally here.

**Reviews moderation (Part 2).** `/admin/reviews` lists all rows (pending + approved), Approve/Reject buttons as plain server-action forms (no client JS needed). Permission model: **RLS-authenticated-role, not the service_role key** — added three new RLS policies (SELECT all / UPDATE / DELETE) scoped to Supabase's `authenticated` role via migration `reviews_admin_rls`. Chosen over service_role because there's exactly one admin account and no public sign-up, so "authenticated" already means "Kyler, logged in" — this avoids ever handling the service_role key for this feature at all, which is the safer of the two patterns the spec allowed either of. As the first real test, used the new Reject/Delete capability (via a direct migration, since no admin account exists yet to click the actual button through the UI) to clean up the leftover `id = 7` verification-test row from the last session — confirmed gone. **The UI-based Approve/Reject flow itself still needs a real click-through test once Kyler's admin account exists** — the migration-based delete proves the DB/RLS side works, not the button.

**Orders + inventory (Part 3).** Schema built via proper migrations (`orders_and_inventory`, `decrement_inventory_function`) — not ad-hoc SQL. `orders` and `inventory` tables, RLS locked to `authenticated`-read-only (no insert/update policy at all — by design, only the webhook's service_role key can write, bypassing RLS). Added one thing not in the original column list: `orders.quantity`, needed to actually implement "handle quantity > 1" from the spec — decrementing inventory needs to know how many copies were in the order. Also added a `decrement_inventory(format, qty)` Postgres function for an atomic relative decrement (avoids a read-then-write race between concurrent webhook calls) — had to explicitly revoke its default PUBLIC execute grant (a real, known Supabase footgun: Postgres grants new functions EXECUTE to PUBLIC by default, which `anon`/`authenticated` inherit) so only `service_role` can call it.

**Inventory seed: `paperback: 0, hardcover: 0` — explicit placeholders, not real counts.** Per the instructions, Claude Code did not guess real numbers. **Kyler needs to give real current on-hand signed-copy counts** so these can be corrected before this is trusted for anything real.

**PayPal button investigation (Part 3a) — reported here as instructed, since the setup does NOT clearly support telling formats apart yet:**
- Only **one** PayPal Hosted Button exists (`NEXT_PUBLIC_PAYPAL_HOSTED_BUTTON_ID`, one value) — not two separate buttons per format as the task assumed might be the case. It's rendered via the PayPal SDK's `HostedButtons` component (`components=hosted-buttons`), and per session 2's build log (5b), checkout renders with a single "hardcover/paperback **selector**" — i.e., format is chosen via a variation dropdown *inside* the one button, not via two distinct button IDs.
- This matters because a Hosted Button's webhook payload only contains whatever item/variation name is configured on it in the PayPal Business dashboard — **Claude Code has no PayPal dashboard access and cannot see that configuration**, so it cannot confirm the exact string the webhook will send for each format.
- The webhook handler (`src/app/api/webhooks/paypal/route.ts`) was still built, using a best-guess parser (`parseFormat()`) that does a case-insensitive substring match for "hardcover" / "paperback" in the item name returned by PayPal's Orders API. **This is unverified and clearly commented as such in the file.** If the real configured name doesn't contain those words, the webhook will safely no-op (log the raw name, skip the DB write, return 200 so PayPal doesn't retry forever) rather than record bad data — but that order would need manual reconciliation.
- **What Kyler needs to do:** check the button's configuration at paypal.com/buttons (or Business account → button management) and confirm the actual configured option/variation names for paperback vs. hardcover, or share a screenshot. Ideally, also do one real PayPal Sandbox test purchase for each format so Claude Code can see the actual webhook payload shape and confirm `parseFormat()` matches it exactly, rather than trusting the guess.

**Webhook (Part 3c) — built, not tested, cannot be tested without more from Kyler.** Verifies the signature via PayPal's `POST /v1/notifications/verify-webhook-signature` (rejects unverified requests, per the spec's requirement not to trust unauthenticated input), acts only on `PAYMENT.CAPTURE.COMPLETED` (the actual "money received" signal — other subscribed event types are acknowledged but not processed, so an order isn't recorded twice), fetches full order details via `GET /v2/checkout/orders/{id}` for buyer/shipping/item data the capture event itself doesn't carry, and is idempotent on `paypal_order_id` via `upsert(..., { ignoreDuplicates: true })` so PayPal's automatic retries can't double-count. Needs four new env vars, currently unset (documented in `.env.local.example`): `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (a REST app, separate from the existing `NEXT_PUBLIC_PAYPAL_CLIENT_ID` used by the client-side SDK), `PAYPAL_WEBHOOK_ID`, `PAYPAL_API_BASE` (defaults to the Sandbox API). Also needs `SUPABASE_SERVICE_ROLE_KEY` (server-only — confirmed via grepping `.next/static` after a production build that neither this nor `PAYPAL_CLIENT_SECRET` reaches any client bundle).

**Webhook URL for Kyler to register in the PayPal Developer Dashboard once deployed:** `https://wakefieldwrites.com/api/webhooks/paypal`, subscribed to at minimum `PAYMENT.CAPTURE.COMPLETED` (the event the handler acts on — subscribing to more, e.g. `CHECKOUT.ORDER.APPROVED`, is harmless since the handler just acknowledges and ignores anything else).

**Part 3e (Sandbox end-to-end test) could not be run.** Requires a PayPal Developer Sandbox REST app (Client ID + Secret), a registered sandbox webhook (Webhook ID), and confirmation of the real button item names above — none of which Claude Code has access to. Flagging rather than guessing, per this task's own instructions.

**Analytics (Part 4).** Added `@vercel/analytics`, `<Analytics />` in the root layout. `/admin/analytics` is a pragmatic v1 per the spec — a prominent link out to this project's Vercel Analytics dashboard, rather than rebuilding what Vercel already provides (and that dashboard is already access-controlled by Kyler's Vercel login). **One manual step for Kyler:** Vercel Analytics needs enabling once in the dashboard (Project → Analytics tab → Enable) — no CLI/API path for this was found.

**Admin home (Part 5).** `/admin` dashboard: pending-review count, 30-day order count, current paperback/hardcover on-hand, plus cards linking to Reviews/Orders/Analytics.

**Verification done:** `npm run build` and `npm run lint` both clean. Confirmed via curl that all four protected `/admin/*` routes 307-redirect to `/admin/login` when unauthenticated, and `/admin/login` itself renders 200. Confirmed via a real headless-browser pass (not just curl) that navigating to `/admin` unauthenticated actually lands on `/admin/login`, and grabbed a mobile-viewport (390px) screenshot of it. Grepped the production build's `.next/static` output directly (not source) for `SUPABASE_SERVICE_ROLE_KEY`, `PAYPAL_CLIENT_SECRET`, and `service_role` — zero matches, confirming those never reach a client bundle.

**Verification NOT done, and why:** the actual authenticated dashboard/reviews/orders/analytics pages, the real Approve/Reject button click-through, and the full PayPal Sandbox order flow all require things only Kyler can provide (the admin account, the PayPal Sandbox app + webhook registration, confirmation of button format names). These are called out explicitly above rather than claimed as done.

## 6. Open items / needs from Kyler

- [x] ~~Real book description/back-cover copy~~ — using manuscript's own "About This Book" text, confirmed
- [x] ~~PayPal Business account button ID(s)~~ — done, live
- [x] ~~GitHub account ready for a new repo~~ — done, `github.com/wakingking97/wakefieldwrites`
- [x] ~~Vercel account ready to import that repo~~ — done, deployed
- [x] ~~Domain connected~~ — done, wakefieldwrites.com live via IONOS DNS → Vercel
- [x] ~~Author bio text~~ — full bio captured in section 5d, confirmed ready to use as-is
- [x] ~~Margaret's review~~ — captured in section 5d, ready to use as-is
- [x] ~~Author photo for the site~~ — provided at `assets/images/mme.png`, instructions sent to Claude Code 2026-08-28
- [x] ~~HSP Substack URL~~ — confirmed real URL `https://thehumanspeciesproject.substack.com`, sent to Claude Code 2026-08-28 (see 5g)
- [ ] Confirm final scope: book-store-first vs. broader personal hub — still open, not blocking anything
- [ ] Fix the blank `/sample` flipbook page (see bug report 5c) — sent to Claude Code, confirm fixed next check-in (nav now shows a "Read a Sample" link as of 2026-08-28, suggests this may already be resolved — verify)
- [ ] Build "About the Author" section (content ready — see 5d) — sent to Claude Code along with photo instructions 2026-08-28, confirm live
- [x] ~~Build interactive Reviews section w/ submission form + Supabase storage, starting with Margaret's review~~ — form and Supabase wiring built earlier; **the env-var wiring to Vercel was missing until 2026-08-29, see 5l** — confirmed live now, Margaret's review confirmed already seeded and approved in the DB
- [x] ~~Delete a leftover test review row from Supabase~~ — the anon-key MCP path still can't do this (by design), but Claude Code had direct migration access this session (see 5m) and removed `id = 7` via a one-off migration statement. Confirmed gone.
- [ ] Redesign `/book` Store section: retailer buttons up top, "buy a signed copy directly" pitch below (pattern documented in 5e) — sent to Claude Code, PLUS a follow-up layout swap request 2026-08-28 (description text right column, store cards stay left under cover — see annotated screenshot instructions given directly to Claude Code) — confirm both are live and match
- [ ] Build Article Archive page pulling live from Substack RSS (pattern in 5e, RSS requirement in 5g) — sent to Claude Code, confirm live and confirm it's NOT showing hardcoded placeholder articles
- [ ] Confirm whether Kyler owns the book cover art source file from Base44, or if a new one needs to be made — still open; note the 3D book mockup on /book already exists and uses this cover art, so this may be moot if that asset is already secured locally
- [ ] Fix signature image cropping the K/d ascenders/descenders — sent directly to Claude Code by Kyler 2026-08-28, confirm fixed
- [ ] Make the /sample flipbook's first page show the real book cover image instead of plain text (see 5h) — sent to Claude Code 2026-08-28, confirm live
- [x] ~~Add SEO/social metadata (OpenGraph, Twitter cards, meta tags) site-wide~~ — built 2026-08-28, see 5k. Verify live on wakefieldwrites.com after deploy (dev-server verification done, production not yet confirmed)
- [x] ~~Add Contact page~~ — built 2026-08-28, uses `kyler@wakefieldwrites.com` (confirmed by Kyler same session). Verify live after deploy
- [x] ~~Add Privacy Policy page~~ — built 2026-08-28, see 5k. **Not attorney-reviewed** — flagged, not guaranteed compliant with formal GDPR/CCPA-style requirements. Verify live after deploy
- [x] ~~Build "Other Projects" section on `/projects` with a real Korale card~~ — built 2026-08-28 as a reusable data-driven pattern, see 5k. Verify live after deploy
- [x] ~~Add outbound trust links (Substack, Amazon Author Page, LinkedIn)~~ — added to site footer 2026-08-28, see 5k. Verify live after deploy
- [x] ~~Kyler's LinkedIn URL~~ — confirmed: `https://www.linkedin.com/in/kyler-wakefield-48200b403/`
- [ ] **Create the one admin user** (see 5m) — Supabase dashboard → project `kpyyvuvqonykzzdcxtmd` → Authentication → Users → Add user → `kyler@wakefieldwrites.com` + a password Kyler sets himself. Nothing in `/admin` can be click-tested until this exists.
- [ ] **Confirm the real signed-copy inventory counts** (see 5m) — `inventory` table currently seeded with `paperback: 0, hardcover: 0` as explicit placeholders, not real numbers.
- [ ] **Confirm the PayPal Hosted Button's actual paperback/hardcover variation names** (see 5m, Part 3a in the original ask) — only one button exists, format is chosen via an in-button selector, and Claude Code has no PayPal dashboard access to see how it's configured. The webhook's format-parsing is an unverified best guess until this is confirmed (ideally via a real Sandbox test purchase so Claude Code can see the actual payload).
- [ ] **Set up a PayPal Developer REST app + Sandbox webhook** for signature verification and testing — need `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` (a REST app at developer.paypal.com, separate from the existing client-side SDK client ID) and a `PAYPAL_WEBHOOK_ID` from registering `https://wakefieldwrites.com/api/webhooks/paypal` (events: at least `PAYMENT.CAPTURE.COMPLETED`) in the Developer Dashboard.
- [ ] **Provide `SUPABASE_SERVICE_ROLE_KEY`** (from Supabase dashboard → Settings → API) so the webhook route can write orders/decrement inventory — server-only, needs adding to Vercel as a Secret-type env var, not committed anywhere.
- [ ] **Enable Vercel Analytics** for this project — Vercel dashboard → Project → Analytics tab → Enable (one-time click, no CLI path found).
- [ ] Run a real PayPal Sandbox end-to-end test (Part 3e) once the above are in place — webhook fires → signature verifies → order appears in `/admin/orders` → inventory decrements correctly, for both formats.

## 7. How to pick this back up

Read this file first. Then check the live code at `C:\Users\wakin\wakefieldwrites` (or wherever it's since moved) for current state vs. what's logged here. Update section 5 (Build log) and section 3 (Decisions) every session before ending.
