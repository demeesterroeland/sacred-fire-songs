/*
 **Version:** 2.6
 **Status:** Current
 **Date:** February 27, 2026
 
 ## Usage
 This script provides a complete setup for the "Sacred Fire Songs" database. 
 It consolidates the initial schema and all subsequent migrations up to Feb 27, 2026.
 (v2.6: Added partial indexes for is_public and alphabetical title index).
 (v2.4: Added tuning to song_versions).
 Run this in the Supabase SQL Editor to initialize a fresh database.
 */
-- Enable necessary extensions
create extension if not exists "uuid-ossp";
-- 1. Create ENUMs
create type user_role as enum ('admin', 'musician', 'member');
-- 2. Create Tables
-- PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role user_role default 'member',
  full_name text,
  avatar_url text,
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
  icon_name text,
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
-- 3. Indexes
-- Partial indexes for public content optimization
CREATE INDEX IF NOT EXISTS idx_compositions_is_public_true ON public.compositions (created_at DESC)
WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_setlists_is_public_true ON public.setlists (created_at DESC)
WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_compositions_title_alphabetical ON public.compositions (title ASC)
WHERE is_public = true;
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
-- Public Read Policies
create policy "Allow public read access" on public.categories for
select to public using (true);
create policy "Public compositions are viewable by everyone" on public.compositions for
select using (is_public = true);
create policy "Owners can view their own songs" on public.compositions for
select to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Public versions are viewable by everyone" on public.song_versions for
select using (
    exists (
      select 1
      from public.compositions c
      where c.id = song_versions.composition_id
        and c.is_public = true
    )
  );
create policy "Owners can view their own song versions" on public.song_versions for
select to authenticated using (
    exists (
      select 1
      from public.compositions c
      where c.id = song_versions.composition_id
        and c.owner_id = (
          select auth.uid()
        )
    )
  );
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
-- Compositions: Public creation (Mock Mode compatibility)
-- create policy "Authenticated users can create compositions" on public.compositions for insert to authenticated with check ((select auth.role()) = 'authenticated');
create policy "Allow public insert compositions" on public.compositions for
insert to public with check (true);
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
create policy "Allow public update compositions" on public.compositions for
update to public using (true);
create policy "Allow public delete compositions" on public.compositions for delete to public using (true);
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