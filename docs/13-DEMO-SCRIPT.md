# 13 — Demo script (P7-06)

Timed walkthrough for a live presentation (~8–12 minutes). Use **mock data** for reliability unless prod is warmed up.

**Prep (2 min before)**
1. `npm run dev` (or production URL).
2. Browser: one normal window + one private/incognito for “second user” chat if showing realtime.
3. Motion toggle → **Full** for the intro; show **Off** once for contrast.
4. Optional: zoom browser to 90% so UI fits on a projector.

---

## Act 1 — First impression (≈ 2 min)

| Step | Action | Say |
|------|--------|-----|
| 1 | Open `/` | “Homeward is adoption discovery that feels like a feed you already love — with motion that earns its place.” |
| 2 | Let hero animate | “Headline staggers in; photos frame the product without competing.” |
| 3 | Scroll Find → Trust → Connect | “Three beats: filter what matters, trust verified rescues, connect when ready.” |
| 4 | Point at stats + card peek | “Real feed data peeks in before you commit.” |
| 5 | Click **Explore animals** | Transition into the product. |
| 6 | Toggle Motion → **Off**, refresh or re-enter intro briefly | “Same product, zero GSAP — the toggle is our impact lab.” |
| 7 | Back to **Full** | Continue. |

---

## Act 2 — Explore & trust (≈ 3 min)

| Step | Action | Say |
|------|--------|-----|
| 1 | `/explore` — scroll grid | “Mobile column, multi-column on desktop. Infinite scroll.” |
| 2 | Open filters (sheet on mobile) | “Filters live in the URL — shareable, back-button friendly.” |
| 3 | Apply species + size; show URL | “Saved searches reuse the same schema later.” |
| 4 | Open a post | Carousel, description, actions. |
| 5 | Open a shelter profile | “Instagram-like grid; verified badge when admins approve.” |
| 6 | Mention `/safety` | “Trust is product: safety copy, reports, private verification docs.” |

---

## Act 3 — Account & engagement (≈ 2 min)

| Step | Action | Say |
|------|--------|-----|
| 1 | Tap like or comment while signed out | “Auth sheet: browse free, act with an account — intent resumes after magic link.” |
| 2 | (If live auth) complete magic link | Or explain the flow without blocking the demo. |
| 3 | Like / comment | Optimistic UI. |
| 4 | `/me` | Profile, saved searches, **Download my data**, delete account. |

---

## Act 4 — Shelter studio (≈ 2 min)

| Step | Action | Say |
|------|--------|-----|
| 1 | `/studio` as shelter (or walk through UI in mock) | “Posting should feel as light as Instagram.” |
| 2 | New post / composer | Multi-image, alt text, animal fields, status. |
| 3 | Mention upload pipeline | “Magic-byte check, EXIF stripped, WebP, path scoped to shelter.” |
| 4 | Verification page | “Private docs → admin queue → badge.” |

---

## Act 5 — Chat & close (≈ 2 min)

| Step | Action | Say |
|------|--------|-----|
| 1 | Message from post or shelter | “Adopters start; shelters reply — anti-spam by design.” |
| 2 | Safety banner | “Never send money before meeting the animal.” |
| 3 | Realtime (two sessions) if available | “Postgres changes over Realtime.” |
| 4 | Close on stack | “Next.js + Supabase + GSAP, security designed in (RLS, headers, rate limits). Docs from vision to deploy.” |

---

## Backup paths if something fails

| Problem | Fallback |
|---------|----------|
| Auth email slow | Narrate the flow; stay in mock |
| Realtime lag | Show optimistic send; explain merge of #34 |
| Empty feed | Confirm `NEXT_PUBLIC_USE_MOCK_DATA=true` |
| Motion jank on projector | Switch to Reduced or Off |

---

## One-liner

> Homeward makes finding a rescue animal feel like scrolling a feed you trust — with motion you can turn off, and security you don’t have to think about.
