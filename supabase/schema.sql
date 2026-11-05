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
-- Discovery layer (activities, hidden gems, quests, badges):
--   activity_saves        activities a user saved for later (always private)
--   activity_completions  activities a user has done, and at which spot
--   gem_finds             hidden gems a user has found
--   user_badges           badges a user has earned from quests
--
-- The activities, hidden gems, quests and badges themselves live in the
-- data/ folder of the site (activities.js, hidden-gems.js, quests.js), so
-- adding new ones needs no database change. Their ids are stored as text.
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

-- ---------- discovery layer ----------
create table if not exists public.activity_saves (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  activity_id  text not null check (activity_id ~ '^[a-z0-9-]{1,60}$'),
  saved_at     timestamptz not null default now(),
  primary key (user_id, activity_id)
);

-- place_id is the spot where it was done, or '' for activities without one.
create table if not exists public.activity_completions (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  activity_id   text not null check (activity_id ~ '^[a-z0-9-]{1,60}$'),
  place_id      text not null default '' check (place_id ~ '^[a-z0-9-]{0,60}$'),
  completed_at  timestamptz not null default now(),
  primary key (user_id, activity_id, place_id)
);

create table if not exists public.gem_finds (
  user_id   uuid not null references public.profiles (id) on delete cascade,
  gem_id    text not null check (gem_id ~ '^[a-z0-9-]{1,60}$'),
  found_at  timestamptz not null default now(),
  primary key (user_id, gem_id)
);

-- Badges are worked out in the app from the quests in data/quests.js and
-- recorded here the first time they're earned.
create table if not exists public.user_badges (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  badge_id   text not null check (badge_id ~ '^[a-z0-9-]{1,60}$'),
  earned_at  timestamptz not null default now(),
  primary key (user_id, badge_id)
);

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
alter table public.activity_saves       enable row level security;
alter table public.activity_completions enable row level security;
alter table public.gem_finds            enable row level security;
alter table public.user_badges          enable row level security;

grant select on public.profiles, public.spot_visits, public.spot_photos to anon;
grant select, insert, update, delete on public.profiles, public.spot_visits, public.wishlist, public.spot_photos to authenticated;
grant select on public.activity_completions, public.gem_finds, public.user_badges to anon;
grant select, insert, update, delete on public.activity_saves, public.activity_completions, public.gem_finds, public.user_badges to authenticated;

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

drop policy if exists "activity saves: own only" on public.activity_saves;
create policy "activity saves: own only" on public.activity_saves
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "completions: read own or public" on public.activity_completions;
create policy "completions: read own or public" on public.activity_completions
  for select using (user_id = (select auth.uid()) or public.is_public_profile(user_id));
drop policy if exists "completions: add own" on public.activity_completions;
create policy "completions: add own" on public.activity_completions
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "completions: remove own" on public.activity_completions;
create policy "completions: remove own" on public.activity_completions
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "gem finds: read own or public" on public.gem_finds;
create policy "gem finds: read own or public" on public.gem_finds
  for select using (user_id = (select auth.uid()) or public.is_public_profile(user_id));
drop policy if exists "gem finds: add own" on public.gem_finds;
create policy "gem finds: add own" on public.gem_finds
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "gem finds: remove own" on public.gem_finds;
create policy "gem finds: remove own" on public.gem_finds
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "badges: read own or public" on public.user_badges;
create policy "badges: read own or public" on public.user_badges
  for select using (user_id = (select auth.uid()) or public.is_public_profile(user_id));
drop policy if exists "badges: add own" on public.user_badges;
create policy "badges: add own" on public.user_badges
  for insert to authenticated with check (user_id = (select auth.uid()));

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


