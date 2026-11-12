-- Migration: Link a song as a version of another song (Story 6.2.9, #512)
-- Date: 2026-11-12
--
-- Imports and members create duplicates: the same song under another title or spelling.
-- A gatekeeper or admin links the duplicate (source) as a version of the song that stays
-- (target). Who may link (owner decision, Nov 12, 2026):
--
--   * admins link any song; a gatekeeper only links songs they own: the source AND the
--     target have owner_id = auth.uid() (42501 "Gatekeepers can only link songs they own")
--   * both songs must have the same visibility, for everyone, admins included: a public
--     song is never merged into a private one or the other way round (22023 "Both songs
--     must be public, or both private")
--
-- One SECURITY DEFINER function does the whole merge in one transaction:
--
--   * the source's versions move to the target (an 'original' becomes a 'variant', so the
--     target's original stays first); recordings and playlist items point at versions, so
--     they follow without changes
--   * categories, song views and translations are merged; notifications are re-pointed
--   * the target's aliases gain the source title (and its aliases); authors are merged
--   * favourites are song level: every "My Favorites" item of the target points at the
--     target's first version again, and a member who had favourited both songs keeps one
--   * catalog keys: the target keeps its own catalog_slug; when it has none it takes the
--     source's. A source slug that is not moved stays on the redirect, so an importer that
--     looks the slug up (fn_song_id_for_catalog_slug) finds the target and does not
--     re-create the source. A moved version whose catalog_source_id the target already has
--     keeps its content but loses the key (unique per song): the target's version stays
--     the one the importer updates
--   * the catalog guard triggers (trg_guard_catalog_slug, trg_guard_catalog_source_id:
--     admin-only for anon / authenticated callers) do not fire for this function: it runs
--     as its owner (postgres), which the guards treat as a trusted importer context. So a
--     gatekeeper's link deliberately moves catalog keys (the source's catalog_slug onto a
--     target that has none, a colliding catalog_source_id cleared). The risk is low: the
--     values only ever come from the source song itself (no caller input reaches a
--     catalog column), so a gatekeeper cannot pre-claim a new key, only keep an existing
--     one reachable on the song that stays
--   * the source song is deleted and composition_redirects sends its old id to the target;
--     redirects that pointed at the source now point at the target (chains collapse)
--   * song_link_audit records who linked what, with the summary of what moved
--
-- fn_preview_song_link returns the same summary without changing anything, for the
-- confirm dialog. There is no undo (docs/design/application-analysis&design.md §6.19,
-- "Confirm, not undo"): the confirm dialog shows the preview first and the audit entry
-- keeps the record.
-- Safe to run more than once.

-- 1. Redirects: old song id -> the song it was linked into
CREATE TABLE IF NOT EXISTS public.composition_redirects (
  old_id uuid PRIMARY KEY,
  new_id uuid NOT NULL REFERENCES public.compositions(id) ON DELETE CASCADE,
  -- The source's catalog slug when the target kept its own (an importer resolves it here).
  catalog_slug text UNIQUE
    CONSTRAINT composition_redirects_catalog_slug_check CHECK (catalog_slug <> '' AND catalog_slug = btrim(catalog_slug)),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT composition_redirects_not_self CHECK (old_id <> new_id)
);
CREATE INDEX IF NOT EXISTS idx_composition_redirects_new_id ON public.composition_redirects (new_id);

ALTER TABLE public.composition_redirects ENABLE ROW LEVEL SECURITY;
-- A redirect is readable exactly when its target song is (the compositions policies of the
-- caller apply inside EXISTS): a guest never learns that a private song took over an old id.
DROP POLICY IF EXISTS "Song redirects are readable by everyone" ON public.composition_redirects;
DROP POLICY IF EXISTS "Song redirects follow the target song" ON public.composition_redirects;
CREATE POLICY "Song redirects follow the target song" ON public.composition_redirects
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.compositions c WHERE c.id = new_id));
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.composition_redirects FROM anon, authenticated;
GRANT SELECT ON public.composition_redirects TO anon, authenticated;

-- 2. Audit: one row per link, written by fn_link_song_as_version only
CREATE TABLE IF NOT EXISTS public.song_link_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  source_id uuid NOT NULL,
  target_id uuid NOT NULL,
  source_title text NOT NULL,
  target_title text NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_song_link_audit_created ON public.song_link_audit (created_at DESC);

ALTER TABLE public.song_link_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gatekeepers and admins read the song link audit" ON public.song_link_audit;
CREATE POLICY "Gatekeepers and admins read the song link audit" ON public.song_link_audit
  FOR SELECT TO authenticated
  USING ((SELECT role::text FROM public.profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'gatekeeper'));
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.song_link_audit FROM anon, authenticated;
REVOKE ALL ON public.song_link_audit FROM anon;
GRANT SELECT ON public.song_link_audit TO authenticated;

