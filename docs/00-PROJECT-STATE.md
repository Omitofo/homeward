# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-23 (P7-03 complete)
**Current phase:** Phase 7 — Polish & launch
**Next task:** P7-04 legal/trust pages (privacy, terms, data export/delete)
**Repo status:** P7-01 a11y code complete. P7-02 perf (#40). P7-03 security (#42) + rate-limit wire PR.

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P6-01 | Conversations/messages schema + RLS | ✅ | #33 |
| P6-02 | Realtime thread UI + unread + safety | ✅ | #34 |
| P6-03 | Start-chat entry points | ✅ | post + shelter profile |
| P7-01 | A11y audit (axe, keyboard, screen reader) | 🟡 | Code done #37–#39; owner axe/keyboard smoke recommended |
| P7-02 | Performance pass + MOTION-METRICS.md | 🟡 | Fill Lighthouse tables |
| P7-03 | Security review against doc 07 | ✅ | #42 headers/role lock; rate limits on auth/comment/chat/report/upload |
| P7-04 | Legal/trust pages, privacy, data export | ⬜ | |
| P7-05 | Error monitoring, deploy, domain, backups | ⬜ | |
| P7-06 | Final README, screenshots, demo script | ⬜ | |

## Owner setup still needed
1. Supabase Realtime: `alter publication supabase_realtime add table public.messages;` (if not already)
2. **Run migration** `20260923120000_lock_privileged_columns.sql` in Supabase SQL editor (or `supabase db push`)
3. Optional: axe/keyboard smoke (P7-01)
4. Lighthouse Full vs Off on `/` → paste into `docs/MOTION-METRICS.md`

## Session log
- **2026-09-23 P7-03 follow-up:** rateLimit wired into comments, start-chat, sendMessage, reports, uploads.
- **2026-09-23 P7-03:** #42 security headers, server-only admin, role/verification DB locks, rate-limit util + magic-link.
- **2026-09-22 P7-02 / P7-01 / Phase 6:** see prior log.
