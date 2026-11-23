// Story 6.1.35 (#485), remaining small files: the song page error states, the
// environment banner, the main content wrapper, the sidebar overlay and the
// songs loading fallback use semantic tokens only. The Song form group
// (SongForm, MediaEmbeds, YouTubeEmbed, SongDetailSkeleton) has its own test.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const FILES = [
  'app/songs/[id]/page.tsx',
  'app/songs/page.tsx',
  'components/common/EnvironmentBanner.tsx',
  'components/common/MainContent.tsx',
  'components/common/SidebarOverlay.tsx',
];

describe('sober remaining files (#485)', () => {
  it.each(FILES)('%s uses no palette classes', (file) => {
    expect(countPaletteClasses(read(file))).toBe(0);
  });

  it('the environment banner names the environment in text, in inverted greys', () => {
    const src = read('components/common/EnvironmentBanner.tsx');
    expect(src).toContain('Preview Environment');
    expect(src).toContain('Local Development');
    expect(src).toContain('bg-fg');
  });

  it('the song page retry buttons are accent buttons with 44 px targets', () => {
    const src = read('app/songs/[id]/page.tsx');
    expect(src.match(/min-h-tap px-5 py-2 rounded-control bg-accent text-on-accent/g)?.length).toBe(2);
  });
});
