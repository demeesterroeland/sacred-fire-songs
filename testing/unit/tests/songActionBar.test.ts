// Story 6.1.9 / G2.4 (#393): sticky action bar on the song page — pure rules (L2).
import { describe, expect, it, vi } from 'vitest';
import {
  ACTION_BAR_BOTTOM,
  ACTION_BAR_CSS_VAR,
  ACTION_BAR_HEIGHT,
  applyActionBarHeight,
  bottomNavHeight,
  initialBarScroll,
  nextBarScroll,
  practiceTab,
} from '@/lib/song/actionBar';

describe('practiceTab', () => {
  it('opens Listen when the song has reference media', () => {
    expect(practiceTab(true)).toBe('media');
  });
  it('opens Record when there is no media', () => {
    expect(practiceTab(false)).toBe('recorder');
    expect(practiceTab(false, true)).toBe('recorder');
  });
  it('opens Listen for a guest even without media: the public takes are there, Record is gated (#405)', () => {
    expect(practiceTab(false, false)).toBe('media');
    expect(practiceTab(true, false)).toBe('media');
  });
});

describe('nextBarScroll (hide on scroll down, show on scroll up)', () => {
  const at = (y: number, visible = true) => ({ visible, anchorY: y });

  it('starts visible', () => {
    expect(initialBarScroll(0).visible).toBe(true);
  });
  it('hides when the page scrolls down past the threshold', () => {
    expect(nextBarScroll(at(300), 340, true).visible).toBe(false);
  });
  it('shows again when the page scrolls up', () => {
    expect(nextBarScroll(at(340, false), 320, true).visible).toBe(true);
  });
  it('ignores jitter below the threshold (no flicker)', () => {
    const s = at(300);
    expect(nextBarScroll(s, 303, true)).toEqual(s);
    expect(nextBarScroll(s, 297, true)).toEqual(s);
  });
  it('accumulates small steps against the anchor instead of dropping them', () => {
    let s = at(300);
    for (const y of [304, 308, 312, 316]) s = nextBarScroll(s, y, true);
    expect(s.visible).toBe(false);
  });
  it('is always visible near the top of the page', () => {
    expect(nextBarScroll(at(120, false), 10, true).visible).toBe(true);
    expect(nextBarScroll(at(40), 0, true).visible).toBe(true);
  });
  it('stays visible when the auto-hide preference is off', () => {
    expect(nextBarScroll(at(300), 900, false).visible).toBe(true);
  });
});

describe('bar position and reserved space', () => {
  it('sits above the bottom nav and the mini player, inside the safe area', () => {
    expect(ACTION_BAR_BOTTOM).toContain('--mini-player-h');
    expect(ACTION_BAR_BOTTOM).toContain('--bottom-nav-height');
    expect(ACTION_BAR_BOTTOM).toContain('env(safe-area-inset-bottom');
    expect(ACTION_BAR_BOTTOM).toContain('max(');
  });
  it('reserves its own height on the page while it is mounted', () => {
    const props = new Map<string, string>();
    const root = {
      style: {
        setProperty: vi.fn((k: string, v: string) => void props.set(k, v)),
        removeProperty: vi.fn((k: string) => void props.delete(k)),
      },
    };
    applyActionBarHeight(true, root);
    expect(props.get(ACTION_BAR_CSS_VAR)).toBe(ACTION_BAR_HEIGHT);
    applyActionBarHeight(false, root);
    expect(props.has(ACTION_BAR_CSS_VAR)).toBe(false);
  });
});

describe('bottomNavHeight', () => {
  it('reports the nav height whenever the nav is on screen, whatever the auto-hide preference', () => {
    expect(bottomNavHeight(true)).toBe('3.5rem');
  });
  it('reports 0 while the nav is slid away', () => {
    expect(bottomNavHeight(false)).toBe('0rem');
  });
});
