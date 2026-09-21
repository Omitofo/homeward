# 04 — Design Principles

The visual system is intentionally **principles-first**. Exact palette and fonts are chosen in task `P0-03`
(logged in doc 10), so the design can be tuned once real screens exist. Whatever is chosen must obey what is below.

## Design North Star
Warm, trustworthy, and alive. It should feel like a product you would find in the App Store's editorial picks,
not a generic template. Photography of the animals is the hero. The UI is the frame, so it stays quiet.

## Standing on giants (what to borrow from whom)
| Reference | Borrow |
|-----------|--------|
| **Instagram** | Feed card anatomy: header (avatar, name, badge) > media carousel > actions > caption > comments. Profile layout: avatar, bio, links, grid |
| **Airbnb** | Search/filter UX: chips, popovers, bottom sheet on mobile, result count, clear-all, saved searches |
| **Pinterest** | Image-first responsive grid, hover reveal on desktop |
| **Petfinder / Adopt-a-Pet** | Domain vocabulary and filter set (species, breed, age, size, sex, location) |
| **Apple product pages / Stripe / Linear** | Scroll storytelling, typographic confidence, motion polish, whitespace |
| **Verified badge pattern (X, Instagram)** | Small, recognizable check next to the name, with a tooltip explaining what "Verified rescue" means |

## Guardrails against generic design
Avoid the tells of templated work: cream background + serif + terracotta accent as a default, identical rounded
cards with the same soft shadow everywhere, ALL-CAPS eyebrow labels above every heading, fade-up on every section,
gradient washes as decoration. If a choice appears because "that's what everyone does", revisit it.
**Spend boldness in one place per screen** (intro: hero moment; feed: the card media; profile: the header).
Everything else is disciplined and calm.

## Foundations
### Color
- 4-6 named base colors + semantic states (success, warning, danger, info) defined as CSS variables.
- Photos carry the color, so the UI palette should be restrained and warm-leaning but distinctive to this brand.
- Verified badge gets a dedicated color used for nothing else.
- Light theme first. Dark theme supported through tokens (not a rewrite). Respect `prefers-color-scheme`.
- Contrast: WCAG 2.2 AA minimum (4.5:1 text, 3:1 UI). Never rely on color alone.

### Typography
- One or two families, clearly distinct if two. Variable fonts, self-hosted via `next/font`, `font-display: swap`, with metric-matched fallbacks.
- A defined modular scale (e.g. 1.2-1.25 ratio) with named steps. Fluid sizing with `clamp()` for headings.
- Body 16px minimum. Line length under ~75 characters. Sentence case. Headline typography can be an active design element in the intro.

### Spacing and layout
- 4/8px base grid. Generous whitespace: when unsure, add space.
- Container max-width ~1200-1280px on desktop, comfortable side padding on mobile (16-20px).
- Consistent radius scale (2-3 values), used by role (controls vs media vs sheets), not one value everywhere.
- Elevation used sparingly. Prefer borders/space to shadows.

### Components (essentials)
Button (primary, secondary, ghost, icon), Chip (filter), Badge (Verified, status), Avatar, Input, Select/Combobox,
Sheet (bottom on mobile, side/popover on desktop), Dialog, Toast, Skeleton, Tabs, Carousel, Tooltip, EmptyState.

## Responsive system (mobile-first, all devices and OS)
| Breakpoint | Width | Feed layout | Filters | Navigation |
|-----------|-------|-------------|---------|------------|
| Mobile | < 640 | 1 column, full-bleed media, Instagram feel | Bottom sheet, sticky filter chip row | Bottom tab bar |
| Tablet | 640-1023 | 2 columns | Sticky top bar + popovers or sheet | Top bar |
| Desktop | 1024-1439 | 3 columns (grid/masonry) | Left rail or top bar | Top bar |
| Wide | 1440+ | 4 columns, capped container | Left rail | Top bar |

Rules:
- Touch targets >= 44x44px. Thumb-reachable primary actions on mobile.
- Test on iOS Safari (dynamic viewport `dvh`, safe-area insets, no hover reliance), Android Chrome, desktop Chrome/Firefox/Safari/Edge.
- Hover effects are enhancements only, never the only way to do something.
- Use container queries for cards where useful. Use logical properties for future RTL.
- No horizontal scroll at any width from 320px up.

## Key screen concepts
- **Intro:** full-viewport hero with a distinctive, animated typographic and imagery moment (see doc 05), then 3 short scroll beats (Find, Trust, Connect), live counters, a peek of real cards, and a strong CTA. Skippable. Fast.
- **Explore:** sticky search/filter header, result count, feed grid. Post card anatomy follows Instagram. Verified badge next to the shelter name. Status chip (Available/Reserved/Adopted).
- **Post detail:** large carousel, key facts as scannable rows (age, size, sex, location), story text, shelter card with Message CTA, comments.
- **Shelter profile:** avatar, name + badge, bio, links, stats (animals available, adopted), image grid with tabs (Available / Adopted).
- **Studio:** a calm, form-focused workspace. Drag-and-drop image upload with previews, progress, and reorder.

## Copy and content
- Plain language, sentence case, active voice. Buttons say what happens ("Send message", "Publish post").
- Errors say what went wrong and how to fix it. Empty states invite action.
- Never use dark patterns. Never guilt-trip about animals.

## Accessibility (floor, not a bonus)
Semantic HTML, visible focus rings, full keyboard operation (carousel, sheets, filters), focus trap and return in
dialogs, ARIA only where needed, alt text on every animal image (shelter writes it or a sensible default), captions
of state changes via `aria-live`, `prefers-reduced-motion` honored, zoom to 200% without loss.
