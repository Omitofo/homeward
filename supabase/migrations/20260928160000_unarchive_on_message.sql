-- WhatsApp-style: any new message restores the thread to everyone's inbox.
-- SECURITY DEFINER so RLS cannot leave the recipient stuck in Archived.

create or replace function public.unarchive_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.conversation_hides
  where conversation_id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_after_insert_unarchive on public.messages;
create trigger messages_after_insert_unarchive
  after insert on public.messages
  for each row
  execute function public.unarchive_conversation_on_message();
