-- Saved animals (private favorites, separate from public likes)

create table public.saved_animals (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.animal_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index saved_animals_user_idx on public.saved_animals (user_id, created_at desc);
create index saved_animals_post_idx on public.saved_animals (post_id);

alter table public.saved_animals enable row level security;

-- Only the owner can see their saves
create policy "saved_animals_select_own"
  on public.saved_animals for select
  using (auth.uid() = user_id);

-- Adopters and admins may save; shelters cannot
create policy "saved_animals_insert_adopter"
  on public.saved_animals for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('adopter', 'admin')
        and p.deleted_at is null
    )
  );

create policy "saved_animals_delete_own"
  on public.saved_animals for delete
  using (auth.uid() = user_id);

-- Table privileges (RLS still applies)
grant select, insert, delete on table public.saved_animals to authenticated;
