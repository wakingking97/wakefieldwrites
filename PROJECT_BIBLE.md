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
- Scaffolded Next.js 15 project (TypeScript, Tailwind, App Router, src/ dir) in cloud workspace at `/tmp/wakefieldwrites`, to be transferred to Kyler's machine at `C:\Users\wakin\wakefieldwrites`
- Next: build page structure (Home, Books/Store, Writing→Substack funnel, Projects/About), style around the book's theme, wire up PayPal button placeholder, prep for GitHub push + Vercel import

### Session 2 — 2026-08-27
- Confirmed the transferred scaffold on Kyler's machine: actually **Next.js 16.3.3** (not 15 as originally scaffolded — see `AGENTS.md` note on breaking changes vs. training data), TypeScript, Tailwind 4, App Router, all four pages (home, book, writing, projects) already built with real book-themed copy and a dark/gold visual theme
- `npm install` — clean, 364 packages, 0 vulnerabilities
- `npm run dev` — verified all four routes return 200 with no console/compile errors
- `npm run build` — clean production build, all routes prerendered as static content, TypeScript passes
- Fixed a `.gitignore` bug: the blanket `.env*` rule was also silently excluding `.env.local.example` (the template file meant to be committed) — added `!.env*.example` exception
- Initialized git repo, first commit made (`aff2379`)
- Kyler created the GitHub repo (`wakingking97/wakefieldwrites`, public) and pushed the initial commit himself
- Added the book cover art (hardcover mockup, supplied by Kyler at `assets/images/`) to `public/images/book-cover.jpg`, wired into the homepage hero and the `/book` page via `next/image`; added `/assets` to `.gitignore` (raw staging asset, not needed in the deployed bundle since the copy in `public/` covers it) — committed (`e919bc5`) and pushed
- Next: walk through Vercel import + deploy (domain/DNS intentionally out of scope until Kyler connects wakefieldwrites.com himself)

## 6. Open items / needs from Kyler

- [ ] Real book description/back-cover copy (or confirm using the manuscript's own "About This Book" section)
- [ ] PayPal Business account button ID(s) for the book product
- [ ] HSP Substack URL (page currently uses a placeholder: `https://humanspeciesproject.substack.com`)
- [ ] Author bio / photo for the site (projects page has placeholder bio copy)
- [ ] Confirm final scope: book-store-first vs. broader personal hub
- [x] GitHub account ready for a new repo — done, repo live at `github.com/wakingking97/wakefieldwrites`
- [ ] Vercel account ready to import that repo
- [ ] DNS/domain connection for wakefieldwrites.com — Kyler handling this himself once deployed

## 7. How to pick this back up

Read this file first. Then check the live code at `C:\Users\wakin\wakefieldwrites` (or wherever it's since moved) for current state vs. what's logged here. Update section 5 (Build log) and section 3 (Decisions) every session before ending.
