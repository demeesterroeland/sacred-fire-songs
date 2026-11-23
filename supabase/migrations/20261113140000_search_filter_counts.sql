-- Migration: Search filter counts for GlobalSearchModal (Story 6.2.25 / G5.8, #570)
-- Date: 2026-11-13
--
-- Option 1: one read-only SQL function (SECURITY INVOKER, so caller RLS decides what
-- each viewer counts) returning visible songbook and language counts so the search
-- window on non-/songs pages does not load the full song list.
--
-- Songbooks: distinct visible compositions linked via song_versions + song_version_sources.
-- Languages: distinct visible compositions tagged with a category under the 'Languages'
--            group (parent.slug = 'languages' OR parent.name = 'Languages'). Translations
--            in song_translations do NOT count unless the song carries that language category.
--            Joining public.compositions enforces song privacy even though song_category_map
--            allows public reads.

CREATE OR REPLACE FUNCTION public.fn_search_filter_counts()
RETURNS TABLE (
  kind text,
  value text,
  label text,
  song_count integer
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    'songbook'::text AS kind,
    sb.id AS value,
    COALESCE(NULLIF(btrim(sb.title), ''), NULLIF(btrim(sb.short_name), '')) AS label,
    COUNT(DISTINCT c.id)::integer AS song_count
  FROM public.songbooks sb
  JOIN public.song_version_sources svs ON svs.songbook_id = sb.id
  JOIN public.song_versions sv ON sv.id = svs.song_version_id
  JOIN public.compositions c ON c.id = sv.composition_id
  WHERE COALESCE(NULLIF(btrim(sb.title), ''), NULLIF(btrim(sb.short_name), '')) IS NOT NULL
  GROUP BY sb.id, sb.title, sb.short_name

  UNION ALL

  SELECT
    'language'::text AS kind,
    cat.slug AS value,
    cat.name AS label,
    COUNT(DISTINCT c.id)::integer AS song_count
  FROM public.categories cat
  JOIN public.categories parent ON parent.id = cat.parent_id
  JOIN public.song_category_map scm ON scm.category_id = cat.id
  JOIN public.compositions c ON c.id = scm.song_id
  WHERE (parent.slug = 'languages' OR parent.name = 'Languages')
    AND NULLIF(btrim(cat.slug), '') IS NOT NULL
    AND NULLIF(btrim(cat.name), '') IS NOT NULL
  GROUP BY cat.id, cat.slug, cat.name

  ORDER BY kind, label, value;
$$;

REVOKE ALL ON FUNCTION public.fn_search_filter_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_search_filter_counts() TO anon, authenticated, service_role;
