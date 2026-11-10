// Validation 1 review, H2: the bars fixed to the bottom of the window are marked, so the auto-scroll fold can
// leave their room out of the area the reader sees.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { READER_BAR_ATTR } from '@/lib/reader/readingArea';

const ROOT = path.resolve(__dirname, '../../../..');
const read = (f: string) => fs.readFileSync(path.join(ROOT, f), 'utf8');

describe('reader bars', () => {
  it('uses the attribute the components carry', () => {
    expect(READER_BAR_ATTR).toBe('data-reader-bar');
  });
  it.each([
    ['components/song/SongActionBar.tsx', 'song-action-bar'],
    ['components/common/MobileBottomNav.tsx', 'bottom-nav'],
    ['components/song/RehearsalDrawer.tsx', 'bottom-mini-player'],
  ])('%s marks its fixed bar', (file, testId) => {
    const src = read(file);
    const at = src.lastIndexOf(`data-testid="${testId}"`);
    expect(at).toBeGreaterThan(-1);
    expect(src.slice(at, at + 200)).toContain('data-reader-bar=""');
  });
});
