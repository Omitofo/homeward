# Motion metrics — GSAP impact lab

Goal: measure what Full motion costs vs Off, so the owner can answer “what is the impact of GSAP?” with numbers and notes.

See also: `docs/05-MOTION-GSAP.md` (philosophy + catalog), `docs/03-ARCHITECTURE.md` (budgets).

## Budgets (from architecture)

| Metric | Target |
|--------|--------|
| JS on `/` (gzip, first load JS) | < 200 KB including GSAP core + used plugins |
| LCP (mid-range mobile) | < 2.5 s |
| CLS | < 0.1 |
| INP | < 200 ms |

## How to measure

1. **Build**
   ```bash
   npm run build && npm run start
   ```
2. **Lighthouse** (Chrome DevTools or CLI), mobile preset, throttling on:
   - `/` with default motion (Full after first visit, or force Full in the toggle)
   - `/` with `?motion=off` or Motion → Off in the footer toggle
   - `/explore` (less GSAP; baseline for app shell)
3. **Bundle**
   - After build, inspect `.next/analyze` if added later, or Chrome Coverage / Network JS transfer size for document + first paint scripts.
4. **Subjective**
   - 4× CPU throttle, mid phone emulation: does intro feel smooth? Any jank on scroll/stagger?

Record results in the tables below (date each run).

## Results log

### Run template

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Commit | |
| Device / profile | e.g. Moto G Power (Lighthouse mobile) |
| Notes | |

### `/` — Motion Full vs Off

| Metric | Full | Off | Delta |
|--------|------|-----|-------|
| Performance score | — | — | — |
| LCP (s) | — | — | — |
| CLS | — | — | — |
| INP (ms) | — | — | — |
| Total blocking time (ms) | — | — | — |
| JS transfer (KB, document + critical) | — | — | — |

### `/explore` (reference)

| Metric | Value |
|--------|-------|
| Performance score | — |
| LCP (s) | — |
| CLS | — |
| INP (ms) | — |

### Subjective notes

- Full:  
- Off:  
- Reduced:  

## Code notes (P7-02)

Implemented to support the budget:

- **GSAP register** only registers `ScrollTrigger` (+ `useGSAP`). Flip is not registered until a feature needs it (dynamic import then).
- **Hero** uses `next/image` with `priority` on the first stack photo (LCP).
- **CardPeek** uses `next/image` with explicit `sizes`.
- **Home page** uses a single repository list instead of two sequential lists.
- **next.config** prefers AVIF/WebP, sensible `deviceSizes` / `imageSizes`, `compress`, no `X-Powered-By`.

Fill the tables after a local or CI Lighthouse pass; do not invent numbers.
