// @vitest-environment jsdom
// Validation 2, item 1: every "Sign in" button is the one accent primary button (same fill, radius and weight),
// whether it sits in the header, in the playlist export popup or in the login form.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { DICTIONARIES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => dict[k] ?? k }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/songs', useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, loading: false, logout: vi.fn() }) }));
vi.mock('@/context/UserPreferencesContext', () => ({
  useUserPreferences: () => ({ preferences: { theme: 'dark' }, setPreference: vi.fn() }),
}));
vi.mock('@/hooks/useNotificationsQuery', () => ({ useNotificationsQuery: () => ({ data: [] }) }));

import { UserProfile } from '@/components/common/navigation/UserProfile';
import { SignInLink } from '@/components/auth/SignInLink';
import GuestDraftBanner from '@/components/song/GuestDraftBanner';
import { existsSync } from 'node:fs';

afterEach(cleanup);

describe('Sign in buttons', () => {
  it('the header button is the accent primary button, not red', () => {
    const { container } = render(<UserProfile />);
    const link = screen.getByRole('link', { name: dict['auth.login.submit'] });
    expect(link.className).toMatch(/bg-accent/);
    expect(link.className).toMatch(/text-on-accent/);
    expect(link.className).toMatch(/rounded-control/);
    expect(link.className).not.toMatch(/rounded-xl|red-|amber-/);
    expect(link.getAttribute('href')).toBe('/auth/login?next=%2Fsongs');
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });

  it('the header and the shared SignInLink carry the same button classes', () => {
    const header = render(<UserProfile />);
    const a = screen.getByRole('link', { name: dict['auth.login.submit'] }).className;
    header.unmount();
    render(<SignInLink href="/auth/login">{dict['auth.login.submit']}</SignInLink>);
    const b = screen.getByRole('link', { name: dict['auth.login.submit'] }).className;
    expect(a).toBe(b);
  });

  it('the playlist export popup uses SignInLink, no amber button', () => {
    const src = readFileSync('components/playlists/PlaylistDetailHeader.tsx', 'utf8');
    expect(src).toContain('SignInLink');
    expect(src).not.toMatch(/bg-amber-500/);
  });

  it('the Add Song draft banner\'s Sign in is the same button', () => {
    const header = render(<SignInLink href="/auth/login">Sign in</SignInLink>);
    const expected = screen.getByRole('link', { name: 'Sign in' }).className;
    header.unmount();
    render(<GuestDraftBanner next="/songs/add" />);
    const link = screen.getByRole('link', { name: dict['songForm.guestDraft.signIn'] });
    expect(link.className).toBe(expected);
    expect(link.className).toMatch(/bg-accent/);
  });

  it('no starter sign-in button with its own text is left in components/', () => {
    expect(existsSync('components/auth-button.tsx')).toBe(false);
  });
});
