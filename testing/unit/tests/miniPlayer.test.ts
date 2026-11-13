import { describe, expect, it, vi } from 'vitest';
import {
  MINI_PLAYER_CSS_VAR,
  applyMiniPlayerHeight,
  isMiniPlayerVisible,
  mediaSessionReducer,
  miniPlayerClose,
  ownsActiveTake,
} from '@/lib/player/miniPlayer';

// Story 6.1.12 / G3.1 (#396), UXD-5: the mini player appears only after play.

function fakeRoot() {
  const props = new Map<string, string>();
  return {
    props,
    style: {
      setProperty: vi.fn((k: string, v: string) => void props.set(k, v)),
      removeProperty: vi.fn((k: string) => void props.delete(k)),
    },
  };
}

describe('ownsActiveTake', () => {
  it('is false without an active take', () => {
    expect(ownsActiveTake(null, ['rec-1'])).toBe(false);
  });
  it('is true for a take of this song', () => {
    expect(ownsActiveTake('rec-1', ['rec-1', 'rec-2'])).toBe(true);
  });
  it('is false for a take of another song', () => {
    expect(ownsActiveTake('rec-other', ['rec-1', 'rec-2'])).toBe(false);
    expect(ownsActiveTake('rec-other', [])).toBe(false);
  });
});

describe('isMiniPlayerVisible', () => {
  const ids = ['rec-1', 'rec-2'];
  it('is hidden on a fresh song page (nothing played yet)', () => {
    expect(isMiniPlayerVisible({ mediaSessionStarted: false, activePlaybackId: null, songRecordingIds: ids })).toBe(false);
  });
  it('shows once a reference track started', () => {
    expect(isMiniPlayerVisible({ mediaSessionStarted: true, activePlaybackId: null, songRecordingIds: ids })).toBe(true);
  });
  it('shows while a take of this song is the active playback (also after pause)', () => {
    expect(isMiniPlayerVisible({ mediaSessionStarted: false, activePlaybackId: 'rec-1', songRecordingIds: ids })).toBe(true);
  });
  it('stays hidden when the active take belongs to another song (the audio provider is global)', () => {
    expect(isMiniPlayerVisible({ mediaSessionStarted: false, activePlaybackId: 'rec-of-song-a', songRecordingIds: ids })).toBe(false);
    expect(isMiniPlayerVisible({ mediaSessionStarted: false, activePlaybackId: 'rec-of-song-a', songRecordingIds: [] })).toBe(false);
  });
  it('still shows for this song\'s reference track when a foreign take is active', () => {
    expect(isMiniPlayerVisible({ mediaSessionStarted: true, activePlaybackId: 'rec-of-song-a', songRecordingIds: ids })).toBe(true);
  });
});

describe('mediaSessionReducer', () => {
  it('starts on play, ends on stop', () => {
    let s = false;
    s = mediaSessionReducer(s, 'playing');
    expect(s).toBe(true);
    s = mediaSessionReducer(s, 'stopped');
    expect(s).toBe(false);
  });
  it('hands over to a take when one starts', () => {
    expect(mediaSessionReducer(true, 'take-started')).toBe(false);
  });
});

describe('applyMiniPlayerHeight', () => {
  it('reserves bar height plus the bottom nav while visible', () => {
    const root = fakeRoot();
    applyMiniPlayerHeight(true, root);
    const v = root.props.get(MINI_PLAYER_CSS_VAR)!;
    expect(v).toContain('3.5rem');
    expect(v).toContain('--bottom-nav-height');
  });
  it('removes the property when hidden (no stale value left on <html>)', () => {
    const root = fakeRoot();
    applyMiniPlayerHeight(true, root);
    applyMiniPlayerHeight(false, root);
    expect(root.style.removeProperty).toHaveBeenCalledWith(MINI_PLAYER_CSS_VAR);
    expect(root.props.has(MINI_PLAYER_CSS_VAR)).toBe(false);
  });
});

describe('✕ closes the bar whatever plays (UXD-5)', () => {
  const ids = ['take-a'];
  it.each([
    ['only a take of this song', { mediaSessionStarted: false, activePlaybackId: 'take-a' }, true],
    ['only a reference track', { mediaSessionStarted: true, activePlaybackId: null }, false],
    ['a paused take and a playing reference track', { mediaSessionStarted: true, activePlaybackId: 'take-a' }, true],
    ['a reference track while a take of another song is active', { mediaSessionStarted: true, activePlaybackId: 'take-b' }, false],
  ])('%s: stops what this song plays and hides the bar', (_label, state, stopTake) => {
    const close = miniPlayerClose(state.activePlaybackId, ids);
    expect(close.stopTake).toBe(stopTake);
    expect(close.stopReference).toBe(true);
    const after = {
      mediaSessionStarted: mediaSessionReducer(state.mediaSessionStarted, 'stopped'),
      activePlaybackId: close.stopTake ? null : state.activePlaybackId,
      songRecordingIds: ids,
    };
    expect(isMiniPlayerVisible(after)).toBe(false);
  });
});
