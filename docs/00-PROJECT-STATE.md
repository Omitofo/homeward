# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-22 (P5-02 composer)
**Current phase:** Phase 5 — Shelter studio
**Next task:** Review/merge P5-02, then P5-03 shelter profile editor
**Repo status:** Phase 4 complete. P5-00–P5-01 merged. P5-02 on `feat/p5-02-composer`.

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P4-01 | Likes | ✅ | #18 |
| P4-02 | Comments | ✅ | #19 |
| P4-03 | Share | ✅ | #20 |
| P4-04 | Saved searches | ✅ | #21 |
| P5-00 | Studio shell | ✅ | #22 |
| P5-01 | Image upload pipeline | ✅ | #25–#27 |
| P5-02 | Composer new/edit post | 🟨 | `feat/p5-02-composer` |
| P5-03 | Shelter profile editor | ⬜ | |
| P5-04 | Verification request | ⬜ | |
| P5-05 | Admin verification queue | ⬜ | |
| P5-06 | Moderation reports queue | ⬜ | |

## Session log
- **2026-09-22 P5-02:** Composer form (name, species, details, traits, status, location), multi-image via upload pipeline, reorder + alt text, create/update actions (mock store + Supabase), wired `/studio/new` and `/studio/post/[id]`.
- **2026-09-22 P5-01:** Storage bucket + policies, magic-byte validation, sharp→WebP EXIF strip, upload action, smoke UI on `/studio/new`.
- **2026-09-22:** Auth #24 merged. Manual shelter promote for testing user works.
- **2026-09-22:** P5-00 studio shell merged (#22).
