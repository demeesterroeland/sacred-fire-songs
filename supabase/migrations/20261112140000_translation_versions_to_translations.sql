-- Migration: Move interim translation versions to song_translations (Story 6.2.13, #516)
-- Date: 2026-11-12
--
-- Until the language switch shipped, an importer could deliver a translation as a song_versions row with
-- version_kind = 'translation' (its version_name names the language). The song page now reads translations from
-- public.song_translations (one per song and language), so those interim rows move there.
--
-- Safe to run more than once, and it never loses data: one row at a time, a translation version is deleted only after
-- its text is stored in song_translations and everything that pointed at it points at the song's first original
-- version. A row that cannot be moved cleanly is LEFT IN PLACE and reported with RAISE NOTICE:
--   * the language cannot be derived from version_name,
--   * the song has no original version to take over its recordings and playlist items,
--   * song_translations already holds a different text for that language (nothing is overwritten or dropped).
--
-- Language: derived from version_name the way the app does (translationLanguageTag in lib/songs/versionLabels.ts):
-- a language name in an app language or in the language itself ("English", "Engels", "Nederlands"), or a lowercase
-- language tag ("nl", "lkt", "pt-BR" -> 'pt-br'). The name list below is generated from the same Intl data.
-- Title: the title the primary songbook source printed for the version (song_version_sources.original_title), when
-- there is one. Translator: not known for a version, so null.
-- Re-pointed: user_recordings and setlist_items (the only foreign keys to song_versions besides
-- song_version_sources). A version's own song_version_sources rows go with it (ON DELETE CASCADE): the translation's
-- songbook and page are not kept, because song_translations has no source column.

DO $migration$
DECLARE
  r record;
  lang text;
  target uuid;
  printed_title text;
  folded text;
  moved integer := 0;
  kept integer := 0;
BEGIN
  FOR r IN
    SELECT v.id, v.composition_id, v.version_name, v.content_chordpro
    FROM public.song_versions v
    WHERE v.version_kind = 'translation'
    ORDER BY v.composition_id, v.created_at, v.id
  LOOP
    -- 1. The language
    folded := lower(btrim(regexp_replace(normalize(coalesce(r.version_name, ''), NFD), '[\u0300-\u036f\u0591-\u05c7]', '', 'g')));
    SELECT n.tag INTO lang FROM (VALUES
    ('english', 'en'),
    ('engels', 'en'),
    ('ingles', 'en'),
    ('inglese', 'en'),
    ('англиискии', 'en'),
    ('ingles simi', 'en'),
    ('anglais', 'en'),
    ('dutch', 'nl'),
    ('nederlands', 'nl'),
    ('neerlandes', 'nl'),
    ('olandese', 'nl'),
    ('нидерландскии', 'nl'),
    ('neerlandes simi', 'nl'),
    ('neerlandais', 'nl'),
    ('holandes', 'nl'),
    ('spanish', 'es'),
    ('spaans', 'es'),
    ('espanol', 'es'),
    ('spagnolo', 'es'),
    ('испанскии', 'es'),
    ('espanol simi', 'es'),
    ('espagnol', 'es'),
    ('espanhol', 'es'),
    ('italian', 'it'),
    ('italiaans', 'it'),
    ('italiano', 'it'),
    ('итальянскии', 'it'),
    ('italiano simi', 'it'),
    ('italien', 'it'),
    ('russian', 'ru'),
    ('russisch', 'ru'),
    ('ruso', 'ru'),
    ('russo', 'ru'),
    ('русскии', 'ru'),
    ('ruso simi', 'ru'),
    ('russe', 'ru'),
    ('quechua', 'qu'),
    ('кечуа', 'qu'),
    ('runasimi', 'qu'),
    ('quichua', 'qu'),
    ('french', 'fr'),
    ('frans', 'fr'),
    ('frances', 'fr'),
    ('francese', 'fr'),
    ('французскии', 'fr'),
    ('frances simi', 'fr'),
    ('francais', 'fr'),
    ('portuguese', 'pt'),
    ('portugees', 'pt'),
    ('portugues', 'pt'),
    ('portoghese', 'pt'),
    ('португальскии', 'pt'),
    ('portugues simi', 'pt'),
    ('portugais', 'pt'),
    ('german', 'de'),
    ('duits', 'de'),
    ('aleman', 'de'),
    ('tedesco', 'de'),
    ('немецкии', 'de'),
    ('aleman simi', 'de'),
    ('allemand', 'de'),
    ('alemao', 'de'),
    ('deutsch', 'de'),
    ('hebrew', 'he'),
    ('hebreeuws', 'he'),
    ('hebreo', 'he'),
    ('ebraico', 'he'),
    ('иврит', 'he'),
    ('hebreo simi', 'he'),
    ('hebreu', 'he'),
    ('hebraico', 'he'),
    ('עברית', 'he'),
    ('arabic', 'ar'),
    ('arabisch', 'ar'),
    ('arabe', 'ar'),
    ('arabo', 'ar'),
    ('арабскии', 'ar'),
    ('arabe simi', 'ar'),
    ('العربية', 'ar'),
    ('polish', 'pl'),
    ('pools', 'pl'),
    ('polaco', 'pl'),
    ('polacco', 'pl'),
    ('польскии', 'pl'),
    ('polaco simi', 'pl'),
    ('polonais', 'pl'),
    ('polones', 'pl'),
    ('polski', 'pl'),
    ('swedish', 'sv'),
    ('zweeds', 'sv'),
    ('sueco', 'sv'),
    ('svedese', 'sv'),
    ('шведскии', 'sv'),
    ('sueco simi', 'sv'),
    ('suedois', 'sv'),
    ('svenska', 'sv'),
    ('danish', 'da'),
    ('deens', 'da'),
    ('danes', 'da'),
    ('danese', 'da'),
    ('датскии', 'da'),
    ('danes simi', 'da'),
    ('danois', 'da'),
    ('dinamarques', 'da'),
    ('dansk', 'da'),
    ('norwegian', 'no'),
    ('noors', 'no'),
    ('noruego', 'no'),
    ('norvegese', 'no'),
    ('норвежскии', 'no'),
    ('noruego simi', 'no'),
    ('norvegien', 'no'),
    ('noruegues', 'no'),
    ('norsk', 'no'),
    ('finnish', 'fi'),
    ('fins', 'fi'),
    ('fines', 'fi'),
    ('finlandese', 'fi'),
    ('финскии', 'fi'),
    ('fines simi', 'fi'),
    ('finnois', 'fi'),
    ('finlandes', 'fi'),
    ('suomi', 'fi'),
    ('turkish', 'tr'),
    ('turks', 'tr'),
    ('turco', 'tr'),
    ('турецкии', 'tr'),
    ('turco simi', 'tr'),
    ('turc', 'tr'),
    ('turkce', 'tr'),
    ('japanese', 'ja'),
    ('japans', 'ja'),
    ('japones', 'ja'),
    ('giapponese', 'ja'),
    ('японскии', 'ja'),
    ('japones simi', 'ja'),
    ('japonais', 'ja'),
    ('日本語', 'ja'),
    ('chinese', 'zh'),
    ('chinees', 'zh'),
    ('chino', 'zh'),
    ('cinese', 'zh'),
    ('китаискии', 'zh'),
    ('chino simi', 'zh'),
    ('chinois', 'zh'),
    ('chines', 'zh'),
    ('中文', 'zh'),
    ('korean', 'ko'),
    ('koreaans', 'ko'),
    ('coreano', 'ko'),
    ('кореискии', 'ko'),
    ('coreano simi', 'ko'),
    ('coreen', 'ko'),
    ('한국어', 'ko'),
    ('hindi', 'hi'),
    ('хинди', 'hi'),
    ('hindi simi', 'hi'),
    ('हनद', 'hi'),
    ('swahili', 'sw'),
    ('suajili', 'sw'),
    ('суахили', 'sw'),
    ('suajili simi', 'sw'),
    ('suaili', 'sw'),
    ('kiswahili', 'sw'),
    ('latin', 'la'),
    ('latijn', 'la'),
    ('latino', 'la'),
    ('латинскии', 'la'),
    ('latin simi', 'la'),
    ('latim', 'la'),
    ('en', 'en'),
    ('nl', 'nl'),
    ('es', 'es'),
    ('it', 'it'),
    ('ru', 'ru'),
    ('qu', 'qu'),
    ('fr', 'fr'),
    ('pt', 'pt'),
    ('de', 'de'),
    ('he', 'he'),
    ('ar', 'ar'),
    ('pl', 'pl'),
    ('sv', 'sv'),
    ('da', 'da'),
    ('no', 'no'),
    ('fi', 'fi'),
    ('tr', 'tr'),
    ('ja', 'ja'),
    ('zh', 'zh'),
    ('ko', 'ko'),
    ('hi', 'hi'),
    ('sw', 'sw'),
    ('la', 'la')
    ) AS n(name, tag) WHERE n.name = folded;
    IF lang IS NULL AND btrim(coalesce(r.version_name, '')) ~ '^[a-z]{2,3}(-[A-Za-z0-9]+)*$'
       AND lower(btrim(r.version_name)) ~ '^[a-z]{2,3}(-[a-z0-9]{1,8})*$' THEN
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
    SELECT o.id INTO target
    FROM public.song_versions o
    WHERE o.composition_id = r.composition_id AND o.version_kind = 'original'
    ORDER BY o.created_at, o.id
    LIMIT 1;
    IF target IS NULL THEN
      RAISE NOTICE 'translation version % of song % left in place: the song has no original version', r.id, r.composition_id;
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

    -- 4. Re-point what referenced the version, then delete it.
    UPDATE public.user_recordings SET song_version_id = target WHERE song_version_id = r.id;
    UPDATE public.setlist_items SET song_version_id = target WHERE song_version_id = r.id;
    DELETE FROM public.song_versions WHERE id = r.id;
    moved := moved + 1;
  END LOOP;

  RAISE NOTICE 'translation versions moved to song_translations: %, left in place: %', moved, kept;
END
$migration$;
