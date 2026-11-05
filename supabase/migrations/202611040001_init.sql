create extension if not exists pgcrypto;
create table if not exists public.anime(
id uuid primary key default gen_random_uuid(),
owner_id uuid not null references auth.users(id) on delete cascade,
mal_id integer,title text not null check(char_length(title) between 1 and 200),
title_th text,poster_url text,aired_date date,
episodes integer check(episodes>=0),genres text[] not null default '{}',
finished_date date not null,rating smallint not null check(rating between 1 and 10),
review text check(char_length(review)<=500),is_featured boolean not null default false,
created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create unique index if not exists anime_owner_mal_idx on public.anime(owner_id,mal_id) where mal_id is not null;
create index if not exists anime_finished_idx on public.anime(owner_id,finished_date desc);
create index if not exists anime_genres_idx on public.anime using gin(genres);
create table if not exists public.library_settings(
owner_id uuid primary key references auth.users(id) on delete cascade,
is_public boolean not null default false,
share_slug text unique not null,
display_name text
);
alter table public.anime enable row level security;
alter table public.library_settings enable row level security;
create policy "owner anime select" on public.anime for select to authenticated using(owner_id=(select auth.uid()));
create policy "owner anime insert" on public.anime for insert to authenticated with check(owner_id=(select auth.uid()));
create policy "owner anime update" on public.anime for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "owner anime delete" on public.anime for delete to authenticated using(owner_id=(select auth.uid()));
create policy "owner settings select" on public.library_settings for select to authenticated using(owner_id=(select auth.uid()));
create policy "owner settings insert" on public.library_settings for insert to authenticated with check(owner_id=(select auth.uid()));
create policy "owner settings update" on public.library_settings for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
-- SECURITY DEFINER accesses only the exact public library matching the supplied slug; no user enumeration.
create or replace function public.get_shared_library(p_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
select jsonb_build_object('display_name',s.display_name,'anime',
coalesce((select jsonb_agg((to_jsonb(a) - 'owner_id') order by a.finished_date desc) from public.anime a where a.owner_id=s.owner_id),'[]'::jsonb))
from public.library_settings s where s.share_slug=p_slug and s.is_public=true
$$;
revoke all on function public.get_shared_library(text) from public;
grant execute on function public.get_shared_library(text) to anon, authenticated;
