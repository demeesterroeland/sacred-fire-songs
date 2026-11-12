/**
 * Story 6.2.9 / G1.4 (#512): link a song as a version of another song.
 *
 * The merge itself is one database function (fn_link_song_as_version); fn_preview_song_link returns the same
 * summary without changing anything. This module holds the pure parts the song page, the server action and the
 * tests share: who sees the action, how an old song link continues, how the summary reads in the confirm dialog,
 * and which message a refusal shows.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TranslationKey } from '@/messages/en';

/** Roles that may link songs (the database checks the same list). */
export const SONG_LINK_ROLES = ['admin', 'gatekeeper'] as const;

export function canLinkSongs(role: string | null | undefined): boolean {
  return !!role && (SONG_LINK_ROLES as readonly string[]).includes(role);
}

/** What fn_preview_song_link / fn_link_song_as_version return. */
export interface SongLinkSummary {
  source_id: string;
  source_title: string;
  target_id: string;
  target_title: string;
  versions: number;
  recordings: number;
  playlist_items: number;
  favourites: number;
  favourites_merged: number;
  categories_added: number;
  aliases_added: string[];
  /** none: the source has no catalog slug; moved: the target takes it; redirect: the target keeps its own. */
  catalog_slug: 'none' | 'moved' | 'redirect';
  catalog_keys_cleared: number;
  translations: number;
}

const COUNT_FIELDS = [
  'versions',
  'recordings',
  'playlist_items',
  'favourites',
  'favourites_merged',
  'categories_added',
  'catalog_keys_cleared',
  'translations',
] as const;

const count = (value: unknown): number => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/** Reads the function's jsonb answer; null when it is not a summary. */
export function parseLinkSummary(raw: unknown): SongLinkSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.source_id !== 'string' || typeof r.target_id !== 'string') return null;
  const slug = r.catalog_slug === 'moved' || r.catalog_slug === 'redirect' ? r.catalog_slug : 'none';
  const summary = {
    source_id: r.source_id,
    source_title: typeof r.source_title === 'string' ? r.source_title : '',
    target_id: r.target_id,
    target_title: typeof r.target_title === 'string' ? r.target_title : '',
    aliases_added: Array.isArray(r.aliases_added) ? r.aliases_added.filter((a): a is string => typeof a === 'string') : [],
    catalog_slug: slug,
  } as SongLinkSummary;
  for (const field of COUNT_FIELDS) summary[field] = count(r[field]);
  return summary;
}

export interface PreviewLine {
  key: TranslationKey;
  params: Record<string, string | number>;
}

const plural = (n: number, one: TranslationKey, other: TranslationKey): PreviewLine => ({
  key: n === 1 ? one : other,
  params: { count: n },
});

/** The confirm dialog's list of what moves. Items with nothing to move are left out. */
export function linkPreviewLines(s: SongLinkSummary): PreviewLine[] {
  const lines: PreviewLine[] = [];
  if (s.versions) lines.push(plural(s.versions, 'song.link.preview.versions.one', 'song.link.preview.versions.other'));
  if (s.recordings) lines.push(plural(s.recordings, 'song.link.preview.recordings.one', 'song.link.preview.recordings.other'));
  if (s.playlist_items) {
    lines.push(plural(s.playlist_items, 'song.link.preview.playlistItems.one', 'song.link.preview.playlistItems.other'));
  }
  if (s.favourites) lines.push(plural(s.favourites, 'song.link.preview.favourites.one', 'song.link.preview.favourites.other'));
  if (s.favourites_merged) {
    lines.push(plural(s.favourites_merged, 'song.link.preview.favouritesMerged.one', 'song.link.preview.favouritesMerged.other'));
  }
  if (s.categories_added) {
    lines.push(plural(s.categories_added, 'song.link.preview.categories.one', 'song.link.preview.categories.other'));
  }
  if (s.translations) {
    lines.push(plural(s.translations, 'song.link.preview.translations.one', 'song.link.preview.translations.other'));
  }
  if (s.aliases_added.length) {
    lines.push({ key: 'song.link.preview.aliases', params: { names: s.aliases_added.join(', ') } });
  }
  if (s.catalog_slug !== 'none') {
    lines.push({ key: s.catalog_slug === 'moved' ? 'song.link.preview.slugMoved' : 'song.link.preview.slugKept', params: {} });
  }
  if (s.catalog_keys_cleared) {
    lines.push(plural(s.catalog_keys_cleared, 'song.link.preview.catalogKeys.one', 'song.link.preview.catalogKeys.other'));
  }
  return lines;
}

/** Why a link was refused, as the action returns it. */
export type SongLinkError = 'forbidden' | 'self' | 'alreadyLinked' | 'notFound' | 'invalid' | 'failed';

export const SONG_LINK_ERROR_KEYS: Readonly<Record<SongLinkError, TranslationKey>> = {
  forbidden: 'song.link.error.forbidden',
  self: 'song.link.error.self',
  alreadyLinked: 'song.link.error.alreadyLinked',
  notFound: 'song.link.error.notFound',
  invalid: 'song.link.error.invalid',
  failed: 'song.link.error.failed',
};

/** Maps a database error of the link functions to the refusal shown to the person. */
export function songLinkError(error: { code?: string | null; message?: string | null } | null | undefined): SongLinkError {
  const code = error?.code ?? '';
  const message = error?.message ?? '';
  if (code === '42501') return 'forbidden';
  if (code === 'P0002') return 'notFound';
  if (code === '22023' || code === '22P02') {
    if (/itself/i.test(message)) return 'self';
    if (/already linked/i.test(message)) return 'alreadyLinked';
    return 'invalid';
  }
  return 'failed';
}

/**
 * Where an old song link continues: the target song with the same query, so ?version= and ?recording= keep
 * working (the versions and takes moved with the song).
 */
export function songRedirectHref(targetId: string, search: string | URLSearchParams | null | undefined): string {
  const query = typeof search === 'string' ? search.replace(/^\?/, '') : (search?.toString() ?? '');
  return `/songs/${encodeURIComponent(targetId)}${query ? `?${query}` : ''}`;
}

/** The song an old song id was linked into, or null. composition_redirects is readable by everyone. */
export async function fetchSongRedirect(supabase: SupabaseClient, oldId: string): Promise<string | null> {
  const { data, error } = await supabase.from('composition_redirects').select('new_id').eq('old_id', oldId).maybeSingle();
  if (error) throw error;
  return (data as { new_id?: string } | null)?.new_id ?? null;
}
