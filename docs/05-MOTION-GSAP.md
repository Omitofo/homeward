# 05 — Motion Plan (GSAP)

Goal: make the app feel modern and alive, AND make GSAP's impact measurable and comparable.

## Motion philosophy
1. **One orchestrated hero moment, many small responsive ones.** Big choreography on the intro; elsewhere motion answers the user's action.
2. **Purposeful:** show what changed (filters applied, item liked, sheet opened), guide attention, express personality.
3. **Fast:** most UI motion 150-400ms. Cinematic only where the user chose to watch (intro).
4. **Never blocks:** interactions are usable immediately, animations are interruptible, and no content is hidden behind animation for assistive tech.
5. **Optional:** honors `prefers-reduced-motion` and a visible **Motion toggle**.
6. Avoid the generic default of fade-and-slide-up on every section and hover transitions on every card.

## The "GSAP Impact Lab" (how the owner sees the impact)
- A global **Motion: Full / Reduced / Off** setting (footer + dev overlay). `?motion=off` query param for quick A/B.
- Stored in localStorage (with try/catch), applied via `data-motion` attribute on `<html>` and read by `useMotionPreference()`.
- A small `docs/MOTION-METRICS.md` (created in Phase 7) records Lighthouse, LCP, CLS, INP, and JS weight for Off vs Full, plus subjective notes. This is the deliverable that answers "what is the impact of GSAP?".

## Infrastructure (Phase 0, `src/motion/`)
- `register.ts`: `gsap.registerPlugin(ScrollTrigger, Flip, SplitText, Draggable, Observer, ...)` once, client only, only plugins actually used.
- `tokens.ts`: the only place for numbers.
  ```ts
  export const duration = { instant: 0.12, fast: 0.2, base: 0.35, slow: 0.6, cinematic: 1.2 };
  export const ease = { out: "power3.out", inOut: "power2.inOut", spring: "back.out(1.6)", snap: "expo.out" };
  export const stagger = { tight: 0.04, base: 0.08, loose: 0.14 };
  export const distance = { sm: 8, md: 16, lg: 32 };
  ```
  (Values are starting points, tuned in use.)
- `hooks/`: wrappers around `useGSAP` from `@gsap/react` (auto-cleanup, scoped selectors, contextSafe for handlers).
- `gsap.matchMedia()` for breakpoint-specific and `(prefers-reduced-motion: reduce)` variants. Reduced motion means crossfades/instant state changes, not "nothing works".
- `primitives/`: `<SplitHeading>`, `<Reveal>`, `<Parallax>`, `<Magnetic>`, `<Marquee>`, `<CountUp>`.
- `timelines/`: named, reusable timelines (`likeBurst`, `sheetOpen`, `pageEnter`, `cardEnter`).

## Motion catalog (what we animate, where, with what)
| # | Where | Effect | GSAP tools | Phase |
|---|-------|--------|-----------|-------|
| M1 | Intro hero | Headline split into lines/chars, staggered mask reveal; hero imagery parallax; a paw-print path draws itself | Timeline, SplitText, DrawSVG (or stroke-dashoffset), ScrollTrigger | 1 |
| M2 | Intro scroll story | Pinned "Find > Trust > Connect" scene: cards/illustrations swap while pinned, progress-linked (scrub) | ScrollTrigger (pin, scrub), Timeline | 1 |
| M3 | Intro counters/marquee | Count-up stats, logo/animal marquee with velocity-aware speed | ScrollTrigger, ticker, `gsap.utils` | 1 |
| M4 | Intro CTA | Magnetic button, cursor-follow highlight (pointer devices only) | quickTo, pointer events | 1 |
| M5 | Feed entry | Cards enter with a tight stagger on first render and on filter change (batched, not per-card observers) | ScrollTrigger.batch, Flip | 2 |
| M6 | Grid <-> list / column change, filter results reorder | Smooth layout transitions of cards | **Flip** | 2 |
| M7 | Image carousel | Drag/swipe with inertia, snap, progress dots, parallax between slides | Draggable/Observer, Timeline | 2 |
| M8 | Filter UI | Chips pop in/out, bottom sheet slides with drag-to-dismiss, results count ticks | Draggable, Timeline, Flip | 2 |
| M9 | Card -> post detail | Shared-element transition: image expands from the card to the detail view | **Flip** | 2 |
| M10 | Like | Heart burst (scale + particles + ring), count roll, optimistic and reversible | Timeline (`likeBurst`) | 4 |
| M11 | Share/save/comments | Button feedback, comment list stagger, new-comment highlight | Timeline | 4 |
| M12 | Auth sheet | Sheet rise, field focus choreography, success check draw | Timeline, DrawSVG | 3 |
| M13 | Shelter profile | Header parallax, avatar/badge entrance, grid stagger, tab underline morph | ScrollTrigger, Flip | 2 |
| M14 | Verified badge | Subtle shine sweep once when it enters view (not looping) | Timeline | 2 |
| M15 | Chat | Message bubbles enter, typing indicator, list-to-thread transition | Timeline, Flip | 6 |
| M16 | Studio upload | Drop zone reacts to drag, thumbnails fly into a reorderable grid, progress ring | Draggable, Flip, Timeline | 5 |
| M17 | Page transitions | Route-level enter/exit choreography (coordinated with Next.js routing, kept light) | Timeline, Flip | 2-7 |
| M18 | Loading | Skeleton shimmer to content crossfade | Timeline | 2 |
| M19 | Smooth scroll (optional) | ScrollSmoother or Lenis-style smoothing, evaluated for a11y/perf before adoption. Decision in doc 10 | ScrollSmoother | 1 (eval) |

Priority if time is short: M1, M2, M5, M6, M9, M10, M7. These produce the biggest perceived quality jump.

## Rules (performance and correctness)
1. Animate `transform` and `opacity` only (x, y, scale, rotate, autoAlpha). Avoid animating layout properties (width, height, top, left) except via Flip.
2. Always use `useGSAP()` with a `scope` ref for cleanup. Never leave timelines or ScrollTriggers alive after unmount.
3. Set initial hidden states in CSS or with `gsap.set` before paint to prevent flash of unstyled content. Avoid hiding content that never gets revealed if JS fails: use a `.js` class gate or `autoAlpha` from the client.
4. Call `ScrollTrigger.refresh()` after images/fonts load or the layout changes (e.g. infinite scroll appended). Use `ScrollTrigger.batch` for lists.
5. `will-change` only during the animation, not permanently. Do not stack many blurred/filtered elements.
6. Use `gsap.quickTo`/`quickSetter` for pointer-follow effects. Throttle with `requestAnimationFrame` (GSAP ticker).
7. Import only the plugins you use. Load heavy ones (SplitText, Flip on non-feed pages) dynamically where possible.
8. Reserve space (aspect-ratio, fixed sizes) so animation cannot cause CLS.
9. Touch devices: no hover-dependent motion, no cursor effects, lighter stagger counts, avoid scroll-jacking. Never override native scroll in a way that breaks momentum or accessibility.
10. Pinned/scrubbed sections must degrade to a simple stacked layout on small screens and with reduced motion.
11. Don't animate more than ~20-30 elements at once on mobile. Batch and cap staggers.
12. Keep animation code out of business logic. A component imports a hook or timeline, never re-implements it.

## Testing motion
- Manual matrix: iPhone Safari, Android Chrome, desktop Chrome/Safari/Firefox, reduced motion on, 4x CPU throttle.
- Playwright runs with reduced motion or `?motion=off` for deterministic e2e tests.
- Watch INP and long frames in Chrome Performance panel for every new timeline.
