# 11 — Intro concept (P1-01)

**Status:** Accepted for implementation · 2026-09-21

## Hero moment
**Typographic + photography.** One full-viewport beat: a confident headline that reveals word-by-word, framed by a quiet stack of animal photos (real feed imagery). No interactive "match" quiz in v1; no pinned scroll jacking on mobile.

## Art direction
- Photography is the color and emotion; UI stays warm neutrals + teal CTA.
- Headline is the bold design element on this screen only (display size, tight tracking).
- Photo stack: 3 overlapping cards, slight rotation, soft shadow — peeks the product without competing with type.
- One memorable moment: the word stagger on load. Everything after is quieter (Reveal, counters).

## Copy
| Block | Copy |
|-------|------|
| Eyebrow | Find a companion |
| Headline | A home is waiting. So are they. |
| Sub | Browse animals from verified rescues. Filter what matters. Message when you’re ready. |
| Primary CTA | Explore animals |
| Secondary | Skip intro |
| Beat — Find | Filter by species, size, age, and place. Share a link; the feed stays in sync. |
| Beat — Trust | Verified rescues, clear status, safe messaging. Trust is the product. |
| Beat — Connect | Like, save, and chat with shelters when you’re ready to take the next step. |

## Structure (top → bottom)
1. **Hero** (100dvh-ish): headline + sub + CTAs + photo stack + skip
2. **Story** (3 short beats): Find · Trust · Connect — not pinned on mobile; light scrub optional later (P1-03)
3. **Proof**: simple counters (animals listed, shelters, countries) from mock data
4. **Peek**: 4 real cards from the feed linking to `/explore`
5. **Footer CTA**: repeat Explore + Motion toggle

## Motion notes
- Hero words: stagger `power3.out`, ~0.06s, transform + opacity only
- Reduced: instant opacity; Off: no animation
- No SplitText Club plugin — manual word spans
- Scroll story pin/scrub deferred to P1-03 with mobile stacked fallback

## ASCII wire (mobile)
```
┌─────────────────────┐
│ Homeward      Motion│
│                     │
│  Find a companion   │
│  A home is waiting. │
│  So are they.       │
│  [subcopy]          │
│  [Explore]  Skip →  │
│     ┌──┐ ┌──┐       │
│     │📷│ │📷│ stack │
│     └──┘ └──┘       │
├─────────────────────┤
│ Find · Trust · Conn │
├─────────────────────┤
│ 40 · 8 · 6  stats   │
├─────────────────────┤
│ [card][card] peek   │
│     Explore →       │
└─────────────────────┘
```
