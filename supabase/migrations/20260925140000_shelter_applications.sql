-- Shelter applications: request-to-join gate before role=shelter.
-- Anyone can open an adopter account; becoming a shelter requires admin approval.
-- Verified badge remains a separate, higher bar (verification_requests).

create type public.shelter_application_status as enum (
  'pending',
  'approved',
  'rejected'
);

create table public.shelter_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  handle text not null
    check (handle ~ '^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$'),
  org_name text not null check (char_length(org_name) between 1 and 120),
  display_name text not null default '' check (char_length(display_name) <= 80),
  country_code char(2) not null default 'XX',
  website text not null default '' check (char_length(website) <= 300),
  message text not null default '' check (char_length(message) <= 2000),
  status public.shelter_application_status not null default 'pending',
  review_note text not null default '' check (char_length(review_note) <= 2000),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Only one pending application per applicant
create unique index shelter_applications_one_pending
  on public.shelter_applications (applicant_id)
  where status = 'pending';

-- Pending handle must not collide with another pending application
create unique index shelter_applications_handle_pending
  on public.shelter_applications (handle)
  where status = 'pending';

create index shelter_applications_status_idx
  on public.shelter_applications (status, created_at asc)
  where status = 'pending';

alter table public.shelter_applications enable row level security;

create policy "shelter_applications_select_own_or_admin"
  on public.shelter_applications for select
  using (
    applicant_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "shelter_applications_insert_own"
  on public.shelter_applications for insert
  with check (
    applicant_id = auth.uid()
    and status = 'pending'
  );

create policy "shelter_applications_update_admin"
  on public.shelter_applications for update
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

grant select, insert, update on public.shelter_applications to authenticated;
grant all on public.shelter_applications to service_role;
