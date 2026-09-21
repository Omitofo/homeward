# 07 — Security (OWASP Top 10 and platform-specific risks)

Security is a design input for every task. Before merging any feature, walk the checklist at the bottom.

## OWASP Top 10 (2021) mapped to this project
| # | Risk | Our controls |
|---|------|--------------|
| A01 | **Broken access control** | RLS on every table (deny by default). Server re-checks role and ownership on every mutation. Role never client-writable. IDs are UUIDs. Route guards in `middleware.ts` AND in server code (defense in depth). Test with "user A tries user B's data" cases. |
| A02 | **Cryptographic failures** | HTTPS only + HSTS. No custom crypto. Secrets only in env vars, service-role key server-only. Private bucket for verification documents with short-lived signed URLs. Minimal PII collected (email, name). |
| A03 | **Injection** | Zod validation on all inputs. Parameterized queries only (Supabase client / RPC, no string-built SQL). React escapes output by default. No `dangerouslySetInnerHTML` with user content. Sanitize/allowlist any rich text (prefer plain text). Search input treated as data. |
| A04 | **Insecure design** | Threat model in this doc. Rate limits on auth, comments, messages, uploads, reports. Chat can only be started by adopters (anti-spam). Verification is manual. Abuse cases considered up front. |
| A05 | **Security misconfiguration** | Security headers (below). Least-privilege Supabase keys. No debug output in production. Separate dev/prod projects. Storage bucket policies reviewed. Error pages leak nothing. |
| A06 | **Vulnerable/outdated components** | Lockfile committed. Dependabot + `npm audit` in CI. Minimal dependencies (ask before adding). Pin major versions. |
| A07 | **Identification & auth failures** | Passwordless magic link/OTP by default (no password storage or reuse risk). Short-lived sessions with refresh, secure httpOnly cookies. Rate-limited login. Email confirmation required before actions. Optional social login later. |
| A08 | **Software & data integrity** | CI required to merge. No untrusted CDN scripts (self-host GSAP via npm). SRI where any external asset is unavoidable. Signed, reviewed migrations only. |
| A09 | **Logging & monitoring failures** | Structured server logs for auth events, admin actions, verification decisions, report handling (no PII/secrets in logs). Error tracking (e.g. Sentry) in Phase 7. Audit trail for badge grants. |
| A10 | **SSRF** | Never fetch user-supplied URLs server-side. Shelter links are stored and rendered only (validated `https` scheme, blocklist of `javascript:`/`data:`), opened with `rel="noopener noreferrer nofollow ugc"`. |

## Security headers (set in `next.config` / middleware)
`Content-Security-Policy` (strict, nonce-based scripts, restrict `img-src`/`connect-src` to app + Supabase),
`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` (disable unused features), `frame-ancestors 'none'` (anti-clickjacking).
CSRF: Server Actions/route handlers verify origin; cookies `SameSite=Lax`+`Secure`+`HttpOnly`.

## Image and upload safety (shelters only)
- Allowlist types (JPEG, PNG, WebP, AVIF). Verify magic bytes, not just extension/MIME. Max size (e.g. 10 MB) and max dimensions. Max 10 images per post.
- **Strip EXIF metadata** (GPS location of a shelter/home is a real privacy risk). Re-encode/resize server-side.
- Random storage filenames. Never trust original names. Per-user path scoping enforced by storage policy.
- Upload rate limits and quotas per shelter. Malware scanning considered for verification documents.
- Documents in a private bucket, never publicly listable.

## Platform-specific threats and mitigations
| Threat | Mitigation |
|--------|-----------|
| Fake rescue centers / scams | Verified badge is admin-granted only, evidence-based, revocable. Visible tooltip explains it. Unverified shelters are labeled neutrally. |
| Animal trafficking, backyard breeders posing as rescues | Verification review criteria, reporting, admin takedown, rate limits on new accounts. |
| Off-platform payment scams via chat | Persistent safety banner in chat, keyword nudges ("send money", "western union"), report button, no links in first messages from new accounts (evaluate). |
| Harassment/spam in comments | Report + hide, rate limits, length limits, admin moderation, basic blocklist. |
| Data scraping of shelter contact info | No email/phone displayed publicly. Contact only through chat. |
| Account enumeration | Generic responses on login/sign-up. |
| Privacy/legal | GDPR-aware from the start: consent, privacy policy, data export and account deletion, minimal data, EU-friendly hosting region option. |

## Secure coding rules for contributors (human or AI)
1. Never trust the client. Validate and authorize on the server, and in the DB via RLS.
2. Never expose `SUPABASE_SERVICE_ROLE_KEY`. It is imported only in `lib/supabase/admin.ts` under `"server-only"`.
3. Never log secrets or personal data. Never commit `.env*` (except `.env.example`).
4. Use generic error messages to users, detailed ones in server logs.
5. Any new table ships with RLS + policies + a test that proves a wrong user is denied.
6. Any new dependency: check maintenance, license, size, and known CVEs.

## Pre-merge security checklist
- [ ] Inputs validated with Zod (client AND server)
- [ ] AuthN/AuthZ enforced server-side and via RLS
- [ ] No user content rendered as raw HTML
- [ ] Rate limiting considered for the new endpoint/action
- [ ] No secrets in code or logs
- [ ] Uploads (if any) follow the upload rules
- [ ] Errors do not leak internals
- [ ] `npm audit` clean of high/critical
