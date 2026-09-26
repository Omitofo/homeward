-- Allow shelters to like and save posts (app policy change in PR #70).
-- Previous policies only permitted role in ('adopter', 'admin').

drop policy if exists "likes_insert_adopter" on public.likes;

create policy "likes_insert_authenticated"
  on public.likes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('adopter', 'shelter', 'admin')
        and p.deleted_at is null
    )
  );

drop policy if exists "saved_animals_insert_adopter" on public.saved_animals;

create policy "saved_animals_insert_authenticated"
  on public.saved_animals for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('adopter', 'shelter', 'admin')
        and p.deleted_at is null
    )
  );
