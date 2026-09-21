# 06 — Data Model (Supabase / Postgres)

Intent-level design. Exact SQL lives in `supabase/migrations/` and generated types in `src/types/db.ts`.
All tables have RLS **enabled**. No table is readable/writable without an explicit policy.

## Entities
```
auth.users (Supabase)
   1 ── 1  profiles ── role: adopter | shelter | admin
                 │
                 ├── 1 ── 0..1  shelters        (if role = shelter)
                 │                 ├── 0..n  verification_requests
                 │                 └── 0..n  animal_posts ── 1..10 post_media
                 │                                   ├── 0..n likes        (adopter)
                 │                                   └── 0..n comments     (any signed-in)
                 ├── 0..n saved_searches (adopter)
                 ├── 0..n conversations ── 0..n messages
                 └── 0..n reports
```

## Tables (key columns)
**profiles** — `id (=auth uid)`, `role`, `display_name`, `avatar_url`, `created_at`, `deleted_at`
**shelters** — `id`, `profile_id`, `handle (unique, slug)`, `org_name`, `bio`, `links jsonb (validated list of {label,url})`, `country_code`, `region`, `city`, `verification_status (unverified|pending|verified|rejected)`, `verified_at`, `verified_by`
**verification_requests** — `id`, `shelter_id`, `status`, `notes`, `documents (private storage paths)`, `reviewed_by`, `review_note`, `created_at`, `reviewed_at`
**animal_posts** — `id`, `shelter_id`, `name`, `species (dog|cat|rabbit|bird|other)`, `breed`, `sex`, `age_months`, `age_group (baby|young|adult|senior)`, `size (small|medium|large|xl)`, `description`, `country_code`, `region`, `city`, `status (available|reserved|adopted|archived)`, `traits text[]` (kids/dogs/cats friendly, vaccinated, neutered...), `created_at`, `updated_at`
**post_media** — `id`, `post_id`, `storage_path`, `position`, `alt_text`, `width`, `height`
**likes** — `user_id`, `post_id`, `created_at` — PK (`user_id`,`post_id`)
**comments** — `id`, `post_id`, `user_id`, `body (max 1000)`, `parent_id null`, `created_at`, `hidden_at`
**saved_searches** — `id`, `user_id`, `name`, `filters jsonb (validated by same Zod schema as URL)`, `notify boolean`, `created_at`
**conversations** — `id`, `adopter_id`, `shelter_profile_id`, `post_id null`, `created_at`, unique (`adopter_id`,`shelter_profile_id`)
**messages** — `id`, `conversation_id`, `sender_id`, `body (max 2000)`, `created_at`, `read_at`
**reports** — `id`, `reporter_id`, `target_type`, `target_id`, `reason`, `status`, `created_at`

Denormalized counters (`like_count`, `comment_count`) maintained by triggers for feed speed.

## Filter fields and indexes
Filters: `country_code`, `region`, `city`, `species`, `breed`, `age_group`, `size`, `sex`, `status`, `verified_only`, `traits`, text `q`.
Indexes: composite on (`status`, `country_code`, `species`, `created_at desc`), btree on `shelter_id`, trigram/`tsvector` for breed and text search. Cursor-based pagination on (`created_at`, `id`).
Location v1: structured fields (ISO country + free text region/city, with a curated suggestion list). Geocoding/radius search is a later enhancement.

## RLS intent (summary)
| Table | Read | Write |
|-------|------|-------|
| profiles | public columns of shelters, own row for everyone | own row only, `role` never client-writable |
| shelters | public | owner; `verification_status`/`verified_*` admin only |
| animal_posts, post_media | public where `status <> archived` (owner sees all) | owner shelter only |
| likes | own rows + aggregate counts | insert/delete own, role = adopter |
| comments | public (non-hidden) | insert as any signed-in; edit/delete own; admin moderates |
| saved_searches | own | own |
| conversations, messages | **participants only** | adopter creates; both post; sender own rows |
| verification_requests + documents | owner shelter + admin | owner creates; admin updates status |
| reports | reporter + admin | insert any signed-in |

Storage buckets: `animal-media` (public read, owner-scoped write), `avatars` (public read), `verification-docs` (**private**, signed URLs, admin + owner only).
Role is stored in `profiles` and mirrored to JWT claims via a controlled server function, never trusted from the client.
