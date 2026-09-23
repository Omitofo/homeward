# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-23 (P7-03 security pass)
**Current phase:** Phase 7 — Polish & launch
**Next task:** Wire rateLimit into hot actions (auth/comment/message/upload) → P7-04 legal pages
**Repo status:** P7-01 a11y code complete (#37–#39). P7-02 perf (#40). P7-03 security headers + role lock + rate-limit util on branch `feat/p7-03-security`.

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P6-01 | Conversations/messages schema + RLS | ✅ | #33 |
| P6-02 | Realtime thread UI + unread + safety | ✅ | #34 |
| P6-03 | Start-chat entry points | ✅ | post + shelter profile |
| P7-01 | A11y audit (axe, keyboard, screen reader) | 🟡 | Code done #37–#39; owner axe/keyboard smoke recommended |
| P7-02 | Performance pass + MOTION-METRICS.md | 🟡 | Docs + register/image/home fetch wins; fill Lighthouse tables |
| P7-03 | Security review against doc 07 | 🟡 | Headers + role lock + rate-limit util; wire limits into actions next |
| P7-04 | Legal/trust pages, privacy, data export | ⬜ | |
| P7-05 | Error monitoring, deploy, domain, backups | ⬜ | |
| P7-06 | Final README, screenshots, demo script | ⬜ | |

## Owner setup still needed
1. Supabase Realtime: `alter publication supabase_realtime add table public.messages;` (if not already)
2. Run new migration `20260923120000_lock_privileged_columns.sql` in Supabase SQL editor (or `supabase db push`)
3. Optional: axe/keyboard smoke (P7-01)
4. Lighthouse Full vs Off on `/` → paste into `docs/MOTION-METRICS.md`

## Session log
- **2026-09-23 P7-03:** Security headers in next.config; server-only on admin client; stop barrel-export of admin; migration locks profiles.role + shelters verification fields; in-memory rateLimit util + presets.
- **2026-09-22 P7-02:** Dropped unused Flip from global register; next/image on Hero LCP + CardPeek; single home list fetch; `docs/MOTION-METRICS.md` template; next.config image formats.
- **2026-09-22 P7-01:** #37–#39 skip/trap/carousel, landmarks/chat, StudioNav/contrast/feed status.
- **2026-09-22:** Phase 6 complete (#33–#35).
