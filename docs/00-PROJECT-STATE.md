# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-21 (mock data session)
**Current phase:** Phase 0 — Foundation
**Next task:** `P0-07` CI, or start Phase 1 / Phase 2 explore feed
**Repo status:** Scaffold + tokens + motion + UI primitives + mock data live.

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
| P0-01 | Scaffold Next.js + TS strict + Tailwind, folder structure per doc 03 | ✅ | Merged |
| P0-02 | ESLint, Prettier, Husky/lint-staged, commit rules | 🟨 | ESLint + Prettier done. Husky/commitlint still TODO |
| P0-03 | Design tokens | ✅ | Merged |
| P0-04 | Motion infrastructure | ✅ | Merged |
| P0-05 | Base UI primitives | ✅ | Merged. Preview at `/ui` |
| P0-06 | Mock data + repository interfaces | ✅ | 40 animals, 8 shelters, filterable repos |
| P0-07 | CI (lint, typecheck, test, build) | ⬜ | |

## Decisions pending the owner
See "Open questions" in `10-DECISIONS.md`. Defaults are chosen so work is never blocked.

## Session log (append newest at top, keep to one or two lines each)
- **2026-09-21 mock:** P0-06 complete on `feat/p0-06-mock-data`. 40 animals, 8 shelters, posts + shelters repositories with filters and cursor pagination.
- **2026-09-21 ui:** P0-05 merged.
- **2026-09-21 motion:** P0-04 merged.
- **2026-09-21 tokens:** P0-03 merged.
- **2026-09-21 scaffold:** P0-01 merged.
- **Planning session 1:** Master plan created.

## Known issues / tech debt
_None yet._

## What the next session should do
1. Merge `feat/p0-06-mock-data`.
2. Optionally P0-07 CI, or jump to Phase 2 explore feed (P2-01 filters + P2-02 feed grid) — the foundation is ready.
