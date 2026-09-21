-- P4-02: comments + denormalized comment_count maintenance

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.animal_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  parent_id uuid references public.comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  hidden_at timestamptz
);

create index comments_post_idx on public.comments (post_id, created_at asc)
  where hidden_at is null;
create index comments_user_idx on public.comments (user_id);

alter table public.comments enable row level security;

-- Public can read non-hidden comments
create policy "comments_select_public"
  on public.comments for select
  using (hidden_at is null);

-- Any signed-in user may comment
create policy "comments_insert_signed_in"
  on public.comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.deleted_at is null
    )
  );

-- Authors can delete their own; soft-hide can be admin later via service role
create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = user_id);

create or replace function public.comments_adjust_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.animal_posts
      set comment_count = comment_count + 1
      where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.animal_posts
      set comment_count = greatest(comment_count - 1, 0)
      where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger comments_after_insert
  after insert on public.comments
  for each row execute function public.comments_adjust_count();

create trigger comments_after_delete
  after delete on public.comments
  for each row execute function public.comments_adjust_count();
