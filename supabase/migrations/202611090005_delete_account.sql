-- Run in Supabase SQL Editor as the database owner before enabling account deletion.
-- Existing foreign keys delete the owner's anime and library settings when auth.users is deleted.

-- Allow the signed-in owner to enumerate their uploaded avatars for Storage API cleanup.
drop policy if exists "avatar owner select" on storage.objects;
create policy "avatar owner select" on storage.objects
for select to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Never accept a user ID from the caller; resolve it from their verified JWT only.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  delete from auth.users
  where id = current_user_id;

  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;
