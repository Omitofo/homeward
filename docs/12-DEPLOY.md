# 12 — Deploy, monitoring & backups (P7-05)

## Target architecture
| Layer | Service |
|-------|---------|
| App | **Vercel** (Next.js App Router) |
| DB / Auth / Storage / Realtime | **Supabase** |
| DNS | Your registrar → Vercel |
| Errors | `reportError` → optional Sentry DSN or webhook |

## 1. Supabase (production project)
1. Create a **separate** prod project (do not reuse local/dev keys in production).
2. Run all migrations in order under `supabase/migrations/` (SQL editor or `supabase db push` linked to prod).
3. Enable Realtime for `messages` if not already:
   ```sql
   alter publication supabase_realtime add table public.messages;
   ```
4. Auth → URL configuration:
   - Site URL: `https://your-domain.com`
   - Redirect allow list: `https://your-domain.com/auth/callback`
5. Storage: confirm buckets `animal-media` (public) and `verification-docs` (private).
6. Copy **Project URL**, **anon key**, **service_role** (secret) into Vercel env (below).

### Backups
- Supabase Pro: enable **Point-in-Time Recovery** (or daily backups) in project settings.
- Free tier: schedule a weekly `pg_dump` via GitHub Action or external job, store encrypted off-site.
- After schema changes, keep migration files in git as the source of truth; never edit prod by hand without a migration.

## 2. Vercel
1. Import the GitHub repo `Omitofo/homeward`.
2. Framework preset: **Next.js**. Build command `npm run build`, output default.
3. Environment variables (Production + Preview as appropriate):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Prod project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `false` for real data |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional public DSN |
| `SENTRY_DSN` | Optional server DSN |
| `ERROR_WEBHOOK_URL` | Optional Slack/Discord/custom webhook |

4. Deploy production from `master`.
5. **Domain:** Project → Settings → Domains → add apex + `www`, follow DNS instructions (A/CNAME).
6. After DNS is live, re-check Supabase Auth redirect URLs.

### Post-deploy smoke
- [ ] `/` and `/explore` load
- [ ] Magic link email arrives and lands on `/auth/callback`
- [ ] Image upload (shelter) works against prod storage
- [ ] Chat realtime (two sessions)
- [ ] Response headers include CSP / HSTS (from `next.config.ts`)

## 3. Error monitoring
Code path: `src/lib/monitoring/report-error.ts`, called from `error.tsx` and `global-error.tsx`.

**Option A — Sentry (recommended for launch)**  
Create a Sentry project, set `NEXT_PUBLIC_SENTRY_DSN` (and optionally `SENTRY_DSN`). The lite reporter sends events without adding `@sentry/nextjs` yet; you can upgrade later for source maps and performance.

**Option B — Webhook**  
Set `ERROR_WEBHOOK_URL` to a Slack/Discord incoming webhook; payloads are JSON with `message`, `source`, `digest`, `ts`.

**Option C — Logs only**  
Vercel runtime logs + `console.error` are enough for early beta.

## 4. CI
`.github/workflows/ci.yml` runs on every PR and push to `master`: `lint` → `typecheck` → `build` (mock env). Protect `master` with required status checks when ready.

## 5. Owner checklist (one-time)
- [ ] Prod Supabase project + migrations applied
- [ ] Vercel project linked + env vars set
- [ ] Custom domain + TLS (automatic on Vercel)
- [ ] Auth redirect URLs updated
- [ ] Backup strategy chosen (PITR or dump)
- [ ] Optional: Sentry or webhook
- [ ] Smoke test list above
