-- P6-01: Conversations + messages (participants-only RLS)

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  adopter_id uuid not null references public.profiles (id) on delete cascade,
  shelter_profile_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.animal_posts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (adopter_id, shelter_profile_id)
);

create index conversations_adopter_idx on public.conversations (adopter_id, updated_at desc);
create index conversations_shelter_idx on public.conversations (shelter_profile_id, updated_at desc);

alter table public.conversations enable row level security;

create policy "conversations_select_participants"
  on public.conversations for select
  using (
    auth.uid() = adopter_id
    or auth.uid() = shelter_profile_id
    or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Only adopters (or admin) may start a chat with a shelter profile
create policy "conversations_insert_adopter"
  on public.conversations for insert
  with check (
    auth.uid() = adopter_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('adopter', 'admin')
        and p.deleted_at is null
    )
    and exists (
      select 1 from public.shelters s
      where s.profile_id = shelter_profile_id
    )
  );

create policy "conversations_update_participants"
  on public.conversations for update
  using (
    auth.uid() = adopter_id or auth.uid() = shelter_profile_id
  )
  with check (
    auth.uid() = adopter_id or auth.uid() = shelter_profile_id
  );

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_conversation_idx
  on public.messages (conversation_id, created_at asc);

alter table public.messages enable row level security;

create policy "messages_select_participants"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.adopter_id = auth.uid() or c.shelter_profile_id = auth.uid())
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.adopter_id = auth.uid() or c.shelter_profile_id = auth.uid())
    )
  );

-- Sender may mark own messages; participants can set read_at on the other party's messages
create policy "messages_update_participants"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.adopter_id = auth.uid() or c.shelter_profile_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.adopter_id = auth.uid() or c.shelter_profile_id = auth.uid())
    )
  );

create or replace function public.conversations_bump_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
    set updated_at = now()
    where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_after_insert_bump_conversation
  after insert on public.messages
  for each row execute function public.conversations_bump_updated_at();
