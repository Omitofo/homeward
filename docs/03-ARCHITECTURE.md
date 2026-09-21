# 03 — Architecture

## Stack (proposed, see doc 10 for rationale and alternatives)
| Concern | Choice | Why |
|---------|--------|-----|
| Framework | **Next.js (App Router)** + React | SSR/SEO for public pages (shareable animal links), routing, industry standard |
| Language | **TypeScript, strict** | Safety and self-documenting code |
| Styling | **Tailwind CSS** + CSS variables for tokens | Fast, consistent, responsive utilities |
| Motion | **GSAP** + `@gsap/react` (`useGSAP`) | The goal of the project. ScrollTrigger, Flip, SplitText, Draggable, Observer |
| Backend | **Supabase**: Postgres, Auth, Storage, Realtime | One service covers auth, DB, images, chat; RLS gives database-level access control |
| Validation | **Zod** | One schema for client + server |
| Testing | **Vitest** + Testing Library, **Playwright** smoke tests | |
| Hosting | **Vercel** (app) + Supabase (backend) | |
| Images | Next `<Image>` + Supabase Storage transforms | Responsive sizes, lazy loading, AVIF/WebP |

> GSAP licensing: as of 2025 GSAP and all its plugins (SplitText, ScrollSmoother, MorphSVG, etc.) are free to use.
> Verify the current license at install time and note it in doc 10.

## Guiding architecture rules
1. **Feature-based structure.** Code for a feature lives together. Shared code is promoted to `components/`, `lib/`, `motion/` only when reused.
2. **Server Components by default.** Client Components only for interactivity and animation (`"use client"`), kept as small leaf components.
3. **Repository pattern.** UI never imports Supabase directly. It calls repositories (`features/*/repository.ts`) that have two implementations: `mock` and `supabase`, selected by `NEXT_PUBLIC_USE_MOCK_DATA`. This lets Phases 1-2 run with no backend, then swap in Phase 3 without touching UI.
4. **Validate at every boundary** with Zod (forms, server actions, route handlers).
5. **Motion is isolated** in `src/motion/`. Features consume motion primitives and tokens, never raw magic numbers.
6. **One source of truth for filters:** the URL. Filter state <-> query string via a single parser (`features/filters/schema.ts`).

## Folder structure
```
homeward/
├─ CLAUDE.md                     # AI entry point
├─ README.md
├─ docs/                         # This plan (00-10)
├─ .github/                      # PR template, CI workflows
├─ public/                       # Static assets (fonts, og images, svg)
├─ supabase/
│  ├─ migrations/                # SQL migrations (schema + RLS), versioned
│  ├─ seed.sql
│  └─ config.toml
├─ tests/
│  ├─ unit/                      # Vitest (mirrors src)
│  └─ e2e/                       # Playwright
└─ src/
   ├─ app/                       # ROUTING ONLY. Thin pages that compose features
   │  ├─ (marketing)/page.tsx            # / intro
   │  ├─ (app)/explore/page.tsx
   │  ├─ (app)/post/[id]/page.tsx
   │  ├─ (app)/shelter/[handle]/page.tsx
   │  ├─ (auth)/login | register | register/shelter
   │  ├─ (adopter)/me/...
   │  ├─ (shared)/messages/...
   │  ├─ (shelter)/studio/...
   │  ├─ (admin)/admin/...
   │  ├─ api/                            # Route handlers (webhooks, uploads)
   │  ├─ layout.tsx, globals.css, not-found.tsx, error.tsx
   ├─ features/                  # Domain logic + feature UI
   │  ├─ intro/                  # Landing sections and their timelines
   │  ├─ feed/                   # FeedGrid, PostCard, Carousel, loading skeletons
   │  ├─ filters/                # FilterBar, FilterSheet, schema, url<->state
   │  ├─ posts/                  # Post detail, composer, repository, schemas
   │  ├─ shelters/               # Profile, header, badge, repository
   │  ├─ auth/                   # AuthSheet, forms, session helpers, guards
   │  ├─ engagement/             # Likes, comments, share, saved searches
   │  ├─ chat/                   # Conversation list, thread, realtime
   │  ├─ verification/           # Request form (shelter) + review queue (admin)
   │  └─ moderation/             # Reports
   │     (each feature: components/, hooks/, repository.ts, schema.ts, types.ts, index.ts)
   ├─ components/
   │  ├─ ui/                     # Primitives: Button, Chip, Badge, Sheet, Dialog, Input, Skeleton, Avatar
   │  └─ layout/                 # Header, Footer, Shell, BottomNav
   ├─ motion/                    # GSAP infrastructure (see doc 05)
   │  ├─ register.ts             # registerPlugin once, client only
   │  ├─ tokens.ts               # durations, eases, distances, stagger
   │  ├─ hooks/                  # useReveal, useMagnetic, useFlip, useMotionPreference...
   │  ├─ primitives/             # <Reveal>, <SplitHeading>, <Parallax>, <Marquee>
   │  └─ timelines/              # Named, reusable timelines (likeBurst, pageEnter...)
   ├─ lib/
   │  ├─ supabase/               # client.ts (browser), server.ts (SSR), admin.ts (server only)
   │  ├─ security/               # rate limit, sanitize, headers helpers
   │  ├─ validation/             # Shared Zod primitives
   │  └─ utils/                  # cn(), format, url helpers
   ├─ data/mock/                 # Mock JSON + generators (Phases 1-2)
   ├─ config/                    # site.ts, filters options, feature flags
   ├─ styles/                    # tokens.css, base.css
   ├─ types/                     # Shared/global types, generated DB types
   └─ middleware.ts              # Session refresh, route guards (defense in depth)
```
This structure is a strong default. It may adapt to real needs, but changes must be logged in doc 10.

## Data flow
```
Page (server component)
   └─ calls feature repository (server) -> Supabase (RLS enforced) / mock
   └─ passes plain data to client leaf components
Client interaction (like, comment, send message)
   └─ Server Action or route handler -> Zod validate -> auth + role check -> DB (RLS)
   └─ optimistic UI update + GSAP feedback -> reconcile on response
```

## Rendering strategy
| Page | Strategy |
|------|----------|
| Intro | Static; heavy motion hydrated on client after first paint |
| Explore | Server-rendered first page (SEO, speed), client infinite scroll (cursor pagination) |
| Post / Shelter | Server-rendered with dynamic metadata + OG image |
| Adopter/Shelter/Admin areas | Dynamic, auth-guarded, `noindex` |

## Performance budget
- JS shipped on `/`: aim < 200 KB gzip including GSAP core + used plugins (import only what is used).
- LCP < 2.5 s on mid-range mobile. Hero image/video is optimized and preloaded.
- Below-the-fold and non-critical plugins load dynamically (`import()`).
- Images: explicit width/height (no CLS), `sizes` set, lazy loading except the first row.
