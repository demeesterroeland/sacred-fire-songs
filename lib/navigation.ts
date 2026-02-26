import { LayoutDashboard, Compass, Library, ListMusic, PlusCircle } from 'lucide-react';

export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    exact: true
  },
  {
    label: 'Explore',
    href: '/explore',
    icon: Compass
  },
  {
    label: 'Songs',
    href: '/songs',
    icon: Library,
    exclude: ['/songs/add']
  },
  {
    label: 'Library',
    href: '/library/playlists',
    icon: ListMusic
  },
  {
    label: 'Add Song',
    href: '/songs/add',
    icon: PlusCircle
  }
] as const;
