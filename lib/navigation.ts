import { Home, Library, ListMusic, PlusCircle } from 'lucide-react';

export const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    exact: true
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
    label: 'Create',
    href: '/songs/add',
    icon: PlusCircle
  }
] as const;
