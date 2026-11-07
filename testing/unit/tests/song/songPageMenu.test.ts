// Validation 2, items 5, 6, 7, 10, 11 on the song page (structure guards; the behaviour is in e2e/tests/ux-v2-validation-2.spec.ts).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const page = readFileSync('app/songs/[id]/page.tsx', 'utf8');
const desktopHeader = page.slice(page.indexOf('Desktop Page Header'), page.indexOf('Song Content (Lyrics/Chords)') > 0 ? page.indexOf('Story 6.1.7 (#391)') : undefined);

describe('song page: one menu (item 11)', () => {
  it('uses the merged SongMenuSheet and nothing of the old ⋮ sheet or reading tools sheet', () => {
    expect(page).toContain('SongMenuSheet');
    expect(page).not.toContain('ReadingToolsSheet');
    expect(page).not.toContain('song-overflow-sheet');
    expect(page).not.toContain('onOpenTools');
    expect(page).not.toContain('toolsButtonRef');
  });

  it('no longer closes the menu when it is "empty": it is never empty (Share and the screen switch)', () => {
    expect(page).not.toMatch(/isToolsOpen && !mayTranspose && !canAutoScroll/);
  });

  it('renders the menu SongMenuSheet exactly once', () => {
    expect(page.match(/<SongMenuSheet/g)).toHaveLength(1);
  });
});

describe('song page: full title on a phone (item 6)', () => {
  it('has a full, wrapping h1 in the page and a truncated sticky copy that is not a heading', () => {
    expect(page).toContain('useScrolledPast');
    expect(page).toMatch(/data-testid="song-title"/);
    // The only `truncate` title is the sticky copy.
    const sticky = page.slice(page.indexOf('data-testid="sticky-song-title"') - 400, page.indexOf('data-testid="sticky-song-title"') + 400);
    expect(sticky).toContain('truncate');
    expect(sticky).not.toMatch(/<h1/);
    const h1 = page.slice(page.indexOf('data-testid="song-title"') - 200, page.indexOf('data-testid="song-title"') + 300);
    expect(h1).toMatch(/<h1/);
    expect(h1).not.toContain('truncate');
  });
});

describe('song page: version links (item 5)', () => {
  it('switching replaces the URL in place (no extra history entry) and Share uses the shown version', () => {
    expect(page).toContain('history.replaceState');
    expect(page).not.toContain('history.pushState');
    expect(page).toContain('versionSearch(');
    expect(page).toContain('versionShareUrl(');
    expect(page).not.toMatch(/url: window\.location\.href/);
    expect(page).not.toMatch(/writeText\(window\.location\.href\)/);
  });
});

describe('song page: neutral desktop buttons (item 7)', () => {
  it('uses no palette colours in the header: Delete, Edit, Practice and the heart are tokens', () => {
    expect(desktopHeader.length).toBeGreaterThan(500);
    expect(countPaletteClasses(desktopHeader)).toBe(0);
    expect(desktopHeader).not.toMatch(/indigo|red-|amber-|bg-danger|text-danger/);
  });

  it('Practice is the single accent action: the only primary Button in the header', () => {
    expect(desktopHeader.match(/variant="primary"/g)).toHaveLength(1);
    const primaryAt = desktopHeader.indexOf('variant="primary"');
    expect(desktopHeader.slice(primaryAt, primaryAt + 900)).toContain('song-header-practice');
    expect(desktopHeader.match(/variant="outline"/g)?.length).toBeGreaterThanOrEqual(2); // Delete and Edit
  });
});

describe('song page: opening the menu does not stop auto-scroll', () => {
  it('both ⋮ buttons sit in a keep zone, so the touch that opens the menu is not a "take over" gesture', () => {
    for (const testId of ['song-menu-button"', 'song-menu-button-desktop"']) {
      const at = page.indexOf(`data-testid="${testId}`);
      expect(at, testId).toBeGreaterThan(0);
      const tag = page.slice(page.lastIndexOf('<button', at), page.indexOf('>', at + 200));
      expect(tag, testId).toContain('AUTOSCROLL_KEEP_ATTR');
    }
    expect(page).toContain("import { useAutoScroll, useLyricsBelowFold, AUTOSCROLL_KEEP_ATTR }");
  });
});
