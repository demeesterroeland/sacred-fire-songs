// Reference providers of the Listen tab and the player's state words
// (Story 6.1.13 / G3.2, #397). Only providers with a link are offered, always in
// the same order, so the buttons never shuffle between songs.

export type ReferenceProvider = 'youtube' | 'soundcloud' | 'spotify';

export interface ReferenceUrls {
  youtubeUrl?: string | null;
  soundcloudUrl?: string | null;
  spotifyUrl?: string | null;
}

/** Brand names: not translated. */
export const PROVIDER_NAMES: Record<ReferenceProvider, string> = {
  youtube: 'YouTube',
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
};

const ORDER: ReadonlyArray<[ReferenceProvider, keyof ReferenceUrls]> = [
  ['youtube', 'youtubeUrl'],
  ['soundcloud', 'soundcloudUrl'],
  ['spotify', 'spotifyUrl'],
];

export function availableProviders(urls: ReferenceUrls): ReferenceProvider[] {
  return ORDER.filter(([, key]) => !!urls[key]?.trim()).map(([provider]) => provider);
}

export function defaultProvider(urls: ReferenceUrls): ReferenceProvider | null {
  return availableProviders(urls)[0] ?? null;
}

/**
 * The word that tells the state without colour or motion. Null for Spotify: its embed does not
 * report pause or end, so the player names the reference without claiming a state.
 */
export function playStateKey(
  isPlaying: boolean,
  source?: ReferenceProvider | null,
): 'miniPlayer.playing' | 'miniPlayer.paused' | null {
  if (source === 'spotify') return null;
  return isPlaying ? 'miniPlayer.playing' : 'miniPlayer.paused';
}
