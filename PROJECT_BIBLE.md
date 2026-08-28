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
- **Built the "Read a Sample" flipbook at `/sample`** using `react-pageflip` (no separate `@types` package needed — it ships its own `.d.ts`). The verbatim front-matter text from `sample-content.md` was split into pages at natural section boundaries, plus a dark cover page matching the book-cover art's palette and an "End of Sample" closer — then moved into `src/components/sampleContent.ts` (data) and `src/components/FlipbookViewer.tsx` (rendering) and `sample-content.md` deleted. Page surfaces use a warm parchment tone (`#f2e9d8` bg, near-black ink) against the site's dark chrome. SSR handled via `dynamic(() => import("react-pageflip"), { ssr: false })` inside `FlipbookViewer.tsx` ("use client"). Added the "Read a Sample" link to nav and a matching button on `/book` below the PayPal panel.
- **Built `src/components/BookCover.tsx`**: the cover-art image (`assets/images/1062.jpg` → `public/images/book-cover.jpg`) as a "floating" 3D treatment — a radial CSS mask feathers the photo's flat background into the page instead of a hard rectangle, plus a slow `rotateY` swing + gentle bob animation (respects `prefers-reduced-motion`), used on both the homepage hero and `/book`. This is the "3D floating book" mockup referenced in 5c0 below — it's Claude Code's own CSS/masking work on the single flat cover-art image, not a separately rendered 3D asset.

## 5c0. IMPORTANT — protect the 3D floating book on /book — 2026-08-27

The live site (checked directly at wakefieldwrites.com/book on 2026-08-27) now has a 3D-rendered hardcover book mockup — angled, with realistic shadow/lighting, showing the gold-thread cover art on a physical-looking book — in the "Get the book" area of the /book page. This is `BookCover.tsx` (see the build-log entry directly above this section) — a real, logged piece of work, not an unexplained gap; it just landed in an earlier session whose build-log updates got clobbered by a stale-base edit before eventually being restored.

**Kyler explicitly wants this 3D floating book KEPT — do not replace it with the old Base44 site's flat/static hero cover image treatment.** When doing the Store section redesign (tiered "shop anywhere" / "buy signed direct" restructure, see 5e), keep this existing 3D book visual as-is; only add the new copy/structure around it. Reconfirmed directly by Kyler mid-session. This is a specific instance of the general "don't remove existing content without asking" rule, called out by name because it's the one thing Kyler flagged directly.

## 5c. Bug report — sample page blank — 2026-08-27

Kyler reports `/sample` (the react-pageflip flipbook) loads to a mostly blank screen — flipbook not rendering. Likely causes to check first (standard react-pageflip + Next.js App Router issues): (1) SSR/hydration — HTMLFlipBook must be dynamically imported with `ssr: false`; (2) the flipbook's parent container has no explicit width/height, so the library measures 0x0 on mount and renders invisible; (3) a silent client-side JS error that doesn't show in the terminal, only the browser console. Needs real debugging (headless browser + console read + DOM inspection), not a guess-and-patch.

