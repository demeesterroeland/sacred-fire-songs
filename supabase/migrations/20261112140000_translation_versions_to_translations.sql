-- Migration: Move interim translation versions to song_translations (Story 6.2.13, #516)
-- Date: 2026-11-12
--
-- Until the language switch shipped, an importer could deliver a translation as a song_versions row with
-- version_kind = 'translation' (its version_name names the language). The song page now reads translations from
-- public.song_translations (one per song and language), so those interim rows move there.
--
-- PREREQUISITE for importers: before this migration runs on real data, every importer that delivers translations
-- must write them to song_translations and stop writing them as translation versions. Deleting a version also
-- deletes its catalog_source_id, the key an importer upserts versions on ((composition_id, catalog_source_id)); an
-- importer that still wrote translations as versions would simply create them again after the migration, and this
-- migration does not run again to move them (it only runs once). See docs/guides/importing-songbooks.md.
--
-- Safe to run more than once, and it loses no user content: one row at a time, a translation version is deleted only
-- after its text is stored in song_translations, everything that pointed at it points at the song's first original
-- version, and it holds nothing else of its own (see below). What the delete still takes along is reported first with
-- RAISE NOTICE: its songbook sources and its contributor (song_translations has no column for either).
-- A row that cannot be moved cleanly is LEFT IN PLACE and reported with RAISE NOTICE:
--   * the language cannot be derived from version_name,
--   * the song has no original version to take over its recordings and playlist items,
--   * the lyrics are blank (nothing to store),
--   * the version has chords and its key, capo or tuning differs from the original version that would take over: the
--     chords would no longer match the key shown with them, and a playlist item's transposition was relative to the
--     translation's key,
--   * song_translations already holds a different text for that language (nothing is overwritten or dropped),
--   * the version holds its own melody_notation, song_note, beats, youtube_url, spotify_url or soundcloud_url (not
--     blank and different from the original version that would take over; song_translations has no such column),
--     or it has votes (vote_count > 0),
--   * its lyrics have no chords, but its key, capo or tuning differs from the original version and a playlist item
--     on it is transposed (transposition_override <> 0): the playlist would sound in another key.
--
-- Language: derived from version_name the way the app does (translationLanguageTag in lib/songs/versionLabels.ts):
-- a language name in an app language or in the language itself ("English", "Engels", "Nederlands"), or a lowercase
-- language tag ("nl", "lkt", "pt-BR" -> 'pt-br'). The name list below is GENERATED, folded exactly like the SQL
-- fold, so SQL and the app agree for every name: regenerate it with
-- `npx tsx scripts/db/generate-translation-language-names.ts` and paste the block between the markers, and write the
-- same block to the committed snapshot testing/unit/tests/songs/fixtures/translation-language-names.sql (a unit test
-- fails when the two differ). Once this migration has been released it is FROZEN: it has run, so never edit it; a
-- later change to the language list (a new app language, a different ICU name) belongs in a new migration.
-- Title: the title the primary songbook source printed for the version (song_version_sources.original_title), when
-- there is one. Translator: not known for a version, so null.
-- Re-pointed: user_recordings and setlist_items (the only foreign keys to song_versions besides
-- song_version_sources). Consequences:
--   * a playlist item that opened the translation now opens the song's first original version, in the original
--     language (setlist_items has no language column);
--   * the moved takes are appended after the takes already on the original version (position = the highest position
--     there + 1, 2, ... in their old order), so the two sets of takes do not interleave;
--   * a version's own song_version_sources rows go with it (ON DELETE CASCADE): the translation's songbook and page
--     are not kept, because song_translations has no source column (#517 may add one). Each is reported with
--     RAISE NOTICE before it goes, so it can be restored from the migration log.

DO $migration$
DECLARE
  r record;
  src record;
  lang text;
  target uuid;
  target_key text;
  target_capo integer;
  target_tuning text;
  target_row record;
  own_content text[];
  key_differs boolean;
  printed_title text;
  folded text;
  moved integer := 0;
  kept integer := 0;
BEGIN
  FOR r IN
    SELECT v.id, v.composition_id, v.version_name, v.content_chordpro, v.catalog_source_id, v.contributor_id,
           v.melody_notation, v.song_note, v.beats, v.youtube_url, v.spotify_url, v.soundcloud_url,
           coalesce(v.vote_count, 0) AS vote_count,
           nullif(btrim(v.key), '') AS key,
           coalesce(v.capo, 0) AS capo,
           coalesce(nullif(btrim(v.tuning), ''), 'Standard') AS tuning
    FROM public.song_versions v
    WHERE v.version_kind = 'translation'
    ORDER BY v.composition_id, v.created_at, v.id
  LOOP
    -- 1. The language
    folded := lower(btrim(regexp_replace(normalize(coalesce(r.version_name, ''), NFD), '[\u0300-\u036f\u0591-\u05c7]', '', 'g')));
    SELECT n.tag INTO lang FROM (VALUES
    -- BEGIN generated language names (scripts/db/generate-translation-language-names.ts)
    ('en', 'en'),
    ('english', 'en'),
    ('engels', 'en'),
    ('ingles', 'en'),
    ('inglese', 'en'),
    ('англиискии', 'en'),
    ('ingles simi', 'en'),
    ('anglais', 'en'),
    ('nl', 'nl'),
    ('dutch', 'nl'),
    ('nederlands', 'nl'),
    ('neerlandes', 'nl'),
    ('olandese', 'nl'),
    ('нидерландскии', 'nl'),
    ('neerlandes simi', 'nl'),
    ('neerlandais', 'nl'),
    ('holandes', 'nl'),
    ('es', 'es'),
    ('spanish', 'es'),
    ('spaans', 'es'),
    ('espanol', 'es'),
    ('spagnolo', 'es'),
    ('испанскии', 'es'),
    ('espanol simi', 'es'),
    ('espagnol', 'es'),
    ('espanhol', 'es'),
    ('it', 'it'),
    ('italian', 'it'),
    ('italiaans', 'it'),
    ('italiano', 'it'),
    ('итальянскии', 'it'),
    ('italiano simi', 'it'),
    ('italien', 'it'),
    ('ru', 'ru'),
    ('russian', 'ru'),
    ('russisch', 'ru'),
    ('ruso', 'ru'),
    ('russo', 'ru'),
    ('русскии', 'ru'),
    ('ruso simi', 'ru'),
    ('russe', 'ru'),
    ('qu', 'qu'),
    ('quechua', 'qu'),
    ('кечуа', 'qu'),
    ('runasimi', 'qu'),
    ('quichua', 'qu'),
    ('fr', 'fr'),
    ('french', 'fr'),
    ('frans', 'fr'),
    ('frances', 'fr'),
    ('francese', 'fr'),
    ('французскии', 'fr'),
    ('frances simi', 'fr'),
    ('francais', 'fr'),
    ('pt', 'pt'),
    ('portuguese', 'pt'),
    ('portugees', 'pt'),
    ('portugues', 'pt'),
    ('portoghese', 'pt'),
    ('португальскии', 'pt'),
    ('portugues simi', 'pt'),
    ('portugais', 'pt'),
    ('de', 'de'),
    ('german', 'de'),
    ('duits', 'de'),
    ('aleman', 'de'),
    ('tedesco', 'de'),
    ('немецкии', 'de'),
    ('aleman simi', 'de'),
    ('allemand', 'de'),
    ('alemao', 'de'),
    ('deutsch', 'de'),
    ('he', 'he'),
    ('hebrew', 'he'),
    ('hebreeuws', 'he'),
    ('hebreo', 'he'),
    ('ebraico', 'he'),
    ('иврит', 'he'),
    ('hebreo simi', 'he'),
    ('hebreu', 'he'),
    ('hebraico', 'he'),
    ('עברית', 'he'),
    ('ar', 'ar'),
    ('arabic', 'ar'),
    ('arabisch', 'ar'),
    ('arabe', 'ar'),
    ('arabo', 'ar'),
    ('арабскии', 'ar'),
    ('arabe simi', 'ar'),
    ('العربية', 'ar'),
    ('pl', 'pl'),
    ('polish', 'pl'),
    ('pools', 'pl'),
    ('polaco', 'pl'),
    ('polacco', 'pl'),
    ('польскии', 'pl'),
    ('polaco simi', 'pl'),
    ('polonais', 'pl'),
    ('polones', 'pl'),
    ('polski', 'pl'),
    ('sv', 'sv'),
    ('swedish', 'sv'),
    ('zweeds', 'sv'),
    ('sueco', 'sv'),
    ('svedese', 'sv'),
    ('шведскии', 'sv'),
    ('sueco simi', 'sv'),
    ('suedois', 'sv'),
    ('svenska', 'sv'),
    ('da', 'da'),
    ('danish', 'da'),
    ('deens', 'da'),
    ('danes', 'da'),
    ('danese', 'da'),
    ('датскии', 'da'),
    ('danes simi', 'da'),
    ('danois', 'da'),
    ('dinamarques', 'da'),
    ('dansk', 'da'),
    ('no', 'no'),
    ('norwegian', 'no'),
    ('noors', 'no'),
    ('noruego', 'no'),
    ('norvegese', 'no'),
    ('норвежскии', 'no'),
    ('noruego simi', 'no'),
    ('norvegien', 'no'),
    ('noruegues', 'no'),
    ('norsk', 'no'),
    ('fi', 'fi'),
    ('finnish', 'fi'),
    ('fins', 'fi'),
    ('fines', 'fi'),
    ('finlandese', 'fi'),
    ('финскии', 'fi'),
    ('fines simi', 'fi'),
    ('finnois', 'fi'),
    ('finlandes', 'fi'),
    ('suomi', 'fi'),
    ('tr', 'tr'),
    ('turkish', 'tr'),
    ('turks', 'tr'),
    ('turco', 'tr'),
    ('турецкии', 'tr'),
    ('turco simi', 'tr'),
    ('turc', 'tr'),
    ('turkce', 'tr'),
    ('ja', 'ja'),
    ('japanese', 'ja'),
    ('japans', 'ja'),
    ('japones', 'ja'),
    ('giapponese', 'ja'),
    ('японскии', 'ja'),
    ('japones simi', 'ja'),
    ('japonais', 'ja'),
    ('日本語', 'ja'),
    ('zh', 'zh'),
    ('chinese', 'zh'),
    ('chinees', 'zh'),
    ('chino', 'zh'),
    ('cinese', 'zh'),
    ('китаискии', 'zh'),
    ('chino simi', 'zh'),
    ('chinois', 'zh'),
    ('chines', 'zh'),
    ('中文', 'zh'),
    ('ko', 'ko'),
    ('korean', 'ko'),
    ('koreaans', 'ko'),
    ('coreano', 'ko'),
    ('кореискии', 'ko'),
    ('coreano simi', 'ko'),
    ('coreen', 'ko'),
    ('한국어', 'ko'),
    ('hi', 'hi'),
    ('hindi', 'hi'),
    ('хинди', 'hi'),
    ('hindi simi', 'hi'),
    ('हिन्दी', 'hi'),
    ('sw', 'sw'),
    ('swahili', 'sw'),
    ('suajili', 'sw'),
    ('суахили', 'sw'),
    ('suajili simi', 'sw'),
    ('suaili', 'sw'),
    ('kiswahili', 'sw'),
    ('la', 'la'),
    ('latin', 'la'),
    ('latijn', 'la'),
    ('latino', 'la'),
    ('латинскии', 'la'),
    ('latin simi', 'la'),
    ('latim', 'la')
-- END generated language names
    ) AS n(name, tag) WHERE n.name = folded;
    -- A language tag as the app reads it (LANGUAGE_TAG in lib/songs/versionLabels.ts): a lowercase 2-3 letter language
    -- subtag, then subtags of 2-8 letters or digits.
    IF lang IS NULL AND btrim(coalesce(r.version_name, '')) ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$' THEN
      lang := lower(btrim(r.version_name));
    END IF;
    IF lang IS NULL THEN
      RAISE NOTICE 'translation version % of song % left in place: cannot derive a language from "%"',
        r.id, r.composition_id, r.version_name;
      kept := kept + 1;
      CONTINUE;
    END IF;

    -- 2. The version that takes over recordings and playlist items: the song's first original version, in the
    --    order of the app (oldest first, id as tie-break).
    SELECT o.id, nullif(btrim(o.key), '') AS key, coalesce(o.capo, 0) AS capo,
           coalesce(nullif(btrim(o.tuning), ''), 'Standard') AS tuning,
           o.melody_notation, o.song_note, o.beats, o.youtube_url, o.spotify_url, o.soundcloud_url
      INTO target_row
    FROM public.song_versions o
    WHERE o.composition_id = r.composition_id AND o.version_kind = 'original'
    ORDER BY o.created_at, o.id
    LIMIT 1;
    target := target_row.id;
    target_key := target_row.key;
    target_capo := target_row.capo;
    target_tuning := target_row.tuning;
    IF target IS NULL THEN
      RAISE NOTICE 'translation version % of song % left in place: the song has no original version', r.id, r.composition_id;
      kept := kept + 1;
      CONTINUE;
    END IF;

    -- 2b. Nothing to store for a blank text.
    IF btrim(r.content_chordpro) = '' THEN
      RAISE NOTICE 'translation version % of song % left in place: its lyrics are blank', r.id, r.composition_id;
      kept := kept + 1;
      CONTINUE;
    END IF;

    -- 2c. Chords are written for a key. They are only moved to the original version when it has the same key, capo
    --     and tuning; otherwise the page would show the chords with the wrong key. Lyrics without chords have no
    --     such problem, except that a playlist item transposed (transposition_override) relative to this version's
    --     key would sound in another key on the original version.
    key_differs := r.key IS DISTINCT FROM target_key OR r.capo <> target_capo OR r.tuning <> target_tuning;
    IF key_differs AND r.content_chordpro ~ '\[[^\]]+\]' THEN
      RAISE NOTICE 'translation version % of song % left in place: it has chords in key "%", capo %, tuning "%", the original version has key "%", capo %, tuning "%"',
        r.id, r.composition_id, r.key, r.capo, r.tuning, target_key, target_capo, target_tuning;
      kept := kept + 1;
      CONTINUE;
    END IF;
    IF key_differs AND EXISTS (
      SELECT 1 FROM public.setlist_items i WHERE i.song_version_id = r.id AND coalesce(i.transposition_override, 0) <> 0
    ) THEN
      RAISE NOTICE 'translation version % of song % left in place: a playlist item transposes it and its key "%", capo %, tuning "%" differ from the original version (key "%", capo %, tuning "%")',
        r.id, r.composition_id, r.key, r.capo, r.tuning, target_key, target_capo, target_tuning;
      kept := kept + 1;
      CONTINUE;
    END IF;

    -- 2d. Content of its own: song_translations stores a title and lyrics only. A melody, note, beats, media link or
    --     vote count that the original version does not already carry would be lost, so the version stays.
    SELECT array_agg(c.field ORDER BY c.ord) INTO own_content
    FROM (VALUES
      (1, 'melody_notation', nullif(btrim(r.melody_notation), ''), nullif(btrim(target_row.melody_notation), '')),
      (2, 'song_note', nullif(btrim(r.song_note), ''), nullif(btrim(target_row.song_note), '')),
      (3, 'beats', nullif(btrim(r.beats), ''), nullif(btrim(target_row.beats), '')),
      (4, 'youtube_url', nullif(btrim(r.youtube_url), ''), nullif(btrim(target_row.youtube_url), '')),
      (5, 'spotify_url', nullif(btrim(r.spotify_url), ''), nullif(btrim(target_row.spotify_url), '')),
      (6, 'soundcloud_url', nullif(btrim(r.soundcloud_url), ''), nullif(btrim(target_row.soundcloud_url), ''))
    ) AS c(ord, field, mine, theirs)
    WHERE c.mine IS NOT NULL AND c.mine IS DISTINCT FROM c.theirs;
    IF r.vote_count > 0 THEN
      own_content := coalesce(own_content, ARRAY[]::text[]) || ('vote_count (' || r.vote_count || ')');
    END IF;
    IF own_content IS NOT NULL THEN
      RAISE NOTICE 'translation version % of song % left in place: it holds content of its own that song_translations cannot store: %',
        r.id, r.composition_id, array_to_string(own_content, ', ');
      kept := kept + 1;
      CONTINUE;
    END IF;

    -- 3. Store the text. An existing translation in that language wins (ON CONFLICT DO NOTHING); the version is then
    --    only removed when that stored text is the same, so no different text is ever dropped.
    SELECT nullif(btrim(s.original_title), '') INTO printed_title
    FROM public.song_version_sources s
    WHERE s.song_version_id = r.id AND nullif(btrim(s.original_title), '') IS NOT NULL
    ORDER BY s.is_primary DESC, s.songbook_id
    LIMIT 1;

    INSERT INTO public.song_translations (composition_id, language, title, lyrics, translator)
    VALUES (r.composition_id, lang, printed_title, r.content_chordpro, NULL)
    ON CONFLICT (composition_id, language) DO NOTHING;

    IF NOT EXISTS (
      SELECT 1 FROM public.song_translations t
      WHERE t.composition_id = r.composition_id AND t.language = lang
        AND btrim(coalesce(t.lyrics, '')) = btrim(r.content_chordpro)
    ) THEN
      RAISE NOTICE 'translation version % of song % left in place: song_translations already holds a different "%" text',
        r.id, r.composition_id, lang;
      kept := kept + 1;
      CONTINUE;
    END IF;

    -- 4. Report what the delete takes along, re-point what referenced the version, then delete it.
    FOR src IN
      SELECT s.songbook_id, s.page FROM public.song_version_sources s
      WHERE s.song_version_id = r.id ORDER BY s.is_primary DESC, s.songbook_id
    LOOP
      RAISE NOTICE 'translation version % (catalog key "%") of song % had source: songbook %, page %',
        r.id, r.catalog_source_id, r.composition_id, src.songbook_id, src.page;
    END LOOP;

    IF r.contributor_id IS NOT NULL THEN
      RAISE NOTICE 'translation version % (catalog key "%") of song % was contributed by profile %',
        r.id, r.catalog_source_id, r.composition_id, r.contributor_id;
    END IF;

    -- The takes of a song version share one order (position, then newest first): append the moved takes after the
    -- ones already on the original version, keeping their order among themselves.
    UPDATE public.user_recordings u
    SET song_version_id = target,
        position = coalesce((SELECT max(x.position) FROM public.user_recordings x WHERE x.song_version_id = target), -1) + m.rn
    FROM (
      SELECT id, row_number() OVER (ORDER BY position, created_at DESC, id) AS rn
      FROM public.user_recordings WHERE song_version_id = r.id
    ) m
    WHERE u.id = m.id;
    UPDATE public.setlist_items SET song_version_id = target WHERE song_version_id = r.id;
    DELETE FROM public.song_versions WHERE id = r.id;
    moved := moved + 1;
  END LOOP;

  RAISE NOTICE 'translation versions moved to song_translations: %, left in place: %', moved, kept;
END
$migration$;
