-- Allow conversations where the "peer" is an admin (support inbox),
-- not only a shelter profile. Used when a rescue messages Homeward about verification.

drop policy if exists "conversations_insert_participants" on public.conversations;

create policy "conversations_insert_participants"
  on public.conversations for insert
  with check (
    auth.uid() = adopter_id
    and adopter_id <> shelter_profile_id
    and (
      -- Target is a shelter (adopter→shelter or shelter→shelter)
      exists (
        select 1 from public.shelters s
        where s.profile_id = shelter_profile_id
      )
      -- Target is an admin (support / verification questions)
      or exists (
        select 1 from public.profiles p
        where p.id = shelter_profile_id
          and p.role = 'admin'
          and p.deleted_at is null
      )
    )
    and (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.role in ('adopter', 'admin', 'shelter')
          and p.deleted_at is null
      )
    )
  );
