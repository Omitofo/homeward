# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-22 (Phase 6 complete)
**Current phase:** Phase 7 — Polish & launch
**Next task:** P7-01 a11y audit (or pick highest-priority polish item)
**Repo status:** Phase 6 complete (#33–#34). Media boundary fix (#35).

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P6-01 | Conversations/messages schema + RLS | ✅ | #33 |
| P6-02 | Realtime thread UI + unread + safety | ✅ | #34 |
| P6-03 | Start-chat entry points | ✅ | post + shelter profile |
| P7-01 | A11y audit (axe, keyboard, screen reader) | ⬜ | |
| P7-02 | Performance pass + MOTION-METRICS.md | ⬜ | |
| P7-03 | Security review against doc 07 | ⬜ | |
| P7-04 | Legal/trust pages, privacy, data export | ⬜ | |
| P7-05 | Error monitoring, deploy, domain, backups | ⬜ | |
| P7-06 | Final README, screenshots, demo script | ⬜ | |

## Owner setup still needed
1. Supabase Realtime: `alter publication supabase_realtime add table public.messages;` (if not already)
2. Any pending migrations / env for live mode
3. `npm install` after #35 (picks up `server-only`)

## Session log
- **2026-09-22:** Merged #35 (sharp server-only boundary) + #34 (P6-02 realtime). Phase 6 complete.
- **2026-09-22 P6-02:** ChatThread with Supabase Realtime INSERT; optimistic send; auto-scroll; Message on shelter profile.
- **2026-09-22 P6-01:** Chat foundation merged (#33).
