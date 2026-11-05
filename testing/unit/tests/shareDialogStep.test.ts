// Story 6.1.18 / G4.5 (#402): which step the Share dialog opens on.
import { describe, expect, it } from 'vitest';
import { shareDialogStep } from '@/lib/songs/shareDialogStep';

describe('shareDialogStep', () => {
  it('opens the member search for a public song', () => {
    expect(shareDialogStep({ songIsPublic: true, canMakeSongPublic: false })).toBe('search');
    expect(shareDialogStep({ songIsPublic: true, canMakeSongPublic: true })).toBe('search');
  });

  it('asks the song owner to confirm first when the song is private', () => {
    expect(shareDialogStep({ songIsPublic: false, canMakeSongPublic: true })).toBe('confirm-private');
  });

  it('explains instead of sharing when the song is private and the member is not the song owner', () => {
    expect(shareDialogStep({ songIsPublic: false, canMakeSongPublic: false })).toBe('not-owner');
  });
});
