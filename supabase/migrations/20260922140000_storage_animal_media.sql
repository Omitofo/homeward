-- P5-01: Public animal media bucket with owner-scoped write.
-- Path convention: {shelter_id}/{uuid}.webp

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'animal-media',
  'animal-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.storage_shelter_id_from_name(object_name text)
returns uuid
language sql
immutable
as $$
  select nullif(split_part(object_name, '/', 1), '')::uuid;
$$;

create policy "animal_media_select_public"
  on storage.objects for select
  using (bucket_id = 'animal-media');

create policy "animal_media_insert_owner"
  on storage.objects for insert
  with check (
    bucket_id = 'animal-media'
    and auth.uid() is not null
    and public.storage_shelter_id_from_name(name) in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );

create policy "animal_media_update_owner"
  on storage.objects for update
  using (
    bucket_id = 'animal-media'
    and public.storage_shelter_id_from_name(name) in (
      select id from public.shelters where profile_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'animal-media'
    and public.storage_shelter_id_from_name(name) in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );

create policy "animal_media_delete_owner"
  on storage.objects for delete
  using (
    bucket_id = 'animal-media'
    and public.storage_shelter_id_from_name(name) in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );
