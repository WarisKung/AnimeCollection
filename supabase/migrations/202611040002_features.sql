-- Apply in Supabase SQL Editor before using new anime metadata and avatar uploads.
alter table public.anime add column if not exists duration_minutes integer check (duration_minutes between 1 and 600);
alter table public.anime add column if not exists anime_format text check (char_length(anime_format) <= 32);
alter table public.anime add column if not exists watch_url text check (char_length(watch_url) <= 2048);

-- Remove historical Thai-title values without deleting anime rows.
update public.anime set title_th = null where title_th is not null;

-- Public avatars: anyone may fetch images, but only the account owner can write in their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar owner insert" on storage.objects;
drop policy if exists "avatar owner update" on storage.objects;
drop policy if exists "avatar owner delete" on storage.objects;

create policy "avatar owner insert" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "avatar owner update" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text))
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "avatar owner delete" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));
