/*
 **Version:** 3.10
 **Status:** Current
 **Date:** November 13, 2026
 
 ## Usage
 This script provides a complete setup for the "Sacred Fire Songs" database. 
 It consolidates the initial schema and all subsequent migrations up to November 12, 2026.
 (v3.10: catalog songs and versions corrected in the app, Story 6.2.21 (#524), migration 20261112160000_protect_catalog_app_edits.sql: compositions and song_versions gain edited_in_app / edited_at / edited_fields, set by trigger trg_track_catalog_edit when a signed-in app user (JWT role authenticated, also through a SECURITY DEFINER function) changes a tracked column of a row with a catalog key; importers (service_role) and data migrations do not mark, and API callers cannot set or clear the markers; admin-only fn_catalog_edits_export() and fn_clear_catalog_edit(). Review of PR #540 (Nov 13, 2026): removing a catalog key in the app counts; the export gives a moved version's new song slug; fn_clear_catalog_edit(kind, id, edited_at) returns 'cleared' / 'changed' / 'not_marked' and leaves a correction made after the download marked; the service role may not execute either function and reads and clears markers with plain SQL).
 (v3.9: migration 20261112140000_translation_versions_to_translations.sql moves the interim song_versions rows with version_kind = 'translation' to song_translations, Story 6.2.13 (#516). It changes data only: the schema is unchanged and a fresh install has no such rows, so this script needs nothing from it. Review of PR #535: the migration also keeps versions with chords in another key/capo/tuning or blank lyrics, appends moved takes after the original's and reports dropped sources; the re-check also keeps versions with their own melody, note, beats, media link or votes, or lyrics-only in another key that a playlist transposes, and reports the contributor.)
 (v3.8: songbook data model, Story 6.2.1, migration 20261111150000_songbook_data_model.sql: compositions.catalog_slug / aliases / authors; song_versions.catalog_source_id / version_kind / beats / song_note, unique per song and catalog source; new tables songbooks, song_version_sources and song_translations, readable when their song is readable and written by admins only. Review round on PR #527: triggers trg_guard_catalog_slug / trg_guard_catalog_source_id let only trusted roles and admins set the catalog keys; keys without surrounding spaces; lowercase translation languages; a cited songbook cannot be deleted (on delete restrict)).
 (v3.7: share e-mails are claimed by the server only, migration 20261111120000_share_email_server_claim.sql: claim_recording_share_email takes the owner as a parameter and only service_role may execute it).
 (v3.6: profile e-mail privacy, migration 20261110120000_profile_email_privacy.sql: public_profiles gains is_musician; the three profile read policies for singers and share partners are gone; search_users_for_sharing matches a name or an exact address and returns no address; user_recordings.singer_email is no longer selectable, the owner reads it with own_recording_singer_emails(); notifications and share e-mails name the sharer by name only).
 (v3.5: back-merge of release 1.7.1 from main: the access rules of migrations 20261106120000, 20261106130000 and 20261106140000 (public_profiles view, fn_can_edit_setlist, fn_guard_profile_fields, song and version read/write rules), compositions.is_public, profiles.last_seen_at and song_views; combined with the develop line below).
 (v3.4: the chord rule of the recompute at the end of the script counts a bracketed chord token ("[Am]"), not a bracketed word that starts with A-G ("[Chorus]"), and uses the same whitespace set as JavaScript (leading BOM, U+0085); migration 20261106180000_recompute_song_flags.sql, review round on PR #474, M6).
 (v3.3: compositions.has_chords / has_melody are declared in the table and recomputed for every song at the end of the script (true when ANY version has chords / a melody, the rule of lib/songs/versionFlags.ts); migration 20261106180000_recompute_song_flags.sql; UX v2 validation 1, fix 7).
 (v3.2: compositions SELECT/ALL policies now mirror the migrations (anon sees is_public = true only; owner/admin policies); the superseded "Public compositions are viewable by everyone" USING (true) and mock-mode public insert/update/delete policies are gone; Story 6.1.28, #412).
 (v3.1: Anon (guest) reads of public takes now also require singer_consent_confirmed; UXD-2, Story 6.1.26).
 (v3.0: Added notifications inbox with share triggers and profiles.email_notifications opt-out).
 (v2.9: Added is_recording_owner / has_recording_share security definer helpers to prevent RLS recursion).
 (v2.8: Added recording_shares, singer attribution, public recording visibility, and consent confirmation).
 (main v3.0: Song and version read and write rules now match the migrations).
 (main v2.9: Write rules for profile fields, categories, playlist owner and song versions; fn_guard_profile_fields, fn_check_song_manage_access).
 (main v2.8: Profile and playlist item access rules, public_profiles view, fn_can_edit_setlist;
 installs without errors again: added missing columns, song_views, new-user trigger).
 (v2.7: Added Guaraní and Camino Rojo categories).
 (v2.6: Added partial indexes for is_public and alphabetical title index).
 (v2.4: Added tuning to song_versions).
 Run this in the Supabase SQL Editor to initialize a fresh database.
 */
-- Enable necessary extensions
create extension if not exists "uuid-ossp";
-- 1. Create ENUMs
create type user_role as enum ('admin', 'musician', 'member', 'expert', 'gatekeeper');
-- 2. Create Tables
-- PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role user_role default 'member',
  full_name text,
  avatar_url text,
  email_notifications boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_at timestamp with time zone
);
-- CATEGORIES (Recursive Structure)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  emoji text,
  flavour_text text,
  icon_name text,
  parent_id uuid references public.categories(id),
  created_at timestamptz default now()
);
-- COMPOSITIONS (Parent Song entity)
create table public.compositions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  original_author text,
  owner_id uuid references public.profiles(id),
  is_public boolean default true,
  has_chords boolean default false,
  has_melody boolean default false,
  -- Songbook catalog data (v3.8, Story 6.2.1): stable external id, other titles, every author.
  -- original_author stays the display text.
  catalog_slug text unique
    constraint compositions_catalog_slug_check check (catalog_slug <> '' and catalog_slug = btrim(catalog_slug)),
  aliases text[] not null default '{}',
  authors text[] not null default '{}',
  -- Catalog songs corrected in the app (v3.10, Story 6.2.21): set by trg_track_catalog_edit.
  edited_in_app boolean not null default false,
  edited_at timestamptz,
  edited_fields text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- SONG_CATEGORY_MAP (Join Table)