-- =====================================================================
-- SOCIAL DISCOVERY & PRIVACY
-- =====================================================================
-- Added with the Free Knowledge / social discovery update. Like the rest of
-- this file it's safe to run again.
--
-- What it adds:
--   profiles        + profile_visibility  public | followers | private
--                   + visits_visibility, wishlist_visibility,
--                     feed_visibility, photos_visibility
--                                         everyone | followers | only_me
--                   + interests           e.g. {nature,books}
--                   + avatar_path         profile photo in the avatars bucket
--   follows         who follows whom. Following a public profile is instant;
--                   a followers-only profile gets a request it can accept or
--                   decline; private profiles can't be followed. There are no
--                   follower counts anywhere: only the lists, and only for
--                   the person themselves.
--   place_ratings   one rating per person per place: overall plus optional
--                   learning value, scenic value, accessibility, family
--                   friendly and uniqueness (1–5). Ratings are private; only
--                   averages are shared, through rating_summary().
--   avatars         a private storage bucket for profile photos
--
-- It also REPLACES the "read" rules from above for visits, photos, the
-- wishlist, activities, hidden gems and badges, so they follow the new
-- privacy settings instead of the old public/private switch. `is_public` is
-- kept, and is now worked out from profile_visibility.
--
-- The activity feed needs no table of its own: it's built from visits,
-- photos, done activities and badges, and only for people whose feed (and
-- the thing in it) you're allowed to see.

-- ---------- profile settings ----------
alter table public.profiles add column if not exists profile_visibility  text not null default 'private';
alter table public.profiles add column if not exists visits_visibility   text not null default 'everyone';
alter table public.profiles add column if not exists wishlist_visibility text not null default 'only_me';
alter table public.profiles add column if not exists feed_visibility     text not null default 'followers';
alter table public.profiles add column if not exists photos_visibility   text not null default 'everyone';
alter table public.profiles add column if not exists interests           text[] not null default '{}';
alter table public.profiles add column if not exists avatar_path         text;

alter table public.profiles drop constraint if exists profiles_profile_visibility_check;
alter table public.profiles add constraint profiles_profile_visibility_check
  check (profile_visibility in ('public', 'followers', 'private'));
alter table public.profiles drop constraint if exists profiles_section_visibility_check;
alter table public.profiles add constraint profiles_section_visibility_check
  check (visits_visibility in ('everyone', 'followers', 'only_me')
     and wishlist_visibility in ('everyone', 'followers', 'only_me')
     and feed_visibility in ('everyone', 'followers', 'only_me')
     and photos_visibility in ('everyone', 'followers', 'only_me'));
alter table public.profiles drop constraint if exists profiles_interests_check;
alter table public.profiles add constraint profiles_interests_check
  check (cardinality(interests) <= 12
     and array_to_string(interests, ',') ~ '^([a-z-]{1,30}(,|$))*$');
alter table public.profiles drop constraint if exists profiles_avatar_path_check;
alter table public.profiles add constraint profiles_avatar_path_check
  check (avatar_path is null or split_part(avatar_path, '/', 1) = id::text);

-- People who had switched to a public profile stay public. (Running this
-- again changes nothing: is_public now always follows profile_visibility.)
update public.profiles set profile_visibility = 'public'
  where is_public and profile_visibility = 'private';

-- Keeps is_public in step with profile_visibility. An older copy of the app
-- that only sets is_public still works.
create or replace function public.sync_profile_visibility()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.is_public is distinct from old.is_public
     and new.profile_visibility = old.profile_visibility then
    new.profile_visibility := case when new.is_public then 'public' else 'private' end;
  end if;
  new.is_public := new.profile_visibility = 'public';
  return new;
end;
$$;

drop trigger if exists profiles_sync_visibility on public.profiles;
create trigger profiles_sync_visibility before insert or update on public.profiles
  for each row execute function public.sync_profile_visibility();

-- ---------- follows ----------
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  followee_id  uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index if not exists follows_followee_idx on public.follows (followee_id, status);

-- Decides the status of a new follow from the other person's settings, and
-- only lets a request go from pending to accepted.
create or replace function public.check_follow()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  vis text;
begin
  if tg_op = 'UPDATE' then
    new.follower_id := old.follower_id;
    new.followee_id := old.followee_id;
    new.created_at := old.created_at;
    if old.status = 'accepted' then new.status := 'accepted'; end if;
    return new;
  end if;
  select profile_visibility into vis from public.profiles where id = new.followee_id;
  if vis is null or vis = 'private' then
    raise exception 'This explorer has a private profile.';
  end if;
  new.status := case when vis = 'public' then 'accepted' else 'pending' end;
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists follows_check on public.follows;
create trigger follows_check before insert or update on public.follows
  for each row execute function public.check_follow();

