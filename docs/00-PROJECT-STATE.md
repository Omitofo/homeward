# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-21 (intro hero session)
**Current phase:** Phase 1 — Intro showpiece (in progress)
**Next task:** P1-03 scroll story polish (optional pin/scrub) or Phase 3 Supabase
**Repo status:** Phase 2 explore complete. Intro hero + story + stats + card peek live on `/`.

## Phase overview
| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 0 | Foundation | Scaffold, tooling, tokens, motion infrastructure, CI | 🟨 Almost done (Husky + CI optional) |
| 1 | Intro showpiece | Cinematic landing page with GSAP, no backend | 🟨 In progress (hero shipped) |
| 2 | Explore (mock data) | Feed, filters, cards, carousel, shelter profile | ✅ Done |
| 3 | Backend & auth | Supabase, roles, RLS, swap mock for real data | ⬜ Not started |
| 4 | Engagement | Likes, comments, share, saved searches | ⬜ Not started |
| 5 | Shelter studio | Upload, profile editing, verification + admin | ⬜ Not started |
| 6 | Chat | Realtime adopter <-> shelter messaging | ⬜ Not started |
| 7 | Polish & launch | A11y, perf, security audit, deploy | ⬜ Not started |

Status legend: ⬜ not started · 🟨 in progress · ✅ done · ⛔ blocked

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-* | Foundation | ✅ / 🟨 | Husky+CI optional |
| P2-* | Explore mock | ✅ | |
| P1-01 | Intro concept | ✅ | `docs/11-INTRO-CONCEPT.md`, D-013 |
| P1-02 | Hero (word stagger + photo stack) | ✅ | Manual word spans, no Club SplitText |
| P1-03 | Scroll story Find/Trust/Connect | 🟨 | Static beats shipped; pin/scrub later |
| P1-04 | Counters + card peek + CTA | ✅ | |
| P1-05 | Returning visitor / skip / smooth-scroll eval | ⬜ | Skip link exists |

## Session log (append newest at top)
- **2026-09-21 intro hero:** Concept doc + Hero word stagger + photo stack, StoryBeats, Stats, CardPeek, IntroFooter. Home = intro.
- **2026-09-21 empty/SEO:** Merged PR #13. Phase 2 complete.
- **2026-09-21 feed motion / filter sheet / infinite scroll:** PRs #10–#12.

## What the next session should do
1. Merge `feat/p1-intro-hero` if not already.
2. Optional: P1-03 pin/scrub on desktop only, or start Phase 3 Supabase.
