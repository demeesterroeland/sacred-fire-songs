import { Home, Library, ListMusic, Heart, FileText, Clock, Music, Mic2, Disc3, Search } from 'lucide-react';
import { FEATURES, type Features } from '@/lib/features';
import type { LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/messages/en';

export type NavItem = {
  label?: string;
  labelKey: TranslationKey;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  exclude?: readonly string[];
};

export type NavSection = {
  label?: string;  // Section header (e.g. "Library") — undefined = no header
  labelKey?: TranslationKey;
  items: readonly NavItem[];
};

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    items: [
      { label: 'Home', labelKey: 'nav.home', href: '/', icon: Home, exact: true },
      { label: 'Songs', labelKey: 'nav.songs', href: '/songs', icon: Library, exclude: ['/songs/add'] },
      { label: 'Playlists', labelKey: 'nav.playlists', href: '/library/playlists', icon: ListMusic },
    ],
  },
  {
    label: 'Library',
    labelKey: 'nav.library',
    items: [
      { label: 'Favorites', labelKey: 'nav.favorites', href: '/songs?favorites=true', icon: Heart },
      { label: 'Drafts', labelKey: 'nav.drafts', href: '/songs?status=draft', icon: FileText },
      { label: 'Recently Viewed', labelKey: 'nav.recentlyViewed', href: '/library/recently-viewed', icon: Clock },
    ],
  },
  {
    label: 'Create',
    labelKey: 'nav.create',
    items: [
      { label: 'Add Song', labelKey: 'nav.addSong', href: '/songs/add', icon: Music },
      { label: 'New Playlist', labelKey: 'nav.newPlaylist', href: '/library/playlists/add', icon: ListMusic },
    ],
  },
] as const;

/**
 * Mobile bottom bar (Story 6.1.24 / G5.3, #408, owner decision UXD-1): exactly
 * Home · Search · Library. Create is a "+" inside Library; Practice lives on the
 * song page. Search opens the song list and moves focus to the search field.
 */
export type BottomNavItem = {
  id: 'home' | 'search' | 'library';
  labelKey: TranslationKey;
  href: string;
  icon: LucideIcon;
  /** Active when the path equals `href` exactly. */
  exact?: boolean;
  /** Active when the path starts with this prefix (default: `href`). */
  prefix?: string;
  /** Paths under `prefix` that belong to another action, not to this item. */
  exclude?: readonly string[];
  /** Tapping the item also focuses the header search field. */
  focusSearch?: boolean;
};

export const BOTTOM_NAV_ITEMS: readonly BottomNavItem[] = [
  { id: 'home', labelKey: 'nav.home', href: '/', icon: Home, exact: true },
  { id: 'search', labelKey: 'nav.search', href: '/songs', icon: Search, exclude: ['/songs/add'], focusSearch: true },
  { id: 'library', labelKey: 'nav.library', href: '/library/playlists', icon: Library, prefix: '/library' },
];

export function isBottomNavActive(pathname: string | null | undefined, item: BottomNavItem): boolean {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  if (item.exclude?.some((ex) => pathname === ex || pathname.startsWith(`${ex}/`))) return false;
  const prefix = item.prefix ?? item.href;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export type LibraryTab = { labelKey: TranslationKey; href: string; icon: LucideIcon };

const ALL_LIBRARY_TABS: readonly (LibraryTab & { feature?: keyof Features })[] = [
  { labelKey: 'library.tabs.playlists', href: '/library/playlists', icon: ListMusic },
  { labelKey: 'library.tabs.history', href: '/library/recently-viewed', icon: Clock },
  { labelKey: 'library.tabs.artists', href: '/library/artists', icon: Mic2 },
  { labelKey: 'library.tabs.albums', href: '/library/albums', icon: Disc3, feature: 'albums' },
];

/** Library tab row (Story 6.1.23, #407): only tabs whose feature is switched on. */
export function libraryTabs(features: Features = FEATURES): LibraryTab[] {
  return ALL_LIBRARY_TABS.filter((t) => !t.feature || features[t.feature]).map(
    ({ labelKey, href, icon }) => ({ labelKey, href, icon })
  );
}
