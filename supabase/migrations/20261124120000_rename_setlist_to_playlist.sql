-- #573: rename "setlist" to "playlist" in the schema (the UI has always said "playlist").
--
-- Pure rename: no data is copied or changed, so ids, ordering and RLS behaviour stay identical.
-- Renaming tables/columns/indexes/constraints keeps every dependent object (foreign keys, policy
-- expressions, grants, column privileges) intact. Function bodies are stored as text and policies
-- that call fn_can_edit_setlist reference it by OID, so those are recreated explicitly below.
--
-- No compatibility views: the app is the only client of these tables, and it ships together with
-- this migration. Self-hosted scripts that read setlists/setlist_items must switch to the new names.
-- Old migrations are left untouched on purpose.

-- 1. Tables
ALTER TABLE public.setlists      RENAME TO playlists;
ALTER TABLE public.setlist_items RENAME TO playlist_items;

-- 2. Column
ALTER TABLE public.playlist_items RENAME COLUMN setlist_id TO playlist_id;

-- 3. Constraints and indexes that carry the old name
ALTER TABLE public.playlists      RENAME CONSTRAINT setlists_pkey                    TO playlists_pkey;
ALTER TABLE public.playlists      RENAME CONSTRAINT setlists_owner_id_fkey           TO playlists_owner_id_fkey;
ALTER TABLE public.playlist_items RENAME CONSTRAINT setlist_items_pkey               TO playlist_items_pkey;
ALTER TABLE public.playlist_items RENAME CONSTRAINT setlist_items_setlist_id_fkey    TO playlist_items_playlist_id_fkey;
ALTER TABLE public.playlist_items RENAME CONSTRAINT setlist_items_song_version_id_fkey TO playlist_items_song_version_id_fkey;
-- (the primary-key indexes setlists_pkey / setlist_items_pkey are renamed with their constraints)
ALTER INDEX public.idx_setlists_owner_id              RENAME TO idx_playlists_owner_id;
ALTER INDEX public.idx_setlists_is_public_true        RENAME TO idx_playlists_is_public_true;
ALTER INDEX public.idx_setlist_items_setlist_id       RENAME TO idx_playlist_items_playlist_id;
ALTER INDEX public.idx_setlist_items_song_version_id  RENAME TO idx_playlist_items_song_version_id;

-- 4. Policies on playlists (pure renames, expressions unchanged)
ALTER POLICY "Admins and Gatekeepers can update public setlists" ON public.playlists RENAME TO "Admins and Gatekeepers can update public playlists";
ALTER POLICY "Admins can view all setlists"  ON public.playlists RENAME TO "Admins can view all playlists";
ALTER POLICY "Owners can delete setlists"    ON public.playlists RENAME TO "Owners can delete playlists";
ALTER POLICY "Owners can insert setlists"    ON public.playlists RENAME TO "Owners can insert playlists";
ALTER POLICY "Owners can update setlists"    ON public.playlists RENAME TO "Owners can update playlists";
ALTER POLICY "Owners can view their setlists" ON public.playlists RENAME TO "Owners can view their playlists";
ALTER POLICY "Public setlists visible"       ON public.playlists RENAME TO "Public playlists visible";

-- 5. Policies on playlist_items: the two read policies are only renamed (their EXISTS sub-selects
--    follow the renamed table/column); the three editor policies call the helper, which is replaced.
ALTER POLICY "Guests can read items of public setlists"    ON public.playlist_items RENAME TO "Guests can read items of public playlists";
ALTER POLICY "Users can read items of visible setlists"    ON public.playlist_items RENAME TO "Users can read items of visible playlists";

DROP POLICY "Editors can insert setlist items" ON public.playlist_items;
DROP POLICY "Editors can update setlist items" ON public.playlist_items;
DROP POLICY "Editors can delete setlist items" ON public.playlist_items;

-- 6. Helper function: new name and parameter name, same body and grants
CREATE OR REPLACE FUNCTION public.fn_can_edit_playlist(p_playlist_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.playlists s
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    WHERE s.id = p_playlist_id
      AND (
        s.owner_id = auth.uid()
        OR p.role = 'admin'::public.user_role
        OR (s.is_public AND p.role = 'gatekeeper'::public.user_role)
      )
  );
$function$

;

