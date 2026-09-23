# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-23 (P7-04 legal)
**Current phase:** Phase 7 — Polish & launch
**Next task:** P7-05 error monitoring, deploy, domain, backups
**Repo status:** P7-03 security complete. P7-04 legal pages + account export/delete on branch `feat/p7-04-legal`.

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P7-01 | A11y audit (axe, keyboard, screen reader) | 🟡 | Code done; owner smoke recommended |
| P7-02 | Performance pass + MOTION-METRICS.md | 🟡 | Fill Lighthouse tables |
| P7-03 | Security review against doc 07 | ✅ | #42 + #43; migration run by owner |
| P7-04 | Legal/trust pages, privacy, data export | 🟡 | /privacy /terms /safety /about + /me export/delete |
| P7-05 | Error monitoring, deploy, domain, backups | ⬜ | |
| P7-06 | Final README, screenshots, demo script | ⬜ | |

## Owner setup still needed
1. Replace `hello@homeward.example` on About page with real contact before launch
2. Optional: axe/keyboard smoke (P7-01)
3. Lighthouse Full vs Off on `/` → paste into `docs/MOTION-METRICS.md`

## Session log
- **2026-09-23 P7-04:** Trust pages, SiteFooter, exportAccountData + deleteAccount, /me privacy section.
- **2026-09-23 P7-03:** Security headers, role locks, rate limits (#42, #43). Owner ran lock migration.
