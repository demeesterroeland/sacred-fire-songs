// Story 6.1.17 / G4.4 (#401): which actions a take offers, and in which groups.
import { describe, expect, it } from 'vitest';
import { takeActionGroups, takeHasActionSheet } from '@/lib/songs/takeActions';

const ids = (groups: ReturnType<typeof takeActionGroups>) => groups.map((g) => g.actions);

describe('takeActionGroups', () => {
  it('groups my own take: listen/manage, then share/publish, then Delete alone', () => {
    expect(ids(takeActionGroups({ is_owner: true }, { canCopyLink: true }))).toEqual([
      ['play', 'rename', 'download'],
      ['share', 'singer', 'visibility', 'copyLink'],
      ['delete'],
    ]);
  });

  it('treats a take without ownership info (just saved on this device) as mine', () => {
    expect(ids(takeActionGroups({}, { canCopyLink: false }))).toEqual([
      ['play', 'rename', 'download'],
      ['share', 'singer', 'visibility'],
      ['delete'],
    ]);
  });

  it('puts Delete in a group of its own, last', () => {
    const groups = takeActionGroups({ is_owner: true }, { canCopyLink: true });
    expect(groups[groups.length - 1].key).toBe('danger');
    expect(groups.filter((g) => g.actions.includes('delete'))).toHaveLength(1);
    expect(groups[groups.length - 1].actions).toEqual(['delete']);
  });

  it('shows only Play for a take someone shared with me', () => {
    expect(ids(takeActionGroups({ is_owner: false, is_shared: true }, { canCopyLink: true }))).toEqual([['play']]);
  });

  it('shows only Play for another singer’s public take', () => {
    expect(ids(takeActionGroups({ is_owner: false }, { canCopyLink: true }))).toEqual([['play']]);
  });
});

describe('takeHasActionSheet', () => {
  it('is true for my take and false for a listen-only take', () => {
    expect(takeHasActionSheet({ is_owner: true })).toBe(true);
    expect(takeHasActionSheet({ is_owner: false })).toBe(false);
  });
});
