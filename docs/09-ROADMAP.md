# 09 — Roadmap & Task Backlog

Sizes: **S** (< 1 session) · **M** (1-2 sessions) · **L** (2-4 sessions). Sessions are assumed to be small (limited token budget), so tasks are sliced vertically and end in a runnable state.
Strategy: **front-end first with mock data**, so the GSAP impact is visible early, then swap in the real backend behind the repository layer.

## Phase 0 — Foundation
| ID | Task | Size | Depends | Acceptance |
|----|------|------|---------|-----------|
| P0-01 | Scaffold Next.js + TS strict + Tailwind; create folder structure from doc 03 | S | – | `npm run dev` works, structure matches doc 03 |
| P0-02 | ESLint, Prettier, lint-staged/Husky, commitlint | S | P0-01 | Bad commit/lint blocked |
| P0-03 | Design tokens: palette, fonts, type scale, spacing, radius; log choices in doc 10 | S | P0-01 | Token page/storybook-like route renders all tokens |
| P0-04 | Motion infrastructure: register, tokens, `useMotionPreference`, motion toggle, `<Reveal>` | M | P0-01 | Toggle switches Full/Reduced/Off; reduced motion respected |
| P0-05 | UI primitives: Button, Chip, Badge(Verified/status), Avatar, Input, Sheet, Dialog, Skeleton, Toast | M | P0-03 | Keyboard + a11y verified, responsive |
| P0-06 | Mock data (~40 animals, ~8 shelters, images) + repository interfaces (mock impl) | M | P0-01 | Repos return typed data, filterable |
| P0-07 | CI workflow + PR template + Dependabot | S | P0-02 | PR runs lint/type/test/build |

## Phase 1 — Intro showpiece
| ID | Task | Size | Depends | Acceptance |
|----|------|------|---------|-----------|
| P1-01 | Intro concept: pick hero moment, art direction, copy (brief + ASCII wireframes) in doc 04/10 | S | P0-03 | Approved by owner |
| P1-02 | Hero: SplitText headline, imagery, paw path draw (M1) | M | P1-01, P0-04 | LCP < 2.5s, no CLS |
| P1-03 | Scroll story: pinned Find > Trust > Connect (M2) with mobile fallback | L | P1-02 | Scrub works, degrades on mobile/reduced |
| P1-04 | Counters, marquee, live card peek, CTA magnetic (M3, M4) | M | P1-03 | Touch-safe |
| P1-05 | Returning-visitor shortcut + skip intro + smooth-scroll evaluation (M19) | S | P1-02 | Decision logged |

## Phase 2 — Explore (mock data)
| ID | Task | Size | Depends | Acceptance |
|----|------|------|---------|-----------|
| P2-01 | Filters schema (Zod) + URL<->state + tests | M | P0-06 | Round-trips, invalid params ignored safely |
| P2-02 | Feed grid + PostCard + skeletons + cursor pagination/infinite scroll | L | P2-01, P0-05 | 1/2/3/4 columns per breakpoint |
| P2-03 | Image carousel with drag/keys/dots (M7) | M | P2-02 | Keyboard + touch |
| P2-04 | Filter bar (desktop) + bottom sheet (mobile) (M8) | L | P2-01 | Counts, clear-all, chips |
| P2-05 | Feed motion: batch entry, Flip on filter change (M5, M6) | M | P2-02 | 60fps on mid mobile, reduced-motion safe |
| P2-06 | Post detail + Flip shared-element transition (M9) | L | P2-02 | Deep link works standalone |
| P2-07 | Shelter profile page (Instagram-like) (M13, M14) | M | P2-02 | Verified badge tooltip |
| P2-08 | Empty/error/404 states, SEO metadata, OG images | S | P2-06 | |

## Phase 3 — Backend & auth
| ID | Task | Size | Depends | Acceptance |
|----|------|------|---------|-----------|
| P3-01 | Supabase project, env, migrations for profiles/shelters/posts/media + RLS | L | P2-* | RLS tests pass |
| P3-02 | Supabase repository implementations behind the same interfaces; seed data | M | P3-01 | Flag flips mock<->real |
| P3-03 | Auth: magic link, adopter + shelter sign-up, session, middleware guards | L | P3-01 | Roles enforced |
| P3-04 | Auth sheet with intent return flow (M12) | M | P3-03 | Action resumes after login |
| P3-05 | Security baseline: headers/CSP, rate limiting util, logging | M | P3-03 | Headers verified |

## Phase 4 — Engagement
| ID | Task | Size | Depends | Acceptance |
|----|------|------|---------|-----------|
| P4-01 | Likes (optimistic, triggers, counts) + likeBurst (M10) | M | P3-04 | Idempotent, reversible |
| P4-02 | Comments (list, add, delete own, report) + motion (M11) | M | P3-04 | Length limits, rate limit |
| P4-03 | Share (Web Share API + copy link fallback) | S | P2-06 | |
| P4-04 | Saved searches + adopter area (`/me/*`) | M | P2-01, P3-03 | Stored filters use same Zod schema |

## Phase 5 — Shelter studio
| ID | Task | Size | Depends | Acceptance |
|----|------|------|---------|-----------|
| P5-01 | Image upload pipeline (validate, strip EXIF, resize, storage policy) | L | P3-03 | Upload rules of doc 07 |
| P5-02 | Composer: new/edit post, reorder images, alt text, status (M16) | L | P5-01 | |
| P5-03 | Shelter profile editor (bio, links validated, avatar) | M | P3-03 | |
| P5-04 | Verification request (private docs) | M | P5-01 | |
| P5-05 | Admin queue: review, approve/reject, audit log, badge | M | P5-04 | Only admins; audited |
| P5-06 | Moderation: reports queue, hide/remove | M | P4-02 | |

## Phase 6 — Chat
| ID | Task | Size | Depends | Acceptance |
|----|------|------|---------|-----------|
| P6-01 | Conversations/messages schema + RLS (participants only) | M | P3-03 | Cross-user access denied |
| P6-02 | Realtime thread UI + list, unread, safety banner (M15) | L | P6-01 | |
| P6-03 | Start-chat entry points (post, profile), spam limits | S | P6-02 | |

## Phase 7 — Polish & launch
| ID | Task | Size | Depends | Acceptance |
|----|------|------|---------|-----------|
| P7-01 | A11y audit (axe, keyboard, screen reader pass) | M | all | AA |
| P7-02 | Performance pass + MOTION-METRICS.md (Off vs Full) | M | all | Budgets in doc 03 met |
| P7-03 | Security review against doc 07, pen-test checklist | M | all | No high/critical |
| P7-04 | Legal/trust pages, privacy, data export/delete | M | P3-03 | |
| P7-05 | Error monitoring, deploy, domain, backups | M | all | |
| P7-06 | Final README, screenshots, demo script | S | all | |

## Later ideas (not scheduled)
Notifications (email/push) for saved searches, follow shelters, radius/map search, multi-language, dark mode polish,
shelter analytics, success stories feed, PWA install.
