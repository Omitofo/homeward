-- P5-06: Content reports + admin moderation helpers

create type public.report_target_type as enum ('post', 'comment');
create type public.report_status as enum (
  'open',
  'dismissed',
  'actioned'
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 500),
  status public.report_status not null default 'open',
  resolver_id uuid references public.profiles (id),
  resolution_note text not null default '' check (char_length(resolution_note) <= 1000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index reports_open_idx on public.reports (status, created_at asc)
  where status = 'open';
create index reports_target_idx on public.reports (target_type, target_id);
create index reports_reporter_idx on public.reports (reporter_id);

-- One open report per reporter per target
create unique index reports_unique_open
  on public.reports (reporter_id, target_type, target_id)
  where status = 'open';

alter table public.reports enable row level security;

create policy "reports_select_own_or_admin"
  on public.reports for select
  using (
    reporter_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "reports_insert_signed_in"
  on public.reports for insert
  with check (
    auth.uid() = reporter_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.deleted_at is null
    )
  );

create policy "reports_update_admin"
  on public.reports for update
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

-- Admins may soft-hide comments
create policy "comments_update_admin"
  on public.comments for update
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
