# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-21 (P3-03 auth magic-link)
**Current phase:** Phase 3 — Backend & auth
**Next task:** Enable Email auth in Supabase dashboard + test magic link end-to-end; then seed a shelter user and optionally flip mock off
**Repo status:** Phase 2 done. Supabase scaffold + migration applied by owner. Auth magic-link UI + middleware on `feat/p3-auth-magic-link`.

## Phase overview
| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 0 | Foundation | Scaffold, tooling, tokens, motion infrastructure, CI | 🟨 Almost done (Husky + CI optional) |
| 1 | Intro showpiece | Cinematic landing page with GSAP | 🟨 Hero + story + stats shipped; pin/scrub optional |
| 2 | Explore (mock data) | Feed, filters, cards, carousel, shelter profile | ✅ Done |
| 3 | Backend & auth | Supabase, roles, RLS, swap mock for real data | 🟨 Auth in progress |
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
| P3-03 | Auth magic link + roles | 🟨 | Branch: middleware, callback, login/register/shelter, /me |

## Session log (append newest at top)
- **2026-09-21 P3-03 auth:** Magic-link forms (adopter + shelter), `/auth/callback`, session helpers, middleware route guards, `/me` stub. Mock remains default. Storage bucket deferred to Phase 5.
- **2026-09-21 owner wiring:** Env keys + migration applied; `USE_MOCK_DATA=true` kept.
- **2026-09-21 Supabase scaffold:** Migration (profiles/shelters/posts/media + RLS), clients, supabase repos, deps. Mock remains default.
- **2026-09-21 intro hero:** Merged PR #14.
- **2026-09-21 Phase 2 complete:** empty/SEO, feed motion, filter sheet, infinite scroll.

## What the next session should do
1. Merge `feat/p3-auth-magic-link` after review.
2. Supabase dashboard → Authentication → Providers → Email: enable; add redirect URL `http://localhost:3000/auth/callback`.
3. Test: register adopter → click magic link → land on `/me` with role adopter.
4. Test: register shelter → land on `/me` with role shelter + row in `shelters`.
5. Then either seed real posts or continue P3-04 AuthSheet intent return.
