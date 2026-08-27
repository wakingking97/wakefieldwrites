# wakefieldwrites.com

Kyler Wakefield's author site — book store, writing hub, and project
directory. Rebuilt on Next.js after moving off Base44.

See `PROJECT_BIBLE.md` for the full project history, decisions, and open
items.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind CSS 4) — the site itself
- **GitHub** — source control; connect this repo, then Vercel deploys on
  every push to `main`
- **Vercel** — hosting + your custom domain
- **PayPal Buttons** — book checkout, no backend required (see
  `src/components/PayPalButton.tsx`)
- **Supabase** — not wired up yet; add only when the site needs something
  dynamic (a real blog CMS, email capture, etc.)

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Before you go live

1. Copy `.env.local.example` to `.env.local` and fill in your real PayPal
   client ID + hosted button ID.
2. Set the real Substack URL in `src/app/writing/page.tsx`.
3. Replace the placeholder bio in `src/app/projects/page.tsx`.
4. Push this repo to GitHub, then import it in Vercel
   (vercel.com/new -> Import Git Repository).
5. In Vercel: add the same env vars from `.env.local` under
   Project Settings -> Environment Variables.
6. In Vercel: Project Settings -> Domains -> add wakefieldwrites.com and
   follow the DNS instructions (point your domain's DNS to Vercel).

## Deploying

Once connected to GitHub + Vercel, every `git push` to `main` auto-deploys.
No manual deploy step needed.
