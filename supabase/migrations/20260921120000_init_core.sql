-- Homeward core schema (P3-01)
-- Profiles, shelters, animal posts, media. RLS enabled on every table.
-- Auth users live in auth.users (Supabase). profiles.id = auth.uid().

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('adopter', 'shelter', 'admin');
create type public.verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type public.species as enum ('dog', 'cat', 'rabbit', 'bird', 'other');
create type public.sex as enum ('male', 'female', 'unknown');
create type public.age_group as enum ('baby', 'young', 'adult', 'senior');
create type public.size as enum ('small', 'medium', 'large', 'xl');
create type public.post_status as enum ('available', 'reserved', 'adopted', 'archived');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'adopter',
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_url text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.profiles enable row level security;

-- Public can read non-deleted profiles (shelter names etc.); users update own row.
-- role is never client-writable: enforce via trigger / service role only.
create policy "profiles_select_public"
  on public.profiles for select
  using (deleted_at is null);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- shelters
-- ---------------------------------------------------------------------------
create table public.shelters (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  handle text not null unique
    check (handle ~ '^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$'),
  org_name text not null check (char_length(org_name) between 1 and 120),
  bio text not null default '' check (char_length(bio) <= 2000),
  links jsonb not null default '[]'::jsonb,
  country_code char(2) not null,
  region text not null default '',
  city text not null default '',
  verification_status public.verification_status not null default 'unverified',
  verified_at timestamptz,
  verified_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index shelters_verification_idx on public.shelters (verification_status);
create index shelters_country_idx on public.shelters (country_code);

alter table public.shelters enable row level security;

create policy "shelters_select_public"
  on public.shelters for select
  using (true);

create policy "shelters_insert_own"
  on public.shelters for insert
  with check (auth.uid() = profile_id);

create policy "shelters_update_own"
  on public.shelters for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- animal_posts
-- ---------------------------------------------------------------------------
create table public.animal_posts (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  species public.species not null,
  breed text not null default '',
  sex public.sex not null default 'unknown',
  age_months int not null check (age_months >= 0 and age_months <= 360),
  age_group public.age_group not null,
  size public.size not null,
  description text not null default '' check (char_length(description) <= 5000),
  country_code char(2) not null,
  region text not null default '',
  city text not null default '',
  status public.post_status not null default 'available',
  traits text[] not null default '{}',
  like_count int not null default 0 check (like_count >= 0),
  comment_count int not null default 0 check (comment_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index animal_posts_feed_idx
  on public.animal_posts (status, country_code, species, created_at desc);
create index animal_posts_shelter_idx on public.animal_posts (shelter_id);
create index animal_posts_created_id_idx on public.animal_posts (created_at desc, id desc);

alter table public.animal_posts enable row level security;

-- Public reads non-archived; owners see all their posts
create policy "animal_posts_select_public"
  on public.animal_posts for select
  using (
    status <> 'archived'
    or shelter_id in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );

create policy "animal_posts_insert_owner"
  on public.animal_posts for insert
  with check (
    shelter_id in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );

create policy "animal_posts_update_owner"
  on public.animal_posts for update
  using (
    shelter_id in (
      select id from public.shelters where profile_id = auth.uid()
    )
  )
  with check (
    shelter_id in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );

create policy "animal_posts_delete_owner"
  on public.animal_posts for delete
  using (
    shelter_id in (
      select id from public.shelters where profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- post_media
-- ---------------------------------------------------------------------------
create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.animal_posts (id) on delete cascade,
  storage_path text not null,
  position int not null default 0 check (position >= 0 and position < 10),
  alt_text text not null default '',
  width int not null default 0,
  height int not null default 0,
  unique (post_id, position)
);

create index post_media_post_idx on public.post_media (post_id, position);

alter table public.post_media enable row level security;

create policy "post_media_select_public"
  on public.post_media for select
  using (
    post_id in (
      select id from public.animal_posts
      where status <> 'archived'
         or shelter_id in (
           select id from public.shelters where profile_id = auth.uid()
         )
    )
  );

create policy "post_media_write_owner"
  on public.post_media for all
  using (
    post_id in (
      select ap.id from public.animal_posts ap
      join public.shelters s on s.id = ap.shelter_id
      where s.profile_id = auth.uid()
    )
  )
  with check (
    post_id in (
      select ap.id from public.animal_posts ap
      join public.shelters s on s.id = ap.shelter_id
      where s.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger animal_posts_set_updated_at
  before update on public.animal_posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New auth user → profile row (adopter by default)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'adopter',
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
