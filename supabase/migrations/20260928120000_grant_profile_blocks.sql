-- Ensure profile_blocks exists with table privileges (PostgREST needs GRANT before RLS).

create table if not exists public.profile_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists profile_blocks_blocked_idx
  on public.profile_blocks (blocked_id);

alter table public.profile_blocks enable row level security;

drop policy if exists "profile_blocks_select_own" on public.profile_blocks;
create policy "profile_blocks_select_own"
  on public.profile_blocks for select
  using (
    auth.uid() = blocker_id
    or auth.uid() = blocked_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "profile_blocks_insert_own" on public.profile_blocks;
create policy "profile_blocks_insert_own"
  on public.profile_blocks for insert
  with check (
    auth.uid() = blocker_id
    and not exists (
      select 1 from public.profiles p
      where p.id = blocked_id
        and p.role = 'admin'
        and p.deleted_at is null
    )
  );

drop policy if exists "profile_blocks_delete_own" on public.profile_blocks;
create policy "profile_blocks_delete_own"
  on public.profile_blocks for delete
  using (
    auth.uid() = blocker_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Critical: without these, PostgREST returns permission denied before RLS
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table public.profile_blocks to authenticated;
grant all on table public.profile_blocks to service_role;