-- 3. Checks shared by preview and link. Returns the target id after following a redirect.
CREATE OR REPLACE FUNCTION public.fn_assert_can_link_song(p_source uuid, p_target uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_target uuid;
  v_source public.compositions%ROWTYPE;
  v_target_row public.compositions%ROWTYPE;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = v_uid;
  IF v_uid IS NULL OR v_role IS NULL OR v_role NOT IN ('admin', 'gatekeeper') THEN
    RAISE EXCEPTION 'Only gatekeepers and admins can link songs' USING ERRCODE = '42501';
  END IF;

  IF p_source IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION 'Pick the song to link and the song to link it to' USING ERRCODE = '22023';
  END IF;

  -- A target that was itself linked earlier stands for the song it now lives in.
  SELECT r.new_id INTO v_target FROM public.composition_redirects r WHERE r.old_id = p_target;
  v_target := coalesce(v_target, p_target);

  IF p_source = v_target THEN
    RAISE EXCEPTION 'A song cannot be linked to itself' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_source FROM public.compositions WHERE id = p_source;
  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.composition_redirects WHERE old_id = p_source) THEN
      RAISE EXCEPTION 'This song is already linked to another song' USING ERRCODE = '22023';
    END IF;
    RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_target_row FROM public.compositions WHERE id = v_target;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_role <> 'admin' THEN
    -- A song the gatekeeper cannot read (private, someone else's) stays "not found".
    IF NOT ((v_source.is_public IS TRUE OR v_source.owner_id = v_uid)
            AND (v_target_row.is_public IS TRUE OR v_target_row.owner_id = v_uid)) THEN
      RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
    END IF;
    -- Gatekeepers only link songs they own, both of them; admins link any song.
    IF v_source.owner_id IS DISTINCT FROM v_uid OR v_target_row.owner_id IS DISTINCT FROM v_uid THEN
      RAISE EXCEPTION 'Gatekeepers can only link songs they own' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- For everyone: a public song is never merged into a private one, or the other way round.
  IF coalesce(v_source.is_public, false) <> coalesce(v_target_row.is_public, false) THEN
    RAISE EXCEPTION 'Both songs must be public, or both private' USING ERRCODE = '22023';
  END IF;

  RETURN v_target;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_assert_can_link_song(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Titles and aliases without blanks or duplicates (case-insensitive), first spelling wins,
-- and never the song's own title.
CREATE OR REPLACE FUNCTION public.fn_merge_song_names(p_names text[], p_exclude text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT coalesce(array_agg(nm ORDER BY ord), '{}')
  FROM (
    SELECT DISTINCT ON (lower(btrim(u.nm))) btrim(u.nm) AS nm, u.ord
    FROM unnest(p_names) WITH ORDINALITY AS u(nm, ord)
    WHERE u.nm IS NOT NULL
      AND btrim(u.nm) <> ''
      AND lower(btrim(u.nm)) IS DISTINCT FROM lower(btrim(coalesce(p_exclude, '')))
    ORDER BY lower(btrim(u.nm)), u.ord
  ) d;
$$;
REVOKE ALL ON FUNCTION public.fn_merge_song_names(text[], text) FROM PUBLIC, anon, authenticated;

-- What a link would move (no checks: callers check first).
CREATE OR REPLACE FUNCTION public.fn_song_link_summary(p_source uuid, p_target uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH s AS (SELECT * FROM public.compositions WHERE id = p_source),
       t AS (SELECT * FROM public.compositions WHERE id = p_target),
       sv AS (SELECT id, catalog_source_id FROM public.song_versions WHERE composition_id = p_source),
       fav_items AS (
         SELECT si.setlist_id, v.composition_id
         FROM public.setlist_items si
         JOIN public.setlists sl ON sl.id = si.setlist_id AND sl.title = 'My Favorites'
         JOIN public.song_versions v ON v.id = si.song_version_id
         WHERE v.composition_id IN (p_source, p_target)
       )
  SELECT jsonb_build_object(
    'source_id', s.id,
    'source_title', s.title,
    'target_id', t.id,
    'target_title', t.title,
    'versions', (SELECT count(*) FROM sv),
    'recordings', (SELECT count(*) FROM public.user_recordings r WHERE r.song_version_id IN (SELECT id FROM sv)),
    'playlist_items', (
      SELECT count(*) FROM public.setlist_items si
      JOIN public.setlists sl ON sl.id = si.setlist_id
      WHERE si.song_version_id IN (SELECT id FROM sv) AND sl.title <> 'My Favorites'
    ),
    'favourites', (SELECT count(DISTINCT setlist_id) FROM fav_items WHERE composition_id = p_source),
    'favourites_merged', (
      SELECT count(*) FROM (
        SELECT setlist_id FROM fav_items GROUP BY setlist_id HAVING count(DISTINCT composition_id) = 2
      ) both_songs
    ),
    'categories_added', (
      SELECT count(*) FROM public.song_category_map m
      WHERE m.song_id = p_source
        AND NOT EXISTS (SELECT 1 FROM public.song_category_map mt WHERE mt.song_id = p_target AND mt.category_id = m.category_id)
    ),
    'aliases_added', to_jsonb(ARRAY(
      SELECT a FROM unnest(public.fn_merge_song_names(t.aliases || s.title || s.aliases, t.title)) AS a
      WHERE lower(a) NOT IN (SELECT lower(btrim(x)) FROM unnest(t.aliases) AS x WHERE x IS NOT NULL)
    )),
    'catalog_slug', CASE
      WHEN s.catalog_slug IS NULL THEN 'none'
      WHEN t.catalog_slug IS NULL THEN 'moved'
      ELSE 'redirect'
    END,
    'catalog_keys_cleared', (
      SELECT count(*) FROM sv
      WHERE sv.catalog_source_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.song_versions tv
          WHERE tv.composition_id = p_target AND tv.catalog_source_id = sv.catalog_source_id
        )
    ),
    'translations', (SELECT count(*) FROM public.song_translations tr WHERE tr.composition_id = p_source)
  )
  FROM s, t;
$$;
REVOKE ALL ON FUNCTION public.fn_song_link_summary(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- 4. Preview for the confirm dialog: same checks, nothing changes.
CREATE OR REPLACE FUNCTION public.fn_preview_song_link(p_source uuid, p_target uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN public.fn_song_link_summary(p_source, public.fn_assert_can_link_song(p_source, p_target));
END;
$$;
-- Signed-in callers only: the checks need auth.uid() (a service_role call has none and is
-- refused with 42501), so there is no service_role grant. Importers do not merge; they
-- resolve slugs with fn_song_id_for_catalog_slug.
REVOKE ALL ON FUNCTION public.fn_preview_song_link(uuid, uuid) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_preview_song_link(uuid, uuid) TO authenticated;

-- 5. The link itself, in one transaction.
CREATE OR REPLACE FUNCTION public.fn_link_song_as_version(p_source uuid, p_target uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_target uuid;
  v_source public.compositions%ROWTYPE;
  v_target_row public.compositions%ROWTYPE;
  v_summary jsonb;
  v_first_version uuid;
  v_slug_moves boolean;
BEGIN
  v_target := public.fn_assert_can_link_song(p_source, p_target);

  -- Lock both songs in a stable order, so two links that cross cannot deadlock.
  PERFORM 1 FROM public.compositions WHERE id IN (p_source, v_target) ORDER BY id FOR UPDATE;
  -- A concurrent link may have committed while this one waited for the locks: check again
  -- on the rows as they are now, so the caller hears "already linked", not "not found".
  IF public.fn_assert_can_link_song(p_source, p_target) IS DISTINCT FROM v_target THEN
    RAISE EXCEPTION 'This song is already linked to another song' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_source FROM public.compositions WHERE id = p_source;
  SELECT * INTO v_target_row FROM public.compositions WHERE id = v_target;
  IF v_source.id IS NULL OR v_target_row.id IS NULL THEN
    RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
  END IF;

  v_summary := public.fn_song_link_summary(p_source, v_target);
  v_slug_moves := v_source.catalog_slug IS NOT NULL AND v_target_row.catalog_slug IS NULL;

  -- Versions: a catalog key the target already has stays with the target's version.
  UPDATE public.song_versions sv
  SET catalog_source_id = NULL
  WHERE sv.composition_id = p_source
    AND sv.catalog_source_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.song_versions tv
      WHERE tv.composition_id = v_target AND tv.catalog_source_id = sv.catalog_source_id
    );
  -- The moved versions are versions of the target now: an 'original' becomes a 'variant', so the
  -- target's own original stays the first version (lib/songs/versionOrder.ts); translations stay translations.
  UPDATE public.song_versions
  SET composition_id = v_target,
      version_kind = CASE WHEN version_kind = 'original' THEN 'variant' ELSE version_kind END
  WHERE composition_id = p_source;

  -- Categories, views, translations, notifications.
  INSERT INTO public.song_category_map (song_id, category_id)
  SELECT v_target, m.category_id FROM public.song_category_map m WHERE m.song_id = p_source
  ON CONFLICT DO NOTHING;

  INSERT INTO public.song_views (user_id, song_id, viewed_at)
  SELECT sv.user_id, v_target, sv.viewed_at FROM public.song_views sv WHERE sv.song_id = p_source
  ON CONFLICT (user_id, song_id) DO UPDATE
    SET viewed_at = greatest(public.song_views.viewed_at, EXCLUDED.viewed_at);

  -- A language the target already has keeps the target's text; empty fields are filled in.
  UPDATE public.song_translations t
  SET title = coalesce(t.title, s.title),
      lyrics = coalesce(t.lyrics, s.lyrics),
      translator = coalesce(t.translator, s.translator)
  FROM public.song_translations s
  WHERE t.composition_id = v_target AND s.composition_id = p_source AND s.language = t.language;
  UPDATE public.song_translations s
  SET composition_id = v_target
  WHERE s.composition_id = p_source
    AND NOT EXISTS (
      SELECT 1 FROM public.song_translations t WHERE t.composition_id = v_target AND t.language = s.language
    );

  UPDATE public.notifications SET composition_id = v_target WHERE composition_id = p_source;

  -- Redirects that led to the source now lead to the target (chains collapse), before the
  -- source is deleted (its redirects would cascade away).
  UPDATE public.composition_redirects SET new_id = v_target WHERE new_id = p_source;

  -- The source goes (the rows still on it are copies of what moved). Its slug is free now.
  DELETE FROM public.compositions WHERE id = p_source;

  INSERT INTO public.composition_redirects (old_id, new_id, catalog_slug)
  VALUES (p_source, v_target, CASE WHEN v_slug_moves THEN NULL ELSE v_source.catalog_slug END);

  UPDATE public.compositions c
  SET aliases = public.fn_merge_song_names(c.aliases || v_source.title || v_source.aliases, c.title),
      authors = public.fn_merge_song_names(c.authors || v_source.authors, NULL),
      original_author = coalesce(nullif(btrim(c.original_author), ''), v_source.original_author),
      catalog_slug = CASE WHEN v_slug_moves THEN v_source.catalog_slug ELSE c.catalog_slug END,
      has_chords = coalesce(c.has_chords, false) OR coalesce(v_source.has_chords, false),
      has_melody = coalesce(c.has_melody, false) OR coalesce(v_source.has_melody, false)
  WHERE c.id = v_target;

  -- Favourites are per song: one item per member, on the target's first version (the one
  -- the heart toggles: original, variants, translations; each oldest first, lib/songs/versionOrder.ts).
  SELECT id INTO v_first_version FROM public.song_versions
  WHERE composition_id = v_target
  ORDER BY CASE version_kind WHEN 'variant' THEN 1 WHEN 'translation' THEN 2 ELSE 0 END, created_at NULLS LAST, id
  LIMIT 1;

  DELETE FROM public.setlist_items si
  USING (
    SELECT i.id, row_number() OVER (PARTITION BY i.setlist_id ORDER BY i.order_index, i.created_at, i.id) AS rn
    FROM public.setlist_items i
    JOIN public.setlists sl ON sl.id = i.setlist_id AND sl.title = 'My Favorites'
    JOIN public.song_versions v ON v.id = i.song_version_id AND v.composition_id = v_target
  ) dup
  WHERE si.id = dup.id AND dup.rn > 1;

  UPDATE public.setlist_items si
  SET song_version_id = v_first_version
  FROM public.setlists sl, public.song_versions v
  WHERE sl.id = si.setlist_id AND sl.title = 'My Favorites'
    AND v.id = si.song_version_id AND v.composition_id = v_target
    AND si.song_version_id <> v_first_version;

  INSERT INTO public.song_link_audit (actor_id, source_id, target_id, source_title, target_title, summary)
  VALUES (auth.uid(), p_source, v_target, v_source.title, v_target_row.title, v_summary);

  RETURN v_summary;
END;
$$;
-- Signed-in callers only (see fn_preview_song_link): no service_role grant.
REVOKE ALL ON FUNCTION public.fn_link_song_as_version(uuid, uuid) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_link_song_as_version(uuid, uuid) TO authenticated;

-- 6. Importers: the song a catalog slug stands for, also after it was linked away.
CREATE OR REPLACE FUNCTION public.fn_song_id_for_catalog_slug(p_slug text)
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(
    (SELECT id FROM public.compositions WHERE catalog_slug = p_slug),
    (SELECT new_id FROM public.composition_redirects WHERE catalog_slug = p_slug)
  );
$$;
REVOKE ALL ON FUNCTION public.fn_song_id_for_catalog_slug(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_song_id_for_catalog_slug(text) TO authenticated, service_role;
