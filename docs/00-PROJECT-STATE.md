# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-22 (P7-01 a11y nearly complete)
**Current phase:** Phase 7 — Polish & launch
**Next task:** Close P7-01 after local axe/keyboard smoke, then P7-02 performance
**Repo status:** A11y foundation merged (#37–#38); studionav/contrast slice in flight.

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P6-01 | Conversations/messages schema + RLS | ✅ | #33 |
| P6-02 | Realtime thread UI + unread + safety | ✅ | #34 |
| P6-03 | Start-chat entry points | ✅ | post + shelter profile |
| P7-01 | A11y audit (axe, keyboard, screen reader) | 🟡 | #37 skip/trap/carousel; #38 landmarks/chat; studionav+contrast next |
| P7-02 | Performance pass + MOTION-METRICS.md | ⬜ | |
| P7-03 | Security review against doc 07 | ⬜ | |
| P7-04 | Legal/trust pages, privacy, data export | ⬜ | |
| P7-05 | Error monitoring, deploy, domain, backups | ⬜ | |
| P7-06 | Final README, screenshots, demo script | ⬜ | |

## Owner setup still needed
1. Supabase Realtime: `alter publication supabase_realtime add table public.messages;` (if not already)
2. Any pending migrations / env for live mode
3. `npm install` after #35 (picks up `server-only`)
4. Optional: run axe / keyboard smoke on explore, post detail, filters sheet, chat, studio

## Session log
- **2026-09-22 P7-01:** #37 skip link, Sheet focus trap, carousel a11y; #38 studio/admin/auth landmarks, chat/comments live regions. StudioNav touch targets, FeedInfinite status, muted contrast, error/404 landmarks.
- **2026-09-22:** Merged #35 (sharp server-only boundary) + #34 (P6-02 realtime). Phase 6 complete.
- **2026-09-22 P6-02:** ChatThread with Supabase Realtime INSERT; optimistic send; auto-scroll; Message on shelter profile.
- **2026-09-22 P6-01:** Chat foundation merged (#33).
