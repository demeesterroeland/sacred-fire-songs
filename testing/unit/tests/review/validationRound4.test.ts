// Validation round 4 (UX v2): source-level checks for the layout requests that have no runtime logic.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { libraryTabs } from '@/lib/navigation';
import { FEATURES } from '@/lib/features';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

describe('Song page', () => {
  it('shows the reader toolbar (Chords · A− · A+) above the version switch', () => {
    const page = read('app/songs/[id]/page.tsx');
    const toolbar = page.indexOf('<ReaderToolbar');
    const versions = page.indexOf('<SongVersionSwitch');
    expect(toolbar).toBeGreaterThan(0);
    expect(versions).toBeGreaterThan(toolbar);
  });
});

describe('Library', () => {
  it('has the tabs Playlists | Smart | History | New | Artists, in that order', () => {
    const hrefs = libraryTabs({ ...FEATURES, albums: false }).map((tab) => tab.href);
    expect(hrefs).toEqual(['/library/playlists', '/library/smart', '/library/recently-viewed', '/library/new', '/library/artists']);
  });

  it('the playlists page splits own private, own public and other public playlists, without the old blocks', () => {
    const page = read('app/library/playlists/page.tsx');
    for (const id of ['your-private-playlists', 'your-public-playlists', 'other-public-playlists']) expect(page).toContain(id);
    expect(page).not.toContain('RecentlyViewed');
    expect(page).not.toContain('NewSinceLastVisit');
    expect(page).not.toContain('SmartPlaylistCard');
  });

  it('Smart playlists have no "My Drafts"', () => {
    const smart = read('app/library/smart/page.tsx');
    expect(smart).toContain('SmartPlaylistCard');
    expect(smart).not.toMatch(/librarySummary.drafts|MY_DRAFTS/);
  });

  it('own playlist rows offer Export PDF in their menu', () => {
    expect(read('components/playlists/PlaylistCard.tsx')).toMatch(/onExportPdf=\{exportPdf\}/);
    expect(read('components/playlists/PublicPlaylistCard.tsx')).toMatch(/onExportPdf=\{isOwner \? exportPdf : undefined\}/);
  });
});

describe('Song rows', () => {
  it('private songs are a little lighter so they stand out in any list', () => {
    expect(read('components/home/SongCard.tsx')).toMatch(/isPublic \? 'text-fg' : 'text-fg-muted'/);
  });
});
