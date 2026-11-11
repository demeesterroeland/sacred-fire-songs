-- Migration: Songbook data model (Story 6.2.1, #504)
-- Date: 2026-11-11
--
-- Gives song collections compiled from printed songbooks a place in the database,
-- so an external importer can store them without losing information.
-- Purely additive: every new column is nullable or has a default, and no existing
-- column, policy or query changes. Safe to run more than once.
--
-- public.compositions
--   * catalog_slug  stable external id of the song (unique when set)
--   * aliases       other titles the song is known by
--   * authors       every author; original_author stays the display text
-- public.song_versions
--   * catalog_source_id  external id of the version within its song (usually the songbook id);
--                        unique per song, so an importer can upsert on (composition_id, catalog_source_id)
--   * version_kind       'original' | 'variant' | 'translation' (default 'original')
--   * beats, song_note   per-book musical data; key and capo reuse the existing columns
-- public.songbooks             one row per source book, keyed by its external id
-- public.song_version_sources  version -> songbook, with original title, page, source file, is_primary
-- public.song_translations     one translation per song and language
--
-- Access: the new tables are readable when their song is readable (the subqueries
-- below run with the caller's row-level security, so they follow the compositions and
-- song_versions read rules) and are written by admins only. Importers may also use
-- service_role, which bypasses row-level security.

-- 1. Songs
ALTER TABLE public.compositions
  ADD COLUMN IF NOT EXISTS catalog_slug text UNIQUE CHECK (btrim(catalog_slug) <> ''),
  ADD COLUMN IF NOT EXISTS aliases text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS authors text[] NOT NULL DEFAULT '{}';

-- 2. Versions
ALTER TABLE public.song_versions
  ADD COLUMN IF NOT EXISTS catalog_source_id text CHECK (btrim(catalog_source_id) <> ''),
  ADD COLUMN IF NOT EXISTS version_kind text NOT NULL DEFAULT 'original'
    CHECK (version_kind IN ('original', 'variant', 'translation')),
  ADD COLUMN IF NOT EXISTS beats text,
  ADD COLUMN IF NOT EXISTS song_note text;

CREATE UNIQUE INDEX IF NOT EXISTS song_versions_composition_catalog_source_key
  ON public.song_versions (composition_id, catalog_source_id);

-- Contributors and admins may edit the musical data like key and capo. The catalog
-- key stays with whoever imports (admins insert it, service_role may change it).
GRANT UPDATE (version_kind, beats, song_note) ON public.song_versions TO authenticated;

-- 3. Songbooks
CREATE TABLE IF NOT EXISTS public.songbooks (
  id text PRIMARY KEY CHECK (btrim(id) <> ''),
  title text NOT NULL,
  short_name text,
  compiler text,
  community text,
  year integer CHECK (year BETWEEN 1 AND 9999),
  languages text[] NOT NULL DEFAULT '{}',
  attribution text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Version sources
CREATE TABLE IF NOT EXISTS public.song_version_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_version_id uuid NOT NULL REFERENCES public.song_versions(id) ON DELETE CASCADE,
  songbook_id text NOT NULL REFERENCES public.songbooks(id) ON UPDATE CASCADE ON DELETE CASCADE,
  original_title text,
  page text,
  source_file text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (song_version_id, songbook_id)
);

CREATE INDEX IF NOT EXISTS idx_song_version_sources_songbook_id ON public.song_version_sources (songbook_id);
CREATE UNIQUE INDEX IF NOT EXISTS song_version_sources_one_primary
  ON public.song_version_sources (song_version_id) WHERE is_primary;

-- 5. Translations
CREATE TABLE IF NOT EXISTS public.song_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  composition_id uuid NOT NULL REFERENCES public.compositions(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$'),
  title text,
  lyrics text,
  translator text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (composition_id, language)
);

-- 6. Privileges: guests read; signed-in users read and (admins only, by policy) write.
REVOKE ALL ON public.songbooks, public.song_version_sources, public.song_translations FROM anon, authenticated;
GRANT SELECT ON public.songbooks, public.song_version_sources, public.song_translations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.songbooks, public.song_version_sources, public.song_translations TO authenticated;
GRANT ALL ON public.songbooks, public.song_version_sources, public.song_translations TO service_role;

-- 7. Row-level security
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
