import type { GuestGateFeature } from '@/lib/auth/guestGate';

/**
 * #600: personal views of /songs that a guest cannot have. `/songs?favorites=true` and
 * `/songs?status=draft` show the GuestGate instead of the "No favourites yet" / "No private songs
 * yet" empty states (the owner chose the gate over the empty state of #232).
 */
export function songsGuestGateFeature(view: {
  favorites: boolean;
  status: string;
  isGuest: boolean;
  authLoading: boolean;
}): GuestGateFeature | null {
  if (!view.isGuest || view.authLoading) return null;
  if (view.favorites) return 'favourites';
  if (view.status === 'draft') return 'drafts';
  return null;
}