-- ---------- ratings ----------
create table if not exists public.place_ratings (
  user_id          uuid not null references public.profiles (id) on delete cascade,
  spot_id          text not null check (spot_id ~ '^[a-z0-9-]{1,60}$'),
  overall          smallint not null check (overall between 1 and 5),
  learning_value   smallint check (learning_value between 1 and 5),
  scenic_value     smallint check (scenic_value between 1 and 5),
  accessibility    smallint check (accessibility between 1 and 5),
  family_friendly  smallint check (family_friendly between 1 and 5),
  uniqueness       smallint check (uniqueness between 1 and 5),
  rated_at         timestamptz not null default now(),
  primary key (user_id, spot_id)
);
create index if not exists place_ratings_spot_idx on public.place_ratings (spot_id);

-- ---------- privacy helpers ----------
-- Is the signed-in user an accepted follower of `owner`?
create or replace function public.is_follower(owner uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.follows
    where follower_id = auth.uid() and followee_id = owner and status = 'accepted'
  );
$$;

-- May the signed-in user (or a visitor) see this part of owner's profile?
-- `what` is 'profile', 'visits', 'wishlist', 'feed' or 'photos'.
-- A private profile shares nothing. A followers-only profile shares only
-- with accepted followers, whatever the section says.
create or replace function public.can_see(owner uuid, what text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(owner = auth.uid(), false) or exists (
    select 1
    from public.profiles p
    cross join lateral (select case what
      when 'profile'  then 'everyone'
      when 'visits'   then p.visits_visibility
      when 'wishlist' then p.wishlist_visibility
      when 'feed'     then p.feed_visibility
      when 'photos'   then p.photos_visibility
      else 'only_me' end as setting) s
    where p.id = owner
      and p.profile_visibility <> 'private'
      and s.setting <> 'only_me'
      and ((p.profile_visibility = 'public' and s.setting = 'everyone') or public.is_follower(owner))
  );
$$;

create or replace function public.can_see_folder(folder text, what text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id::text = folder and public.can_see(id, what));
$$;

-- Name, avatar and interests, for lists of people: people you follow, who
-- follow you or asked to, and explorers who aren't private. Nothing else.
create or replace function public.can_see_card(owner uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(owner = auth.uid(), false) or exists (
    select 1 from public.profiles p where p.id = owner and p.profile_visibility <> 'private'
  ) or exists (
    select 1 from public.follows f
    where (f.follower_id = auth.uid() and f.followee_id = owner)
       or (f.followee_id = auth.uid() and f.follower_id = owner)
  );
$$;

create or replace function public.profile_cards(ids uuid[])
returns table (id uuid, username text, display_name text, avatar_emoji text, accent_color text,
               avatar_path text, profile_visibility text, interests text[])
language sql stable security definer set search_path = '' as $$
  select p.id, p.username, p.display_name, p.avatar_emoji, p.accent_color, p.avatar_path, p.profile_visibility,
         case when public.can_see(p.id, 'profile') then p.interests else '{}'::text[] end
  from public.profiles p
  where p.id = any (ids) and public.can_see_card(p.id);
$$;

create or replace function public.profile_card(name text)
returns table (id uuid, username text, display_name text, avatar_emoji text, accent_color text,
               avatar_path text, profile_visibility text, interests text[])
language sql stable security definer set search_path = '' as $$
  select c.* from public.profile_cards(array(
    select p.id from public.profiles p where p.username = lower(name)
  )) c;
$$;

-- Which of these people's activity feeds may the signed-in user see?
create or replace function public.feed_visible(ids uuid[])
returns setof uuid language sql stable security definer set search_path = '' as $$
  select u from unnest(ids) as u where public.can_see(u, 'feed');
$$;

-- Average ratings for a place. Individual ratings stay private.
create or replace function public.rating_summary(spot text)
returns table (ratings bigint, overall numeric, learning_value numeric, learning_count bigint,
               scenic_value numeric, scenic_count bigint, accessibility numeric, accessibility_count bigint,
               family_friendly numeric, family_count bigint, uniqueness numeric, uniqueness_count bigint)
language sql stable security definer set search_path = '' as $$
  select count(*), round(avg(overall), 1),
         round(avg(learning_value), 1), count(learning_value),
         round(avg(scenic_value), 1), count(scenic_value),
         round(avg(accessibility), 1), count(accessibility),
         round(avg(family_friendly), 1), count(family_friendly),
         round(avg(uniqueness), 1), count(uniqueness)
  from public.place_ratings where spot_id = spot;
$$;

grant execute on function public.is_follower(uuid) to anon, authenticated;
grant execute on function public.can_see(uuid, text) to anon, authenticated;
grant execute on function public.can_see_folder(text, text) to anon, authenticated;
grant execute on function public.can_see_card(uuid) to anon, authenticated;
grant execute on function public.profile_cards(uuid[]) to anon, authenticated;
grant execute on function public.profile_card(text) to anon, authenticated;
grant execute on function public.feed_visible(uuid[]) to anon, authenticated;
grant execute on function public.rating_summary(text) to anon, authenticated;

-- ---------- row level security ----------
alter table public.follows       enable row level security;
alter table public.place_ratings enable row level security;

grant select, insert, update, delete on public.follows, public.place_ratings to authenticated;
grant select on public.wishlist to anon;

drop policy if exists "follows: see your own" on public.follows;
create policy "follows: see your own" on public.follows
  for select to authenticated using (follower_id = (select auth.uid()) or followee_id = (select auth.uid()));
drop policy if exists "follows: follow as yourself" on public.follows;
create policy "follows: follow as yourself" on public.follows
  for insert to authenticated with check (follower_id = (select auth.uid()));
drop policy if exists "follows: accept requests to you" on public.follows;
create policy "follows: accept requests to you" on public.follows
  for update to authenticated using (followee_id = (select auth.uid())) with check (followee_id = (select auth.uid()));
-- unfollow, decline a request, or remove a follower
drop policy if exists "follows: unfollow or remove" on public.follows;
create policy "follows: unfollow or remove" on public.follows
  for delete to authenticated using (follower_id = (select auth.uid()) or followee_id = (select auth.uid()));

drop policy if exists "ratings: own only" on public.place_ratings;
create policy "ratings: own only" on public.place_ratings
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- The read rules below replace the ones further up.
drop policy if exists "profiles: read own or public" on public.profiles;
drop policy if exists "profiles: read if allowed" on public.profiles;
create policy "profiles: read if allowed" on public.profiles
  for select using (id = (select auth.uid()) or public.can_see(id, 'profile'));

drop policy if exists "visits: read own or public" on public.spot_visits;
drop policy if exists "visits: read if allowed" on public.spot_visits;
create policy "visits: read if allowed" on public.spot_visits
  for select using (public.can_see(user_id, 'visits'));

drop policy if exists "photos: read own or public" on public.spot_photos;
drop policy if exists "photos: read if allowed" on public.spot_photos;
create policy "photos: read if allowed" on public.spot_photos
  for select using (public.can_see(user_id, 'photos'));

drop policy if exists "wishlist: own only" on public.wishlist;
drop policy if exists "wishlist: read if allowed" on public.wishlist;
create policy "wishlist: read if allowed" on public.wishlist
  for select using (public.can_see(user_id, 'wishlist'));
drop policy if exists "wishlist: add own" on public.wishlist;
create policy "wishlist: add own" on public.wishlist
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "wishlist: edit own" on public.wishlist;
create policy "wishlist: edit own" on public.wishlist
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "wishlist: remove own" on public.wishlist;
create policy "wishlist: remove own" on public.wishlist
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "completions: read own or public" on public.activity_completions;
drop policy if exists "completions: read if allowed" on public.activity_completions;
create policy "completions: read if allowed" on public.activity_completions
  for select using (public.can_see(user_id, 'profile'));

drop policy if exists "gem finds: read own or public" on public.gem_finds;
drop policy if exists "gem finds: read if allowed" on public.gem_finds;
create policy "gem finds: read if allowed" on public.gem_finds
  for select using (public.can_see(user_id, 'profile'));

drop policy if exists "badges: read own or public" on public.user_badges;
drop policy if exists "badges: read if allowed" on public.user_badges;
create policy "badges: read if allowed" on public.user_badges
  for select using (public.can_see(user_id, 'profile'));

drop policy if exists "spot-photos: read own or public" on storage.objects;
drop policy if exists "spot-photos: read if allowed" on storage.objects;
create policy "spot-photos: read if allowed" on storage.objects
  for select using (
    bucket_id = 'spot-photos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text
         or public.can_see_folder((storage.foldername(name))[1], 'photos'))
  );

-- ---------- profile photos ----------
-- Private bucket, 1 MB, JPEG only (the app shrinks the photo and strips its
-- location data first). Visible wherever the person's name card is.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];

create or replace function public.can_see_avatar(folder text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id::text = folder and public.can_see_card(id));
$$;
grant execute on function public.can_see_avatar(text) to anon, authenticated;

drop policy if exists "avatars: read if allowed" on storage.objects;
create policy "avatars: read if allowed" on storage.objects
  for select using (bucket_id = 'avatars' and public.can_see_avatar((storage.foldername(name))[1]));
drop policy if exists "avatars: upload own" on storage.objects;
create policy "avatars: upload own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "avatars: remove own" on storage.objects;
create policy "avatars: remove own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- =====================================================================
-- COLLECTIONS
-- =====================================================================
-- Added with the place metadata / collections / Plan My Day update. Safe to
-- run again, like the rest of this file. Needs the social part above
-- (is_follower) to exist, so run the whole file.
--
--   collections        lists of places, like playlists. One row per list.
--                      visibility: public | followers | private
--                        public     anyone, also people who aren't signed in
--                        followers  the owner's accepted followers
--                        private    only the owner
--   collection_saves   other people's collections (or Go Places ones, whose
--                      ids start with "pick-" or "theme-") that someone saved
--
-- Place metadata and Plan My Day need no tables: they come from data/.

