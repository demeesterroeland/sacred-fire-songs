import { parseArtists } from '@/lib/songs/artistUtils';

/**
 * Song page meta lines (Epic 6.1, Story 6.1.7 / G2.2, #391):
 * "Herbert Quinteros · Fire · Healing · Spanish" and "Key E · Capo 3 · Standard".
 */
type T = (key: string, vars?: Record<string, string | number>) => string;

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

export type VersionTechnical = { key?: string | null; capo?: number | null; tuning?: string | null };

/** "Key E · Capo 3 · Standard"; empty when the version has no key, capo or special tuning. */
export function technicalItems(v: VersionTechnical | undefined, t: T): string[] {
  if (!v) return [];
  const special = !!v.tuning && v.tuning !== 'Standard';
  if (!v.key && !v.capo && !special) return [];
  return [
    v.key ? t('song.meta.key', { key: v.key }) : null,
    v.capo ? t('song.meta.capo', { capo: v.capo }) : null,
    special ? v.tuning! : t('song.metadata.standard'),
  ].filter((i): i is string => !!i);
}
