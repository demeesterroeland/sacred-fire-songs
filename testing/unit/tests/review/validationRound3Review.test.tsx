// @vitest-environment jsdom
// Cross-review of the validation rounds 2 and 3 on feat/ux-v2.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Mic2 } from 'lucide-react';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import { parseChordProForDisplay } from '@/lib/chordUtils';
import { safeEmailParam } from '@/lib/auth/notice';
import { readOperator } from '@/lib/legal/operator';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k }),
}));

import { VisibilityIcon } from '@/components/common/VisibilityIcon';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

afterEach(cleanup);

describe('chord tokens', () => {
  it('a long bracketed token is handled in bounded time', () => {
    const start = performance.now();
    parseChordProForDisplay(`[C${'/b'.repeat(26)}X]\n`);
    expect(performance.now() - start).toBeLessThan(200);
  });

  it.each(['C6/9', 'Bb/D', 'F♯m7/C♯', 'C/b', 'Am7'])('%s alone on a line stays a chord', (chord) => {
    const items = parseChordProForDisplay(`[${chord}]\n`).flatMap((s) => s.lines).flatMap((l) => l.items);
    expect(items.some((i) => i.chords === chord)).toBe(true);
  });

  it('a very long bracket is a label, not a chord', () => {
    const label = `C${'m'.repeat(40)}`;
    const items = parseChordProForDisplay(`[${label}]\n`).flatMap((s) => s.lines).flatMap((l) => l.items);
    expect(items.some((i) => i.comment === label)).toBe(true);
  });
});

describe('email addresses with an apostrophe', () => {
  it('can use the sign-up code', () => {
    expect(safeEmailParam("o'brien@example.org")).toBe("o'brien@example.org");
    expect(safeEmailParam('a<b@example.org')).toBe('');
  });

  it('are accepted as the operator address', () => {
    expect(readOperator({ OPERATOR_CONTACT_EMAIL: "o'brien@example.org" }).email).toBe("o'brien@example.org");
  });
});

describe('Terms and Privacy say what the app does', () => {
  it.each(SUPPORTED_LOCALES)('%s: no favourites kept for guests', (locale) => {
    const d = DICTIONARIES[locale] as Record<string, string>;
    const english = DICTIONARIES.en as Record<string, string>;
    expect(d['legal.privacy.stored.p5']).not.toBe('');
    expect(english['legal.privacy.stored.p5']).not.toMatch(/favourite/i);
    expect(english['legal.privacy.browser.p2']).not.toMatch(/favourite/i);
    if (locale === 'qu') expect(d['legal.privacy.browser.p2']).toBe(english['legal.privacy.browser.p2']);
  });

  it('do not promise that a shared recording cannot be saved', () => {
    expect((DICTIONARIES.en as Record<string, string>)['legal.privacy.visible.p4']).not.toMatch(/cannot download/i);
  });
});

describe('Library sub-page heading', () => {
  it('is an h2 on tab pages, where the Library h1 is already there', () => {
    render(<LibrarySubpageHeading icon={Mic2} title="Artists" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Artists' })).toBeTruthy();
  });

  it('is the h1 on a page without tabs', () => {
    render(<LibrarySubpageHeading icon={Mic2} title="Shared" level={1} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Shared' })).toBeTruthy();
    expect(read('app/library/shared/page.tsx')).toMatch(/LibrarySubpageHeading[^\n]*level=\{1\}/);
  });
});

describe('every favourites lookup uses the one helper', () => {
  it.each(['app/actions/toggleFavorite.ts', 'lib/songs/serverQueries.ts'])('%s', (file) => {
    const source = read(file);
    expect(source).not.toContain(".eq('title', 'My Favorites')");
    expect(source).toContain('fetchFavoritesSetlistId');
  });
});

describe('lock and globe', () => {
  it.each([[false, 'Private'], [true, 'Public']] as const)('public=%s says "%s" to a screen reader and on hover', (isPublic, label) => {
    const { container } = render(<VisibilityIcon isPublic={isPublic} className="size-4" />);
    expect(screen.getByText(label).className).toContain('sr-only');
    expect(container.querySelector(`[title="${label}"]`)).toBeTruthy();
  });

  // #488 owner review: playlist rows dropped their leading icon (the section headings say private or public).
  it.each(['app/songs/[id]/page.tsx'])('%s uses it', (file) => {
    expect(read(file)).toContain('<VisibilityIcon');
  });

  it('the label exists in every language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      expect(d['song.visibility.private'], locale).toBeTruthy();
      expect(d['song.visibility.public'], locale).toBeTruthy();
    }
  });
});

describe('song page', () => {
  const page = read('app/songs/[id]/page.tsx');

  it('never cuts the desktop title', () => {
    expect(page).not.toMatch(/<h1 className="[^"]*truncate/);
  });

  it('moves focus before a press on pause removes the toolbar', () => {
    expect(page).toContain('metaToggleRef.current?.focus()');
    expect(read('components/song/SongMetaLines.tsx')).toContain('ref={toggleRef}');
  });

  it('names what the disclosure opens', () => {
    const meta = read('components/song/SongMetaLines.tsx');
    expect(meta).toContain("song.meta.showDetails");
    expect(meta).toContain("song.meta.hideDetails");
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      expect(d['song.meta.showDetails'], locale).toBeTruthy();
      expect(d['song.meta.hideDetails'], locale).toBeTruthy();
      expect(d, locale).not.toHaveProperty(['song.meta.showTags']);
    }
  });
});

describe('small ones', () => {
  it('the Your library labels wrap instead of running into the next cell', () => {
    expect(read('components/home/LibrarySummary.tsx')).toMatch(/text-caption text-fg-muted break-words/);
  });

  it('only tokens that exist', () => {
    expect(read('components/profile/UserProfileView.tsx')).not.toContain('surface-3');
  });

  it('the playlist menu button is a 44 px target without palette colours', () => {
    const trigger = read('components/playlists/PlaylistContextMenu.tsx').match(/ref=\{triggerRef\}[\s\S]*?className="([^"]*)"/)?.[1] ?? '';
    expect(trigger).toContain('size-tap');
    expect(trigger).not.toMatch(/gray/);
  });
});