create table if not exists public.collections (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  city         text not null default 'munich' check (city ~ '^[a-z0-9-]{1,30}$'),
  title        text not null check (char_length(btrim(title)) between 1 and 80),
  description  text not null default '' check (char_length(description) <= 500),
  cover_image  text not null default '' check (cover_image = '' or cover_image ~ '^images/([a-z0-9-]{1,30}/)?[A-Za-z0-9._-]{1,80}$'),
  place_ids    text[] not null default '{}'
               check (cardinality(place_ids) <= 100
                  and array_to_string(place_ids, ',') ~ '^([a-z0-9-]{1,60}(,|$))*$'),
  visibility   text not null default 'private' check (visibility in ('public', 'followers', 'private')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists collections_owner_idx on public.collections (owner_id, city);
create index if not exists collections_public_idx on public.collections (city, visibility, updated_at desc);
create index if not exists collections_places_idx on public.collections using gin (place_ids);

drop trigger if exists collections_touch on public.collections;
create trigger collections_touch before update on public.collections
  for each row execute function public.touch_updated_at();

create table if not exists public.collection_saves (
  user_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  collection_id  text not null check (collection_id ~ '^[a-z0-9-]{1,60}$'),
  saved_at       timestamptz not null default now(),
  primary key (user_id, collection_id)
);

-- May the signed-in user (or a visitor) see this collection?
create or replace function public.can_see_collection(owner uuid, visibility text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(owner = auth.uid(), false)
      or visibility = 'public'
      or (visibility = 'followers' and public.is_follower(owner));
$$;
grant execute on function public.can_see_collection(uuid, text) to anon, authenticated;

alter table public.collections      enable row level security;
alter table public.collection_saves enable row level security;

grant select on public.collections to anon;
grant select, insert, update, delete on public.collections, public.collection_saves to authenticated;

drop policy if exists "collections: read if allowed" on public.collections;
create policy "collections: read if allowed" on public.collections
  for select using (public.can_see_collection(owner_id, visibility));
drop policy if exists "collections: add own" on public.collections;
create policy "collections: add own" on public.collections
  for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "collections: edit own" on public.collections;
create policy "collections: edit own" on public.collections
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "collections: remove own" on public.collections;
create policy "collections: remove own" on public.collections
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "collection saves: own only" on public.collection_saves;
create policy "collection saves: own only" on public.collection_saves
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));


-- =====================================================================
-- SUBMISSIONS (suggest a place, suggest a photo)
-- =====================================================================
-- Added with the submissions / review queue update. Safe to run again, like
-- the rest of this file.
--
-- Signed-in explorers can suggest a new place (with an optional photo) or a
-- photo for a place that's already on the map. Nothing they send is public
-- until a reviewer approves it.
--
--   reviewers     who may approve or reject. Nobody can add themselves from
--                 the app; reviewers are added in the SQL Editor (see
--                 "reviewer" at the end of this section).
--   submissions   one row per suggestion. status: pending | approved | rejected
--                 Approved places show on the map for everyone, approved
--                 photos on their place's page. Who sent them is never shown:
--                 only the sender and reviewers can read the rows, and
--                 everyone else gets the approved content, without names,
--                 through approved_submissions(). A reviewer can also
--                 approve or reject straight
--                 in Supabase → Table Editor → submissions by changing the
--                 status column; it has the same effect as the app's buttons.
--   submissions   a private storage bucket for the photos. The app stamps
--                 "© Go Places" on them and removes their location data
--                 before upload.

-- ---------- reviewers ----------
create table if not exists public.reviewers (
  user_id   uuid primary key references public.profiles (id) on delete cascade,
  added_at  timestamptz not null default now()
);

create or replace function public.is_reviewer()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.reviewers where user_id = (select auth.uid()));
$$;
grant execute on function public.is_reviewer() to anon, authenticated;

