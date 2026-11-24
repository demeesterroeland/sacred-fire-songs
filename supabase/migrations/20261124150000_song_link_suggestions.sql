-- Migration: Members suggest that a song is a version of another song (Story 6.2.26 / G1.5, #598)
-- Date: 2026-11-24
--
-- Members often spot duplicates first, but a link (fn_link_song_as_version, #512) has no undo, so
-- members suggest and gatekeepers / admins decide. Owner decisions (issue #598, Nov 24, 2026):
--
--   * a gatekeeper or admin REVIEWS EVERY suggestion, also on songs they own neither; accepting a
--     suggestion links the songs as the reviewer. A direct link (#512) still needs ownership for a
--     gatekeeper (fn_assert_can_link_song is unchanged)
--   * anyone signed in who is not a gatekeeper or admin may suggest; gatekeepers and admins review
--     or link directly instead of suggesting
--   * public songs only in v1: a suggestion between a public and a private song, or between two
--     private songs, is refused
--   * one open suggestion per pair of songs, in either direction; a declined pair may be suggested
--     again; at most 10 open suggestions per member; note and decline reason at most 280 characters
--   * the reviewer may keep the other song (swap), a member may withdraw, an admin may reopen a
--     declined suggestion
--
-- Everything is written through SECURITY DEFINER functions (search_path = ''): the guard rails need to
-- read songs the caller may not read, follow redirects and lock rows, which a plain INSERT policy
-- cannot do. Nobody writes song_link_suggestions directly (no INSERT / UPDATE / DELETE grant).
-- The merge body of fn_link_song_as_version moves into fn_link_song_as_version_core, which is not
-- callable by any API role; only the two public wrappers call it.
-- Safe to run more than once.

-- 1. The suggestions. Rows are history: the app never deletes them. The title snapshots survive the
--    source song, which an accepted suggestion deletes (ON DELETE SET NULL on the song ids).
CREATE TABLE IF NOT EXISTS public.song_link_suggestions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     uuid REFERENCES public.compositions(id) ON DELETE SET NULL,  -- the duplicate
  target_id     uuid REFERENCES public.compositions(id) ON DELETE SET NULL,  -- the song it is a version of
  source_title  text NOT NULL,
  target_title  text NOT NULL,
  suggested_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note          text CHECK (note IS NULL OR char_length(note) <= 280),
  status        text NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'accepted', 'declined', 'withdrawn', 'superseded')),
  decision_note text CHECK (decision_note IS NULL OR char_length(decision_note) <= 280),
  reviewed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  reopened_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT song_link_suggestions_open_has_songs CHECK (status <> 'open' OR (source_id IS NOT NULL AND target_id IS NOT NULL)),
  CONSTRAINT song_link_suggestions_not_self CHECK (source_id <> target_id),
  CONSTRAINT song_link_suggestions_decided CHECK (status NOT IN ('accepted', 'declined') OR reviewed_at IS NOT NULL)
);
-- One open suggestion per pair of songs, in either direction.
CREATE UNIQUE INDEX IF NOT EXISTS uq_song_link_suggestions_open_pair
  ON public.song_link_suggestions (LEAST(source_id, target_id), GREATEST(source_id, target_id))
  WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_song_link_suggestions_queue ON public.song_link_suggestions (status, created_at);
CREATE INDEX IF NOT EXISTS idx_song_link_suggestions_member ON public.song_link_suggestions (suggested_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_song_link_suggestions_source ON public.song_link_suggestions (source_id) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_song_link_suggestions_target ON public.song_link_suggestions (target_id) WHERE status = 'open';

ALTER TABLE public.song_link_suggestions ENABLE ROW LEVEL SECURITY;
-- A member reads their own suggestions (any status); gatekeepers and admins read all of them.
DROP POLICY IF EXISTS "Members read their own link suggestions" ON public.song_link_suggestions;
CREATE POLICY "Members read their own link suggestions" ON public.song_link_suggestions
  FOR SELECT TO authenticated
  USING (suggested_by = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Reviewers read every link suggestion" ON public.song_link_suggestions;
CREATE POLICY "Reviewers read every link suggestion" ON public.song_link_suggestions
  FOR SELECT TO authenticated
  USING ((SELECT role::text FROM public.profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'gatekeeper'));
REVOKE ALL ON public.song_link_suggestions FROM anon, authenticated;
GRANT SELECT ON public.song_link_suggestions TO authenticated;

-- 2. The audit entry of a link made from a suggestion points at it.
ALTER TABLE public.song_link_audit
  ADD COLUMN IF NOT EXISTS suggestion_id uuid REFERENCES public.song_link_suggestions(id) ON DELETE SET NULL;

-- 3. The member is told in the bell when their suggestion is linked or declined.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('recording_shared', 'link_suggestion_accepted', 'link_suggestion_declined'));

-- 4. A reviewer's check: the same shape as fn_assert_can_link_song, without the ownership rule.
--    Returns the target id after following a redirect. Public songs only (v1), for admins too.
CREATE OR REPLACE FUNCTION public.fn_assert_can_review_link(p_source uuid, p_target uuid)
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
    RAISE EXCEPTION 'Only gatekeepers and admins can review suggestions' USING ERRCODE = '42501';
  END IF;

  IF p_source IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
  END IF;

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

  IF coalesce(v_source.is_public, false) <> coalesce(v_target_row.is_public, false) THEN
    RAISE EXCEPTION 'Both songs must be public, or both private' USING ERRCODE = '22023';
  END IF;
  IF NOT coalesce(v_source.is_public, false) THEN
    RAISE EXCEPTION 'Only public songs can be suggested' USING ERRCODE = '22023';
  END IF;

  RETURN v_target;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_assert_can_review_link(uuid, uuid) FROM PUBLIC, anon, authenticated, service_role;

-- 5. The merge, with the suggestion bookkeeping. p_suggestion is the suggestion being accepted
--    (NULL for a direct link). Not callable by any API role: only the two wrappers below call it, so
--    nobody can pass a suggestion id and mark it accepted without the reviewer's checks.
CREATE OR REPLACE FUNCTION public.fn_link_song_as_version_core(p_source uuid, p_target uuid, p_suggestion uuid)
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
  v_sugg public.song_link_suggestions%ROWTYPE;
  v_reviewer text;
BEGIN
  -- A suggestion is decided by a reviewer, who need not own the songs; a direct link keeps the #512 rules.
  v_target := CASE WHEN p_suggestion IS NULL
    THEN public.fn_assert_can_link_song(p_source, p_target)
    ELSE public.fn_assert_can_review_link(p_source, p_target)
  END;

  -- Lock both songs in a stable order, so two links that cross cannot deadlock.
  PERFORM 1 FROM public.compositions WHERE id IN (p_source, v_target) ORDER BY id FOR UPDATE;
  -- A concurrent link may have committed while this one waited for the locks: check again
  -- on the rows as they are now, so the caller hears "already linked", not "not found".
  IF (CASE WHEN p_suggestion IS NULL
        THEN public.fn_assert_can_link_song(p_source, p_target)
        ELSE public.fn_assert_can_review_link(p_source, p_target)
      END) IS DISTINCT FROM v_target THEN
    RAISE EXCEPTION 'This song is already linked to another song' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_source FROM public.compositions WHERE id = p_source;
  SELECT * INTO v_target_row FROM public.compositions WHERE id = v_target;
  IF v_source.id IS NULL OR v_target_row.id IS NULL THEN
    RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
  END IF;

  -- The suggestion being accepted, or the open one for exactly this pair (a direct link closes it too).
  -- Songs are locked first, then the suggestion: decline and withdraw never wait for a song lock.
  IF p_suggestion IS NOT NULL THEN
    SELECT * INTO v_sugg FROM public.song_link_suggestions WHERE id = p_suggestion FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Suggestion not found' USING ERRCODE = 'P0002';
    END IF;
    IF v_sugg.status <> 'open' THEN
      RAISE EXCEPTION 'This suggestion was already decided' USING ERRCODE = '22023';
    END IF;
  ELSE
    SELECT * INTO v_sugg FROM public.song_link_suggestions
    WHERE status = 'open'
      AND ((source_id = p_source AND target_id = v_target) OR (source_id = v_target AND target_id = p_source))
    FOR UPDATE;
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

  -- Suggestions: the one being accepted is done; no other open suggestion may point at the song that goes.
  IF v_sugg.id IS NOT NULL THEN
    UPDATE public.song_link_suggestions
    SET status = 'accepted', reviewed_by = auth.uid(), reviewed_at = now()
    WHERE id = v_sugg.id;
  END IF;
  -- Suggestions that start from the song that goes: the link did the work.
  UPDATE public.song_link_suggestions SET status = 'superseded' WHERE status = 'open' AND source_id = p_source;
  -- Suggestions that point at the song that goes are re-pointed to the song that stays, unless that would
  -- become a self-link or repeat an open pair; those are closed.
  UPDATE public.song_link_suggestions s
  SET status = 'superseded'
  WHERE s.status = 'open' AND s.target_id = p_source
    AND (
      s.source_id = v_target
      OR EXISTS (
        SELECT 1 FROM public.song_link_suggestions o
        WHERE o.status = 'open' AND o.id <> s.id
          AND ((o.source_id = s.source_id AND o.target_id = v_target) OR (o.source_id = v_target AND o.target_id = s.source_id))
      )
    );
  UPDATE public.song_link_suggestions
  SET target_id = v_target, target_title = v_target_row.title
  WHERE status = 'open' AND target_id = p_source;

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

  INSERT INTO public.song_link_audit (actor_id, source_id, target_id, source_title, target_title, summary, suggestion_id)
  VALUES (auth.uid(), p_source, v_target, v_source.title, v_target_row.title, v_summary, v_sugg.id);

  -- The member is told in the bell (never the reviewer about their own suggestion). A failed
  -- notification never blocks the link.
  IF v_sugg.id IS NOT NULL AND v_sugg.suggested_by IS NOT NULL AND v_sugg.suggested_by IS DISTINCT FROM auth.uid() THEN
    BEGIN
      SELECT nullif(btrim(full_name), '') INTO v_reviewer FROM public.profiles WHERE id = auth.uid();
      INSERT INTO public.notifications (user_id, actor_id, type, composition_id, metadata)
      VALUES (
        v_sugg.suggested_by, auth.uid(), 'link_suggestion_accepted', v_target,
        jsonb_build_object('source_title', v_source.title, 'target_title', v_target_row.title, 'reviewer_name', v_reviewer)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'link suggestion notification failed for suggestion %: %', v_sugg.id, SQLERRM;
    END;
  END IF;

  RETURN v_summary;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_link_song_as_version_core(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated, service_role;

-- 6. The direct link keeps its signature, checks and grants: the body lives in the core now.
CREATE OR REPLACE FUNCTION public.fn_link_song_as_version(p_source uuid, p_target uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN public.fn_link_song_as_version_core(p_source, p_target, NULL);
END;
$$;
-- Signed-in callers only (the checks need auth.uid()): no service_role grant.
REVOKE ALL ON FUNCTION public.fn_link_song_as_version(uuid, uuid) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_link_song_as_version(uuid, uuid) TO authenticated;

-- 7. Suggest. Not for gatekeepers and admins, who link or review instead.
CREATE OR REPLACE FUNCTION public.fn_suggest_song_link(p_source uuid, p_target uuid, p_note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_target uuid;
  v_note text;
  v_source public.compositions%ROWTYPE;
  v_target_row public.compositions%ROWTYPE;
  v_id uuid;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = v_uid;
  IF v_uid IS NULL OR v_role IS NULL THEN
    RAISE EXCEPTION 'Sign in to suggest a link' USING ERRCODE = '42501';
  END IF;
  IF v_role IN ('admin', 'gatekeeper') THEN
    RAISE EXCEPTION 'You can link or review these songs yourself' USING ERRCODE = '42501';
  END IF;

  IF p_source IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION 'Pick the song to suggest and the song it belongs to' USING ERRCODE = '22023';
  END IF;

  v_note := nullif(btrim(coalesce(p_note, '')), '');
  IF char_length(v_note) > 280 THEN
    RAISE EXCEPTION 'The note is too long' USING ERRCODE = '22023';
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

  -- A song the caller cannot read stays "not found": no hint that a private song exists.
  IF NOT ((v_source.is_public IS TRUE OR v_source.owner_id = v_uid)
          AND (v_target_row.is_public IS TRUE OR v_target_row.owner_id = v_uid)) THEN
    RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
  END IF;

  IF coalesce(v_source.is_public, false) <> coalesce(v_target_row.is_public, false) THEN
    RAISE EXCEPTION 'Both songs must be public, or both private' USING ERRCODE = '22023';
  END IF;
  IF NOT coalesce(v_source.is_public, false) THEN
    RAISE EXCEPTION 'Only public songs can be suggested' USING ERRCODE = '22023';
  END IF;

  -- One open suggestion per pair, either direction; at most 10 open per member. The advisory lock
  -- makes two parallel sends of the same member count one after the other.
  PERFORM pg_advisory_xact_lock(hashtext('song_link_suggestions:' || v_uid::text));
  IF EXISTS (
    SELECT 1 FROM public.song_link_suggestions
    WHERE status = 'open'
      AND ((source_id = p_source AND target_id = v_target) OR (source_id = v_target AND target_id = p_source))
  ) THEN
    RAISE EXCEPTION 'This suggestion already exists' USING ERRCODE = '23505';
  END IF;
  IF (SELECT count(*) FROM public.song_link_suggestions WHERE suggested_by = v_uid AND status = 'open') >= 10 THEN
    RAISE EXCEPTION 'Too many open suggestions' USING ERRCODE = '22023';
  END IF;

  BEGIN
    INSERT INTO public.song_link_suggestions (source_id, target_id, source_title, target_title, suggested_by, note)
    VALUES (p_source, v_target, v_source.title, v_target_row.title, v_uid, v_note)
    RETURNING id INTO v_id;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'This suggestion already exists' USING ERRCODE = '23505';
  END;

  RETURN jsonb_build_object('id', v_id);
END;
$$;
REVOKE ALL ON FUNCTION public.fn_suggest_song_link(uuid, uuid, text) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_suggest_song_link(uuid, uuid, text) TO authenticated;

-- 8. Withdraw: the suggester takes back their own open suggestion.
CREATE OR REPLACE FUNCTION public.fn_withdraw_song_link_suggestion(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.song_link_suggestions%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Sign in to suggest a link' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_row FROM public.song_link_suggestions WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_row.suggested_by IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'You can only withdraw your own suggestions' USING ERRCODE = '42501';
  END IF;
  IF v_row.status <> 'open' THEN
    RAISE EXCEPTION 'This suggestion was already decided' USING ERRCODE = '22023';
  END IF;
  UPDATE public.song_link_suggestions SET status = 'withdrawn' WHERE id = p_id;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_withdraw_song_link_suggestion(uuid) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_withdraw_song_link_suggestion(uuid) TO authenticated;

-- 9. Decline: a reviewer says no, with an optional reason; the member is told.
CREATE OR REPLACE FUNCTION public.fn_decline_song_link_suggestion(p_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_reason text;
  v_reviewer text;
  v_row public.song_link_suggestions%ROWTYPE;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = v_uid;
  IF v_uid IS NULL OR v_role IS NULL OR v_role NOT IN ('admin', 'gatekeeper') THEN
    RAISE EXCEPTION 'Only gatekeepers and admins can review suggestions' USING ERRCODE = '42501';
  END IF;
  v_reason := nullif(btrim(coalesce(p_reason, '')), '');
  IF char_length(v_reason) > 280 THEN
    RAISE EXCEPTION 'The reason is too long' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_row FROM public.song_link_suggestions WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_row.status <> 'open' THEN
    RAISE EXCEPTION 'This suggestion was already decided' USING ERRCODE = '22023';
  END IF;

  UPDATE public.song_link_suggestions
  SET status = 'declined', decision_note = v_reason, reviewed_by = v_uid, reviewed_at = now()
  WHERE id = p_id;

  IF v_row.suggested_by IS NOT NULL AND v_row.suggested_by IS DISTINCT FROM v_uid THEN
    BEGIN
      SELECT nullif(btrim(full_name), '') INTO v_reviewer FROM public.profiles WHERE id = v_uid;
      INSERT INTO public.notifications (user_id, actor_id, type, composition_id, metadata)
      VALUES (
        v_row.suggested_by, v_uid, 'link_suggestion_declined', v_row.source_id,
        jsonb_build_object(
          'source_title', v_row.source_title, 'target_title', v_row.target_title,
          'reviewer_name', v_reviewer, 'reason', v_reason
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'link suggestion notification failed for suggestion %: %', p_id, SQLERRM;
    END;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_decline_song_link_suggestion(uuid, text) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_decline_song_link_suggestion(uuid, text) TO authenticated;

-- 10. Preview what accepting would move (the same summary as fn_preview_song_link), without changing anything.
CREATE OR REPLACE FUNCTION public.fn_preview_song_link_suggestion(p_id uuid, p_swap boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_row public.song_link_suggestions%ROWTYPE;
  v_source uuid;
  v_target uuid;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = v_uid;
  IF v_uid IS NULL OR v_role IS NULL OR v_role NOT IN ('admin', 'gatekeeper') THEN
    RAISE EXCEPTION 'Only gatekeepers and admins can review suggestions' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.song_link_suggestions WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_row.status <> 'open' THEN
    RAISE EXCEPTION 'This suggestion was already decided' USING ERRCODE = '22023';
  END IF;

  v_source := CASE WHEN p_swap THEN v_row.target_id ELSE v_row.source_id END;
  v_target := CASE WHEN p_swap THEN v_row.source_id ELSE v_row.target_id END;
  RETURN public.fn_song_link_summary(v_source, public.fn_assert_can_review_link(v_source, v_target));
END;
$$;
REVOKE ALL ON FUNCTION public.fn_preview_song_link_suggestion(uuid, boolean) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_preview_song_link_suggestion(uuid, boolean) TO authenticated;

-- 11. Accept: the reviewer links the songs from the suggestion; with p_swap the suggested target is the
--     song that goes and the source stays ("keep the other title").
CREATE OR REPLACE FUNCTION public.fn_accept_song_link_suggestion(p_id uuid, p_swap boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_row public.song_link_suggestions%ROWTYPE;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = v_uid;
  IF v_uid IS NULL OR v_role IS NULL OR v_role NOT IN ('admin', 'gatekeeper') THEN
    RAISE EXCEPTION 'Only gatekeepers and admins can review suggestions' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.song_link_suggestions WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_row.status <> 'open' THEN
    RAISE EXCEPTION 'This suggestion was already decided' USING ERRCODE = '22023';
  END IF;

  RETURN public.fn_link_song_as_version_core(
    CASE WHEN p_swap THEN v_row.target_id ELSE v_row.source_id END,
    CASE WHEN p_swap THEN v_row.source_id ELSE v_row.target_id END,
    p_id
  );
END;
$$;
REVOKE ALL ON FUNCTION public.fn_accept_song_link_suggestion(uuid, boolean) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_accept_song_link_suggestion(uuid, boolean) TO authenticated;

-- 12. Reopen: an admin takes a decline back (a decline is reversible, a link is not). The guard rails run
--     again on the stored songs: they may have been linked, deleted or made private since.
CREATE OR REPLACE FUNCTION public.fn_reopen_song_link_suggestion(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_row public.song_link_suggestions%ROWTYPE;
  v_source public.compositions%ROWTYPE;
  v_target public.compositions%ROWTYPE;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = v_uid;
  IF v_uid IS NULL OR v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Only admins can reopen suggestions' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.song_link_suggestions WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_row.status <> 'declined' THEN
    RAISE EXCEPTION 'Only declined suggestions can be reopened' USING ERRCODE = '22023';
  END IF;

  -- A song that was linked or deleted since leaves a NULL id on the row.
  SELECT * INTO v_source FROM public.compositions WHERE id = v_row.source_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
  END IF;
  SELECT * INTO v_target FROM public.compositions WHERE id = v_row.target_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Song not found' USING ERRCODE = 'P0002';
  END IF;
  IF coalesce(v_source.is_public, false) <> coalesce(v_target.is_public, false) THEN
    RAISE EXCEPTION 'Both songs must be public, or both private' USING ERRCODE = '22023';
  END IF;
  IF NOT coalesce(v_source.is_public, false) THEN
    RAISE EXCEPTION 'Only public songs can be suggested' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.song_link_suggestions o
    WHERE o.status = 'open' AND o.id <> p_id
      AND ((o.source_id = v_row.source_id AND o.target_id = v_row.target_id)
        OR (o.source_id = v_row.target_id AND o.target_id = v_row.source_id))
  ) THEN
    RAISE EXCEPTION 'This suggestion already exists' USING ERRCODE = '23505';
  END IF;

  -- reviewed_by, reviewed_at and decision_note keep the last decision ("Declined before").
  UPDATE public.song_link_suggestions SET status = 'open', reopened_at = now() WHERE id = p_id;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_reopen_song_link_suggestion(uuid) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_reopen_song_link_suggestion(uuid) TO authenticated;

-- 13. The reviewer's badge: how many open suggestions wait. 0 for everyone else.
CREATE OR REPLACE FUNCTION public.fn_open_song_link_suggestion_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN (SELECT role::text FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'gatekeeper')
    THEN (SELECT count(*)::int FROM public.song_link_suggestions WHERE status = 'open')
    ELSE 0
  END;
$$;
REVOKE ALL ON FUNCTION public.fn_open_song_link_suggestion_count() FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_open_song_link_suggestion_count() TO authenticated;

-- 14. A song that is deleted another way (its owner deletes it) closes its open suggestions first, so the
--     "open suggestions keep both songs" check never fails a delete. SECURITY DEFINER: owners have no
--     UPDATE grant on the table.
CREATE OR REPLACE FUNCTION public.fn_close_link_suggestions_on_song_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.song_link_suggestions
  SET status = 'superseded'
  WHERE status = 'open' AND (source_id = OLD.id OR target_id = OLD.id);
  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_close_link_suggestions_on_song_delete() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trg_close_link_suggestions_on_song_delete ON public.compositions;
CREATE TRIGGER trg_close_link_suggestions_on_song_delete
  BEFORE DELETE ON public.compositions
  FOR EACH ROW EXECUTE FUNCTION public.fn_close_link_suggestions_on_song_delete();
