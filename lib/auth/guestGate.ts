import type { TranslationKey } from '@/messages/en';
import { safeNextPath } from '@/lib/auth/safeNext';

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
  'addToPlaylist',
  'sharedWithMe',
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
