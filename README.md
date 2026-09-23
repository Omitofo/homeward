# Homeward 🐾

> A social platform where **verified rescue centers** post animals for adoption and people browse, like, comment, and chat their way to a new companion.
>
> Also a showcase of **GSAP** on a real product: cinematic intro, purposeful micro-interactions, and a motion toggle (Full / Reduced / Off) so you can feel the difference.

**Status:** Implementation complete through Phase 7 polish. Owner deploy checklist: [`docs/12-DEPLOY.md`](docs/12-DEPLOY.md). Living task board: [`docs/00-PROJECT-STATE.md`](docs/00-PROJECT-STATE.md).

---

## Features

| Area | What you get |
|------|----------------|
| **Intro** | Hero with staggered headline, photo stack, story beats, stats, feed peek |
| **Explore** | Responsive grid, URL-synced filters, infinite scroll, carousels |
| **Post & shelter** | Detail pages, share, likes, comments, verified badge |
| **Auth** | Passwordless magic link · adopter or shelter sign-up · intent resume |
| **Engagement** | Likes, comments, saved searches, Web Share |
| **Shelter studio** | Composer, image upload (validated + WebP), profile, verification request |
| **Admin** | Verification queue, report moderation |
| **Chat** | Adopter-started threads, realtime messages, safety banner |
| **Trust** | Privacy, terms, safety, about · data export & account delete |
| **Ops** | Security headers, RLS, rate limits, CI, error reporting hooks |

---

## Stack

**Next.js** (App Router) · **TypeScript** (strict) · **Tailwind CSS** · **GSAP** + `@gsap/react` · **Supabase** (Postgres, Auth, Storage, Realtime, RLS) · **Zod** · **sharp** (uploads)

Hosting target: **Vercel** + Supabase ([deploy guide](docs/12-DEPLOY.md)).

---

## Quick start

```bash
git clone https://github.com/Omitofo/homeward.git
cd homeward
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

By default `NEXT_PUBLIC_USE_MOCK_DATA=true` — the feed and most UI work **without** Supabase. Fill Supabase keys in `.env.local` when you want real auth, studio, chat, and uploads.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

CI runs lint → typecheck → build on every PR to `master`.

---

## Main routes

| Route | Access |
|-------|--------|
| `/` | Public intro |
| `/explore` | Public feed + filters |
| `/post/[id]` | Public post detail |
| `/shelter/[handle]` | Public shelter profile |
| `/login`, `/register`, `/register/shelter` | Auth |
| `/me` | Adopter account, saved searches, export/delete |
| `/messages`, `/messages/[id]` | Chat |
| `/studio/*` | Shelter studio |
| `/admin/verification`, `/admin/reports` | Admin |
| `/privacy`, `/terms`, `/safety`, `/about` | Trust pages |

---

## Demo & screenshots

- **Live demo script (timed):** [`docs/13-DEMO-SCRIPT.md`](docs/13-DEMO-SCRIPT.md)
- **Screenshot shot list:** [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md)

Motion tip for demos: use the footer **Motion** toggle — Full for the GSAP story, Off for a clean baseline.

---

## Documentation map

| Doc | Purpose |
|-----|---------|
| [00 Project State](docs/00-PROJECT-STATE.md) | Phase status, next tasks |
| [01 Vision](docs/01-VISION-AND-SCOPE.md) | Goals & MVP |
| [02 Roles & flows](docs/02-ROLES-AND-FLOWS.md) | Permissions & journeys |
| [03 Architecture](docs/03-ARCHITECTURE.md) | Stack & folders |
| [04 Design](docs/04-DESIGN-PRINCIPLES.md) | Visual system |
| [05 Motion](docs/05-MOTION-GSAP.md) | GSAP rules |
| [06 Data](docs/06-DATA-MODEL.md) | Schema intent |
| [07 Security](docs/07-SECURITY.md) | OWASP mapping |
| [08 Standards](docs/08-ENGINEERING-STANDARDS.md) | DoD, git |
| [09 Roadmap](docs/09-ROADMAP.md) | Phased backlog |
| [10 Decisions](docs/10-DECISIONS.md) | ADR log |
| [11 Intro concept](docs/11-INTRO-CONCEPT.md) | Hero direction |
| [12 Deploy](docs/12-DEPLOY.md) | Vercel, domain, backups |
| [13 Demo script](docs/13-DEMO-SCRIPT.md) | Presentation walkthrough |
| [Screenshots](docs/SCREENSHOTS.md) | Capture guide |

AI collaborators: start at [`CLAUDE.md`](CLAUDE.md).

---

## Security highlights

- RLS on every table; privileged columns (`role`, verification) locked by triggers
- Magic-link auth; service role key server-only
- Upload pipeline: magic bytes → sharp (strip EXIF, WebP) → scoped storage paths
- Rate limits on auth, comments, chat, reports, uploads
- Security headers (CSP, HSTS, frame-ancestors, …) via `next.config.ts`

---

## License

Private / unlicensed unless stated otherwise by the owner.
