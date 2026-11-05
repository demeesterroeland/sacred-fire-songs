// @vitest-environment jsdom
// Story 6.1.27 / G6.2 (#411): guests learn before typing that saving needs an account (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import GuestDraftBanner from '@/components/song/GuestDraftBanner';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => dict[k] ?? k }),
}));

afterEach(cleanup);

describe('GuestDraftBanner', () => {
  it('says that saving needs an account and links to sign-in with the way back', () => {
    render(<GuestDraftBanner next="/songs/add" />);
    expect(screen.getByText('Draft now — sign in to save')).toBeTruthy();
    const link = screen.getByRole('link', { name: 'Sign in' });
    expect(link.getAttribute('href')).toBe('/auth/login?next=%2Fsongs%2Fadd');
    expect(link.className).toMatch(/min-h-tap/);
  });

  it('uses design tokens only', () => {
    const { container } = render(<GuestDraftBanner next="/songs/add" />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });

  it('has its texts in every language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      for (const k of ['songForm.guestDraft.title', 'songForm.guestDraft.body', 'songForm.guestDraft.signIn']) {
        expect(d[k], `${locale} ${k}`).toBeTruthy();
      }
    }
  });
});
