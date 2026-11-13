// @vitest-environment jsdom
// Story 6.1.35 (#485), group 4 — docs/testing/ux-v2-sober-header.feature. The user menu and the notification bell
// use semantic tokens only: no coloured items, the theme choice is announced, unread is a count, not a colour.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DICTIONARIES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string, p?: Record<string, string | number>) =>
      (dict[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => String(p?.[n] ?? '')),
    setLocaleAndPersist: vi.fn(),
    supportedLocales: ['en'],
    localeLabels: { en: 'English' },
  }),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/songs',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'a@example.org', full_name: 'Ana', role: 'admin', avatar_url: null },
    loading: false,
    logout: vi.fn(),
  }),
}));
vi.mock('@/context/UserPreferencesContext', () => ({
  useUserPreferences: () => ({ preferences: { theme: 'dark' }, setPreference: vi.fn() }),
}));
const notes = [
  { id: 'n1', read_at: null, created_at: new Date().toISOString(), metadata: {}, recording_id: null, composition_id: null },
  { id: 'n2', read_at: null, created_at: new Date().toISOString(), metadata: {}, recording_id: null, composition_id: null },
  { id: 'n3', read_at: new Date().toISOString(), created_at: new Date().toISOString(), metadata: {}, recording_id: null, composition_id: null },
];
vi.mock('@/hooks/useNotificationsQuery', () => ({ useNotificationsQuery: () => ({ data: notes }) }));

import { UserProfile } from '@/components/common/navigation/UserProfile';
import { NotificationBell } from '@/components/common/navigation/NotificationBell';

afterEach(cleanup);

const openMenu = () => {
  const view = render(<UserProfile />);
  fireEvent.click(screen.getByRole('button', { name: dict['userMenu.trigger'] }));
  return view;
};

describe('sober user menu', () => {
  it('the open menu uses no palette classes and no gradient avatar', () => {
    const { container } = openMenu();
    expect(screen.getByTestId('user-menu')).toBeTruthy();
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
    expect(container.innerHTML).not.toMatch(/bg-gradient/);
  });

  it('the Admin Portal item has the same style as the other items', () => {
    openMenu();
    const admin = screen.getByRole('link', { name: dict['userMenu.adminPortal'] });
    const favourites = screen.getByRole('link', { name: dict['userMenu.favorites'] });
    expect(admin.className).toBe(favourites.className);
  });

  it('the role is translated', () => {
    openMenu();
    expect(screen.getByText(dict['admin.role.admin'])).toBeTruthy();
  });

  it('choosing a menu item closes the menu', () => {
    openMenu();
    fireEvent.click(screen.getByRole('link', { name: dict['userMenu.settings'] }));
    expect(screen.queryByTestId('user-menu')).toBeNull();
  });

  it('the theme buttons are 44 px targets', () => {
    openMenu();
    for (const name of ['theme.light', 'theme.dark', 'theme.system']) {
      expect(screen.getByRole('button', { name: dict[name] }).className).toMatch(/\bsize-tap\b/);
    }
  });

  it('only the chosen theme is pressed and shows the inverted greys', () => {
    openMenu();
    const dark = screen.getByRole('button', { name: dict['theme.dark'] });
    const light = screen.getByRole('button', { name: dict['theme.light'] });
    expect(dark.getAttribute('aria-pressed')).toBe('true');
    expect(light.getAttribute('aria-pressed')).toBe('false');
    expect(dark.className).toMatch(/\bbg-chip-active\b/);
    expect(light.className).not.toMatch(/\bbg-chip-active\b/);
  });
});

describe('sober notification bell', () => {
  it('names the unread count and draws the badge in inverted greys', () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <NotificationBell userId="u1" />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('button', { name: 'Notifications (2 unread)' })).toBeTruthy();
    const badge = screen.getByTestId('notification-badge');
    expect(badge.textContent).toBe('2');
    expect(badge.className).toMatch(/\bbg-chip-active\b.*\btext-on-chip-active\b/);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });
});
