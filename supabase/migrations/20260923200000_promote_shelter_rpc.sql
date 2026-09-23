-- Reliable shelter promote: SECURITY DEFINER runs as function owner (postgres),
-- so profiles_lock_role allows the role change regardless of JWT claim shape.
-- Only service_role may execute (anon/authenticated cannot escalate).

create or replace function public.admin_promote_shelter(
  p_user_id uuid,
  p_handle text,
  p_org_name text,
  p_display_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null or p_handle is null or p_org_name is null then
    raise exception 'admin_promote_shelter: user_id, handle, and org_name are required';
  end if;

  if p_handle !~ '^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$' then
    raise exception 'admin_promote_shelter: invalid handle';
  end if;

  -- Ensure profile exists (trigger may lag or have failed)
  insert into public.profiles (id, role, display_name)
  values (
    p_user_id,
    'shelter',
    coalesce(
      nullif(trim(p_display_name), ''),
      'Shelter'
    )
  )
  on conflict (id) do update
    set role = 'shelter',
        display_name = coalesce(
          nullif(trim(p_display_name), ''),
          public.profiles.display_name
        ),
        deleted_at = null;

  -- Shelter row (idempotent on profile_id)
  insert into public.shelters (
    profile_id,
    handle,
    org_name,
    bio,
    country_code,
    region,
    city,
    verification_status
  )
  values (
    p_user_id,
    p_handle,
    p_org_name,
    '',
    'XX',
    '',
    '',
    'unverified'
  )
  on conflict (profile_id) do update
    set handle = excluded.handle,
        org_name = excluded.org_name;
end;
$$;

revoke all on function public.admin_promote_shelter(uuid, text, text, text) from public;
revoke all on function public.admin_promote_shelter(uuid, text, text, text) from anon;
revoke all on function public.admin_promote_shelter(uuid, text, text, text) from authenticated;
grant execute on function public.admin_promote_shelter(uuid, text, text, text) to service_role;
