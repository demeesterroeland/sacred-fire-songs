// Validation 2, item 14: one term for the saved songs. The user menu says "Your Favorites"; the song page's heart
// (button, bottom bar and sign-in card) says the same, never "Liked Songs", in every language (qu: see below).
import { describe, expect, it } from 'vitest';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const dict = (l: string) => DICTIONARIES[l as keyof typeof DICTIONARIES] as Record<string, string>;
const STEM: Record<string, RegExp> = {
  en: /favou?rites?/i,
  nl: /favoriet/i,
  es: /favorit/i,
  it: /preferit/i,
  ru: /избранн/i,
  fr: /favori/i,
  pt: /favorit/i,
  // Quechua already says "munasqa" in the menu, the heart and the toasts.
  qu: /munasqa/i,
};
const KEYS = ['song.addToFavorites', 'song.removeFromFavorites', 'songBar.like', 'songBar.liked', 'guestGate.favourites.reason'] as const;

describe.each([...SUPPORTED_LOCALES])('Favorites term (%s)', (locale) => {
  it('the user menu, the heart and the sign-in card use the same word', () => {
    const d = dict(locale);
    expect(d['userMenu.favorites'], 'userMenu.favorites').toMatch(STEM[locale]);
    for (const key of KEYS) {
      if (locale === 'qu' && (key === 'songBar.like' || key === 'songBar.liked')) continue; // "Munay"/"Munasqa": already the same root
      expect(d[key], key).toMatch(STEM[locale]);
    }
  });
});

describe('Favorites term (en)', () => {
  it('has no "Liked Songs" or "liked songs" anywhere', () => {
    for (const [k, v] of Object.entries(dict('en'))) expect(v, k).not.toMatch(/liked songs/i);
  });
});
