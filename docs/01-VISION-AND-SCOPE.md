# 01 — Vision & Scope

## Mission
Make adopting an animal feel as effortless and emotional as scrolling a feed you love, while keeping
rescue centers trustworthy and visible. Secondary mission: demonstrate what GSAP does for the
perceived quality of a landing page and a web app.

## Audience
- **Adopters:** people of any tech level, mostly on phones. Want to browse fast, filter by what matters, and reach a shelter without friction.
- **Rescue centers:** small, often volunteer-run. Need posting to be as easy as Instagram, and a credible identity (verified badge).
- **Owner/developer:** wants a clean, well-documented codebase and a clear before/after view of GSAP's impact.

## Principles
1. **Browse freely, act with an account.** Reading is public; liking, commenting, contacting, saving require sign-up.
2. **Trust is the product.** Verification, reporting, and safe messaging are core, not extras.
3. **Simple over clever.** Few screens, obvious flows.
4. **Motion with purpose.** GSAP explains change and adds delight. It never blocks a task. It is always optional (reduced motion, toggle).
5. **Secure by design.** OWASP Top 10 informs every feature.
6. **Standing on giants.** Borrow proven patterns (Instagram feed, Airbnb filters, Pinterest grid) rather than inventing new ones.

## MVP scope (in)
- Public intro/landing page (GSAP showpiece)
- Public explore feed with filters and URL-synced search
- Post cards: image carousel, description, like, share, comments (read-only for visitors)
- Shelter public profile: avatar, bio, links, verified badge, image grid of animals
- Auth: email + name (passwordless magic link by default)
- Adopter: like, comment, save searches, chat with shelters, saved/liked list
- Shelter: create/edit/archive animal posts with images, edit profile, request verification, mark status (available/reserved/adopted)
- Admin: review verification requests, handle reports
- Responsive: mobile, tablet, desktop
- Motion toggle for comparing "with" vs "without" GSAP

## Non-goals (for now)
- Payments or donations
- Native mobile apps (PWA-friendly, but web only)
- Full adoption paperwork workflow / contracts
- Video uploads
- Multi-language UI (architecture should allow i18n later; English first)
- Recommendation algorithms (chronological + filters only)
- Adopters uploading images

## Success criteria
- A first-time visitor understands the product and reaches a relevant animal within 3 interactions.
- Lighthouse mobile: Performance >= 90, Accessibility >= 95, Best Practices >= 95 (with motion on).
- No layout shift caused by animation (CLS < 0.05). INP stays in the "good" range.
- A fresh AI session can become productive from docs alone in under 5 minutes.

## Naming
"Homeward" is a working title. Change in one place (`src/config/site.ts`) when decided.
