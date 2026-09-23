# CLAUDE.md — Read this first (AI collaborator entry point)

You are helping build **Homeward** (working title), a browser-based pet adoption social platform for rescue
centers, with a heavy focus on GSAP-driven motion. The owner has a limited token budget per day, so
**every session must be cheap to start and safe to stop at any moment.**

## Session start protocol (do this in order, nothing more)
1. Read this file.
2. Read `docs/00-PROJECT-STATE.md` — it tells you the current phase, what is done, and the next task.
3. Read ONLY the docs the next task needs (map below). Do not read everything.
4. Look at the repo tree and the files the task touches. Do not re-audit the whole codebase.
5. State in 2-3 lines what you will do this session, then do it.

## Session end protocol (always, even if the session is cut short)
1. Update the task table in `docs/00-PROJECT-STATE.md` (status, notes, next task).
2. Log any new decision in `docs/10-DECISIONS.md`.
3. Commit small, with Conventional Commit messages.
Work in small vertical slices so the repo is always in a runnable state.

## Doc map (read only what you need)
| Working on...                     | Read                                   |
|-----------------------------------|----------------------------------------|
| Anything (always)                 | `00-PROJECT-STATE.md`                  |
| Scope, "should we build X?"       | `01-VISION-AND-SCOPE.md`               |
| Auth, roles, permissions, flows   | `02-ROLES-AND-FLOWS.md`                |
| Folders, stack, data access layer | `03-ARCHITECTURE.md`                   |
| Any UI work                       | `04-DESIGN-PRINCIPLES.md`              |
| Any animation                     | `05-MOTION-GSAP.md`                    |
| Database, RLS, types              | `06-DATA-MODEL.md`                     |
| Auth, uploads, API, headers       | `07-SECURITY.md`                       |
| Code style, testing, git, DoD     | `08-ENGINEERING-STANDARDS.md`          |
| Picking the next task             | `09-ROADMAP.md`                        |
| "Why did we choose X?"            | `10-DECISIONS.md`                      |
| Production deploy                 | `12-DEPLOY.md`                         |
| Live presentation                 | `13-DEMO-SCRIPT.md`, `SCREENSHOTS.md`  |

## Non-negotiable rules
- Follow the folder structure in `03-ARCHITECTURE.md`. Change it only with a logged decision.
- Every UI is mobile-first and works on mobile, tablet, desktop, and iOS/Android/Windows/macOS browsers.
- Every animation follows `05-MOTION-GSAP.md` (tokens, cleanup, reduced-motion, transform/opacity only).
- Security is designed in, not bolted on: `07-SECURITY.md` (OWASP Top 10) applies to every feature.
- Access control lives on the server/database (RLS), never only in the UI.
- Data is accessed through the repository layer, so mock data and Supabase are swappable.
- Keep it simple. Prefer the boring, proven solution. Ask before adding a dependency.
- Restraint in design: one memorable moment per screen, everything else quiet and disciplined.
- Do not invent facts about the owner's preferences. If a decision is open, check `10-DECISIONS.md`, then ask.
