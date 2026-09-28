-- One conversation per unordered pair of profiles.
-- Merge A→B and B→A duplicates, then enforce unique (least, greatest).

-- 1) Merge reverse-orientation duplicates (keep lower id)
do $$
declare
  r record;
begin
  for r in
    select c1.id as keep_id, c2.id as drop_id
    from public.conversations c1
    join public.conversations c2
      on c1.adopter_id = c2.shelter_profile_id
     and c1.shelter_profile_id = c2.adopter_id
     and c1.id < c2.id
  loop
    -- Move messages onto the kept conversation
    update public.messages
      set conversation_id = r.keep_id
      where conversation_id = r.drop_id;

    -- Move hides (ignore conflicts on same user)
    insert into public.conversation_hides (user_id, conversation_id, hidden_at)
    select user_id, r.keep_id, hidden_at
    from public.conversation_hides
    where conversation_id = r.drop_id
    on conflict do nothing;

    delete from public.conversation_hides where conversation_id = r.drop_id;
    delete from public.conversations where id = r.drop_id;
  end loop;
end $$;

-- 2) Prevent future dual threads for the same two people
drop index if exists conversations_pair_unique_idx;
create unique index conversations_pair_unique_idx
  on public.conversations (
    least(adopter_id, shelter_profile_id),
    greatest(adopter_id, shelter_profile_id)
  );

-- 3) Ensure profile_blocks grants (idempotent)
grant select, insert, update, delete on table public.profile_blocks to authenticated;
grant all on table public.profile_blocks to service_role;
