# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-21 (P4-02 comments)
**Current phase:** Phase 4 — Engagement
**Next task:** Run comments migration; smoke-test CommentSection; merge `feat/p4-comments`
**Repo status:** P4-01 likes merged (#18). Comments on branch. Mock still default.

## Phase overview
| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 3 | Backend & auth | Supabase, roles, RLS, swap mock for real data | ✅ Auth + AuthSheet done |
| 4 | Engagement | Likes, comments, share, saved searches | 🟨 Likes done; comments in progress |
| 5 | Shelter studio | Upload, profile editing, verification + admin | ⬜ Not started |

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P4-01 | Likes | ✅ | PR #18 |
| P4-02 | Comments | 🟨 | Branch `feat/p4-comments` — run migration |
| P4-03 | Share | ⬜ | |
| P4-04 | Saved searches | ⬜ | |

## Session log (append newest at top)
- **2026-09-21 P4-02 comments:** Migration, list/add/delete own, CommentSection + AuthSheet. Mock localStorage for non-UUID post ids.
- **2026-09-21 P4-01 merged:** Likes + magic-link redirect cookie fix (#18).

## What the next session should do
1. SQL Editor → run `supabase/migrations/20260921200000_comments.sql`.
2. Pull branch, test comment as signed-in adopter and gated visitor.
3. Merge; next P4-03 share or seed real data.
