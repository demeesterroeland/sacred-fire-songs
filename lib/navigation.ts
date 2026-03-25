import { Home, Library, ListMusic, PlusCircle, Heart, FileText, Clock, Music } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  exclude?: readonly string[];
};

export type NavSection = {
  label?: string;  // Section header (e.g. "Library") — undefined = no header
  items: readonly NavItem[];
};

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    items: [
      { label: 'Home', href: '/', icon: Home, exact: true },
      { label: 'Songs', href: '/songs', icon: Library, exclude: ['/songs/add'] },
      { label: 'Playlists', href: '/library/playlists', icon: ListMusic },
    ],
  },
  {
    label: 'Library',
    items: [
      { label: 'Favorites', href: '/songs?favorites=true', icon: Heart },
      { label: 'Drafts', href: '/songs?status=draft', icon: FileText },
      { label: 'Recently Viewed', href: '/library/recently-viewed', icon: Clock },
    ],
  },
  {
    label: 'Create',
    items: [
      { label: 'Add Song', href: '/songs/add', icon: Music },
      { label: 'New Playlist', href: '/library/playlists/add', icon: PlusCircle },
    ],
  },
] as const;

// Flat list for mobile bottom nav (only main items)
export const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home, exact: true },
  { label: 'Songs', href: '/songs', icon: Library, exclude: ['/songs/add'] },
  { label: 'Library', href: '/library/playlists', icon: ListMusic },
  { label: 'Create', href: '/songs/add', icon: PlusCircle },
] as const;
