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
- **Built the "Read a Sample" flipbook at `/sample`** using `react-pageflip` (no separate `@types` package needed — it ships its own `.d.ts`). The verbatim front-matter text from `sample-content.md` was split into 22 pages at natural section boundaries (About This Book's five subsections each on their own page, the Architecture section's 5-tool list split from its surrounding paragraphs, Dedication split at its tonal shift, the Introduction split into 6 pages by paragraph, Part One split into 3), plus a dark cover page matching the book-cover art's palette and an "End of Sample" closer — then moved into `src/components/sampleContent.ts` (data) and `src/components/FlipbookViewer.tsx` (rendering) and `sample-content.md` deleted. Page surfaces use a warm parchment tone (`#f2e9d8` bg, near-black ink) against the site's dark chrome, per Kyler's ask for a "physical book" feel distinct from the rest of the dark theme.
  - SSR handled via `dynamic(() => import("react-pageflip"), { ssr: false })` inside `FlipbookViewer.tsx` ("use client"), keeping `/sample`'s `page.tsx` a plain Server Component so it can still export `metadata`.
  - **Verified working, not just built** — used a headless-browser harness (Playwright, Chromium already cached locally) to: click-flip through the desktop two-page spread; confirm single-page portrait mode auto-activates at a 390px phone viewport; dispatch a **real synthetic touch swipe** (touchstart/touchmove/touchend, not just a tap) directly on the flipbook's DOM element and confirm it flips the page; and screenshot several pages at both widths to confirm no cut-off/overlapping/overflowing text. Zero console/page errors throughout.
  - **Found and fixed a self-inflicted mobile regression**: adding the 5th nav link ("Read a Sample") pushed the header nav past 390px width, wrapping "Kyler Wakefield" onto two lines and clipping "Projects" entirely. Fixed with `overflow-x-auto` + a CSS mask fade on the nav (`.nav-scroll` in `globals.css`) so it scrolls horizontally with a visible fade-edge affordance instead of breaking layout.
  - Added the "Read a Sample" link to nav (`layout.tsx`, between "The Book" and "Writing") and a matching outlined button on `/book` directly below the PayPal panel.
  - `npm run build` — clean, all 6 routes (including new `/sample`) prerender as static content.
- **Fixed: `/sample` loaded to a mostly-blank screen.** Root cause was *not* a hydration error and *not* an unsized parent container (both ruled out with direct evidence — the raw prerendered HTML correctly showed React's `BAILOUT_TO_CLIENT_SIDE_RENDERING` marker exactly where `ssr:false` should put it, and the mounted flipbook's own DOM measured a correct non-zero size in every test). The actual cause: `react-pageflip` code-splits into ~10 separate JS chunks, and `.sample-flipbook-wrap` had no `min-height` and the `dynamic()` import had no `loading` fallback — so for however long those chunks take to fetch, the container had nothing rendered into it and collapsed to ~48px of padding, leaving a large empty void exactly where the book belongs. Reproduced by screenshotting the container's computed height at t=0/300/800/1500ms under CDP-throttled network (~1.5Mbps) against the real `next start` production build (not dev mode) — confirmed the void lasted ~800ms-1.5s, long enough to read as "broken." Fixed with a `min-height: 460px` on the wrapper and a "Loading the sample…" fallback on the dynamic import; re-ran the same timing test post-fix and confirmed the wrapper now holds its reserved height from t=0 instead of collapsing. Re-verified desktop click-to-flip and the real synthetic touch-swipe still work against production build, zero console errors. Committed `4593080`.
- Added the site logo/favicon from a new cover-art image Kyler dropped in `assets/images/1062.jpg` (flat "Pulling the Thread" cover art, distinct from the earlier 3D book-mockup photo) — cropped to isolate just the glowing thread/roots mark below the title text (using `sharp`, installed temporarily in a scratchpad dir, not added to the project). `src/app/icon.png` replaces the default Next.js `favicon.ico` via the App Router's `icon` file convention; `public/images/logo.png` is a small version next to "Kyler Wakefield" in the header nav.

## 6. Open items / needs from Kyler

- [x] ~~Real book description/back-cover copy~~ — using manuscript's own "About This Book" text, confirmed
- [x] ~~PayPal Business account button ID(s)~~ — done, live
- [x] ~~GitHub account ready for a new repo~~ — done, `github.com/wakingking97/wakefieldwrites`
- [x] ~~Vercel account ready to import that repo~~ — done, deployed
- [x] ~~Domain connected~~ — done, wakefieldwrites.com live via IONOS DNS → Vercel
- [ ] HSP Substack URL (still placeholder on `/writing`)
- [ ] Author bio / photo for the site (still placeholder on `/projects`)
- [ ] Confirm final scope: book-store-first vs. broader personal hub
- [x] ~~Build the "Read a Sample" flipbook page~~ — done, live at `/sample`, verified working (including touch swipe) on both desktop and mobile — see 5b

## 7. How to pick this back up

Read this file first. Then check the live code at `C:\Users\wakin\wakefieldwrites` (or wherever it's since moved) for current state vs. what's logged here. Update section 5 (Build log) and section 3 (Decisions) every session before ending.
