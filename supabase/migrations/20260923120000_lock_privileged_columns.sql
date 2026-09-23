-- P7-03: Lock privileged columns so clients cannot escalate role or verification.
-- Role changes and verification status must go through service-role only.

-- ---------------------------------------------------------------------------
-- profiles.role is immutable for authenticated users (service_role bypasses RLS
-- but this trigger still runs unless we detect the service role JWT).
-- ---------------------------------------------------------------------------
create or replace function public.profiles_lock_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow service_role / postgres (admin promote, seed, migrations)
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    raise exception 'profiles.role is not client-writable';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_lock_role on public.profiles;
create trigger profiles_lock_role
  before update on public.profiles
  for each row execute function public.profiles_lock_role();

-- ---------------------------------------------------------------------------
-- shelters.verification_status / verified_at / verified_by — admin only
-- ---------------------------------------------------------------------------
create or replace function public.shelters_lock_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
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

drop trigger if exists shelters_lock_verification on public.shelters;
create trigger shelters_lock_verification
  before update on public.shelters
  for each row execute function public.shelters_lock_verification();
