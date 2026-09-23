-- Fix P7-03 lock triggers: detect service_role correctly.
-- PostgREST exposes JWT as request.jwt.claims (JSON), not request.jwt.claim.role.
-- Without this, createAdminClient() updates to profiles.role fail and shelter
-- sign-up leaves the user stuck as adopter.

create or replace function public.profiles_lock_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
  );

  -- service_role key (admin client) or superusers running migrations / SQL editor
  if jwt_role = 'service_role'
     or current_user in ('postgres', 'supabase_admin', 'supabase_auth_admin') then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    raise exception 'profiles.role is not client-writable';
  end if;

  return new;
end;
$$;

create or replace function public.shelters_lock_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
  );

  if jwt_role = 'service_role'
     or current_user in ('postgres', 'supabase_admin', 'supabase_auth_admin') then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.verification_status is distinct from old.verification_status
       or new.verified_at is distinct from old.verified_at
       or new.verified_by is distinct from old.verified_by then
      raise exception 'shelters verification fields are not client-writable';
    end if;
  end if;

  return new;
end;
$$;