create table public.song_category_map (
  song_id uuid references public.compositions(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (song_id, category_id)
);
-- SONG_VERSIONS (The actual playable content)
create table public.song_versions (
  id uuid default uuid_generate_v4() primary key,
  composition_id uuid references public.compositions(id) on delete cascade not null,
  version_name text default 'Standard',
  content_chordpro text not null,
  melody_notation text,
  -- ABC Notation
  key text,
  capo integer default 0,
  tuning text default 'Standard',
  -- Added v2.4
  soundcloud_url text,
  -- Renamed from audio_url (v2.3)
  youtube_url text,
  -- Video ID or URL for YouTube embed
  spotify_url text,
  -- Added v2.3
  contributor_id uuid references public.profiles(id),
  vote_count integer default 0,
  -- Songbook catalog data (v3.8, Story 6.2.1): key and capo above hold the per-book values.
  catalog_source_id text
    constraint song_versions_catalog_source_id_check
    check (catalog_source_id <> '' and catalog_source_id = btrim(catalog_source_id)),
  version_kind text not null default 'original'
    check (version_kind in ('original', 'variant', 'translation')),
  beats text,
  song_note text,
  -- Catalog versions corrected in the app (v3.10, Story 6.2.21): set by trg_track_catalog_edit.
  edited_in_app boolean not null default false,
  edited_at timestamptz,
  edited_fields text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- SETLISTS
create table public.setlists (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- SETLIST ITEMS
create table public.setlist_items (
  id uuid default uuid_generate_v4() primary key,
  setlist_id uuid references public.setlists(id) on delete cascade not null,
  song_version_id uuid references public.song_versions(id) on delete cascade not null,
  order_index integer not null,
  transposition_override integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- USER RECORDINGS
create table public.user_recordings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  song_version_id uuid references public.song_versions(id) on delete cascade not null,
  recording_name text not null,
  storage_path text not null unique,
  position integer default 0 not null,
  file_size_bytes bigint default 0,
  duration_seconds integer default 0,
  is_public boolean default false not null,
  singer_consent_confirmed boolean default false not null,
  singer_profile_id uuid references public.profiles(id) on delete set null,
  singer_name text,
  singer_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RECORDING SHARES (Private user-to-user sharing)
create table public.recording_shares (
  id uuid default gen_random_uuid() primary key,
  recording_id uuid references public.user_recordings(id) on delete cascade not null,
  shared_with_user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  email_sent_at timestamptz,
  constraint uq_recording_shares unique (recording_id, shared_with_user_id)
);
-- SONG VIEWS (Recently Viewed)
create table public.song_views (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  song_id uuid references public.compositions(id) on delete cascade not null,
  viewed_at timestamp with time zone default now() not null,
  unique (user_id, song_id)
);
-- SONGBOOKS (v3.8, Story 6.2.1): one row per source book, keyed by its external id
create table public.songbooks (
  id text primary key constraint songbooks_id_check check (id <> '' and id = btrim(id)),
  title text not null,
  short_name text,
  compiler text,
  community text,
  year integer check (year between 1 and 9999),
  languages text[] not null default '{}',
  attribution text,
  created_at timestamptz not null default now()
);
-- SONG VERSION SOURCES (v3.8): the songbooks a version was printed in. A songbook that a
-- source cites cannot be deleted (on delete restrict): delete the sources first.
create table public.song_version_sources (
  id uuid primary key default gen_random_uuid(),
  song_version_id uuid not null references public.song_versions(id) on delete cascade,
  songbook_id text not null references public.songbooks(id) on update cascade on delete restrict,
  original_title text,
  page text,
  source_file text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (song_version_id, songbook_id)
);
-- SONG TRANSLATIONS (v3.8): one translation per song and language
create table public.song_translations (
  id uuid primary key default gen_random_uuid(),
  composition_id uuid not null references public.compositions(id) on delete cascade,
  -- Lowercase BCP 47-style tag ('nl', 'pt-br'), so one language has one spelling.
  language text not null constraint song_translations_language_check
    check (language = lower(language) and language ~ '^[a-z]{2,3}(-[a-z0-9]{1,8})*$'),
  title text,
  lyrics text,
  translator text,
  created_at timestamptz not null default now(),
  unique (composition_id, language)
);
-- 3. Indexes
-- Songbook catalog keys (v3.8): an importer upserts versions on (composition_id, catalog_source_id).
create unique index song_versions_composition_catalog_source_key
  on public.song_versions (composition_id, catalog_source_id);
create index idx_song_version_sources_songbook_id on public.song_version_sources (songbook_id);
create unique index song_version_sources_one_primary
  on public.song_version_sources (song_version_id) where is_primary;
-- Partial indexes for public content optimization
CREATE INDEX IF NOT EXISTS idx_compositions_is_public_true ON public.compositions (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_setlists_is_public_true ON public.setlists (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_compositions_title_alphabetical ON public.compositions (title ASC);
CREATE INDEX IF NOT EXISTS idx_recording_shares_user ON public.recording_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_recording_shares_recording ON public.recording_shares(recording_id);
CREATE INDEX IF NOT EXISTS idx_user_recordings_public ON public.user_recordings(song_version_id) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_recordings_singer ON public.user_recordings(singer_profile_id) WHERE singer_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_song_views_user_viewed ON public.song_views (user_id, viewed_at DESC);

-- 4. Triggers & Functions
-- Trigger to prevent linking songs to parent groups (only subcategories allowed)
create or replace function public.check_is_subcategory() returns trigger as $$ begin if (
    select parent_id
    from public.categories
    where id = new.category_id
  ) is null then raise exception 'Songs can only be linked to subcategories, not parent groups.';
end if;
return new;
end;
$$ language plpgsql security definer
set search_path = public;
create trigger trg_check_subcategory before
insert
  or
update on public.song_category_map for each row execute function public.check_is_subcategory();
-- Create a profile for every new auth user. New profiles start with the default role.
create or replace function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'member'::public.user_role);
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();
-- 5. Views
-- View: Category Details (for UI display)
create or replace view public.category_details with (security_invoker = true) as
select child.id as subcategory_id,
  child.name as subcategory_name,
  child.slug as subcategory_slug,
  child.emoji as subcategory_emoji,
  child.flavour_text,
  parent.name as parent_group_name,
  parent.emoji as parent_emoji,
  concat(
    child.emoji,
    ' ',
    child.name,
    ' (',
    parent.emoji,
    ' ',
    parent.name,
    ')'
  ) as full_display_name
from public.categories child
  join public.categories parent on child.parent_id = parent.id
where child.parent_id is not null;
-- View: Songs with Categories
create or replace view public.song_with_categories with (security_invoker = true) as
select s.id as song_id,
  s.title,
  jsonb_agg(
    jsonb_build_object(
      'category',
      cd.subcategory_name,
      'emoji',
      cd.subcategory_emoji,
      'parent',
      cd.parent_group_name
    )
  ) as categories
from public.compositions s
  join public.song_category_map scm on s.id = scm.song_id
  join public.category_details cd on scm.category_id = cd.subcategory_id
group by s.id,
  s.title;
-- 6. Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.compositions enable row level security;
alter table public.song_category_map enable row level security;

-- Admin Helper Function (Security Definer avoids RLS recursion)
create or replace function public.fn_is_admin() returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
end;
$$ language plpgsql security definer
set search_path = public;

grant execute on function public.fn_is_admin to authenticated;
grant execute on function public.fn_is_admin to service_role;

-- Recording sharing helpers (security definer to avoid RLS recursion between
-- user_recordings and recording_shares policies)
create or replace function public.is_recording_owner(p_recording_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_recordings
    where id = p_recording_id
    and user_id = p_user_id
  );
$$;

create or replace function public.has_recording_share(p_recording_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.recording_shares
    where recording_id = p_recording_id
    and shared_with_user_id = p_user_id
  );
$$;

-- Profiles Policies
create policy "Users can read own profile" on public.profiles for
select to authenticated using (id = auth.uid());

create policy "Admins can read all profiles" on public.profiles for
select to authenticated using (public.fn_is_admin());

create policy "Users can update own profile" on public.profiles for
update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- id, email and created_at change only in a trusted server context (service role,
-- auth triggers). role changes there or through an admin. A trigger is used because
-- admin and member share the authenticated database role.
create or replace function public.fn_guard_profile_fields() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- API callers run as anon or authenticated. Every other role is a trusted context.
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.email is distinct from old.email
    or new.created_at is distinct from old.created_at
  then
    raise exception 'This profile field cannot be changed' using errcode = '42501';
  end if;

  if new.role is distinct from old.role and not public.fn_is_admin() then
    raise exception 'This profile field cannot be changed' using errcode = '42501';
  end if;

  return new;
end;
$$;
revoke all on function public.fn_guard_profile_fields() from public, anon, authenticated;
create trigger trg_guard_profile_fields
before update on public.profiles
for each row execute function public.fn_guard_profile_fields();

revoke insert, delete, truncate, references, trigger on public.profiles from authenticated;

create policy "Admins can update profiles" on public.profiles for
update to authenticated using (public.fn_is_admin()) with check (public.fn_is_admin());

-- anon has no row access and no privilege on the email column. id and role stay
-- granted because row-level policies on other tables look up the caller's role.
revoke all on public.profiles from anon;
grant select (id, role) on public.profiles to anon;

-- Runs with the owner's rights, so it lists only fields that are safe for anyone.
-- Privileges are replaced because a simple view is writable by default.
create or replace view public.public_profiles
with (security_invoker = false, security_barrier = true) as
select id, full_name, avatar_url, (role in ('musician', 'expert')) as is_musician
from public.profiles;

revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to anon, authenticated, service_role;

-- Song Category Map Policies
create policy "Public read access for song_category_map" on public.song_category_map for
select to public using (true);
create policy "Owners/Admins can insert song categories" on public.song_category_map for
insert to authenticated with check (
    exists (
      select 1
      from public.compositions
      where id = song_category_map.song_id
        and (
          owner_id = auth.uid()
          or exists (
            select 1
            from public.profiles
            where id = auth.uid()
              and role = 'admin'
          )
        )
    )
  );
create policy "Owners/Admins can delete song categories" on public.song_category_map for delete to authenticated using (
  exists (
    select 1
    from public.compositions
    where id = song_category_map.song_id
      and (
        owner_id = auth.uid()
        or exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      )
  )
);
alter table public.song_versions enable row level security;
alter table public.setlists enable row level security;
alter table public.setlist_items enable row level security;
alter table public.user_recordings enable row level security;
alter table public.recording_shares enable row level security;
-- Public Read Policies
create policy "Allow public read access" on public.categories for
select to public using (true);
-- Compositions SELECT mirrors migrations 20260128175700 / 20260128175900: guests (anon) see public songs only;
-- signed-in users also see their own songs, admins see all.
create policy "Public songs are viewable by everyone" on public.compositions for
select to public using (is_public = true);
create policy "Authenticated users can view appropriate songs" on public.compositions for
select to authenticated using (
    is_public = true
    or owner_id = (select auth.uid())
    or (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );
create policy "Respect composition privacy for versions" on public.song_versions for
select to public using (
    exists (
      select 1 from public.compositions c
      where c.id = song_versions.composition_id and c.is_public = true
    )
  );
create policy "Authenticated users can view appropriate versions" on public.song_versions for
select to authenticated using (
    exists (
      select 1 from public.compositions c
      where c.id = song_versions.composition_id
        and (
          c.is_public = true
          or c.owner_id = (select auth.uid())
          or (select role from public.profiles where id = (select auth.uid())) = 'admin'
        )
    )
  );
-- Admin/Member Policies (Simplified for MVP)
-- Admin/Member Policies (Optimized: Split actions, cached auth)
-- admin manages categories. Signed-in users may add an artist sub-category, and the
-- Artists parent if it does not exist yet: saving a song creates them through the
-- user's session.
create policy "Admins can insert categories" on public.categories for
insert to authenticated with check (public.fn_is_admin());
create policy "Admins can update categories" on public.categories for
update to authenticated using (public.fn_is_admin()) with check (public.fn_is_admin());
create policy "Admins can delete categories" on public.categories for delete to authenticated using (public.fn_is_admin());
create policy "Users can add artist categories" on public.categories for
insert to authenticated with check (
    (parent_id is null and slug = 'artists' and name = 'Artists')
    or (
      slug like 'artist-%'
      and parent_id = (select c.id from public.categories c where c.slug = 'artists')
    )
  );
-- Compositions: Authenticated creation
-- Compositions: Authenticated creation, Owner Edit, Admin Edit
-- (The mock-mode "Allow public insert/update/delete compositions" policies were dropped by migration 20260128175900.)
-- create policy "Authenticated users can create compositions" on public.compositions for insert to authenticated with check ((select auth.role()) = 'authenticated');
create policy "Owners can manage their songs" on public.compositions for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Admins can manage all songs" on public.compositions for all to authenticated
  using ((select role from public.profiles where id = (select auth.uid())) = 'admin');
create policy "Owners can update their songs" on public.compositions for
update to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Admins can update all songs" on public.compositions for
update to authenticated using (
    (
      select role
      from public.profiles
      where id = (
          select auth.uid()
        )
    ) = 'admin'
  );
-- create policy "Admins can delete songs" on public.compositions for delete to authenticated using ((select role from public.profiles where id = (select auth.uid())) = 'admin');
-- Song Versions: Strict contributor check + Admin Override
-- create policy "Users can insert versions" on public.song_versions for insert with check ((select auth.uid()) = contributor_id);
create or replace function public.fn_check_song_manage_access(target_song_id uuid) returns boolean as $$
begin
  return exists (
    select 1 from public.compositions
    where id = target_song_id and owner_id = auth.uid()
  ) or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer
set search_path = public;
grant execute on function public.fn_check_song_manage_access to authenticated;
grant execute on function public.fn_check_song_manage_access to service_role;
create policy "Song managers can insert versions" on public.song_versions for
insert to authenticated with check (
    contributor_id = (select auth.uid())
    and public.fn_check_song_manage_access(composition_id)
  );
-- A version stays on its song and keeps its contributor.
revoke update on public.song_versions from anon, authenticated;
grant update (
  version_name, content_chordpro, melody_notation, key, capo, tuning,
  soundcloud_url, youtube_url, spotify_url,
  version_kind, beats, song_note
) on public.song_versions to authenticated;
create policy "Contributors can update their versions" on public.song_versions for
update to authenticated using (
    contributor_id = (
      select auth.uid()
    )
  );
create policy "Admins can update all versions" on public.song_versions for
update to authenticated using (
    (
      select role
      from public.profiles
      where id = (
          select auth.uid()
        )
    ) = 'admin'
  );
-- create policy "Admins can delete versions" on public.song_versions for delete to authenticated using ((select role from public.profiles where id = (select auth.uid())) = 'admin');
create policy "Allow contributors and admins to delete versions" on public.song_versions for delete to authenticated using (
    contributor_id = (select auth.uid())
    or (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );
-- Setlist Policies (RLS enabled)
create policy "Public setlists visible" on public.setlists for
select to public using (is_public = true);
create policy "Owners can view their setlists" on public.setlists for
select to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Owners can insert setlists" on public.setlists for
insert to authenticated with check (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Owners can update setlists" on public.setlists for
update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Owners can delete setlists" on public.setlists for
delete to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Admins can view all setlists" on public.setlists for
select to authenticated using (public.fn_is_admin());
create policy "Admins and Gatekeepers can update public setlists" on public.setlists for
update to authenticated using (
    is_public = true
    and (select role::text from public.profiles where id = (select auth.uid())) in ('admin', 'gatekeeper')
  ) with check (
    is_public = true
    and (select role::text from public.profiles where id = (select auth.uid())) in ('admin', 'gatekeeper')
  );
-- A policy cannot compare a row with its previous value, so column privileges keep owner_id fixed.
revoke update on public.setlists from anon, authenticated;
grant update (title, description, is_public) on public.setlists to authenticated;
-- Setlist Items Policies
-- Read: parent playlist is public, or the caller owns it, or the caller is admin.
-- Write: caller owns the parent playlist, or is admin, or is gatekeeper and the
-- parent playlist is public. Checked for the old and the new row.
create or replace function public.fn_can_edit_setlist(p_setlist_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.setlists s
    left join public.profiles p on p.id = auth.uid()
    where s.id = p_setlist_id
      and (
        s.owner_id = auth.uid()
        or p.role = 'admin'::public.user_role
        or (s.is_public and p.role = 'gatekeeper'::public.user_role)
      )
  );
$$;

revoke all on function public.fn_can_edit_setlist(uuid) from public, anon;
grant execute on function public.fn_can_edit_setlist(uuid) to authenticated, service_role;

create policy "Guests can read items of public setlists" on public.setlist_items for
select to anon using (
    exists (
      select 1 from public.setlists s
      where s.id = setlist_items.setlist_id
        and s.is_public = true
    )
  );
create policy "Users can read items of visible setlists" on public.setlist_items for
select to authenticated using (
    exists (
      select 1 from public.setlists s
      where s.id = setlist_items.setlist_id
        and (
          s.is_public = true
          or s.owner_id = (select auth.uid())
          or (select public.fn_is_admin())
        )
    )
  );
create policy "Editors can insert setlist items" on public.setlist_items for
insert to authenticated with check (public.fn_can_edit_setlist(setlist_id));
create policy "Editors can update setlist items" on public.setlist_items for
update to authenticated using (public.fn_can_edit_setlist(setlist_id))
  with check (public.fn_can_edit_setlist(setlist_id));
create policy "Editors can delete setlist items" on public.setlist_items for delete to authenticated using (public.fn_can_edit_setlist(setlist_id));
-- Song Views Policies
alter table public.song_views enable row level security;
create policy "Users can read own song views" on public.song_views for
select using (auth.uid() = user_id);
create policy "Users can upsert own song views" on public.song_views for
insert with check (auth.uid() = user_id);
create policy "Users can update own song views" on public.song_views for
update using (auth.uid() = user_id);
-- User Recordings Policies
create policy "Allow users to read accessible recordings" on public.user_recordings for
select to authenticated using (
  auth.uid() = user_id
  or is_public = true
  or public.has_recording_share(id, auth.uid())
);
create policy "Allow public to read public recordings" on public.user_recordings for
select to anon using (is_public = true and singer_consent_confirmed = true);
create policy "Allow users to insert their own recordings" on public.user_recordings for
insert to authenticated with check (auth.uid() = user_id);
create policy "Allow users to update their own recordings" on public.user_recordings for
update to authenticated using (auth.uid() = user_id);
create policy "Allow users to delete their own recordings" on public.user_recordings for delete to authenticated using (auth.uid() = user_id);

-- Recording Shares Policies
create policy "Allow owners and recipients to read shares" on public.recording_shares for
select to authenticated using (
  shared_with_user_id = auth.uid()
  or public.is_recording_owner(recording_id, auth.uid())
);
create policy "Allow owners to insert shares" on public.recording_shares for
insert to authenticated with check (
  public.is_recording_owner(recording_id, auth.uid())
);
create policy "Allow owners and recipients to delete shares" on public.recording_shares for delete to authenticated using (
  shared_with_user_id = auth.uid()
  or public.is_recording_owner(recording_id, auth.uid())
);

-- User lookup for sharing and attribution: a name, or a complete e-mail address. It never
-- returns an address.
create or replace function public.search_users_for_sharing(search_term text)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  is_musician boolean
) language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.avatar_url, p.role in ('musician', 'expert')
    from public.profiles p
   where auth.uid() is not null
     and p.id <> auth.uid()
     and char_length(trim(search_term)) >= 2
     and (
       p.full_name ilike ('%' || trim(search_term) || '%')
       or lower(p.email) = lower(trim(search_term))
     )
   order by p.full_name nulls last
   limit 10;
$$;
revoke all on function public.search_users_for_sharing(text) from public, anon;
grant execute on function public.search_users_for_sharing(text) to authenticated, service_role;

-- user_recordings.singer_email (an unregistered singer's address) is not selectable through the
-- API: every other column is. A new user_recordings column must be added to this list.
revoke select on public.user_recordings from anon, authenticated;
grant select (
  id, user_id, song_version_id, recording_name, storage_path, position, created_at,
  file_size_bytes, duration_seconds, is_public, singer_consent_confirmed, singer_profile_id, singer_name
) on public.user_recordings to anon, authenticated;

-- The owner reads the singer addresses of their own takes.
create or replace function public.own_recording_singer_emails(p_recording_ids uuid[])
returns table (recording_id uuid, singer_email text)
language sql stable security definer set search_path = '' as $$
  select ur.id, ur.singer_email
    from public.user_recordings ur
   where ur.id = any (p_recording_ids)
     and ur.user_id = auth.uid()
     and ur.singer_email is not null;
$$;
revoke all on function public.own_recording_singer_emails(uuid[]) from public, anon;
grant execute on function public.own_recording_singer_emails(uuid[]) to authenticated, service_role;
-- NOTIFICATIONS inbox (Story 4.6.6). Display text is rendered client-side from `type`
--    and the `metadata` snapshot, so it follows the reader's locale.
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('recording_shared')),
  recording_id uuid REFERENCES public.user_recordings(id) ON DELETE CASCADE,
  composition_id uuid REFERENCES public.compositions(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recipients read, mark read and dismiss their own notifications. There is no
-- INSERT policy: rows are only created by the SECURITY DEFINER trigger below.
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Supabase grants ALL on new public tables by default; narrow it so recipients
-- can only flip `read_at`.
REVOKE ALL ON public.notifications FROM anon, authenticated;
GRANT SELECT, DELETE ON public.notifications TO authenticated;
GRANT UPDATE (read_at) ON public.notifications TO authenticated;

-- Create a notification when a recording is shared. Errors are swallowed
--    (logged as WARNING) so a notification failure never blocks the share.
CREATE OR REPLACE FUNCTION public.fn_notify_recording_shared()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_owner_name text;
  v_recording_name text;
  v_composition uuid;
  v_song_title text;
BEGIN
  BEGIN
    SELECT ur.user_id, ur.recording_name, sv.composition_id, c.title,
           NULLIF(p.full_name, '')
      INTO v_owner, v_recording_name, v_composition, v_song_title, v_owner_name
      FROM public.user_recordings ur
      JOIN public.song_versions sv ON sv.id = ur.song_version_id
      JOIN public.compositions c ON c.id = sv.composition_id
      LEFT JOIN public.profiles p ON p.id = ur.user_id
     WHERE ur.id = NEW.recording_id;

    INSERT INTO public.notifications (user_id, actor_id, type, recording_id, composition_id, metadata)
    VALUES (
      NEW.shared_with_user_id, v_owner, 'recording_shared', NEW.recording_id, v_composition,
      jsonb_build_object(
        'actor_name', v_owner_name,
        'song_title', v_song_title,
        'recording_name', v_recording_name
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'fn_notify_recording_shared failed for share %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Revoking a share removes its notification so no dead link stays behind.
CREATE OR REPLACE FUNCTION public.fn_remove_recording_share_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.notifications
   WHERE user_id = OLD.shared_with_user_id
     AND recording_id = OLD.recording_id
     AND type = 'recording_shared';
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_recording_shared ON public.recording_shares;
CREATE TRIGGER trg_notify_recording_shared
  AFTER INSERT ON public.recording_shares
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_recording_shared();

DROP TRIGGER IF EXISTS trg_remove_recording_share_notification ON public.recording_shares;
CREATE TRIGGER trg_remove_recording_share_notification
  AFTER DELETE ON public.recording_shares
  FOR EACH ROW EXECUTE FUNCTION public.fn_remove_recording_share_notification();

-- One transactional email per share. The app server (secret key, never a user's
--    session) claims the share for its owner (sets email_sent_at) and gets the
--    recipient's details back only when the claim succeeds and the recipient has not
--    opted out. This keeps the email idempotent and owner-only.
CREATE OR REPLACE FUNCTION public.claim_recording_share_email(p_recording_id uuid, p_recipient_id uuid, p_owner_id uuid)
RETURNS TABLE (
  recipient_email text,
  recipient_name text,
  actor_name text,
  song_title text,
  recording_name text,
  composition_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH claimed AS (
    UPDATE public.recording_shares rs
       SET email_sent_at = now()
     WHERE rs.recording_id = p_recording_id
       AND rs.shared_with_user_id = p_recipient_id
       AND rs.email_sent_at IS NULL
       AND public.is_recording_owner(rs.recording_id, p_owner_id)
    RETURNING rs.recording_id, rs.shared_with_user_id
  )
  SELECT rp.email,
         rp.full_name,
         NULLIF(op.full_name, ''),
         c.title,
         ur.recording_name,
         sv.composition_id
    FROM claimed cl
    JOIN public.profiles rp ON rp.id = cl.shared_with_user_id
    JOIN public.user_recordings ur ON ur.id = cl.recording_id
    JOIN public.profiles op ON op.id = ur.user_id
    JOIN public.song_versions sv ON sv.id = ur.song_version_id
    JOIN public.compositions c ON c.id = sv.composition_id
   WHERE rp.email_notifications;
$$;

REVOKE ALL ON FUNCTION public.claim_recording_share_email(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_recording_share_email(uuid, uuid, uuid) TO service_role;

-- Songbook data model (v3.8, Story 6.2.1, migration 20261111150000_songbook_data_model.sql).
-- Readable when the song is readable (the subqueries run with the caller's row-level
-- security), written by admins only. Importers may also use service_role.

-- Catalog keys are set by importers and admins only. Song owners may insert and update
-- their songs and versions, so without these guards a member could pre-claim a
-- catalog_slug (or a catalog_source_id) that an importer later needs.
CREATE OR REPLACE FUNCTION public.fn_guard_catalog_slug() RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  sets_key boolean;
BEGIN
  -- API callers run as anon or authenticated. Every other role (service_role, the
  -- database owner) is a trusted importer context.
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    sets_key := NEW.catalog_slug IS NOT NULL;
  ELSE
    sets_key := NEW.catalog_slug IS DISTINCT FROM OLD.catalog_slug;
  END IF;

  IF sets_key AND NOT public.fn_is_admin() THEN
    RAISE EXCEPTION 'Only admins can set the catalog slug' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_guard_catalog_slug() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_catalog_slug ON public.compositions;
CREATE TRIGGER trg_guard_catalog_slug
BEFORE INSERT OR UPDATE ON public.compositions
FOR EACH ROW EXECUTE FUNCTION public.fn_guard_catalog_slug();

CREATE OR REPLACE FUNCTION public.fn_guard_catalog_source_id() RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  sets_key boolean;
BEGIN
  -- API callers run as anon or authenticated. Every other role (service_role, the
  -- database owner) is a trusted importer context.
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  -- Updates are already refused by the column privileges (catalog_source_id has no
  -- UPDATE grant); the check also covers them should such a grant ever be added.
  IF TG_OP = 'INSERT' THEN
    sets_key := NEW.catalog_source_id IS NOT NULL;
  ELSE
    sets_key := NEW.catalog_source_id IS DISTINCT FROM OLD.catalog_source_id;
  END IF;

  IF sets_key AND NOT public.fn_is_admin() THEN
    RAISE EXCEPTION 'Only admins can set the catalog source id' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_guard_catalog_source_id() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_catalog_source_id ON public.song_versions;
CREATE TRIGGER trg_guard_catalog_source_id
BEFORE INSERT OR UPDATE ON public.song_versions
FOR EACH ROW EXECUTE FUNCTION public.fn_guard_catalog_source_id();

-- Catalog songs and versions corrected in the app (v3.10, Story 6.2.21, migration
-- 20261112160000_protect_catalog_app_edits.sql). trg_track_catalog_edit marks a row with a catalog key
-- (catalog_slug / catalog_source_id) when a signed-in app user (JWT role 'authenticated', also through a
-- SECURITY DEFINER function) changes a tracked column; importers (service_role) and data migrations do not
-- mark. API callers cannot set or clear the markers. fn_catalog_edits_export() and fn_clear_catalog_edit()
-- are for signed-in admins only (not the service role); the clear function only clears the edit the admin
-- downloaded (review of PR #540, v3.10). Importer contract: docs/guides/importing-songbooks.md.
CREATE INDEX IF NOT EXISTS idx_compositions_edited_in_app
  ON public.compositions (edited_at DESC) WHERE edited_in_app;
CREATE INDEX IF NOT EXISTS idx_song_versions_edited_in_app
  ON public.song_versions (edited_at DESC) WHERE edited_in_app;

-- Trigger: TG_ARGV[0] is the catalog key column (tracked too), the other arguments the
-- tracked columns.
CREATE OR REPLACE FUNCTION public.fn_track_catalog_edit() RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  new_row jsonb;
  old_row jsonb;
  changed text[] := '{}';
  col text;
  i integer;
BEGIN
  -- API callers never write the markers themselves.
  IF current_user IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.edited_in_app := false;
      NEW.edited_at := NULL;
      NEW.edited_fields := '{}';
    ELSE
      NEW.edited_in_app := OLD.edited_in_app;
      NEW.edited_at := OLD.edited_at;
      NEW.edited_fields := OLD.edited_fields;
    END IF;
  END IF;

  -- Only updates by a signed-in app user count.
  IF TG_OP <> 'UPDATE' OR coalesce(auth.role(), '') <> 'authenticated' THEN
    RETURN NEW;
  END IF;

  -- Only catalog rows count: the key before or after the write, so removing it is marked too.
  IF TG_ARGV[0] = 'catalog_slug' THEN
    IF NEW.catalog_slug IS NULL AND OLD.catalog_slug IS NULL THEN
      RETURN NEW;
    END IF;
  ELSIF TG_ARGV[0] = 'catalog_source_id' THEN
    IF NEW.catalog_source_id IS NULL AND OLD.catalog_source_id IS NULL THEN
      RETURN NEW;
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown catalog key %', TG_ARGV[0] USING ERRCODE = '22023';
  END IF;

  new_row := to_jsonb(NEW);
  old_row := to_jsonb(OLD);
  FOR i IN 0 .. TG_NARGS - 1 LOOP
    col := TG_ARGV[i];
    IF (new_row -> col) IS DISTINCT FROM (old_row -> col) THEN
      changed := changed || col;
    END IF;
  END LOOP;

  IF cardinality(changed) = 0 THEN
    RETURN NEW;
  END IF;

  NEW.edited_in_app := true;
  NEW.edited_at := now();
  NEW.edited_fields := ARRAY(
    SELECT DISTINCT f FROM unnest(OLD.edited_fields || changed) AS f ORDER BY f
  );
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_track_catalog_edit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_track_catalog_edit ON public.compositions;
CREATE TRIGGER trg_track_catalog_edit
BEFORE INSERT OR UPDATE ON public.compositions
FOR EACH ROW EXECUTE FUNCTION public.fn_track_catalog_edit(
  'catalog_slug', 'title', 'original_author', 'aliases', 'authors'
);

DROP TRIGGER IF EXISTS trg_track_catalog_edit ON public.song_versions;
CREATE TRIGGER trg_track_catalog_edit
BEFORE INSERT OR UPDATE ON public.song_versions
FOR EACH ROW EXECUTE FUNCTION public.fn_track_catalog_edit(
  'catalog_source_id', 'version_name', 'content_chordpro', 'melody_notation', 'key', 'capo', 'tuning',
  'soundcloud_url', 'youtube_url', 'spotify_url', 'version_kind', 'beats', 'song_note', 'composition_id'
);

-- Export (admins only): every marked song and version with its catalog keys and the current
-- values of its edited fields. A key is null when it was removed in the app; a moved version
-- gives the catalog_slug of its new song as the value of composition_id, not the internal id.
CREATE OR REPLACE FUNCTION public.fn_catalog_edits_export() RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.fn_is_admin() THEN
    RAISE EXCEPTION 'Only admins can export catalog edits' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'songs', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
          'song_id', c.id,
          'catalog_slug', c.catalog_slug,
          'title', c.title,
          'edited_at', c.edited_at,
          'edited_fields', to_jsonb(c.edited_fields),
          'values', (SELECT coalesce(jsonb_object_agg(f, to_jsonb(c) -> f), '{}'::jsonb)
                     FROM unnest(c.edited_fields) AS f)
        ) ORDER BY c.edited_at DESC, c.catalog_slug)
      FROM public.compositions c
      WHERE c.edited_in_app
    ), '[]'::jsonb),
    'versions', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
          'song_id', c.id,
          'version_id', v.id,
          'catalog_slug', c.catalog_slug,
          'catalog_source_id', v.catalog_source_id,
          'title', c.title,
          'version_name', v.version_name,
          'edited_at', v.edited_at,
          'edited_fields', to_jsonb(v.edited_fields),
          'values', (SELECT coalesce(jsonb_object_agg(
                       f, CASE WHEN f = 'composition_id' THEN to_jsonb(c.catalog_slug) ELSE to_jsonb(v) -> f END
                     ), '{}'::jsonb)
                     FROM unnest(v.edited_fields) AS f)
        ) ORDER BY v.edited_at DESC, c.catalog_slug, v.catalog_source_id)
      FROM public.song_versions v
      JOIN public.compositions c ON c.id = v.composition_id
      WHERE v.edited_in_app
    ), '[]'::jsonb)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.fn_catalog_edits_export() FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_catalog_edits_export() TO authenticated;

-- Clear a marker (admins only), once the external catalog has taken the correction over.
-- p_kind is 'song' or 'version'; p_edited_at is the edited_at the admin downloaded, so a
-- correction made after the download stays marked. Returns 'cleared', 'changed' (still marked,
-- corrected again since p_edited_at) or 'not_marked' (nothing to clear).
CREATE OR REPLACE FUNCTION public.fn_clear_catalog_edit(p_kind text, p_id uuid, p_edited_at timestamptz) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  cleared integer;
  marked boolean;
BEGIN
  IF NOT public.fn_is_admin() THEN
    RAISE EXCEPTION 'Only admins can clear catalog edits' USING ERRCODE = '42501';
  END IF;

  IF p_kind = 'song' THEN
    UPDATE public.compositions
       SET edited_in_app = false, edited_at = NULL, edited_fields = '{}'
     WHERE id = p_id AND edited_in_app AND edited_at = p_edited_at;
    GET DIAGNOSTICS cleared = ROW_COUNT;
    IF cleared = 0 THEN
      SELECT edited_in_app INTO marked FROM public.compositions WHERE id = p_id;
    END IF;
  ELSIF p_kind = 'version' THEN
    UPDATE public.song_versions
       SET edited_in_app = false, edited_at = NULL, edited_fields = '{}'
     WHERE id = p_id AND edited_in_app AND edited_at = p_edited_at;
    GET DIAGNOSTICS cleared = ROW_COUNT;
    IF cleared = 0 THEN
      SELECT edited_in_app INTO marked FROM public.song_versions WHERE id = p_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown kind %', p_kind USING ERRCODE = '22023';
  END IF;

  IF cleared > 0 THEN
    RETURN 'cleared';
  END IF;
  RETURN CASE WHEN coalesce(marked, false) THEN 'changed' ELSE 'not_marked' END;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_clear_catalog_edit(text, uuid, timestamptz) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_clear_catalog_edit(text, uuid, timestamptz) TO authenticated;

-- Privileges: guests read; signed-in users read and (admins only, by policy) write.
REVOKE ALL ON public.songbooks, public.song_version_sources, public.song_translations FROM anon, authenticated;
GRANT SELECT ON public.songbooks, public.song_version_sources, public.song_translations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.songbooks, public.song_version_sources, public.song_translations TO authenticated;
GRANT ALL ON public.songbooks, public.song_version_sources, public.song_translations TO service_role;

-- Row-level security
ALTER TABLE public.songbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_version_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Songbooks are readable with a readable version" ON public.songbooks;
CREATE POLICY "Songbooks are readable with a readable version"
ON public.songbooks FOR SELECT
TO public
USING (EXISTS (SELECT 1 FROM public.song_version_sources s WHERE s.songbook_id = songbooks.id));
-- Admins also read songbooks no version cites yet, through the policy below.

DROP POLICY IF EXISTS "Admins can manage songbooks" ON public.songbooks;
CREATE POLICY "Admins can manage songbooks"
ON public.songbooks FOR ALL
TO authenticated
USING ((select public.fn_is_admin()))
WITH CHECK ((select public.fn_is_admin()));

DROP POLICY IF EXISTS "Version sources follow version privacy" ON public.song_version_sources;
CREATE POLICY "Version sources follow version privacy"
ON public.song_version_sources FOR SELECT
TO public
USING (EXISTS (SELECT 1 FROM public.song_versions v WHERE v.id = song_version_sources.song_version_id));

DROP POLICY IF EXISTS "Admins can manage version sources" ON public.song_version_sources;
CREATE POLICY "Admins can manage version sources"
ON public.song_version_sources FOR ALL
TO authenticated
USING ((select public.fn_is_admin()))
WITH CHECK ((select public.fn_is_admin()));

DROP POLICY IF EXISTS "Translations follow song privacy" ON public.song_translations;
CREATE POLICY "Translations follow song privacy"
ON public.song_translations FOR SELECT
TO public
USING (EXISTS (SELECT 1 FROM public.compositions c WHERE c.id = song_translations.composition_id));

DROP POLICY IF EXISTS "Admins can manage translations" ON public.song_translations;
CREATE POLICY "Admins can manage translations"
ON public.song_translations FOR ALL
TO authenticated
USING ((select public.fn_is_admin()))
WITH CHECK ((select public.fn_is_admin()));
-- 7. SEED DATA (Categories)
with groups as (
  insert into public.categories (name, slug, emoji)
  values ('The Elements', 'the-elements', '🌀'),
    ('Nature', 'nature', '🌿'),
    ('Languages', 'languages', '🗣️'),
    ('Lineage & Tradition', 'lineage-tradition', '🌳'),
    ('Medicine & Healing', 'medicine-healing', '🦅'),
    ('Spiritual Concepts', 'spiritual-concepts', '✨')
  returning id,
    name
)
insert into public.categories (name, slug, emoji, flavour_text, parent_id)
values -- THE ELEMENTS
  (
    'Water',
    'water',
    '💧',
    'Songs dedicated to the water element, rivers, and rain.',
    (
      select id
      from groups
      where name = 'The Elements'
    )
  ),
  (
    'Air',
    'air',
    '🌬️',
    'Songs for the wind, the breath, and the invisible spirit.',
    (
      select id
      from groups
      where name = 'The Elements'
    )
  ),
  (
    'Fire',
    'fire',
    '🔥',
    'Songs for the sacred fire, transformation, and warmth.',
    (
      select id
      from groups
      where name = 'The Elements'
    )
  ),
  (
    'Earth',
    'earth',
    '🌎',
    'Songs for Pachamama and the physical grounding of the earth.',
    (
      select id
      from groups
      where name = 'The Elements'
    )
  ),
  -- NATURE
  (
    'Animales',
    'animales',
    '🐾',
    'Songs dedicated to power animals like the Jaguar and Serpent.',
    (
      select id
      from groups
      where name = 'Nature'
    )
  ),
  (
    'Bird',
    'bird',
    '🦅',
    'Melodies for the winged ones, the Condor, and the Eagle.',
    (
      select id
      from groups
      where name = 'Nature'
    )
  ),
  (
    'Plantas',
    'plantas',
    '🍃',
    'Songs for specific master plants or general botanical spirits.',
    (
      select id
      from groups
      where name = 'Nature'
    )
  ),
  (
    'Moon',
    'moon',
    '🌙',
    'Songs for Mama Quilla and the cycles of the night.',
    (
      select id
      from groups
      where name = 'Nature'
    )
  ),
  (
    'Sun',
    'sun',
    '☀️',
    'Songs for Inti and the light of consciousness.',
    (
      select id
      from groups
      where name = 'Nature'
    )
  ),
  (
    'Mountain',
    'mountain',
    '🏔️',
    'Hymns for the Apus and the sacred heights.',
    (
      select id
      from groups
      where name = 'Nature'
    )
  ),
  (
    'Selva',
    'selva',
    '🌳',
    'Songs emerging from the heart of the jungle.',
    (
      select id
      from groups
      where name = 'Nature'
    )
  ),
  -- LANGUAGES
  (
    'Spanish',
    'spanish',
    '🇪🇸',
    'Songs written or sung in Spanish.',
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'English',
    'english',
    '🇬🇧',
    'Songs written or sung in English.',
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Quechua / Kichwa',
    'quechua-kichwa',
    '🏔️',
    'Traditional Andean songs in the native tongue.',
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Portuguese',
    'portuguese',
    '🇧🇷',
    'Hinos and songs from the Brazilian traditions.',
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Nahuatl',
    'nahuatl',
    '🏹',
    'Ancient songs from the Mexica and Mesoamerican traditions.',
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Huni Kuin',
    'huni-kuin',
    '🐍',
    'Sacred chants in the Hatxa Kuin language.',
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'German',
    'german',
    '🇩🇪',
    null,
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Belarusian',
    'belarusian',
    '🇧🇾',
    null,
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Croatian',
    'croatian',
    '🇭🇷',
    null,
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Italian',
    'italian',
    '🇮🇹',
    null,
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Lithuanian',
    'lithuanian',
    '🇱🇹',
    null,
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Russian',
    'russian',
    '🇷🇺',
    null,
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  (
    'Guaraní',
    'guarani',
    '🏹',
    null,
    (
      select id
      from groups
      where name = 'Languages'
    )
  ),
  -- LINEAGE & TRADITION
  (
    'Andean',
    'andean',
    '🧣',
    'Songs from the high mountains and Q''ero traditions.',
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Amazonian',
    'amazonian',
    '🏹',
    'Songs emerging from the Shipibo and Yawanawa lineages.',
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Native American',
    'native-american',
    '🪶',
    'Songs from Northern traditions and the Red Road.',
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Santo Daime',
    'santo-daime',
    '🌟',
    'Specific religious spiritual lineages from Brazil.',
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Traditional',
    'traditional',
    '📜',
    'Folk songs passed down through oral tradition.',
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Lakota',
    'lakota',
    '🪶',
    null,
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Sacred Pipe',
    'sacred-pipe',
    '💨',
    null,
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Temazcal',
    'temazcal',
    '⛺',
    null,
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Umbanda',
    'umbanda',
    '🌊',
    null,
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  (
    'Camino Rojo',
    'camino-rojo',
    '🔴',
    null,
    (
      select id
      from groups
      where name = 'Lineage & Tradition'
    )
  ),
  -- MEDICINE & HEALING
  (
    'Medicine Songs',
    'medicine-songs',
    '🧪',
    'The broad category for songs used in ceremony.',
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Icaros',
    'icaros',
    '🎶',
    'Healing chants used by maestros during plant ceremonies.',
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Healing / Limpieza',
    'healing-limpieza',
    '🌿',
    'Songs specifically for cleansing the energy field.',
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Protection',
    'protection',
    '🛡️',
    'Songs used to create a sacred container or ward off heavy energy.',
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Opening / Closing',
    'opening-closing',
    '🔑',
    'Songs used for the start or end of a ritual.',
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Ayahuasca',
    'ayahuasca',
    '🍵',
    null,
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Peyote',
    'peyote',
    '🌵',
    null,
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Rapé',
    'rape',
    '🌬️',
    null,
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'San Pedro',
    'san-pedro',
    '🌵',
    null,
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Santa Maria',
    'santa-maria',
    '🌿',
    null,
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  (
    'Tobacco',
    'tobacco',
    '🍂',
    null,
    (
      select id
      from groups
      where name = 'Medicine & Healing'
    )
  ),
  -- SPIRITUAL CONCEPTS
  (
    'Gratitude',
    'gratitude',
    '🙏',
    'Songs of thanks and deep appreciation.',
    (
      select id
      from groups
      where name = 'Spiritual Concepts'
    )
  ),
  (
    'Love / Heart',
    'love-heart',
    '💖',
    'Songs focused on opening the Anahata heart center.',
    (
      select id
      from groups
      where name = 'Spiritual Concepts'
    )
  ),
  (
    'Plegarias',
    'plegarias',
    '🕯️',
    'Devotional prayers and sacred invocations.',
    (
      select id
      from groups
      where name = 'Spiritual Concepts'
    )
  ),
  (
    'Vocalization',
    'vocalization',
    '🗣️',
    'Songs focusing on the power of pure voice and tone.',
    (
      select id
      from groups
      where name = 'Spiritual Concepts'
    )
  ),
  (
    'Women',
    'women',
    '♀️',
    'Songs celebrating the divine feminine and sisterhood.',
    (
      select id
      from groups
      where name = 'Spiritual Concepts'
    )
  );
-- 8. TEST DATA (Mock Users & Songs) - OPTIONAL
-- Run this section to populate the database with test users and songs for development.
-- 8.1 Insert Mock Users (Member, Musician, Admin)
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  )
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'member@mock.com',
    '$2y$10$MockHashPassword............',
    now(),
    now(),
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'musician@mock.com',
    '$2y$10$MockHashPassword............',
    now(),
    now(),
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@mock.com',
    '$2y$10$MockHashPassword............',
    now(),
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;
-- 8.2 Insert Mock Profiles
INSERT INTO public.profiles (id, email, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'member@mock.com',
    'member'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'musician@mock.com',
    'musician'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'admin@mock.com',
    'admin'
  ) ON CONFLICT (id) DO
UPDATE
SET role = EXCLUDED.role;
-- 8.3 Update/Create Test Songs
-- Ensure 'Victory Song' exists, or create it if not present, then assign to Mock Member
DO $$ BEGIN IF EXISTS (
  SELECT 1
  FROM public.compositions
  WHERE title = 'Victory Song'
) THEN
UPDATE public.compositions
SET title = 'Victory Member Song',
  owner_id = '11111111-1111-1111-1111-111111111111'
WHERE title = 'Victory Song';
END IF;
END $$;
-- 9. Song flags (any version): recompute compositions.has_chords / has_melody (v3.3)
-- Recompute compositions.has_chords / has_melody for every song (UX v2 validation 1, fix 7).
--
-- The flags describe the whole song: true when ANY version has them. The rule is the one in
-- lib/songs/versionFlags.ts:
--   melody = a version has a YouTube / Spotify / SoundCloud link or a melody notation;
--   chords = a version passes lib/chordProParsing.ts hasChords(): a bracketed chord ("[Am]") or a
--            chords-over-lyrics line (more than half of its tokens are chords or "|").
-- Songs saved before the "any version" rule (or created by seeds/imports) can disagree with it, e.g. an
-- "Original" with chords next to a lyrics-only "Simplified" that was the last one saved.
--
-- Idempotent: only rows whose flags differ are written, so a second run changes nothing. No schema change,
-- no new object is left behind (the helper lives in pg_temp and vanishes with the session).

create or replace function pg_temp.sfs_has_chords(content text) returns boolean
language sql immutable as $$
  select exists (
    -- a bracketed chord ("[Am]", "[C#m7/G#]"); a bracketed label such as "[Chorus]" is not a chord
    select 1
    from regexp_matches(coalesce(content, ''), '\[([^\]\[]*)\]', 'g') as b(m)
    where b.m[1] ~ '^[A-G][#b]?(maj|min|dim|aug|sus|add|m|M|\+|-|°|ø|[0-9]|#|b|\(|\))*(/[A-G][#b]?)?$'
  )
  or exists (
    select 1
    from regexp_split_to_table(coalesce(content, ''), E'\n') as raw(line)
    cross join lateral (
      select regexp_replace(raw.line, '^[\t\n\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+|[\t\n\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+$', '', 'g') as line
    ) as trimmed
    cross join lateral (
      select array(
        select tok
        from regexp_split_to_table(trimmed.line, '[\t\n\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+') as t(tok)
        where tok <> '' and tok not like '(%' and tok not like '%)'
      ) as toks
    ) as r
    where trimmed.line <> ''
      and cardinality(r.toks) > 0
      and (
        select count(*) from unnest(r.toks) as x(tok)
        where x.tok ~ '^[A-G][#b]?(m|min|maj|dim|aug|sus|add)?[0-9]*(/[A-G][#b]?)?$' or x.tok = '|'
      ) > cardinality(r.toks) * 0.5
  );
$$;

with calc as (
  select
    c.id,
    coalesce(bool_or(pg_temp.sfs_has_chords(v.content_chordpro)), false) as chords,
    coalesce(bool_or(
      coalesce(v.youtube_url, '') <> '' or coalesce(v.spotify_url, '') <> ''
      or coalesce(v.soundcloud_url, '') <> '' or coalesce(v.melody_notation, '') <> ''
    ), false) as melody
  from public.compositions c
  left join public.song_versions v on v.composition_id = c.id
  group by c.id
)
update public.compositions c
set has_chords = calc.chords,
    has_melody = calc.melody
from calc
where c.id = calc.id
  and (c.has_chords is distinct from calc.chords or c.has_melody is distinct from calc.melody);
