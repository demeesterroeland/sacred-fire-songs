import { songAuthors } from '@/lib/songs/authors';

/**
 * Song page meta lines (Epic 6.1, Story 6.1.7 / G2.2, #391):
 * "Herbert Quinteros · Fire · Healing · Spanish" and "Key E · Capo 3".
 */
import type { TranslateFn } from '@/lib/i18n';
import { LANGUAGES_PARENT_NAME } from '@/lib/songs/browseFilters';

/** Any translate function (the app's typed `t`, or a plain test double). */
type T = TranslateFn;

/** Authors first, then tag names, for one grey meta line. */
export function songMetaItems(
  originalAuthor: string | null | undefined,
  categories: ReadonlyArray<{ name: string }>,
  t: T
): string[] {
  return [...songAuthors({ originalAuthor }, t), ...categories.map((c) => c.name)];
}

export type VersionTechnical = {
  key?: string | null;
  capo?: number | null;
  tuning?: string | null;
  /** Songbook beats of the version, free text such as "8" or "8y4" (Story 6.2.7 / #510). */
  beats?: string | null;
};

export interface TechnicalOptions {
  /**
   * Chords are on screen (#566). With `false` key, capo and tuning are left out and only the beats remain (they matter
   * to singers too). Default `true`: callers without a Chords switch (the PDF meta line) keep today's output.
   */
  chordsOn?: boolean;
}

/**
 * "Key E · Capo 3 · Beats 8" (or "Key D · Tuning: Drop D · Beats 8" for non-standard tuning; Story 6.2.7 / #510).
 * Empty when the version has no key, capo, non-standard tuning or beats. Standard tuning ("Standard", null, or empty)
 * is omitted completely. `chordsOn: false` (#566) drops key, capo and tuning while keeping beats.
 */
export function technicalItems(v: VersionTechnical | undefined, t: T, { chordsOn = true }: TechnicalOptions = {}): string[] {
  if (!v) return [];
  const beats = v.beats?.trim() ?? '';
  if (!chordsOn) return beats ? [t('song.meta.beats', { beats })] : [];
  const tuning = v.tuning?.trim() ?? '';
  // Standard tuning is omitted; non-standard tunings are labelled ("Tuning: Drop D", owner decision #566).
  const specialTuning = !!tuning && tuning !== 'Standard';
  return [
    v.key ? t('song.meta.key', { key: v.key }) : null,
    v.capo ? t('song.meta.capo', { capo: v.capo }) : null,
    specialTuning ? t('song.meta.tuning', { tuning }) : null,
    beats ? t('song.meta.beats', { beats }) : null,
  ].filter((i): i is string => !!i);
}

type RowCategory = { name: string; parent?: string | null };
const ARTISTS_PARENT = 'Artists';

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
  const category = tags.find((c) => c.parent !== LANGUAGES_PARENT_NAME);
  const language = tags.find((c) => c.parent === LANGUAGES_PARENT_NAME);
  // Server queries fill a missing author with the English placeholder 'Unknown'.
  const author = originalAuthor === 'Unknown' ? null : originalAuthor;
  return [songAuthors({ originalAuthor: author }, t).join(', '), category?.name, language?.name].filter(
    (i): i is string => !!i
  );
}
