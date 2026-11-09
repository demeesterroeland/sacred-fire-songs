// Review round: the "My Drafts" card counts the user's own drafts (owner filter), so its link must list the same songs.
// An admin reads every draft through RLS; "status=draft" alone would list them all. Own drafts = mine + draft.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { MY_DRAFTS_HREF } from '@/lib/songs/draftsLink';

describe('MY_DRAFTS_HREF', () => {
  it('asks for my songs that are drafts', () => {
    const url = new URL(MY_DRAFTS_HREF, 'http://x.test');
    expect(url.pathname).toBe('/songs');
    expect(url.searchParams.get('mine')).toBe('true');
    expect(url.searchParams.get('status')).toBe('draft');
  });
});

describe('every entry point to "my drafts" uses it', () => {
  it.each([
    'components/home/LibrarySummary.tsx',
    'components/common/navigation/UserProfile.tsx',
    'lib/navigation.ts',
  ])('%s', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src).toContain('MY_DRAFTS_HREF');
    expect(src).not.toMatch(/['"`]\/songs\?status=draft['"`]/);
  });
});
