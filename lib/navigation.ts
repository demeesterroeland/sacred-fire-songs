import { Home, Library, ListMusic, PlusCircle, Heart, FileText, Clock, Music } from 'lucide-react';
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

// Flat list for mobile bottom nav (only main items)
export const NAV_ITEMS = [
  { label: 'Home', labelKey: 'nav.home', href: '/', icon: Home, exact: true },
  { label: 'Songs', labelKey: 'nav.songs', href: '/songs', icon: Library, exclude: ['/songs/add'] },
  { label: 'Library', labelKey: 'nav.library', href: '/library/playlists', icon: ListMusic },
  { label: 'Create', labelKey: 'nav.create', href: '/songs/add', icon: PlusCircle },
] as const;
