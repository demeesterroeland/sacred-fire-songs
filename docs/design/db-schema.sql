/*
 **Version:** 3.4
 **Status:** Current
 **Date:** November 7, 2026
 
 ## Usage
 This script provides a complete setup for the "Sacred Fire Songs" database. 
 It consolidates the initial schema and all subsequent migrations up to November 7, 2026.
 (v3.4: the chord rule of the recompute at the end of the script counts a bracketed chord token ("[Am]"), not a bracketed word that starts with A-G ("[Chorus]"), and uses the same whitespace set as JavaScript (leading BOM, U+0085); migration 20261106180000_recompute_song_flags.sql, review round on PR #474, M6).
 (v3.3: compositions.has_chords / has_melody are declared in the table and recomputed for every song at the end of the script (true when ANY version has chords / a melody, the rule of lib/songs/versionFlags.ts); migration 20261106180000_recompute_song_flags.sql; UX v2 validation 1, fix 7).
 (v3.2: compositions SELECT/ALL policies now mirror the migrations (anon sees is_public = true only; owner/admin policies); the superseded "Public compositions are viewable by everyone" USING (true) and mock-mode public insert/update/delete policies are gone; Story 6.1.28, #412).
 (v3.1: Anon (guest) reads of public takes now also require singer_consent_confirmed; UXD-2, Story 6.1.26).
 (v3.0: Added notifications inbox with share triggers and profiles.email_notifications opt-out).
 (v2.9: Added is_recording_owner / has_recording_share security definer helpers to prevent RLS recursion).
 (v2.8: Added recording_shares, singer attribution, public recording visibility, and consent confirmation).
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- CATEGORIES (Recursive Structure)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  emoji text,
  flavour_text text,
  parent_id uuid references public.categories(id),
  created_at timestamptz default now()
);
-- COMPOSITIONS (Parent Song entity)
create table public.compositions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  original_author text,
  owner_id uuid references public.profiles(id),
  has_chords boolean default false,
  has_melody boolean default false,
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
  position integer default 0,
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
-- 3. Indexes
-- Partial indexes for public content optimization
CREATE INDEX IF NOT EXISTS idx_compositions_is_public_true ON public.compositions (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_setlists_is_public_true ON public.setlists (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_compositions_title_alphabetical ON public.compositions (title ASC);
CREATE INDEX IF NOT EXISTS idx_recording_shares_user ON public.recording_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_recording_shares_recording ON public.recording_shares(recording_id);
CREATE INDEX IF NOT EXISTS idx_user_recordings_public ON public.user_recordings(song_version_id) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_recordings_singer ON public.user_recordings(singer_profile_id) WHERE singer_profile_id IS NOT NULL;

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
-- 5. Views
-- View: Category Details (for UI display)
create or replace view public.category_details as
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
where child.parent_id is not null with (security_invoker = true);
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

create policy "Allow reading singer profiles" on public.profiles for
select to authenticated using (
  exists (
    select 1 from public.user_recordings ur
    where ur.singer_profile_id = profiles.id
    and (
      ur.is_public = true
      or ur.user_id = auth.uid()
      or public.has_recording_share(ur.id, auth.uid())
    )
  )
);

create policy "Allow reading shared recording users" on public.profiles for
select to authenticated using (
  exists (
    select 1 from public.recording_shares rs
    where (rs.shared_with_user_id = profiles.id and public.is_recording_owner(rs.recording_id, auth.uid()))
       or (rs.shared_with_user_id = auth.uid() and public.is_recording_owner(rs.recording_id, profiles.id))
  )
);

create policy "Allow public reading public singer profiles" on public.profiles for
select to anon using (
  exists (
    select 1 from public.user_recordings ur
    where ur.singer_profile_id = profiles.id
    and ur.is_public = true
  )
);

create policy "Admins can read all profiles" on public.profiles for
select to authenticated using (public.fn_is_admin());

create policy "Users can update own profile" on public.profiles for
update to authenticated using (id = auth.uid()) with check (id = auth.uid());

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
    or owner_id = (
      select auth.uid()
    )
    or (
      select role
      from public.profiles
      where id = (
          select auth.uid()
        )
    ) = 'admin'
  );
create policy "Owners can view their own songs" on public.compositions for
select to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Public versions are viewable by everyone" on public.song_versions for
select using (true);
-- Admin/Member Policies (Simplified for MVP)
-- Admin/Member Policies (Optimized: Split actions, cached auth)
create policy "Admins/Members can manage categories" on public.categories for
insert to authenticated with check (
    (
      select auth.role()
    ) = 'authenticated'
  );
create policy "Admins/Members can update categories" on public.categories for
update to authenticated using (
    (
      select auth.role()
    ) = 'authenticated'
  );
create policy "Admins/Members can delete categories" on public.categories for delete to authenticated using (
  (
    select auth.role()
  ) = 'authenticated'
);
-- Compositions: Authenticated creation
-- Compositions: Authenticated creation, Owner Edit, Admin Edit
-- (The mock-mode "Allow public insert/update/delete compositions" policies were dropped by migration 20260128175900.)
-- create policy "Authenticated users can create compositions" on public.compositions for insert to authenticated with check ((select auth.role()) = 'authenticated');
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
create policy "Owners can manage their songs" on public.compositions for all to authenticated using (
    owner_id = (
      select auth.uid()
    )
  ) with check (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Admins can manage all songs" on public.compositions for all to authenticated using (
    (
      select role
      from public.profiles
      where id = (
          select auth.uid()
        )
    ) = 'admin'
  );
-- Song Versions: Strict contributor check + Admin Override
-- create policy "Users can insert versions" on public.song_versions for insert with check ((select auth.uid()) = contributor_id);
create policy "Allow public insert versions" on public.song_versions for
insert to public with check (true);
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
create policy "Allow public update versions" on public.song_versions for
update to public using (true);
-- create policy "Admins can delete versions" on public.song_versions for delete to authenticated using ((select role from public.profiles where id = (select auth.uid())) = 'admin');
create policy "Allow public delete versions" on public.song_versions for delete to public using (true);
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
update to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
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
    and (
      select role 
      from public.profiles 
      where id = auth.uid()
    ) in ('admin'::public.user_role, 'gatekeeper'::public.user_role)
  );
-- Setlist Items Policies
create policy "Allow public read access" on public.setlist_items for
select to public using (true);
create policy "Auth users can insert setlist items" on public.setlist_items for
insert to authenticated with check (
    (
      select auth.role()
    ) = 'authenticated'
  );
create policy "Auth users can update setlist items" on public.setlist_items for
update to authenticated using (
    (
      select auth.role()
    ) = 'authenticated'
  );
create policy "Auth users can delete setlist items" on public.setlist_items for delete to authenticated using (
  (
    select auth.role()
  ) = 'authenticated'
);
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

-- User lookup helper function for sharing and attribution
create or replace function public.search_users_for_sharing(search_term text)
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  is_musician boolean,
  role public.user_role
) language sql security definer set search_path = public as $$
  select
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role in ('musician', 'expert') as is_musician,
    p.role
  from public.profiles p
  where
    char_length(trim(search_term)) >= 2
    and (
      p.email ilike ('%' || trim(search_term) || '%')
      or p.full_name ilike ('%' || trim(search_term) || '%')
    )
  limit 10;
$$;
grant execute on function public.search_users_for_sharing(text) to authenticated;
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
           COALESCE(NULLIF(p.full_name, ''), p.email)
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

-- One transactional email per share. The owner's session claims the share
--    (sets email_sent_at) and gets the recipient's details back only when the
--    claim succeeds and the recipient has not opted out. This keeps the email
--    server action idempotent and owner-only.
CREATE OR REPLACE FUNCTION public.claim_recording_share_email(p_recording_id uuid, p_recipient_id uuid)
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
SET search_path = public
AS $$
  WITH claimed AS (
    UPDATE public.recording_shares rs
       SET email_sent_at = now()
     WHERE rs.recording_id = p_recording_id
       AND rs.shared_with_user_id = p_recipient_id
       AND rs.email_sent_at IS NULL
       AND public.is_recording_owner(rs.recording_id, auth.uid())
    RETURNING rs.recording_id, rs.shared_with_user_id
  )
  SELECT rp.email,
         rp.full_name,
         COALESCE(NULLIF(op.full_name, ''), op.email),
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

REVOKE EXECUTE ON FUNCTION public.claim_recording_share_email(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_recording_share_email(uuid, uuid) TO authenticated;
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
