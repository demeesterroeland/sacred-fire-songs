import type { GuestGateFeature } from '@/lib/auth/guestGate';

/**
 * #600: personal views of /songs that a guest cannot have. `/songs?favorites=true` shows the
 * GuestGate instead of the "No favourites yet" empty state. Drafts (`?status=draft`) stay as
 * they are until the owner decides between a gate and the empty state of #232.
 */
export function songsGuestGateFeature(view: {
  favorites: boolean;
  status: string;
  isGuest: boolean;
  authLoading: boolean;
}): GuestGateFeature | null {
  if (!view.isGuest || view.authLoading) return null;
  if (view.favorites) return 'favourites';
  return null;
}
