import { parseArtists } from '@/lib/songs/artistUtils';

/**
 * Song page meta lines (Epic 6.1, Story 6.1.7 / G2.2, #391):
 * "Herbert Quinteros · Fire · Healing · Spanish" and "Key E · Capo 3 · Standard".
 */
import type { TranslateFn } from '@/lib/i18n';

/** Any translate function (the app's typed `t`, or a plain test double). */
type T = TranslateFn;

/** Display names of the song's authors ("Traditional" when none). */
export function songAuthors(originalAuthor: string | null | undefined, t: T): string[] {
  const artists = parseArtists(originalAuthor);
  return artists.length > 0
    ? artists.map((a) => (a.toLowerCase() === 'traditional' ? t('song.traditional') : a))
    : [t('song.traditional')];
}

/** Authors first, then tag names, for one grey meta line. */
export function songMetaItems(
  originalAuthor: string | null | undefined,
  categories: ReadonlyArray<{ name: string }>,
  t: T
): string[] {
  return [...songAuthors(originalAuthor, t), ...categories.map((c) => c.name)];
}

export type VersionTechnical = {
  key?: string | null;
  capo?: number | null;
  tuning?: string | null;
  /** Songbook beats of the version, free text such as "8" or "8y4" (Story 6.2.7 / #510). */
  beats?: string | null;
};

/**
 * "Key E · Capo 3 · Standard · Beats 8" (Story 6.2.7 / #510: beats added last). Empty when the version has no key,
 * capo, special tuning or beats. "Standard" is only named next to other technical values, so beats alone show "Beats 8".
 */
export function technicalItems(v: VersionTechnical | undefined, t: T): string[] {
  if (!v) return [];
  const special = !!v.tuning && v.tuning !== 'Standard';
  const beats = v.beats?.trim() ?? '';
  const keyCapoOrTuning = !!v.key || !!v.capo || special;
  if (!keyCapoOrTuning && !beats) return [];
  const tuning = keyCapoOrTuning ? (special ? v.tuning! : t('song.metadata.standard')) : null;
  return [
    v.key ? t('song.meta.key', { key: v.key }) : null,
    v.capo ? t('song.meta.capo', { capo: v.capo }) : null,
    tuning,
    beats ? t('song.meta.beats', { beats }) : null,
  ].filter((i): i is string => !!i);
}

type RowCategory = { name: string; parent?: string | null };
const ARTISTS_PARENT = 'Artists';
const LANGUAGES_PARENT = 'Languages';

/**
 * Song list rows (Story 6.1.2 / G1.2, #386): "Author · Category · Language" —
 * authors joined into one item, the first non-artist, non-language tag, and the
 * first language tag. Missing parts are dropped.
 */
export function songRowMeta(
  originalAuthor: string | null | undefined,
  categories: ReadonlyArray<RowCategory>,
  t: T
): string[] {
  const tags = categories.filter((c) => c.parent !== ARTISTS_PARENT && c.name !== ARTISTS_PARENT);
  const category = tags.find((c) => c.parent !== LANGUAGES_PARENT);
  const language = tags.find((c) => c.parent === LANGUAGES_PARENT);
  // Server queries fill a missing author with the English placeholder 'Unknown'.
  const author = originalAuthor === 'Unknown' ? null : originalAuthor;
  return [songAuthors(author, t).join(', '), category?.name, language?.name].filter(
    (i): i is string => !!i
  );
}
