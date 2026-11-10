// @vitest-environment jsdom
// Validation 2, item 2 (#408): the Library "+" floats at the bottom right on a phone, above the bottom bar and the
// mini player, is the one accent action, and is not also drawn in the page header.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';
import { ACTION_BAR_BOTTOM } from '@/lib/song/actionBar';

const dict = DICTIONARIES.en as Record<string, string>;
let user: object | null = { id: 'u1' };
vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => dict[k] ?? k }) }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user }) }));
vi.mock('@/components/common/CreateSheet', () => ({ default: () => null }));
vi.mock('@/components/library/SharedWithMeLink', () => ({ SharedWithMeLink: () => null }));
vi.mock('next/navigation', () => ({ usePathname: () => '/library/playlists' }));

import LibraryCreateButton from '@/app/library/LibraryCreateButton';
import LibraryTabs from '@/app/library/LibraryTabs';

afterEach(() => {
  cleanup();
  user = { id: 'u1' };
});

describe('Library create button', () => {
  it('is fixed at the bottom right, above the bars, in the accent, and hidden from lg up', () => {
    render(<LibraryCreateButton />);
    const fab = screen.getByRole('button', { name: dict['nav.create'] });
    expect(fab.className).toMatch(/\bfixed\b/);
    expect(fab.className).toMatch(/\bright-4\b|\bend-4\b/);
    expect(fab.className).toMatch(/bg-accent/);
    expect(fab.className).toMatch(/text-on-accent/);
    expect(fab.className).toMatch(/lg:hidden/);
    expect(fab.className).not.toMatch(/rounded-pill/); // pills are for chips only
    expect(fab.className).toMatch(/\brounded-full\b/); // validation 4: a circle, not a rounded square
    expect(fab.className).toMatch(/\bsize-14\b/);
    // Same distance from the bottom as the song action bar: above the nav, or above the mini player when it shows.
    expect(fab.style.bottom).toContain('--mini-player-h');
    expect(fab.style.bottom).toContain('--bottom-nav-height');
    expect(ACTION_BAR_BOTTOM).toContain('--mini-player-h');
  });

  it('is not shown to guests', () => {
    user = null;
    render(<LibraryCreateButton />);
    expect(screen.queryByRole('button', { name: dict['nav.create'] })).toBeNull();
  });

  it('is drawn once on the Library page, not again in the header', () => {
    render(<LibraryTabs />);
    expect(screen.getAllByRole('button', { name: dict['nav.create'] })).toHaveLength(1);
  });
});
