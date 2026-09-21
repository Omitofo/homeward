# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-21 (P3-04 AuthSheet)
**Current phase:** Phase 3 — Backend & auth
**Next task:** Merge `feat/p3-auth-sheet`; smoke-test gated CTAs on post detail; then either seed real data or start Phase 4 likes
**Repo status:** P3-03 auth merged (#16). P3-04 AuthSheet + intent return on branch. Mock still default.

## Phase overview
| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 0 | Foundation | Scaffold, tooling, tokens, motion infrastructure, CI | 🟨 Almost done (Husky + CI optional) |
| 1 | Intro showpiece | Cinematic landing page with GSAP | 🟨 Hero + story + stats shipped; pin/scrub optional |
| 2 | Explore (mock data) | Feed, filters, cards, carousel, shelter profile | ✅ Done |
| 3 | Backend & auth | Supabase, roles, RLS, swap mock for real data | 🟨 Auth done; AuthSheet in progress |
| 4 | Engagement | Likes, comments, share, saved searches | ⬜ Not started |
| 5 | Shelter studio | Upload, profile editing, verification + admin | ⬜ Not started |
| 6 | Chat | Realtime adopter <-> shelter messaging | ⬜ Not started |
| 7 | Polish & launch | A11y, perf, security audit, deploy | ⬜ Not started |

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-01 / P1-02 / P1-04 | Intro concept + hero + peek | ✅ | Merged PR #14 |
| P1-03 | Pin/scrub story | ⬜ | Optional |
| P3-01 | Supabase schema + RLS migrations | ✅ | Applied on owner project |
| P3-02 | Supabase repository implementations | 🟨 | posts + shelters repos; mock still default |
| P3-03 | Auth magic link + roles | ✅ | Merged PR #16 |
| P3-04 | Auth sheet + intent return | 🟨 | Branch `feat/p3-auth-sheet` |

## Session log (append newest at top)
- **2026-09-21 P3-04 AuthSheet:** Bottom-sheet conversion gate on post detail (Like / Contact / Save). Intent stored in sessionStorage; resume banner after magic link. Real mutations still Phase 4/6.
- **2026-09-21 P3-03 merged:** Magic-link auth verified by owner (adopter + shelter + guards). PR #16 squash-merged.
- **2026-09-21 owner wiring:** Env keys + migration applied; `USE_MOCK_DATA=true` kept.
- **2026-09-21 Supabase scaffold:** Migration, clients, repos. Mock default.
- **2026-09-21 intro hero:** Merged PR #14.
- **2026-09-21 Phase 2 complete:** empty/SEO, feed motion, filter sheet, infinite scroll.

## What the next session should do
1. Merge `feat/p3-auth-sheet` after smoke test.
2. Optional: seed one shelter + posts and try `USE_MOCK_DATA=false`.
3. Or start P4-01 likes (optimistic + AuthSheet already gates visitors).
