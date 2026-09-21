# 08 — Engineering Standards

## Code quality
- **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`). No `any` without a comment explaining why.
- **ESLint** (Next + TypeScript + jsx-a11y + import order) and **Prettier**. Enforced by lint-staged + CI.
- **Naming:** components `PascalCase.tsx`; hooks `useThing.ts`; utilities `camelCase.ts`; folders `kebab-case`; constants `SCREAMING_SNAKE` only for true constants.
- **Small units.** Components < ~150 lines, functions do one thing. Extract when a file needs scrolling to understand.
- **Composition over configuration.** Simple props, no boolean-prop explosions.
- **Barrel files (`index.ts`)** expose a feature's public API only. Features do not import each other's internals.
- **Comments explain why**, not what. Public functions get short JSDoc.
- **No dead code, no commented-out blocks, no TODO without a task ID.**
- **Accessibility and semantics** are part of "correct", not extra (see doc 04).
- **i18n-ready:** UI strings live in a single module per feature (easy to extract later).

## Patterns to use
Repository pattern for data, Zod schema as single source of truth for types (`z.infer`), server-first rendering,
optimistic UI with rollback, error boundaries per feature, skeletons for loading, Result-style returns from server
actions (`{ ok: true, data } | { ok: false, error }`) instead of throwing to the UI.

## Git workflow
- Default branch is protected. Work on short-lived branches: `feat/…`, `fix/…`, `chore/…`, `docs/…`. Merge via PR, squash.
- **Conventional Commits:** `feat(feed): add carousel drag`, `fix(auth): handle expired link`, `docs: update state`.
- Small PRs, one task ID each. PR template checklist is the Definition of Done.
- Never commit secrets, build output, or large binaries (optimize images first).

## Testing
| Layer | Tool | What |
|-------|------|------|
| Unit | Vitest | Zod schemas, filter<->URL parsing, utils, repositories (mock) |
| Component | Testing Library | Critical UI: filter bar, auth sheet, post card actions |
| Security/RLS | SQL tests / integration | "Wrong user is denied" for every table |
| E2E | Playwright | Browse+filter, sign-up gate, like/comment, shelter post, chat. Runs with `?motion=off` |
| Manual | Device matrix | iOS Safari, Android Chrome, desktop browsers, reduced motion |

Test what would hurt if it broke. Do not chase coverage numbers.

## CI (GitHub Actions)
On every PR: install > lint > typecheck > unit tests > build > (e2e on main / labeled PRs) > `npm audit --audit-level=high`.

## Documentation
- README stays accurate (setup, scripts, env vars, architecture link).
- Each feature folder may hold a short `README.md` if non-obvious.
- Update `docs/00-PROJECT-STATE.md` at the end of every session. Log decisions in doc 10.

## Definition of Done (every task)
- [ ] Meets the task's acceptance criteria in doc 09
- [ ] Responsive: 320px to wide desktop, touch and pointer
- [ ] Accessible: keyboard, focus, labels, contrast, reduced motion
- [ ] Motion follows doc 05 and cleans up
- [ ] Security checklist (doc 07) passed
- [ ] Lint, typecheck, tests, build green
- [ ] No console errors or warnings
- [ ] Docs and state table updated
- [ ] Runnable in a clean clone with README steps

## Performance hygiene
Server components by default, dynamic imports for heavy client code, image optimization, no unnecessary global
state (URL and server state first), memoize only with evidence, measure with Lighthouse and the Performance panel.