-- ---------- submissions ----------
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  kind         text not null check (kind in ('place', 'photo')),
  city         text not null check (city ~ '^[a-z0-9-]{1,40}$'),
  -- a photo: the place it's for. A new place: its id on the map, set by the
  -- database ("c-" plus 10 letters and numbers).
  spot_id      text check (spot_id ~ '^[a-z0-9-]{1,60}$'),
  -- new places only
  name         text check (char_length(name) between 2 and 80),
  emoji        text check (char_length(emoji) between 1 and 8),
  lat          double precision check (lat between -90 and 90),
  lng          double precision check (lng between -180 and 180),
  themes       text[] not null default '{}' check (cardinality(themes) <= 8),
  cost         text check (char_length(cost) <= 80),
  best_time    text check (char_length(best_time) <= 120),
  summary      text check (char_length(summary) <= 600),
  tip          text check (char_length(tip) <= 300),
  -- the photo (optional for a place)
  photo_path   text unique,
  caption      text check (char_length(caption) <= 140),
  width        int,
  height       int,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note  text check (char_length(review_note) <= 300),
  reviewed_by  uuid references public.profiles (id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  check (kind <> 'place' or (name is not null and lat is not null and lng is not null and summary is not null)),
  check (kind <> 'photo' or (spot_id is not null and photo_path is not null)),
  -- the file must sit in the sender's own folder: <user id>/<file>
  check (photo_path is null or split_part(photo_path, '/', 1) = user_id::text)
);
create index if not exists submissions_status_idx on public.submissions (status, created_at desc);
create index if not exists submissions_city_idx on public.submissions (city, status);
create index if not exists submissions_user_idx on public.submissions (user_id, created_at desc);

