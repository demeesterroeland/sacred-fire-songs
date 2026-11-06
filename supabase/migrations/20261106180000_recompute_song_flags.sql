-- Recompute compositions.has_chords / has_melody for every song (UX v2 validation 1, fix 7).
--
-- The flags describe the whole song: true when ANY version has them. The rule is the one in
-- lib/songs/versionFlags.ts:
--   melody = a version has a YouTube / Spotify / SoundCloud link or a melody notation;
--   chords = a version passes lib/chordProParsing.ts hasChords(): a bracketed chord ("[Am]") or a
--            chords-over-lyrics line (more than half of its tokens are chords or "|").
-- Songs saved before the "any version" rule (or created by seeds/imports) can disagree with it, e.g. an
-- "Original" with chords next to a lyrics-only "Simplified" that was the last one saved.
--
-- Idempotent: only rows whose flags differ are written, so a second run changes nothing. No schema change,
-- no new object is left behind (the helper lives in pg_temp and vanishes with the session).

create or replace function pg_temp.sfs_has_chords(content text) returns boolean
language sql immutable as $$
  select coalesce(content, '') ~ '\[[A-G]'
  or exists (
    select 1
    from regexp_split_to_table(coalesce(content, ''), E'\n') as raw(line)
    cross join lateral (
      select array(
        select tok
        from regexp_split_to_table(btrim(raw.line, E' \t\r\f\v'), '\s+') as t(tok)
        where tok <> '' and tok not like '(%' and tok not like '%)'
      ) as toks
    ) as r
    where btrim(raw.line, E' \t\r\f\v') <> ''
      and cardinality(r.toks) > 0
      and (
        select count(*) from unnest(r.toks) as x(tok)
        where x.tok ~ '^[A-G][#b]?(m|min|maj|dim|aug|sus|add)?[0-9]*(/[A-G][#b]?)?$' or x.tok = '|'
      ) > cardinality(r.toks) * 0.5
  );
$$;

with calc as (
  select
    c.id,
    coalesce(bool_or(pg_temp.sfs_has_chords(v.content_chordpro)), false) as chords,
    coalesce(bool_or(
      coalesce(v.youtube_url, '') <> '' or coalesce(v.spotify_url, '') <> ''
      or coalesce(v.soundcloud_url, '') <> '' or coalesce(v.melody_notation, '') <> ''
    ), false) as melody
  from public.compositions c
  left join public.song_versions v on v.composition_id = c.id
  group by c.id
)
update public.compositions c
set has_chords = calc.chords,
    has_melody = calc.melody
from calc
where c.id = calc.id
  and (c.has_chords is distinct from calc.chords or c.has_melody is distinct from calc.melody);
