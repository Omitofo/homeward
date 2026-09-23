# 00 — Project State (living document, update every session)

**Last updated:** 2026-09-23 (P7-05 ops)
**Current phase:** Phase 7 — Polish & launch
**Next task:** Owner deploy (Vercel + prod Supabase) → P7-06 final README/screenshots/demo
**Repo status:** P7-04 legal done. P7-05 CI + monitoring + deploy docs on branch `feat/p7-05-deploy-ops`.

## Current task table
| ID | Task | Status | Notes |
|----|------|--------|-------|
| P7-01 | A11y audit | 🟡 | Code done; owner smoke recommended |
| P7-02 | Performance + MOTION-METRICS | 🟡 | Fill Lighthouse tables |
| P7-03 | Security review | ✅ | #42 #43 + migration applied |
| P7-04 | Legal / export / delete | ✅ | #44 |
| P7-05 | Monitoring, deploy, domain, backups | 🟡 | CI + reportError + docs/12-DEPLOY.md; owner runs Vercel/DNS |
| P7-06 | Final README, screenshots, demo script | ⬜ | |

## Owner setup still needed
1. Follow **docs/12-DEPLOY.md**: prod Supabase migrations, Vercel env, domain, backups
2. Optional: set `NEXT_PUBLIC_SENTRY_DSN` or `ERROR_WEBHOOK_URL`
3. Optional: axe/keyboard smoke; Lighthouse numbers in MOTION-METRICS.md

## Session log
- **2026-09-23 P7-05:** CI workflow; reportError; global-error; deploy/backup guide.
- **2026-09-23 P7-04:** Legal pages + account export/delete (#44).
- **2026-09-23 P7-03:** Security + rate limits (#42, #43).
