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
  it('has the tabs Playlists | Smart | History | New | Artists | Songbooks, in that order', () => {
    const hrefs = libraryTabs({ ...FEATURES, albums: false }).map((tab) => tab.href);
    expect(hrefs).toEqual(['/library/playlists', '/library/smart', '/library/recently-viewed', '/library/new', '/library/artists', '/songbooks']);
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
    // Other members' public playlists: no export, no rename (they are never yours on this page).
    expect(read('components/playlists/PublicPlaylistCard.tsx')).not.toMatch(/onExportPdf|onRenameStart/);
  });
});

describe('Song rows', () => {
  it('private songs are a little lighter so they stand out in any list', () => {
    expect(read('components/home/SongCard.tsx')).toMatch(/isPublic \? 'text-fg' : 'text-fg-subtle'/);
  });
});

describe('Song page, private song (validation 4)', () => {
  const page = read('app/songs/[id]/page.tsx');
  it('draws the title lighter when the song is private, in every title copy', () => {
    expect(page).toMatch(/const titleColour = song\.is_public \? 'text-fg' : 'text-fg-subtle'/);
    // Owner (third round): only a private song gets an icon after the title (lock); a public one gets no globe.
    expect(page).not.toMatch(/<VisibilityIcon isPublic=\{!!song\.is_public\}/);
    expect(page.match(/\{!song\.is_public && <VisibilityIcon isPublic=\{false\}/g)).toHaveLength(3);
    expect(page.match(/titleColour/g)!.length).toBeGreaterThanOrEqual(4); // declaration + sticky + phone h1 + desktop h1
  });
  it('offers Make public only to the owner or an admin of a private song', () => {
    expect(page).toMatch(/onPublish: !song\.is_public && \(song\.owner_id === user\?\.id \|\| isAdmin\)/);
  });
});
