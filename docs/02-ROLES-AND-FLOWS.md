# 02 — Roles, Permissions & User Flows

## Roles
| Role | How created | Purpose |
|------|-------------|---------|
| **Visitor** | No account | Browse everything public |
| **Adopter** | Sign-up: email + name | Engage and contact shelters. Cannot upload images |
| **Shelter** | Sign-up as shelter: email + name + organization name + country | Publish animals, own a profile, chat |
| **Admin** | Assigned manually in DB | Verification and moderation |

A single email has ONE role. Shelter sign-up is a separate entry point ("I represent a rescue center").

## Permissions matrix
| Action | Visitor | Adopter | Shelter | Admin |
|--------|:------:|:------:|:------:|:-----:|
| View feed, filters, shelter profiles, post detail | ✅ | ✅ | ✅ | ✅ |
| Read comments | ✅ | ✅ | ✅ | ✅ |
| Share a post (link/Web Share) | ✅ | ✅ | ✅ | ✅ |
| Like a post | ❌ prompt sign-up | ✅ | ✅* | ✅ |
| Comment | ❌ prompt sign-up | ✅ | ✅ | ✅ |
| Save searches / see liked | ❌ | ✅ | ❌ | ❌ |
| Start a chat | ❌ | ✅ (with a shelter) | ❌ (can only reply) | ✅ |
| Create/edit/delete own animal posts | ❌ | ❌ | ✅ (own only) | ✅ |
| Upload images | ❌ | ❌ | ✅ | ✅ |
| Edit shelter profile | ❌ | ❌ | ✅ (own only) | ✅ |
| Request verification | ❌ | ❌ | ✅ | ❌ |
| Grant/revoke Verified badge | ❌ | ❌ | ❌ | ✅ |
| Report post/comment/user | ❌ | ✅ | ✅ | ✅ |
| Delete any comment/post | ❌ | ❌ | ❌ | ✅ |

*Shelter likes are an open question, see doc 10. Default: shelters cannot like, to keep like counts meaningful.

**Enforcement:** every row above is enforced by Supabase RLS + server-side checks. UI hiding is cosmetic only.

## Gating pattern for visitors
When a visitor taps like, comment, contact, or save: do NOT navigate away. Open an **auth sheet/modal**
that explains the benefit in one line, takes email + name, and after confirming returns the visitor to the
exact place with the action completed (store `intent` in session). This is the key conversion flow, so make it excellent.

## Core flows

### F1. First visit
Intro (GSAP hero) -> scroll storytelling (3 beats: find, trust, connect) -> CTA "Meet the animals" -> Explore.
Returning visitors skip the full intro (compact intro or straight to Explore, remembered via localStorage).

### F2. Browse and filter
Explore -> filter bar (desktop: top bar with popovers; mobile: bottom sheet) -> URL updates
(`/explore?species=dog&country=ES&size=small`) -> feed re-renders with animated transition -> open post detail -> share.

### F3. Adopter sign-up and engagement
Tap like/comment/contact -> auth sheet -> enter name + email -> magic link -> confirm -> return to intent -> action done.
Adopter home: Liked, Saved searches, Messages.

### F4. Contact a shelter
Post detail or shelter profile -> "Message" -> auth if needed -> conversation created (linked to the animal if started from a post) -> realtime chat. Safety banner: "Never send money before meeting the animal."

### F5. Shelter onboarding
Shelter sign-up -> confirm email -> profile setup checklist (avatar, bio, links, location) -> first post -> "Request verification" (upload documents/proof, private storage) -> admin review -> badge granted or feedback given.

### F6. Shelter posting (Instagram-like)
Studio -> New post -> upload 1-10 images (reorder, alt text) -> animal details (species, breed, age, size, sex, location, description) -> preview -> publish. Edit, mark reserved/adopted, archive.

### F7. Admin verification
Queue -> review request (documents, links, history) -> approve / request more info / reject with reason -> shelter is notified and badge updates immediately.

## Screens (route map)
| Route | Access | Notes |
|-------|--------|-------|
| `/` | public | Intro/landing |
| `/explore` | public | Feed + filters (URL-synced) |
| `/post/[id]` | public | Detail (also opens as modal over explore on client nav) |
| `/shelter/[handle]` | public | Instagram-like profile |
| `/login`, `/register`, `/register/shelter` | public | Auth |
| `/me/liked`, `/me/searches`, `/me/settings` | adopter | |
| `/messages`, `/messages/[id]` | adopter, shelter | |
| `/studio`, `/studio/new`, `/studio/post/[id]`, `/studio/profile`, `/studio/verification` | shelter | |
| `/admin/verification`, `/admin/reports` | admin | |
| `/about`, `/safety`, `/privacy`, `/terms` | public | Trust content |
