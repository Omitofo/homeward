-- Fix: permission denied for table conversation_hides
-- Table may exist from 20260926180000 without effective GRANTs for the API role.

-- Ensure table exists (no-op if already created)
create table if not exists public.conversation_hides (
  user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, conversation_id)
);

create index if not exists conversation_hides_user_idx
  on public.conversation_hides (user_id, hidden_at desc);

alter table public.conversation_hides enable row level security;

-- Policies (idempotent)
drop policy if exists "conversation_hides_select_own" on public.conversation_hides;
create policy "conversation_hides_select_own"
  on public.conversation_hides for select
  using (auth.uid() = user_id);

drop policy if exists "conversation_hides_insert_own" on public.conversation_hides;
create policy "conversation_hides_insert_own"
  on public.conversation_hides for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.adopter_id = auth.uid() or c.shelter_profile_id = auth.uid())
    )
  );

drop policy if exists "conversation_hides_delete_own" on public.conversation_hides;
create policy "conversation_hides_delete_own"
  on public.conversation_hides for delete
  using (auth.uid() = user_id);

drop policy if exists "conversation_hides_delete_peer_unhide" on public.conversation_hides;
create policy "conversation_hides_delete_peer_unhide"
  on public.conversation_hides for delete
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.adopter_id = auth.uid() or c.shelter_profile_id = auth.uid())
    )
  );

-- Critical: table-level privileges (without these, PostgREST fails before RLS)
grant usage on schema public to authenticated;
grant select, insert, delete on table public.conversation_hides to authenticated;
grant all on table public.conversation_hides to service_role;
