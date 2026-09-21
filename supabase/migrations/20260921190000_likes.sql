-- P4-01: likes + denormalized like_count maintenance

create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.animal_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index likes_post_idx on public.likes (post_id);
create index likes_user_idx on public.likes (user_id);

alter table public.likes enable row level security;

-- Anyone signed in can read their own likes (for heart state).
-- Aggregate counts live on animal_posts.like_count (public).
create policy "likes_select_own"
  on public.likes for select
  using (auth.uid() = user_id);

-- Only adopters (and admins) may like. Shelters are blocked by default (D-open / doc 02).
create policy "likes_insert_adopter"
  on public.likes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('adopter', 'admin')
        and p.deleted_at is null
    )
  );

create policy "likes_delete_own"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Keep animal_posts.like_count in sync
create or replace function public.likes_adjust_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.animal_posts
      set like_count = like_count + 1
      where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.animal_posts
      set like_count = greatest(like_count - 1, 0)
      where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger likes_after_insert
  after insert on public.likes
  for each row execute function public.likes_adjust_count();

create trigger likes_after_delete
  after delete on public.likes
  for each row execute function public.likes_adjust_count();
