# 00 — Project State (living document, update every session)

**Last updated:** planning session 1
**Current phase:** Phase 0 — Foundation (not started)
**Next task:** `P0-01` Scaffold the Next.js app (see roadmap)
**Repo status:** Contains planning docs only. No application code yet.

## Phase overview
| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 0 | Foundation | Scaffold, tooling, tokens, motion infrastructure, CI | ⬜ Not started |
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
| P0-01 | Scaffold Next.js + TS strict + Tailwind, folder structure per doc 03 | ⬜ | |
| P0-02 | ESLint, Prettier, Husky/lint-staged, commit rules | ⬜ | |
| P0-03 | Design tokens (color, type, spacing, radius, motion) | ⬜ | Pick fonts + palette here, log in doc 10 |
| P0-04 | Motion infrastructure (`src/motion/`): register plugins, tokens, `useGSAP` helpers, reduced-motion, motion toggle | ⬜ | |
| P0-05 | Base UI primitives (Button, Chip, Badge, Sheet, Skeleton) | ⬜ | |
| P0-06 | Mock data + repository interfaces | ⬜ | ~40 animals, ~8 shelters, real-looking copy |
| P0-07 | CI (lint, typecheck, test, build) | ⬜ | |

## Decisions pending the owner
See "Open questions" in `10-DECISIONS.md`. Defaults are chosen so work is never blocked.

## Session log (append newest at top, keep to one or two lines each)
- **Planning session 1:** Master plan created (vision, roles, architecture, design, motion, data, security, standards, roadmap).

## Known issues / tech debt
_None yet._

## What the next session should do
1. Read `CLAUDE.md`, then this file.
2. Read `03-ARCHITECTURE.md` and `08-ENGINEERING-STANDARDS.md`.
3. Execute `P0-01` and `P0-02`, commit, update this file.
