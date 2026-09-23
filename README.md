# Homeward 🐾

> A social platform where verified rescue centers post animals for adoption and people browse, like,
> comment, and chat their way to a new companion. Built as a showcase of **GSAP** on landing pages and web apps.

**Status:** Phase 7 (polish & launch). See [`docs/00-PROJECT-STATE.md`](docs/00-PROJECT-STATE.md).

## What it is
- **Browse without an account.** Explore the feed, filters, and shelter profiles freely.
- **Instagram-style feed.** Image carousels, likes, share, comments.
- **Filters in the URL.** Country, species, size, and more — shareable links.
- **Roles:** Adopter · Shelter (verified badge) · Admin (moderation).
- **Motion-first UX.** GSAP on the intro and purposeful micro-interactions (toggleable).

## Stack
Next.js (App Router) · TypeScript (strict) · Tailwind CSS · GSAP · Supabase · Zod

## Getting started
```bash
cp .env.example .env.local   # fill in Supabase keys when ready
npm install
npm run dev
```

Scripts: `npm run lint` · `npm run typecheck` · `npm run build`

With `NEXT_PUBLIC_USE_MOCK_DATA=true` (default) the feed runs without a database.

## Deploy
See **[`docs/12-DEPLOY.md`](docs/12-DEPLOY.md)** for Vercel + Supabase production, domain, backups, and error monitoring.

## Documentation
| Doc | Purpose |
|-----|---------|
| [00 Project State](docs/00-PROJECT-STATE.md) | Current status, next tasks |
| [01–11](docs/) | Vision, roles, architecture, design, motion, data, security, standards, roadmap, ADRs, intro |
| [12 Deploy](docs/12-DEPLOY.md) | Production checklist |

## License
Private / unlicensed unless stated otherwise.
