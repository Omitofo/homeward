# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-21 (card carousel session)
**Current phase:** Phase 2 — Explore (in progress)
**Next task:** Infinite scroll on explore, filter sheet polish, feed motion (Flip)
**Repo status:** Foundation + explore feed + post detail + shelter profile + card carousel.

## Phase overview
| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 0 | Foundation | Scaffold, tooling, tokens, motion infrastructure, CI | 🟨 Almost done (Husky + CI optional) |
| 1 | Intro showpiece | Cinematic landing page with GSAP, no backend | ⬜ Not started |
| 2 | Explore (mock data) | Feed, filters, cards, carousel, shelter profile | 🟨 In progress |
| 3 | Backend & auth | Supabase, roles, RLS, swap mock for real data | ⬜ Not started |
| 4 | Engagement | Likes, comments, share, saved searches | ⬜ Not started |
| 5 | Shelter studio | Upload, profile editing, verification + admin | ⬜ Not started |
| 6 | Chat | Realtime adopter <-> shelter messaging | ⬜ Not started |
| 7 | Polish & launch | A11y, perf, security audit, deploy | ⬜ Not started |

Status legend: ⬜ not started · 🟨 in progress · ✅ done · ⛔ blocked

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-01 … P0-06 | Foundation tasks | ✅ | Merged |
| P0-02 / P0-07 | Husky + CI | 🟨 | Optional polish |
| P2-01 | Filters schema (Zod) + URL state | ✅ | `src/features/filters/schema.ts` |
| P2-02 | Feed grid + PostCard | ✅ | `/explore` with responsive grid |
| P2-03 | Image carousel | ✅ | CardCarousel on feed + PostGallery on detail |
| P2-04 | Filter bar / sheet polish | 🟨 | Chip row done; full sheet later |
| P2-06 | Post detail | ✅ | `/post/[id]` + PostGallery |
| P2-07 | Shelter profile | ✅ | `/shelter/[handle]` + animals grid |

## Session log (append newest at top)
- **2026-09-21 card carousel:** CardCarousel on PostCard (prev/next, dots, count badge, stopPropagation). P2-03 done.
- **2026-09-21 shelter profile:** `/shelter/[handle]` with bio, links, stats, animals. Merged PR #8.
- **2026-09-21 post detail:** `/post/[id]` with gallery, traits, shelter card. Merged PR #7.
- **2026-09-21 explore:** First explore feed. Zod filters, PostCard, FeedGrid.
- **2026-09-21 mock / ui / motion / tokens / scaffold:** P0-01…06 merged.

## What the next session should do
1. Merge `feat/p2-card-carousel`.
2. Infinite scroll / cursor pagination on explore.
3. Filter sheet polish (mobile bottom sheet).
