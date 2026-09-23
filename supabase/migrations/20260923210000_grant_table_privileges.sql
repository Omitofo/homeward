-- Table-level privileges for API roles.
-- RLS still enforces row access; without GRANT, PostgREST fails with
-- "permission denied for table …" before policies run.

grant usage on schema public to anon, authenticated, service_role;

-- Core
grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;

grant select on table public.shelters to anon, authenticated;
grant insert, update on table public.shelters to authenticated;

grant select on table public.animal_posts to anon, authenticated;
grant insert, update, delete on table public.animal_posts to authenticated;

grant select on table public.post_media to anon, authenticated;
grant insert, update, delete on table public.post_media to authenticated;

-- Engagement
grant select, insert, delete on table public.likes to authenticated;
grant select on table public.likes to anon;

grant select on table public.comments to anon, authenticated;
grant insert, update, delete on table public.comments to authenticated;

grant select, insert, update, delete on table public.saved_searches to authenticated;

-- Verification & moderation
grant select, insert on table public.verification_requests to authenticated;
grant update on table public.verification_requests to authenticated;

grant select, insert on table public.reports to authenticated;
grant update on table public.reports to authenticated;

-- Chat
grant select, insert, update on table public.conversations to authenticated;
grant select, insert, update on table public.messages to authenticated;

-- Sequences (ids)
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- service_role: full access (admin client, RPC)
grant all on all tables in schema public to service_role;

-- Future tables created by postgres inherit sensible defaults
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
