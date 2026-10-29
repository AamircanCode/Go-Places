-- GO PLACES — database setup for accounts
-- =========================================
-- Paste this whole file into Supabase → SQL Editor → New query, and click Run.
-- It is safe to run again later: it only creates what is missing and
-- replaces the policies and functions with the versions below.
--
-- What it creates:
--   profiles      one row per user: username, name, bio, avatar, colour, privacy
--   spot_visits   which spots a user has explored, and when
--   wishlist      spots a user wants to visit (always private)
--   spot_photos   photos users took of spots (files live in the storage bucket)
--   spot-photos   a private storage bucket for those photos
--
-- Spot ids are the `id` values from data/spots.js. They are stored as text so
-- new spots need no database change.
--
-- Privacy: every table has row level security. A user can only change their
-- own rows. Other people can only see someone's visits and photos if that
-- person has switched their profile to public. Wishlists are never shared.
--
-- Built with future challenges in mind: visits and photos carry timestamps,
-- so a challenge like "visit 3 sunset spots in November" or "post a photo
-- from every church" can be checked with a simple query later.

-- ---------- profiles ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name  text check (char_length(display_name) <= 40),
  bio           text check (char_length(bio) <= 160),
  avatar_emoji  text not null default '🧭' check (char_length(avatar_emoji) between 1 and 8),
  accent_color  text not null default '#0f766e' check (accent_color ~ '^#[0-9a-f]{6}$'),
  home_city     text not null default 'Munich' check (char_length(home_city) <= 40),
  is_public     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- explored spots ----------
create table if not exists public.spot_visits (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  spot_id     text not null check (spot_id ~ '^[a-z0-9-]{1,60}$'),
  visited_at  timestamptz not null default now(),
  primary key (user_id, spot_id)
);

-- ---------- wishlist ----------
create table if not exists public.wishlist (
  user_id   uuid not null references public.profiles (id) on delete cascade,
  spot_id   text not null check (spot_id ~ '^[a-z0-9-]{1,60}$'),
  added_at  timestamptz not null default now(),
  primary key (user_id, spot_id)
);

-- ---------- photos ----------
create table if not exists public.spot_photos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  spot_id     text not null check (spot_id ~ '^[a-z0-9-]{1,60}$'),
  path        text not null unique,
  caption     text check (char_length(caption) <= 140),
  width       int,
  height      int,
  created_at  timestamptz not null default now(),
  -- the file must sit in the uploader's own folder: <user id>/<spot id>/<file>
  check (split_part(path, '/', 1) = user_id::text and split_part(path, '/', 2) = spot_id)
);
create index if not exists spot_photos_user_idx on public.spot_photos (user_id, created_at desc);
create index if not exists spot_photos_spot_idx on public.spot_photos (spot_id, created_at desc);

-- ---------- helpers ----------
-- Is this user's profile public? Used by the policies below.
create or replace function public.is_public_profile(uid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = uid and is_public);
$$;

-- Lets the sign-up form check a username without exposing private profiles.
create or replace function public.username_available(name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select name ~ '^[a-z0-9_]{3,20}$'
     and not exists (select 1 from public.profiles where username = name);
$$;

-- Creates the profile as soon as someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  wanted text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
begin
  if wanted !~ '^[a-z0-9_]{3,20}$' then
    wanted := 'explorer_' || substr(replace(new.id::text, '-', ''), 1, 8);
  elsif exists (select 1 from public.profiles where username = wanted) then
    wanted := left(wanted, 15) || '_' || substr(replace(new.id::text, '-', ''), 1, 4);
  end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, wanted, nullif(left(new.raw_user_meta_data ->> 'display_name', 40), ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Deletes the signed-in user and, through the cascades, all their rows.
-- The app removes their photo files from storage first.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.is_public_profile(uuid) to anon, authenticated;

-- ---------- row level security ----------
alter table public.profiles    enable row level security;
alter table public.spot_visits enable row level security;
alter table public.wishlist    enable row level security;
alter table public.spot_photos enable row level security;

grant select on public.profiles, public.spot_visits, public.spot_photos to anon;
grant select, insert, update, delete on public.profiles, public.spot_visits, public.wishlist, public.spot_photos to authenticated;

drop policy if exists "profiles: read own or public" on public.profiles;
create policy "profiles: read own or public" on public.profiles
  for select using (is_public or id = (select auth.uid()));
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "visits: read own or public" on public.spot_visits;
create policy "visits: read own or public" on public.spot_visits
  for select using (user_id = (select auth.uid()) or public.is_public_profile(user_id));
drop policy if exists "visits: add own" on public.spot_visits;
create policy "visits: add own" on public.spot_visits
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "visits: remove own" on public.spot_visits;
create policy "visits: remove own" on public.spot_visits
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "wishlist: own only" on public.wishlist;
create policy "wishlist: own only" on public.wishlist
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "photos: read own or public" on public.spot_photos;
create policy "photos: read own or public" on public.spot_photos
  for select using (user_id = (select auth.uid()) or public.is_public_profile(user_id));
drop policy if exists "photos: add own" on public.spot_photos;
create policy "photos: add own" on public.spot_photos
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "photos: edit own" on public.spot_photos;
create policy "photos: edit own" on public.spot_photos
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "photos: remove own" on public.spot_photos;
create policy "photos: remove own" on public.spot_photos
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------- photo storage ----------
-- Private bucket: files are only reachable through short-lived signed links,
-- and only by the owner or, for public profiles, by anyone.
-- 5 MB per file, JPEG only (the app re-encodes every photo to JPEG, which
-- also drops the GPS location and other camera data).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('spot-photos', 'spot-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

create or replace function public.is_public_folder(folder text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id::text = folder and is_public);
$$;
grant execute on function public.is_public_folder(text) to anon, authenticated;

drop policy if exists "spot-photos: read own or public" on storage.objects;
create policy "spot-photos: read own or public" on storage.objects
  for select using (
    bucket_id = 'spot-photos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text
         or public.is_public_folder((storage.foldername(name))[1]))
  );
drop policy if exists "spot-photos: upload own" on storage.objects;
create policy "spot-photos: upload own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'spot-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "spot-photos: remove own" on storage.objects;
create policy "spot-photos: remove own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'spot-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
