# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-22 (P5-01 image upload pipeline)
**Current phase:** Phase 5 — Shelter studio
**Next task:** P5-02 composer (after P5-01 merges)
**Repo status:** Phase 4 complete. P5-00 (#22) + auth shelter promote (#24) merged. P5-01 on this branch.

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P4-01 | Likes | ✅ | #18 |
| P4-02 | Comments | ✅ | #19 |
| P4-03 | Share | ✅ | #20 |
| P4-04 | Saved searches | ✅ | #21 |
| P5-00 | Studio shell (routes, nav, role gate, post list) | ✅ | #22 |
| P5-01 | Image upload pipeline | 🟨 | PR #23 |
| P5-02 | Composer new/edit post | ⬜ | Depends on P5-01 |
| P5-03 | Shelter profile editor | ⬜ | |
| P5-04 | Verification request | ⬜ | |
| P5-05 | Admin verification queue | ⬜ | |
| P5-06 | Moderation reports queue | ⬜ | |

## Session log
- **2026-09-22 P5-01:** Storage bucket + policies, magic-byte validation, EXIF strip/re-encode (sharp), shelter-scoped upload action, smoke UI on `/studio/new`.
- **2026-09-22:** Auth #24 — shelter role promote via service role + intent cookie. Free-tier SMTP ~2 emails/hour.
- **2026-09-22:** P5-00 studio shell merged (#22).
- **2026-09-22:** P4-04 saved searches merged (#21). Phase 4 complete.
