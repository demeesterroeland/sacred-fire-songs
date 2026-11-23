// @vitest-environment jsdom
// #600: header, playlist export popup and Add Song keep next= with the query string.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { DICTIONARIES } from '@/lib/i18n';
import { currentReturnPath } from '@/lib/auth/guestGate';

const dict = DICTIONARIES.en as Record<string, string>;
const nav = vi.hoisted(() => ({ search: '' }));
vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => dict[k] ?? k }) }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/songs',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, loading: false, logout: vi.fn() }) }));
vi.mock('@/context/UserPreferencesContext', () => ({
  useUserPreferences: () => ({ preferences: { theme: 'dark' }, setPreference: vi.fn() }),
}));
vi.mock('@/hooks/useNotificationsQuery', () => ({ useNotificationsQuery: () => ({ data: [] }) }));

import { UserProfile } from '@/components/common/navigation/UserProfile';

afterEach(() => {
  cleanup();
  nav.search = '';
});

describe('sign-in links keep next= (#600)', () => {
  it('the header Sign in keeps the query string', () => {
    nav.search = 'favorites=true';
    render(<UserProfile />);
    const link = screen.getByRole('link', { name: dict['auth.login.submit'] });
    expect(link.getAttribute('href')).toBe('/auth/login?next=%2Fsongs%3Ffavorites%3Dtrue');
  });

  it('currentReturnPath reads path and query from the browser', () => {
    window.history.pushState({}, '', '/library/playlists/p1?view=grid');
    expect(currentReturnPath('/fallback')).toBe('/library/playlists/p1?view=grid');
  });

  it('the playlist export popup uses currentReturnPath, not the bare pathname', () => {
    const src = readFileSync('components/playlists/PlaylistDetailHeader.tsx', 'utf8');
    expect(src).toContain('currentReturnPath(');
    expect(src).not.toMatch(/window\.location\.pathname/);
  });
});
