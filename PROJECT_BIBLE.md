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
- **Built the "Read a Sample" flipbook at `/sample`** using `react-pageflip` (no separate `@types` package needed — it ships its own `.d.ts`). The verbatim front-matter text from `sample-content.md` was split into pages at natural section boundaries, plus a dark cover page matching the book-cover art's palette and an "End of Sample" closer — then moved into `src/components/sampleContent.ts` (data) and `src/components/FlipbookViewer.tsx` (rendering) and `sample-content.md` deleted. Page surfaces use a warm parchment tone (`#f2e9d8` bg, near-black ink) against the site's dark chrome, per Kyler's ask for a "physical book" feel distinct from the rest of the dark theme. SSR handled via `dynamic(() => import("react-pageflip"), { ssr: false })` inside `FlipbookViewer.tsx` ("use client"), keeping `/sample`'s `page.tsx` a plain Server Component so it can still export `metadata`. Added the "Read a Sample" link to nav and a matching button on `/book` below the PayPal panel.

## 5c. Bug report — sample page blank — 2026-08-27

Kyler reports `/sample` (the react-pageflip flipbook) loads to a mostly blank screen — flipbook not rendering. Likely causes to check first (standard react-pageflip + Next.js App Router issues): (1) SSR/hydration — HTMLFlipBook must be dynamically imported with `ssr: false`; (2) the flipbook's parent container has no explicit width/height, so the library measures 0x0 on mount and renders invisible; (3) a silent client-side JS error that doesn't show in the terminal, only the browser console. Needs real debugging (headless browser + console read + DOM inspection), not a guess-and-patch.

**Resolved same day.** Root cause was neither of the two most obvious guesses — both were checked and ruled out with direct evidence: the raw prerendered HTML correctly showed React's `BAILOUT_TO_CLIENT_SIDE_RENDERING` marker exactly where `ssr:false` should put it (so SSR handling was already correct), and the mounted flipbook's own DOM measured a correct non-zero size in every test (so the container wasn't unsized either). The actual cause: `react-pageflip` code-splits into ~10 separate JS chunks, and `.sample-flipbook-wrap` had no `min-height` and the `dynamic()` import had no `loading` fallback — so for however long those chunks take to fetch, the container had nothing rendered into it and collapsed to ~48px of padding, leaving a large empty void exactly where the book belongs. Reproduced by screenshotting the container's computed height at t=0/300/800/1500ms under CDP-throttled network (~1.5Mbps) against the real `next start` production build (not dev mode) — confirmed the void lasted ~800ms-1.5s, long enough to read as "broken." Fixed with a `min-height` on the wrapper and a "Loading the sample…" fallback on the dynamic import. Re-verified desktop click-to-flip and a real synthetic touch-swipe against the production build, zero console errors. Committed `4593080`.

Separately, also found and fixed: **flipbook text getting cut off on several pages.** Root cause, found by inspecting computed styles up the DOM ancestor chain rather than guessing: `react-pageflip` sets `position: absolute` and an explicit pixel `height` via an **inline style** on its own page wrapper, and forces `display: block` — which silently overrides the `.sample-page { display: flex }` rule in `globals.css` (inline styles always beat stylesheet rules, regardless of specificity). That broke the flex-based scroll container completely: `.sample-page__inner` wasn't flex-constrained at all, so it just grew to fit its content and the excess visually spilled past the page's edge instead of scrolling. Confirmed by direct evidence — `clientHeight` matched `scrollHeight` exactly on every page regardless of content length, meaning nothing was actually constraining it. Fixed by switching `.sample-page__inner`/`.sample-page__number` to `position: absolute` + `inset`, which only needs a sized, non-static ancestor — both of which react-pageflip already provides inline. Committed `5ca155b`.

Also as part of that same pass: rebalanced the page manifest so pages read more like an actual book (split the most overstuffed sections; per Kyler's note, stripped the eyebrow/heading from every continuation page so only the page where a section *begins* carries it — a real book doesn't reprint the chapter title on every page), and added gold-bordered prev/next buttons with directional chevrons in a control bar below the book, wired to `react-pageflip`'s ref API and auto-disabling at the start/end (first attempt overlaid them on the book's edges, but that covered real text on mobile — moved below instead).

Also added the site logo/favicon from a new cover-art image Kyler dropped in `assets/images/1062.jpg` (flat "Pulling the Thread" cover art, distinct from the earlier 3D book-mockup photo) — cropped to isolate just the glowing thread/roots mark below the title text (using `sharp`, installed temporarily in a scratchpad dir, not added to the project). `src/app/icon.png` replaces the default Next.js `favicon.ico` via the App Router's `icon` file convention; `public/images/logo.png` is a small version next to "Kyler Wakefield" in the header nav.

**Follow-up same day — pages looked half-full.** Kyler noted the flipbook pages had too much empty space and asked to either shorten the book or fill pages more fully (and to make sure it still worked on mobile). Measured true intrinsic content height per page (not just container overflow, since a short page's `overflow:auto` container reports its own box size, not the content's real size) — average content height was ~372px against a 461px available box, i.e. ~81% fill on average with several pages well under 50%. Tried three levers and judged by screenshot, not just numbers: shrinking the book alone had diminishing returns for the genuinely-short single-paragraph pages (their fill barely moved, 42%→45%) while pushing medium-length pages into new overflow; increasing font size alone filled pages well (avg 90%) but blew out overflow on the longer pages (up to +261px). Settled on a moderate combination — book height 500→475, paragraph type 0.82rem/1.7 line-height → 0.86rem/1.72 — plus two targeted splits of the two worst outlier pages (the Architecture 5-tool list, which needed a `listStart` prop added to `SamplePage` so the split list's numbering continues at 4 instead of restarting at 1; and the Thesis page), and tightened `maxWidth` from 500 to 400 so desktop's two-page spread wraps text at roughly the same width as mobile's single page instead of looking sparser than mobile from wrapping less. Result: average fill 84%, worst-case overflow down from 251px to 113px, and the book is visibly more compact overall. Verified via headless browser: real touch-swipe still works, prev/next buttons still correctly enable/disable, zero console errors, screenshotted on both mobile (390px) and desktop.

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
- [x] ~~Fix the blank `/sample` flipbook page~~ — resolved same day (see 5c), plus a follow-on text-cutoff fix, gold flip controls, and a page-fullness pass — verified via headless browser incl. real touch-swipe on mobile
- [ ] Build "About the Author" section (content ready — see 5d)
- [ ] Build "Reviews/Testimonials" section, starting with Margaret's review (content ready — see 5d; more reviews likely to be added later)

## 7. How to pick this back up

Read this file first. Then check the live code at `C:\Users\wakin\wakefieldwrites` (or wherever it's since moved) for current state vs. what's logged here. Update section 5 (Build log) and section 3 (Decisions) every session before ending.
