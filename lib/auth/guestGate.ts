import type { TranslationKey } from '@/messages/en';
import { safeNextPath } from '@/lib/auth/safeNext';
import { LOGIN_REQUIRED_NOTICE } from '@/lib/auth/notice';

/**
 * GuestGate (Story 6.1.26 / G6.1, #410): every members-only screen shows the same
 * locked preview with a reason and a "Sign in" button that carries `next=` back.
 * One feature per screen; its copy lives under `guestGate.<feature>.{title,reason}`.
 */
export const GUEST_GATE_FEATURES = [
  'edit',
  'history',
  'newSongs',
  'newPlaylist',
  'settings',
  'profile',
  'smartPlaylists',
  'recorder',
  'sharing',
  'favourites',
  'drafts',
  'addToPlaylist',
  'sharedWithMe',
  'sharedByMe',
] as const;

export type GuestGateFeature = (typeof GUEST_GATE_FEATURES)[number];

export function guestGateKeys(feature: GuestGateFeature): {
  title: Extract<TranslationKey, `guestGate.${GuestGateFeature}.title`>;
  reason: Extract<TranslationKey, `guestGate.${GuestGateFeature}.reason`>;
} {
  return {
    title: `guestGate.${feature}.title`,
    reason: `guestGate.${feature}.reason`,
  } as ReturnType<typeof guestGateKeys>;
}

export { safeNextPath };

/** Sign-in URL that lands the user back on `next` (current path + query). */
export function signInHref(next: string | null | undefined): string {
  return `/auth/login?next=${encodeURIComponent(safeNextPath(next))}`;
}

/**
 * #600: request header the proxy sets to the current path + query, so a Server Component
 * (e.g. `app/admin/layout.tsx`, which gets no pathname) can build a sign-in link that
 * returns there. Always overwritten by the proxy; still validated by `safeNextPath`.
 */
export const RETURN_PATH_HEADER = 'x-sfs-return-path';

/** Path plus query string (`/songs?favorites=true`); the query may come with or without `?`. */
export function returnPath(pathname: string, search: string | URLSearchParams | null | undefined): string {
  const query = (search == null ? '' : search.toString()).replace(/^\?/, '');
  return query ? `${pathname}?${query}` : pathname;
}

/** Browser-only: the page the user is on now (path + query), or `fallback` during SSR. */
export function currentReturnPath(fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return returnPath(window.location.pathname, window.location.search);
}

/** Where the proxy sends a guest from a protected page: login with `next=` and the known reason. */
export function loginRedirectHref(pathname: string, search: string): string {
  return `${signInHref(returnPath(pathname, search))}&message=${LOGIN_REQUIRED_NOTICE}`;
}
