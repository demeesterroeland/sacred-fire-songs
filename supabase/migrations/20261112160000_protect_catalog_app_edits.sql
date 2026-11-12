-- Migration: Protect in-app edits of catalog songs from re-import (Story 6.2.21, #524)
-- Date: 2026-11-12
--
-- An importer updates the catalog rows it owns on every run, so a correction made in the app
-- would be overwritten. This migration marks every catalog song and version that is corrected
-- in the app, so an importer that follows the contract in docs/guides/importing-songbooks.md
-- skips it and reports it, and admins can export the corrections to take them over into the
-- external catalog.
--
-- Markers (both tables): edited_in_app (boolean), edited_at (last app edit), edited_fields
-- (every tracked column changed in the app since the marker was last cleared, sorted).
--
-- What counts as an app edit (trigger trg_track_catalog_edit, BEFORE UPDATE):
--   * the row has a catalog key: compositions.catalog_slug / song_versions.catalog_source_id;
--     a version without its own catalog_source_id is never marked, even on a catalog song;
--   * the writer is a signed-in app user: the request's JWT role (auth.role()) is
--     'authenticated'. That includes SECURITY DEFINER functions an app user calls (they run as
--     their owner, but the request is still the user's), e.g. linking a song as a version of
--     another song moves catalog versions and merges aliases/authors: those changes are the
--     gatekeeper's or admin's decision, so they are marked;
--   * NOT an importer (service_role) and NOT a data migration or another direct database
--     session without a signed-in user (no JWT role): they are the catalog's own writes;
--   * a tracked column actually changed (IS DISTINCT FROM); saving without a change, or a
--     change to an untracked column, marks nothing.
-- Tracked columns: the catalog content an importer writes.
--   compositions:  title, original_author, aliases, authors
--   song_versions: version_name, content_chordpro, melody_notation, key, capo, tuning,
--                  soundcloud_url, youtube_url, spotify_url, version_kind, beats, song_note,
--                  composition_id (the version was moved to another song)
--   Not tracked: derived or app-only columns (has_chords, has_melody, is_public, owner_id,
--   vote_count, contributor_id), and the catalog keys themselves (guarded by
--   trg_guard_catalog_slug / trg_guard_catalog_source_id). Songbook sources and translations are
--   admin-only tables and are not tracked (see the importer guide).
-- Inserts are not marked: a new row is not a correction of an imported one.
--
-- Tampering: API callers (current_user anon / authenticated) cannot set or clear the markers;
-- the trigger restores them (defaults on insert). Admins clear a marker with
-- fn_clear_catalog_edit (once the external catalog has the correction); importers running as
-- service_role may clear it with plain SQL (see the importer guide).
--
-- Export: fn_catalog_edits_export() returns every marked song and version as JSON with its
-- catalog keys, edited_at, the edited fields and their current values. Admins only (42501);
-- guests cannot execute it at all.
--
-- The trigger is named so it runs after the catalog guards (BEFORE triggers fire in name order).
-- Safe to run more than once.

-- 1. Markers
ALTER TABLE public.compositions
  ADD COLUMN IF NOT EXISTS edited_in_app boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS edited_fields text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.song_versions
  ADD COLUMN IF NOT EXISTS edited_in_app boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS edited_fields text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_compositions_edited_in_app
  ON public.compositions (edited_at DESC) WHERE edited_in_app;
CREATE INDEX IF NOT EXISTS idx_song_versions_edited_in_app
  ON public.song_versions (edited_at DESC) WHERE edited_in_app;

-- 2. Trigger: TG_ARGV[0] is the catalog key column, the other arguments the tracked columns.
CREATE OR REPLACE FUNCTION public.fn_track_catalog_edit() RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  new_row jsonb := to_jsonb(NEW);
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

  -- Only updates of catalog rows by a signed-in app user count.
  IF TG_OP <> 'UPDATE'
     OR coalesce(auth.role(), '') <> 'authenticated'
     OR new_row ->> TG_ARGV[0] IS NULL THEN
    RETURN NEW;
  END IF;

  old_row := to_jsonb(OLD);
  FOR i IN 1 .. TG_NARGS - 1 LOOP
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

-- 3. Export (admins only): every marked song and version with its catalog keys and the current
--    values of its edited fields.
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
      WHERE c.edited_in_app AND c.catalog_slug IS NOT NULL
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
          'values', (SELECT coalesce(jsonb_object_agg(f, to_jsonb(v) -> f), '{}'::jsonb)
                     FROM unnest(v.edited_fields) AS f)
        ) ORDER BY v.edited_at DESC, c.catalog_slug, v.catalog_source_id)
      FROM public.song_versions v
      JOIN public.compositions c ON c.id = v.composition_id
      WHERE v.edited_in_app AND v.catalog_source_id IS NOT NULL
    ), '[]'::jsonb)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.fn_catalog_edits_export() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_catalog_edits_export() TO authenticated, service_role;

-- 4. Clear a marker (admins only), once the external catalog has taken the correction over.
--    p_kind is 'song' or 'version'. Returns whether a marked row was cleared.
CREATE OR REPLACE FUNCTION public.fn_clear_catalog_edit(p_kind text, p_id uuid) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  cleared integer;
BEGIN
  IF NOT public.fn_is_admin() THEN
    RAISE EXCEPTION 'Only admins can clear catalog edits' USING ERRCODE = '42501';
  END IF;

  IF p_kind = 'song' THEN
    UPDATE public.compositions
       SET edited_in_app = false, edited_at = NULL, edited_fields = '{}'
     WHERE id = p_id AND edited_in_app;
  ELSIF p_kind = 'version' THEN
    UPDATE public.song_versions
       SET edited_in_app = false, edited_at = NULL, edited_fields = '{}'
     WHERE id = p_id AND edited_in_app;
  ELSE
    RAISE EXCEPTION 'Unknown kind %', p_kind USING ERRCODE = '22023';
  END IF;

  GET DIAGNOSTICS cleared = ROW_COUNT;
  RETURN cleared > 0;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_clear_catalog_edit(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_clear_catalog_edit(text, uuid) TO authenticated, service_role;
