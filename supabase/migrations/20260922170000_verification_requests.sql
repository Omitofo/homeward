-- P5-04: Verification requests + private document storage.

create type public.verification_request_status as enum (
  'pending',
  'needs_info',
  'approved',
  'rejected'
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters (id) on delete cascade,
  status public.verification_request_status not null default 'pending',
  notes text not null default '' check (char_length(notes) <= 2000),
  documents jsonb not null default '[]'::jsonb,
  -- documents: [{ path, fileName, mime, size }]
  reviewed_by uuid references public.profiles (id),
  review_note text not null default '' check (char_length(review_note) <= 2000),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index verification_requests_shelter_idx
  on public.verification_requests (shelter_id, created_at desc);
create index verification_requests_status_idx
  on public.verification_requests (status, created_at desc)
  where status in ('pending', 'needs_info');

alter table public.verification_requests enable row level security;

-- Owner shelter can read own requests; admin can read all
create policy "verification_requests_select_owner_or_admin"
  on public.verification_requests for select
  using (
    shelter_id in (
      select id from public.shelters where profile_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Owner creates only when shelter is not already verified/pending
create policy "verification_requests_insert_owner"
  on public.verification_requests for insert
  with check (
    shelter_id in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );

-- Only admin updates status / review fields
create policy "verification_requests_update_admin"
  on public.verification_requests for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Private verification documents bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification-docs',
  'verification-docs',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path: {shelter_id}/{uuid}.{ext}
create policy "verification_docs_select_owner_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'verification-docs'
    and (
      public.storage_shelter_id_from_name(name) in (
        select id from public.shelters where profile_id = auth.uid()
      )
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );

create policy "verification_docs_insert_owner"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-docs'
    and auth.uid() is not null
    and public.storage_shelter_id_from_name(name) in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );

create policy "verification_docs_delete_owner_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'verification-docs'
    and (
      public.storage_shelter_id_from_name(name) in (
        select id from public.shelters where profile_id = auth.uid()
      )
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );
