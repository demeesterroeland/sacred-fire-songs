-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
-- 1. Create ENUMs
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'user_role'
) THEN CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');
END IF;
IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'category_type'
) THEN CREATE TYPE category_type AS ENUM ('Theme', 'Rhythm', 'Origin');
END IF;
END $$;
-- 2. Create Tables
-- PROFILES (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role user_role default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- CATEGORIES (Tags)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid default extensions.uuid_generate_v4() primary key,
  name text not null,
  type category_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- COMPOSITIONS (Parent Song)
CREATE TABLE IF NOT EXISTS public.compositions (
  id uuid default extensions.uuid_generate_v4() primary key,
  title text not null,
  original_author text,
  primary_language text default 'ES',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- COMPOSITION_CATEGORY (Join Table)
CREATE TABLE IF NOT EXISTS public.composition_categories (
  composition_id uuid references public.compositions(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (composition_id, category_id)
);
-- SONG_VERSIONS (The actual playable content)
CREATE TABLE IF NOT EXISTS public.song_versions (
  id uuid default extensions.uuid_generate_v4() primary key,
  composition_id uuid references public.compositions(id) on delete cascade not null,
  version_name text default 'Standard',
  content_chordpro text not null,
  melody_notation text,
  -- ABC Notation
  key text,
  capo integer default 0,
  audio_url text,
  contributor_id uuid references public.profiles(id),
  vote_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- SETLISTS
CREATE TABLE IF NOT EXISTS public.setlists (
  id uuid default extensions.uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- SETLIST ITEMS
CREATE TABLE IF NOT EXISTS public.setlist_items (
  id uuid default extensions.uuid_generate_v4() primary key,
  setlist_id uuid references public.setlists(id) on delete cascade not null,
  song_version_id uuid references public.song_versions(id) on delete cascade not null,
  order_index integer not null,
  transposition_override integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 3. Row Level Security (RLS) Policies
-- This ensures security (e.g., only admins can delete songs)
alter table public.profiles enable row level security;
alter table public.compositions enable row level security;
alter table public.song_versions enable row level security;
-- Policy: Everyone can read songs
DROP POLICY IF EXISTS "Public compositions are viewable by everyone" ON public.compositions;
create policy "Public compositions are viewable by everyone" on public.compositions for
select using (true);
DROP POLICY IF EXISTS "Public versions are viewable by everyone" ON public.song_versions;
create policy "Public versions are viewable by everyone" on public.song_versions for
select using (true);
-- Policy: Only authenticated users can insert (for Phase 2)
DROP POLICY IF EXISTS "Users can insert versions" ON public.song_versions;
create policy "Users can insert versions" on public.song_versions for
insert with check (auth.uid() = contributor_id);