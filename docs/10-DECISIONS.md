# 10 — Decisions (ADR log) & Open Questions

Format: **ID — Decision** · Status · Date · Why · Alternatives. Append new decisions at the bottom.

## Accepted (defaults so work is never blocked)
**D-001 — Stack: Next.js App Router + TypeScript + Tailwind + GSAP** · Proposed default
Why: SEO for shareable animal pages, best-in-class ecosystem, server components for performance.
Alternatives: Vite + React SPA (simpler, but weaker SEO/sharing); Astro (great for content, more work for the app parts); SvelteKit.

**D-002 — Backend: Supabase (Postgres, Auth, Storage, Realtime, RLS)** · Proposed default
Why: covers auth, images, chat and database-level access control with one service; fastest path to secure. Alternatives: Firebase (weaker relational filtering), custom Node + Postgres (more work, more attack surface).

**D-003 — Front-end first with mock data, then swap via repository layer** · Accepted
Why: the owner wants to see GSAP's impact early. The repository pattern makes the swap safe.

**D-004 — Passwordless sign-in (magic link/OTP) with email + name** · Proposed default
Why: matches "email and name is ok", removes password risks (OWASP A07). Alternative: email+password, social login (later).

**D-005 — Roles: adopter, shelter, admin; one role per account** · Accepted
Why: matches the requirement of clearly different profiles. Shelters cannot act as adopters.

**D-006 — Chat is started by adopters only; shelters reply** · Proposed default
Why: anti-spam and reduces abuse. Revisit if shelters need outreach.

**D-007 — Filter state lives in the URL** · Accepted
Why: shareable, back-button friendly, SEO-friendly, the same schema powers saved searches.

**D-008 — GSAP is installed from npm (self-hosted), only needed plugins imported** · Accepted
Why: security (no third-party CDN), bundle size. Note: verify GSAP's current license/plugin availability at install.

**D-009 — Design is principles-first; exact palette/fonts decided in P0-03** · Accepted
Why: better decisions once real screens exist. Constraints in doc 04 still apply.

**D-010 — Location v1: structured country + free-text region/city (no geocoding)** · Proposed default
Why: simple and works globally. Radius/map search is a later enhancement.

**D-011 — Typeface: Plus Jakarta Sans (UI) + Geist Mono (code)** · Accepted · 2026-09-21
Why: warm, modern, highly legible at small sizes, distinctive without being quirky. Variable, self-hosted via `next/font`, excellent Latin support. Geist Mono kept for rare code/mono needs.
Alternatives considered: Inter (too generic), DM Sans, Figtree, Satoshi.

**D-012 — Color system: warm neutrals + teal primary + amber verified** · Accepted · 2026-09-21
Why: Photos of animals carry the emotional color; UI stays quiet and trustworthy. Teal (#0d9488) feels calm and nature-adjacent without the overused "pet green". Amber (#f59e0b) is reserved exclusively for the Verified badge so it stays recognizable. Full token set (including dark theme) lives in `src/styles/tokens.css`.
Alternatives: coral/rose primary (more "heart" but noisier against photos), soft indigo, pure neutral + one accent.

**D-013 — Intro hero: typographic + photography (not match quiz)** · Accepted · 2026-09-21
Why: Matches design north star (photos as hero, UI as frame) and GSAP impact lab goals with a single clear moment (word stagger). Avoids Club SplitText dependency — manual word spans. Pinned scroll story is a later enhancement (P1-03) with mobile stacked fallback.
Details: `docs/11-INTRO-CONCEPT.md`.
Alternatives: interactive match moment (more product, less cinematic); pure typographic with no imagery.

## Open questions for the owner (answer any time; defaults above apply until then)
1. **Project name** (Homeward is a placeholder) and rough brand feeling (playful, calm, editorial?).
2. **Can shelters publish before being verified?** Default: yes, without the badge, and a "Verified only" filter exists. Alternative: posting requires verification.
3. **Can shelters like posts** (e.g. from other shelters)? Default: no.
4. **Comments:** flat or threaded replies? Default: flat, one level of replies later.
5. **Hosting/legal region:** EU-centric or global? Affects GDPR posture and Supabase region.
6. **Animals scope:** dogs and cats first, or all species from day one? Default: dog, cat, rabbit, bird, other.
7. **Hero concept preference:** ~~typographic + photography, a pinned scroll story, or an interactive "match" moment?~~ → **D-013** (typographic + photography).
8. **Smooth scrolling (ScrollSmoother/Lenis-style):** yes/no? Default: evaluate in P1-05, off on touch.
9. **Real content:** will there be real shelter images/text for demos, or stock/mock? Default: mock, with licensed/free images.
