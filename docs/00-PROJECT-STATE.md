# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-21 (Supabase scaffold session)
**Current phase:** Phase 3 — Backend & auth (started)
**Next task:** Link a Supabase project, run migration, seed, flip `USE_MOCK_DATA=false` and verify explore/post/shelter
**Repo status:** Phase 2 done. Intro hero live. Core SQL + clients + supabase repos scaffolded; mock still default.

## Phase overview
| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 0 | Foundation | Scaffold, tooling, tokens, motion infrastructure, CI | 🟨 Almost done (Husky + CI optional) |
| 1 | Intro showpiece | Cinematic landing page with GSAP | 🟨 Hero + story + stats shipped; pin/scrub optional |
| 2 | Explore (mock data) | Feed, filters, cards, carousel, shelter profile | ✅ Done |
| 3 | Backend & auth | Supabase, roles, RLS, swap mock for real data | 🟨 Scaffold in progress |
| 4 | Engagement | Likes, comments, share, saved searches | ⬜ Not started |
| 5 | Shelter studio | Upload, profile editing, verification + admin | ⬜ Not started |
| 6 | Chat | Realtime adopter <-> shelter messaging | ⬜ Not started |
| 7 | Polish & launch | A11y, perf, security audit, deploy | ⬜ Not started |

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-01 / P1-02 / P1-04 | Intro concept + hero + peek | ✅ | Merged PR #14 |
| P1-03 | Pin/scrub story | ⬜ | Optional |
| P3-01 | Supabase schema + RLS migrations | 🟨 | Core tables migration added |
| P3-02 | Supabase repository implementations | 🟨 | posts + shelters repos; mock still default |
| P3-03 | Auth magic link + roles | ⬜ | Trigger creates profile on signup |

## Session log (append newest at top)
- **2026-09-21 Supabase scaffold:** Migration (profiles/shelters/posts/media + RLS), clients, supabase repos, deps. Mock remains default.
- **2026-09-21 intro hero:** Merged PR #14.
- **2026-09-21 Phase 2 complete:** empty/SEO, feed motion, filter sheet, infinite scroll.

## What the next session should do
1. Merge `feat/p3-supabase-scaffold`.
2. Create/link Supabase project → apply migration → seed → test with `NEXT_PUBLIC_USE_MOCK_DATA=false`.
3. Or continue P3-03 auth (magic link + middleware).
