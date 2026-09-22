-- P4-04: saved_searches (adopters own their rows)

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  filters jsonb not null default '{}'::jsonb,
  notify boolean not null default false,
  created_at timestamptz not null default now()
);

create index saved_searches_user_idx on public.saved_searches (user_id, created_at desc);

alter table public.saved_searches enable row level security;

create policy "saved_searches_select_own"
  on public.saved_searches for select
  using (auth.uid() = user_id);

create policy "saved_searches_insert_own"
  on public.saved_searches for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('adopter', 'admin')
        and p.deleted_at is null
    )
  );

create policy "saved_searches_update_own"
  on public.saved_searches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "saved_searches_delete_own"
  on public.saved_searches for delete
  using (auth.uid() = user_id);