-- New suggestions always start as pending, and a new place gets its id.
-- At most 20 pending
-- suggestions per person, to keep the queue manageable.
create or replace function public.prepare_submission()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.status := 'pending';
  new.review_note := null;
  new.reviewed_by := null;
  new.reviewed_at := null;
  new.created_at := now();
  if new.kind = 'place' then
    new.spot_id := 'c-' || left(replace(new.id::text, '-', ''), 10);
  end if;
  if (select count(*) from public.submissions where user_id = new.user_id and status = 'pending') >= 20 then
    raise exception 'You have 20 suggestions waiting for review. Please wait until some are reviewed.';
  end if;
  return new;
end;
$$;

drop trigger if exists submissions_prepare on public.submissions;
create trigger submissions_prepare before insert on public.submissions
  for each row execute function public.prepare_submission();

-- Reviewers may change the text and the status, never who sent it, what
-- kind it is, or its id. A change of status records who decided and when
-- (reviewed_by stays empty when it's done in the Table Editor).
create or replace function public.review_submission()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.id := old.id;
  new.user_id := old.user_id;
  new.kind := old.kind;
  new.spot_id := old.spot_id;
  new.photo_path := old.photo_path;
  new.created_at := old.created_at;
  if new.status is distinct from old.status then
    new.reviewed_by := (select auth.uid());
    new.reviewed_at := now();
  else
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists submissions_review on public.submissions;
create trigger submissions_review before update on public.submissions
  for each row execute function public.review_submission();

-- ---------- row level security ----------
alter table public.reviewers   enable row level security;
alter table public.submissions enable row level security;

grant select on public.reviewers to authenticated;
grant select, insert, update, delete on public.submissions to authenticated;

drop policy if exists "reviewers: see yourself" on public.reviewers;
create policy "reviewers: see yourself" on public.reviewers
  for select to authenticated using (user_id = (select auth.uid()));

-- only the sender and the reviewers see a row; everyone sees approved
-- content through approved_submissions() below
drop policy if exists "submissions: read own or as reviewer" on public.submissions;
create policy "submissions: read own or as reviewer" on public.submissions
  for select to authenticated using (user_id = (select auth.uid()) or public.is_reviewer());
drop policy if exists "submissions: send as yourself" on public.submissions;
create policy "submissions: send as yourself" on public.submissions
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "submissions: reviewers decide" on public.submissions;
create policy "submissions: reviewers decide" on public.submissions
  for update to authenticated using (public.is_reviewer()) with check (public.is_reviewer());
-- senders can take back a suggestion that isn't approved; reviewers can
-- remove any
drop policy if exists "submissions: withdraw unapproved or as reviewer" on public.submissions;
create policy "submissions: withdraw unapproved or as reviewer" on public.submissions
  for delete to authenticated using (
    (user_id = (select auth.uid()) and status <> 'approved') or public.is_reviewer()
  );

-- Approved places and photos for one city, for everyone (also visitors who
-- aren't signed in). Leaves out who sent them.
create or replace function public.approved_submissions(for_city text)
returns table (
  id uuid, kind text, spot_id text, name text, emoji text, lat double precision, lng double precision,
  themes text[], cost text, best_time text, summary text, tip text,
  photo_path text, caption text, width int, height int, approved_at timestamptz
) language sql stable security definer set search_path = '' as $$
  select s.id, s.kind, s.spot_id, s.name, s.emoji, s.lat, s.lng, s.themes, s.cost, s.best_time, s.summary, s.tip,
         s.photo_path, s.caption, s.width, s.height, coalesce(s.reviewed_at, s.created_at)
  from public.submissions s
  where s.status = 'approved' and s.city = for_city
  order by coalesce(s.reviewed_at, s.created_at);
$$;
grant execute on function public.approved_submissions(text) to anon, authenticated;

-- ---------- submission photos ----------
-- Private bucket, 5 MB, JPEG only. A file can be seen by its sender, by
-- reviewers, and by everyone once its suggestion is approved.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 5242880, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

create or replace function public.is_approved_photo(file text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.submissions where photo_path = file and status = 'approved');
$$;
grant execute on function public.is_approved_photo(text) to anon, authenticated;

drop policy if exists "submissions: read if allowed" on storage.objects;
create policy "submissions: read if allowed" on storage.objects
  for select using (
    bucket_id = 'submissions'
    and ((storage.foldername(name))[1] = (select auth.uid())::text
         or public.is_reviewer()
         or public.is_approved_photo(name))
  );
drop policy if exists "submissions: upload own" on storage.objects;
create policy "submissions: upload own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'submissions' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "submissions: remove own or as reviewer" on storage.objects;
create policy "submissions: remove own or as reviewer" on storage.objects
  for delete to authenticated using (
    bucket_id = 'submissions'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_reviewer())
  );

-- ---------- reviewer ----------
-- @aamiradmin is the reviewer. If that account doesn't exist yet when this
-- runs, sign up with that username first and run the file again.
--
-- To add another reviewer, run this on its own in the SQL Editor with their
-- username:
--   insert into public.reviewers (user_id)
--   select id from public.profiles where username = 'their_username'
--   on conflict do nothing;
-- To remove one:
--   delete from public.reviewers
--   where user_id = (select id from public.profiles where username = 'their_username');
insert into public.reviewers (user_id)
select id from public.profiles where username = 'aamiradmin'
on conflict do nothing;
