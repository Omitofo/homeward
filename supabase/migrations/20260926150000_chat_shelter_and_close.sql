-- Shelter-to-shelter messaging + close/block conversations.
-- Column names stay adopter_id / shelter_profile_id for compatibility:
--   adopter_id          = conversation initiator (adopter OR shelter)
--   shelter_profile_id  = the other party (always a shelter profile)

alter table public.conversations
  add column if not exists status text not null default 'open'
    check (status in ('open', 'closed')),
  add column if not exists closed_by uuid references public.profiles (id),
  add column if not exists closed_at timestamptz,
  add column if not exists close_reason text not null default ''
    check (char_length(close_reason) <= 500);

-- Replace insert policy: adopters (as before) OR shelters messaging another shelter
drop policy if exists "conversations_insert_adopter" on public.conversations;

create policy "conversations_insert_participants"
  on public.conversations for insert
  with check (
    auth.uid() = adopter_id
    and exists (
      select 1 from public.shelters s
      where s.profile_id = shelter_profile_id
    )
    and adopter_id <> shelter_profile_id
    and (
      -- Adopter / admin starts chat with a shelter
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.role in ('adopter', 'admin')
          and p.deleted_at is null
      )
      -- Shelter starts chat with another shelter
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.role = 'shelter'
          and p.deleted_at is null
      )
      and exists (
        select 1 from public.shelters s2
        where s2.profile_id = auth.uid()
      )
    )
  );

-- Messages only while conversation is open
drop policy if exists "messages_insert_participant" on public.messages;

create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.status = 'open'
        and (c.adopter_id = auth.uid() or c.shelter_profile_id = auth.uid())
    )
  );
