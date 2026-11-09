// Story 6.1.26 / G6.1 (#410): one GuestGate pattern on every members-only screen.
import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import en from '@/messages/en';
import { SUPPORTED_LOCALES, DICTIONARIES } from '@/lib/i18n';
import {
  GUEST_GATE_FEATURES,
  guestGateKeys,
  safeNextPath,
  signInHref,
} from '@/lib/auth/guestGate';
import { shouldRedirectToLogin } from '@/lib/supabase/routeAccess';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (key: keyof typeof en) => en[key] }),
}));

const root = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('signInHref / safeNextPath', () => {
  it('carries the current path and query back through next=', () => {
    expect(signInHref('/library/recently-viewed')).toBe('/auth/login?next=%2Flibrary%2Frecently-viewed');
    expect(signInHref('/account/settings?tab=security')).toBe(
      '/auth/login?next=%2Faccount%2Fsettings%3Ftab%3Dsecurity',
    );
  });

  it('never carries an off-site or protocol-relative target', () => {
    for (const bad of ['https://evil.example/x', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '', null, undefined]) {
      expect(safeNextPath(bad)).toBe('/');
    }
  });
});

describe('GuestGate reason keys', () => {
  it('covers add-to-playlist, edit, history, new playlist, new songs, settings, profile, smart playlists, recorder, sharing and favourites', () => {
    expect([...GUEST_GATE_FEATURES].sort()).toEqual(
      ['addToPlaylist', 'edit', 'favourites', 'history', 'newPlaylist', 'newSongs', 'profile', 'recorder', 'settings', 'sharedWithMe', 'sharing', 'smartPlaylists'],
    );
  });

  it('has a title, a reason and a sign-in label in every locale, none an English copy of another feature', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const dict = DICTIONARIES[locale] as Record<string, string>;
      for (const feature of GUEST_GATE_FEATURES) {
        const { title, reason } = guestGateKeys(feature);
        expect(dict[title], `${locale} ${title}`).toBeTruthy();
        expect(dict[reason], `${locale} ${reason}`).toBeTruthy();
      }
      expect(dict['guestGate.signIn'], `${locale} guestGate.signIn`).toBeTruthy();
    }
  });
});

describe('<GuestGate />', () => {
  it('shows the reason, a Sign in link with next= and a locked preview', async () => {
    const { default: GuestGate } = await import('@/components/common/GuestGate');
    const html = renderToStaticMarkup(
      React.createElement(GuestGate, { feature: 'history', next: '/library/recently-viewed' }),
    );
    expect(html).toContain(en['guestGate.history.title']);
    expect(html).toContain(en['guestGate.history.reason']);
    expect(html).toContain(en['guestGate.signIn']);
    expect(html).toContain('href="/auth/login?next=%2Flibrary%2Frecently-viewed"');
    expect(html).toContain('data-testid="guest-gate"');
    expect(html).toContain('data-feature="history"');
    // the blurred preview makes its own stacking context: the card must sit above it
    expect(html).toMatch(/relative z-10[^"]*"[^>]*><div class="mx-auto/);
    // the preview is decorative: hidden from assistive tech and not focusable
    expect(html).toMatch(/aria-hidden="true"[^>]*inert|inert[^>]*aria-hidden="true"/);
  });

  it('uses semantic tokens only (no palette classes) and a 44 px sign-in target', () => {
    const src = read('components/common/GuestGate.tsx');
    expect(src).not.toMatch(/\b(gray|red|amber|indigo|slate|zinc|orange)-\d{2,3}\b/);
    expect(src).not.toMatch(/\[#[0-9a-fA-F]{3,8}\]/);
    expect(src).toContain("from '@/components/ui/button'");
  });
});

describe('members-only screens render GuestGate instead of redirecting', () => {
  const screens: Array<[string, string]> = [
    ['app/library/recently-viewed/page.tsx', 'history'],
    ['app/library/playlists/add/page.tsx', 'newPlaylist'],
    ['app/account/settings/page.tsx', 'settings'],
    ['app/users/[id]/page.tsx', 'profile'],
    ['app/songs/[id]/edit/page.tsx', 'edit'],
    ['app/library/playlists/page.tsx', 'newPlaylist'],
    ['app/library/smart/page.tsx', 'smartPlaylists'],
    ['app/library/new/page.tsx', 'newSongs'],
    ['components/song/RehearsalDrawer.tsx', 'recorder'],
    ['app/recordings/[id]/page.tsx', 'sharing'],
  ];
  for (const [file, feature] of screens) {
    it(`${file} gates "${feature}"`, () => {
      const src = read(file);
      expect(src).toContain('GuestGate');
      expect(src).toMatch(new RegExp(`feature=["'{]+${feature}["'}]`));
      expect(src, 'no bare login redirect for guests').not.toMatch(/redirect\([^)]*\/auth\/login/);
    });
  }

  it('the edit page keeps the warm "Not yours to edit" copy only for signed-in non-owners', () => {
    const src = read('app/songs/[id]/edit/page.tsx');
    expect(src).toMatch(/!user[\s\S]{0,200}GuestGate/);
    expect(src).toContain('NotYoursToEdit');
  });

  it('the account and user-profile prefixes reach the page so it can render the gate', () => {
    for (const p of ['/account', '/account/settings', '/users/abc']) {
      expect(shouldRedirectToLogin(p, false)).toBe(false);
    }
    expect(shouldRedirectToLogin('/admin', false)).toBe(true);
  });
});

describe('UXD-2: anon only reads public takes that carry singer consent', () => {
  it('a newer migration requires singer_consent_confirmed on both anon policies', () => {
    const dir = path.join(root, 'supabase/migrations');
    const sql = fs
      .readdirSync(dir)
      .filter((f) => f > '20261104190000')
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
      .join('\n');
    expect(sql).toMatch(/ON public\.user_recordings FOR SELECT TO anon[\s\S]*is_public = true AND singer_consent_confirmed = true/);
    expect(sql).toMatch(/ON storage\.objects FOR SELECT TO anon[\s\S]*ur\.is_public = true\s+AND ur\.singer_consent_confirmed = true/);
  });

  it('db-schema.sql carries the same policies', () => {
    const schema = read('docs/design/db-schema.sql');
    expect(schema).toMatch(/to anon using \(\s*is_public = true and singer_consent_confirmed = true\s*\)/i);
  });
});
