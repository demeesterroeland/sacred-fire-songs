// @vitest-environment jsdom
// Story 6.1.10 / G2.5 (#394): useWakeLock reports whether the screen lock is really held.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

const prefs = { keepScreenAwake: true };
vi.mock('@/context/UserPreferencesContext', () => ({
  useUserPreferences: () => ({ preferences: prefs }),
}));

import { useWakeLock } from '@/hooks/useWakeLock';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  prefs.keepScreenAwake = true;
  Reflect.deleteProperty(navigator, 'wakeLock');
});

function stubWakeLock() {
  const listeners: Array<() => void> = [];
  const sentinel = {
    release: vi.fn(async () => {
      listeners.forEach((l) => l());
    }),
    addEventListener: (_e: string, l: () => void) => void listeners.push(l),
  };
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: vi.fn(async () => sentinel) } });
  return { sentinel, listeners };
}

describe('useWakeLock', () => {
  it('is inactive when the browser has no Wake Lock', () => {
    const { result } = renderHook(() => useWakeLock());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isActive).toBe(false);
  });

  it('is active once the lock is granted', async () => {
    stubWakeLock();
    const { result } = renderHook(() => useWakeLock());
    await waitFor(() => expect(result.current.isActive).toBe(true));
  });

  it('is inactive when the preference is off, and no lock is requested', async () => {
    prefs.keepScreenAwake = false;
    stubWakeLock();
    const { result } = renderHook(() => useWakeLock());
    await act(async () => {});
    expect(result.current.isActive).toBe(false);
    expect((navigator as unknown as { wakeLock: { request: ReturnType<typeof vi.fn> } }).wakeLock.request).not.toHaveBeenCalled();
  });

  // Validation 2, item 10: the "Screen stays on" switch (per device, in the song menu) really lets go of the lock.
  it('releases the lock when the preference is switched off, and asks for it again when switched on', async () => {
    const { sentinel } = stubWakeLock();
    const { result, rerender } = renderHook(() => useWakeLock());
    await waitFor(() => expect(result.current.isActive).toBe(true));
    prefs.keepScreenAwake = false;
    rerender();
    await waitFor(() => expect(result.current.isActive).toBe(false));
    expect(sentinel.release).toHaveBeenCalled();
    prefs.keepScreenAwake = true;
    rerender();
    await waitFor(() => expect(result.current.isActive).toBe(true));
  });

  it('turns inactive when the system releases the lock', async () => {
    const { listeners } = stubWakeLock();
    const { result } = renderHook(() => useWakeLock());
    await waitFor(() => expect(result.current.isActive).toBe(true));
    act(() => listeners.forEach((l) => l()));
    expect(result.current.isActive).toBe(false);
  });

  it('releases a lock that is granted after the page has gone, and never turns active', async () => {
    let grant!: (s: unknown) => void;
    const listeners: Array<() => void> = [];
    const sentinel = { release: vi.fn(async () => {}), addEventListener: (_e: string, l: () => void) => void listeners.push(l) };
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: vi.fn(() => new Promise((resolve) => (grant = resolve))) },
    });
    const { result, unmount } = renderHook(() => useWakeLock());
    unmount();
    await act(async () => {
      grant(sentinel);
    });
    expect(sentinel.release).toHaveBeenCalledTimes(1);
    expect(result.current.isActive).toBe(false);
  });

  it('a second lock (tab visible again) releases the first, and the old release keeps the indicator on', async () => {
    const make = () => {
      const listeners: Array<() => void> = [];
      return {
        listeners,
        release: vi.fn(async () => listeners.forEach((l) => l())),
        addEventListener: (_e: string, l: () => void) => void listeners.push(l),
      };
    };
    const first = make();
    const second = make();
    const request = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    const { result } = renderHook(() => useWakeLock());
    await waitFor(() => expect(result.current.isActive).toBe(true));
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(() => expect(first.release).toHaveBeenCalled());
    expect(result.current.isActive).toBe(true);
  });
});