REVOKE ALL ON FUNCTION public.fn_can_edit_playlist(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_can_edit_playlist(uuid) TO authenticated, service_role;

CREATE POLICY "Editors can insert playlist items"
ON public.playlist_items FOR INSERT
TO authenticated
WITH CHECK (public.fn_can_edit_playlist(playlist_id));

CREATE POLICY "Editors can update playlist items"
ON public.playlist_items FOR UPDATE
TO authenticated
USING (public.fn_can_edit_playlist(playlist_id))
WITH CHECK (public.fn_can_edit_playlist(playlist_id));

CREATE POLICY "Editors can delete playlist items"
ON public.playlist_items FOR DELETE
TO authenticated
USING (public.fn_can_edit_playlist(playlist_id));

DROP FUNCTION public.fn_can_edit_setlist(uuid);

-- 7. Functions whose bodies read the renamed tables (text bodies are not rewritten by RENAME).
--    Signatures, SECURITY DEFINER, search_path and grants are unchanged (CREATE OR REPLACE keeps ACLs).
CREATE OR REPLACE FUNCTION public.fn_song_link_summary(p_source uuid, p_target uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  WITH s AS (SELECT * FROM public.compositions WHERE id = p_source),
       t AS (SELECT * FROM public.compositions WHERE id = p_target),
       sv AS (SELECT id, catalog_source_id FROM public.song_versions WHERE composition_id = p_source),
       fav_items AS (
         SELECT si.playlist_id, v.composition_id
         FROM public.playlist_items si
         JOIN public.playlists sl ON sl.id = si.playlist_id AND sl.title = 'My Favorites'
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
      SELECT count(*) FROM public.playlist_items si
      JOIN public.playlists sl ON sl.id = si.playlist_id
      WHERE si.song_version_id IN (SELECT id FROM sv) AND sl.title <> 'My Favorites'
    ),
    'favourites', (SELECT count(DISTINCT playlist_id) FROM fav_items WHERE composition_id = p_source),
    'favourites_merged', (
      SELECT count(*) FROM (
        SELECT playlist_id FROM fav_items GROUP BY playlist_id HAVING count(DISTINCT composition_id) = 2
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
$function$

;

CREATE OR REPLACE FUNCTION public.fn_link_song_as_version(p_source uuid, p_target uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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

  DELETE FROM public.playlist_items si
  USING (
    SELECT i.id, row_number() OVER (PARTITION BY i.playlist_id ORDER BY i.order_index, i.created_at, i.id) AS rn
    FROM public.playlist_items i
    JOIN public.playlists sl ON sl.id = i.playlist_id AND sl.title = 'My Favorites'
    JOIN public.song_versions v ON v.id = i.song_version_id AND v.composition_id = v_target
  ) dup
  WHERE si.id = dup.id AND dup.rn > 1;

  UPDATE public.playlist_items si
  SET song_version_id = v_first_version
  FROM public.playlists sl, public.song_versions v
  WHERE sl.id = si.playlist_id AND sl.title = 'My Favorites'
    AND v.id = si.song_version_id AND v.composition_id = v_target
    AND si.song_version_id <> v_first_version;

  INSERT INTO public.song_link_audit (actor_id, source_id, target_id, source_title, target_title, summary)
  VALUES (auth.uid(), p_source, v_target, v_source.title, v_target_row.title, v_summary);

  RETURN v_summary;
END;
$function$

;

-- 8. Safety net: abort (and roll back) if anything in the public schema still carries the old name.
DO $$
DECLARE
  v_left text;
BEGIN
  SELECT string_agg(s.hit, ', ') INTO v_left FROM (
    SELECT 'relation ' || c.relname AS hit
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname ILIKE '%setlist%'
    UNION ALL
    SELECT 'column ' || table_name || '.' || column_name
      FROM information_schema.columns
     WHERE table_schema = 'public' AND column_name ILIKE '%setlist%'
    UNION ALL
    SELECT 'constraint ' || conname FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
     WHERE n.nspname = 'public' AND (conname ILIKE '%setlist%' OR pg_get_constraintdef(c.oid) ILIKE '%setlist%')
    UNION ALL
    SELECT 'function ' || p.proname
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND (p.proname ILIKE '%setlist%' OR p.prosrc ILIKE '%setlist%' OR pg_get_function_arguments(p.oid) ILIKE '%setlist%')
    UNION ALL
    SELECT 'policy ' || tablename || '.' || policyname
      FROM pg_policies
     WHERE schemaname = 'public'
       AND (policyname ILIKE '%setlist%' OR tablename ILIKE '%setlist%' OR qual ILIKE '%setlist%' OR with_check ILIKE '%setlist%')
  ) s;
  IF v_left IS NOT NULL THEN
    RAISE EXCEPTION 'setlist -> playlist rename incomplete: %', v_left;
  END IF;
END $$;
