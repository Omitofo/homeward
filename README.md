# Homeward 🐾

> A social platform where verified rescue centers post animals for adoption and people browse, like,
> comment, and chat their way to a new companion. Built as a showcase of **GSAP** on landing pages and web apps.

**Status:** Planning complete, implementation not started. See [`docs/00-PROJECT-STATE.md`](docs/00-PROJECT-STATE.md).

## What it is
- **Browse without an account.** A visitor can explore the feed, filters, and shelter profiles freely.
- **Instagram-style feed.** Image carousels, text, like, share, comments. Single column on mobile, grid on tablet and desktop.
- **Powerful filters.** Country, region, city, species, breed, age, size, sex, and more. Shareable via URL.
- **Three account types.**
  - *Adopter* (email + name): likes, comments, saved searches, chat.
  - *Shelter* (rescue center): uploads animals, profile with bio, links, image grid. Can earn a **Verified** badge.
  - *Admin*: reviews shelter verification requests and handles reports.
- **Motion-first UX.** A cinematic intro and purposeful GSAP micro-interactions throughout.

## Tech stack (proposed, see `docs/10-DECISIONS.md`)
Next.js (App Router) · TypeScript (strict) · Tailwind CSS · GSAP + `@gsap/react` · Supabase (Postgres, Auth, Storage, Realtime, RLS) · Zod · Vitest · Playwright

## Getting started
> Not scaffolded yet. Phase 0 creates the app. Once it exists:
```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## Documentation
Everything lives in [`docs/`](docs/). Start with `CLAUDE.md` (AI collaborators) or `docs/00-PROJECT-STATE.md`.

| Doc | Purpose |
|-----|---------|
| 00 Project State | Current status, task table, next steps |
| 01 Vision & Scope | Goals, MVP, non-goals |
| 02 Roles & Flows | Permissions matrix, user journeys |
| 03 Architecture | Stack, folder structure, data access layer |
| 04 Design Principles | Visual system, references, responsive rules |
| 05 Motion (GSAP) | Motion plan, tokens, performance rules |
| 06 Data Model | Tables, relations, RLS intent |
| 07 Security | OWASP Top 10 mapping, upload safety, abuse prevention |
| 08 Engineering Standards | Code quality, testing, git, definition of done |
| 09 Roadmap | Phases and task backlog |
| 10 Decisions | ADR log and open questions |

## Working with limited context
This repo is designed so a fresh AI session (or a new human) can be productive in minutes: read
`CLAUDE.md`, then `docs/00-PROJECT-STATE.md`, then only what the next task requires.
