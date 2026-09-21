# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-21 (scaffold session)
**Current phase:** Phase 0 — Foundation
**Next task:** `P0-03` Design tokens (after merging this PR)
**Repo status:** Next.js scaffold + folder structure in place. App code lives under `src/`.

## Phase overview
| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 0 | Foundation | Scaffold, tooling, tokens, motion infrastructure, CI | 🟨 In progress |
| 1 | Intro showpiece | Cinematic landing page with GSAP, no backend | ⬜ Not started |
| 2 | Explore (mock data) | Feed, filters, cards, carousel, shelter profile | ⬜ Not started |
| 3 | Backend & auth | Supabase, roles, RLS, swap mock for real data | ⬜ Not started |
| 4 | Engagement | Likes, comments, share, saved searches | ⬜ Not started |
| 5 | Shelter studio | Upload, profile editing, verification + admin | ⬜ Not started |
| 6 | Chat | Realtime adopter <-> shelter messaging | ⬜ Not started |
| 7 | Polish & launch | A11y, perf, security audit, deploy | ⬜ Not started |

Status legend: ⬜ not started · 🟨 in progress · ✅ done · ⛔ blocked

## Current task table
Full backlog with dependencies is in `09-ROADMAP.md`. Only the active window is mirrored here.

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-01 | Scaffold Next.js + TS strict + Tailwind, folder structure per doc 03 | ✅ | Branch `feat/p0-01-scaffold`. `npm install && npm run dev` works. |
| P0-02 | ESLint, Prettier, Husky/lint-staged, commit rules | 🟨 | ESLint + Prettier configs added. Husky/commitlint still TODO. |
| P0-03 | Design tokens (color, type, spacing, radius, motion) | ⬜ | Pick fonts + palette here, log in doc 10 |
| P0-04 | Motion infrastructure (`src/motion/`): register plugins, tokens, `useGSAP` helpers, reduced-motion, motion toggle | ⬜ | |
| P0-05 | Base UI primitives (Button, Chip, Badge, Sheet, Skeleton) | ⬜ | |
| P0-06 | Mock data + repository interfaces | ⬜ | ~40 animals, ~8 shelters, real-looking copy |
| P0-07 | CI (lint, typecheck, test, build) | ⬜ | |

## Decisions pending the owner
See "Open questions" in `10-DECISIONS.md`. Defaults are chosen so work is never blocked.

## Session log (append newest at top, keep to one or two lines each)
- **2026-09-21 scaffold:** P0-01 done on branch `feat/p0-01-scaffold`. Next.js 16 + TS strict + Tailwind v4 + architecture folders. Prettier + ESLint baseline. Name stays Homeward.
- **Planning session 1:** Master plan created (vision, roles, architecture, design, motion, data, security, standards, roadmap).

## Known issues / tech debt
_None yet._

## What the next session should do
1. Merge `feat/p0-01-scaffold` (or review the PR).
2. Finish P0-02 (Husky + lint-staged + commitlint) if desired.
3. Execute P0-03 (design tokens) — this unlocks visual work.
4. Then P0-04 (motion infrastructure).
