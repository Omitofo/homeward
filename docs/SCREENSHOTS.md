# Screenshots guide (P7-06)

Capture assets for README, social, and pitch decks. Prefer **real browser** captures (not design mocks) so motion and layout match production.

## Recommended set

| # | File name (suggested) | Route | Viewport | Notes |
|---|----------------------|-------|----------|-------|
| 1 | `01-hero-desktop.png` | `/` | 1440×900 | After hero animation settles; Full motion |
| 2 | `02-hero-mobile.png` | `/` | 390×844 | iPhone-class width |
| 3 | `03-explore-grid.png` | `/explore` | 1440×900 | 3–4 columns visible |
| 4 | `04-filters-mobile.png` | `/explore` | 390×844 | Filter sheet open |
| 5 | `05-post-detail.png` | `/post/[id]` | 1280×800 | Carousel + actions |
| 6 | `06-shelter-profile.png` | `/shelter/[handle]` | 1280×800 | Badge if verified |
| 7 | `07-studio-composer.png` | `/studio/new` | 1280×800 | Shelter session |
| 8 | `08-chat-thread.png` | `/messages/[id]` | 390×844 | Safety banner visible |
| 9 | `09-motion-off.png` | `/` | 1440×900 | Same as #1 with Motion **Off** (pair for “impact”) |

## How to capture

1. `npm run build && npm run start` (or deploy preview URL).
2. Chrome DevTools → device toolbar for mobile sizes; full page or clipped viewport.
3. Hide bookmarks bar; use a clean profile if possible.
4. Export PNG (2× if Retina and file size allows).
5. Store under `docs/assets/screenshots/` (create folder when you add files) and link from README if desired.

```text
docs/assets/screenshots/
  01-hero-desktop.png
  …
```

## README embed (optional)

Once files exist:

```markdown
![Homeward hero](docs/assets/screenshots/01-hero-desktop.png)
```

## Accessibility note

When using screenshots in decks, add a one-line caption (what the screen is for). Avoid relying on color alone to explain the verified badge — mention it in the caption.
