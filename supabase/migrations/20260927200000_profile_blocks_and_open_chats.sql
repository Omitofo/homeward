-- WhatsApp-style chat model:
--   - Archive = conversation_hides (per-user, history kept on server for both)
--   - Block = profile_blocks (either direction stops messaging; admin cannot be blocked)
--   - Remove mutual "closed / only closer reopens"
-- Migrate existing closed conversations into blocks owned by the closer.

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

grant select, insert, delete on table public.profile_blocks to authenticated;
grant all on table public.profile_blocks to service_role;

insert into public.profile_blocks (blocker_id, blocked_id)
select
  c.closed_by,
  case
    when c.closed_by = c.adopter_id then c.shelter_profile_id
    else c.adopter_id
  end
from public.conversations c
where c.status = 'closed'
  and c.closed_by is not null
  and c.closed_by <> case
    when c.closed_by = c.adopter_id then c.shelter_profile_id
    else c.adopter_id
  end
  and not exists (
    select 1 from public.profiles p
    where p.id = case
      when c.closed_by = c.adopter_id then c.shelter_profile_id
      else c.adopter_id
    end
      and p.role = 'admin'
  )
on conflict do nothing;

update public.conversations
set
  status = 'open',
  closed_by = null,
  closed_at = null,
  close_reason = ''
where status = 'closed';

drop policy if exists "messages_insert_participant" on public.messages;

create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.adopter_id = auth.uid() or c.shelter_profile_id = auth.uid())
        and not exists (
          select 1 from public.profile_blocks b
          where
            (b.blocker_id = c.adopter_id and b.blocked_id = c.shelter_profile_id)
            or (b.blocker_id = c.shelter_profile_id and b.blocked_id = c.adopter_id)
        )
    )
  );