**Resolved same day.** Root cause was neither of the two most obvious guesses — both were checked and ruled out with direct evidence: the raw prerendered HTML correctly showed React's `BAILOUT_TO_CLIENT_SIDE_RENDERING` marker exactly where `ssr:false` should put it (so SSR handling was already correct), and the mounted flipbook's own DOM measured a correct non-zero size in every test (so the container wasn't unsized either). The actual cause: `react-pageflip` code-splits into ~10 separate JS chunks, and `.sample-flipbook-wrap` had no `min-height` and the `dynamic()` import had no `loading` fallback — so for however long those chunks take to fetch, the container had nothing rendered into it and collapsed to ~48px of padding, leaving a large empty void exactly where the book belongs. Fixed with a `min-height` on the wrapper and a "Loading the sample…" fallback on the dynamic import. Committed `4593080`.

Separately, also found and fixed: **flipbook text getting cut off on several pages.** Root cause: `react-pageflip` sets `position: absolute` and an explicit pixel `height` via an **inline style** on its own page wrapper, and forces `display: block` — which silently overrides the `.sample-page { display: flex }` rule in `globals.css` (inline styles always beat stylesheet rules). Fixed by switching `.sample-page__inner`/`.sample-page__number` to `position: absolute` + `inset`. Committed `5ca155b`.

Also as part of that same pass: rebalanced the page manifest so pages read more like an actual book, added gold-bordered prev/next buttons with directional chevrons below the book, added the site logo/favicon from `assets/images/1062.jpg` (`src/app/icon.png` + `public/images/logo.png`), and did a page-fullness pass after Kyler noted pages looked half-full (average fill 84%, worst-case overflow down from 251px to 113px). All verified via headless browser against the real production build: real synthetic touch-swipe, click-to-flip, prev/next button states, zero console errors, both mobile and desktop. Committed `55dbea0`.

**Re-verified again 2026-08-27 (this session):** `/sample` confirmed still working — screenshotted real content rendering and a working click-to-flip against a fresh `npm run dev`, zero console errors. The fix has held.

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

## 5f. Session 3 — 2026-08-27 — five-step build (bug fix + 4 new features)

Kyler asked for all remaining open items in one pass, in order, each verified with real browser checks (not just "it compiled") and committed separately so any step can be reviewed/rolled back independently. Hard rule restated and followed throughout: additive only, never remove/replace existing content without asking first.

**Step 1 — `/sample` blank page (5c):** already fixed in a prior session (see 5c above) — re-verified working with a fresh `npm run dev` + real browser screenshot + click-to-flip before starting anything else, since the bug report on disk (from a stale doc snapshot) suggested otherwise.

**Step 3 — `/about` page:** built ahead of Steps 2/4 since it needed no input from Kyler. Chose a dedicated `/about` page over adding to `/projects` — the bio is long and personal (six paragraphs on addiction/recovery), and a new page is purely additive (zero risk of altering `/projects`'s existing content), vs. editing `/projects`'s placeholder bio which the "additive only" rule would make riskier even though Kyler's instructions permitted either. Full verbatim bio from 5d, photo area is a clearly marked "Author photo coming soon" placeholder. Added to nav and as a new card on `/projects` (existing cards untouched).

Found and fixed a real bug during verification, not just eyeballing the screenshot: the two-column grid (`grid-cols-[1fr_1.6fr]`, same pattern as `/book`'s working layout) rendered as `1200px 115px` instead of a proportional ~1:1.6 split — confirmed via computed-style inspection, not assumption. Classic CSS Grid "implied minimum size" issue: the `aspect-square` photo placeholder has no intrinsic content, so its track inflated. Fixed with `min-w-0` on both grid children; re-verified the computed columns split ~357px/571px as intended. Committed `4574401`.

## 6. Open items / needs from Kyler

- [x] ~~Real book description/back-cover copy~~ — using manuscript's own "About This Book" text, confirmed
- [x] ~~PayPal Business account button ID(s)~~ — done, live
- [x] ~~GitHub account ready for a new repo~~ — done, `github.com/wakingking97/wakefieldwrites`
- [x] ~~Vercel account ready to import that repo~~ — done, deployed
- [x] ~~Domain connected~~ — done, wakefieldwrites.com live via IONOS DNS → Vercel
- [x] ~~Author bio text~~ — full bio captured in section 5d, confirmed ready to use as-is
- [x] ~~Margaret's review~~ — captured in section 5d, ready to use as-is
- [ ] Author photo for the site (bio text is ready, photo still needed)
- [ ] HSP Substack URL (still placeholder on `/writing`)
- [ ] Confirm final scope: book-store-first vs. broader personal hub
- [x] ~~Fix the blank `/sample` flipbook page~~ — resolved (see 5c), plus a follow-on text-cutoff fix, gold flip controls, and a page-fullness pass — verified via headless browser incl. real touch-swipe on mobile, re-verified again this session
- [x] ~~Confirm whether Kyler owns the book cover art source file from Base44~~ — yes, it's `assets/images/1062.jpg`, already in use as the site logo/favicon and the `BookCover.tsx` 3D treatment (see 5c0/5e)
- [x] ~~Build "About the Author" section~~ — done, live at `/about`, full verbatim bio + placeholder photo area, nav link + `/projects` card added (see 5f)
- [ ] Build interactive Reviews section w/ submission form + Supabase storage, starting with Margaret's review (content ready — see 5d; old-site pattern documented in 5e)
- [ ] Redesign `/book` Store section: retailer buttons up top, "buy a signed copy directly" pitch below (pattern documented in 5e; **keep the existing 3D floating book as-is per 5c0** — additive only)
- [ ] Build Article Archive page (richer replacement/companion to `/writing` — pattern documented in 5e; needs a data source for HSP articles, manual or RSS)

## 7. How to pick this back up

Read this file first. Then check the live code at `C:\Users\wakin\wakefieldwrites` (or wherever it's since moved) for current state vs. what's logged here. Update section 5 (Build log) and section 3 (Decisions) every session before ending.
