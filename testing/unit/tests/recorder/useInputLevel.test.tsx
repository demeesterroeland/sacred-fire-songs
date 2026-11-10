// @vitest-environment jsdom
// Story 6.1.20 / G4.7 (#404): the Web Audio level hook reads an AnalyserNode from a shared AudioContext (L3, mocked Web Audio).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { createAudioContext, useInputLevel } from '@/lib/recorder/useInputLevel';

let samples: number; // byte value the analyser returns (128 = silence)
const close = vi.fn(() => Promise.resolve());
const disconnect = vi.fn();
const connectToDestination = vi.fn();
let sourceError: Error | null = null;

class FakeAnalyser {
  fftSize = 0;
  getByteTimeDomainData(buf: Uint8Array) {
    // alternate around 128 so RMS = |samples-128|/128
    for (let i = 0; i < buf.length; i++) buf[i] = i % 2 ? 128 + (samples - 128) : 128 - (samples - 128);
  }
}
class FakeAudioContext {
  static created = 0;
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  close = close;
  constructor() { FakeAudioContext.created += 1; }
  createAnalyser() { return new FakeAnalyser(); }
  createMediaStreamSource() {
    if (sourceError) throw sourceError;
    return { connect: (n: unknown) => { if (n === this.destination) connectToDestination(); }, disconnect };
  }
}

const fakeStream = {} as MediaStream;
const ctx = () => new FakeAudioContext() as unknown as AudioContext;
let now = 0;

beforeEach(() => {
  vi.useFakeTimers();
  samples = 128;
  now = 0;
  sourceError = null;
  FakeAudioContext.created = 0;
  close.mockClear();
  disconnect.mockClear();
  connectToDestination.mockClear();
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) =>
    setTimeout(() => { now += 60; cb(now); }, 60) as unknown as number);
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const run = async (ms: number) => { await act(async () => { vi.advanceTimersByTime(ms); }); };

describe('createAudioContext', () => {
  it('creates and resumes one context synchronously (for the tap that starts a take)', () => {
    const c = createAudioContext() as unknown as FakeAudioContext;
    expect(FakeAudioContext.created).toBe(1);
    expect(c.resume).toHaveBeenCalledTimes(1);
  });
  it('returns null without Web Audio, or when the constructor throws', () => {
    vi.stubGlobal('AudioContext', undefined);
    expect(createAudioContext()).toBeNull();
    vi.stubGlobal('AudioContext', class { constructor() { throw new Error('nope'); } });
    expect(createAudioContext()).toBeNull();
  });
});

describe('useInputLevel', () => {
  it('is silent without a stream or context', () => {
    const { result } = renderHook(() => useInputLevel(null, null, true, true));
    expect(result.current.level).toBe(0);
    expect(result.current.silent).toBe(false);
    expect(result.current.levels).toHaveLength(8);
  });

  it('follows the input: silence reads 0, a loud signal reads high', async () => {
    const c = ctx();
    const { result } = renderHook(() => useInputLevel(fakeStream, c, true, true));
    await run(200);
    expect(result.current.level).toBe(0);
    samples = 228; // rms ≈ 0.78
    await run(200);
    expect(result.current.level).toBeGreaterThan(0.8);
    expect(result.current.levels[7]).toBe(result.current.level);
  });

  it('never routes the microphone to the speakers (no echo)', async () => {
    renderHook(() => useInputLevel(fakeStream, ctx(), true, true));
    await run(100);
    expect(connectToDestination).not.toHaveBeenCalled();
  });

  it('reads 0 when paused or the stream goes away, and never closes the shared context', async () => {
    samples = 228;
    const c = ctx();
    const { result, rerender } = renderHook(({ s, a }) => useInputLevel(s, c, a, true), { initialProps: { s: fakeStream as MediaStream | null, a: true } });
    await run(200);
    expect(result.current.level).toBeGreaterThan(0);
    rerender({ s: fakeStream, a: false });
    expect(result.current.level).toBe(0);
    expect(disconnect).toHaveBeenCalledTimes(1);
    rerender({ s: fakeStream, a: true });
    await run(200);
    expect(result.current.level).toBeGreaterThan(0);
    rerender({ s: null, a: true });
    expect(result.current.level).toBe(0);
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(close).not.toHaveBeenCalled(); // one context per take: its owner closes it
  });

  it('degrades to a flat meter without a context', async () => {
    const { result } = renderHook(() => useInputLevel(fakeStream, null, true, true));
    await run(200);
    expect(result.current.level).toBe(0);
  });

  it('degrades to a flat meter when the source cannot be created, without throwing', async () => {
    sourceError = new Error('InvalidStateError');
    const { result } = renderHook(() => useInputLevel(fakeStream, ctx(), true, true));
    await run(200);
    expect(result.current.level).toBe(0);
    expect(result.current.silent).toBe(false);
  });
});

describe('silent window while recording', () => {
  it('turns silent after 3 s without sound, and clears when sound returns (rolling, not a latch)', async () => {
    const c = ctx();
    const { result } = renderHook(() => useInputLevel(fakeStream, c, true, true));
    await run(2400);
    expect(result.current.silent).toBe(false);
    await run(1200);
    expect(result.current.silent).toBe(true);
    samples = 228;
    await run(200);
    expect(result.current.silent).toBe(false);
    samples = 128; // quiet again: a new 3 s window must run out first
    await run(2400);
    expect(result.current.silent).toBe(false);
    await run(1200);
    expect(result.current.silent).toBe(true);
  });

  it('does not count the count-in: silence only counts once recording starts', async () => {
    const c = ctx();
    const { result, rerender } = renderHook(({ rec }) => useInputLevel(fakeStream, c, true, rec), { initialProps: { rec: false } });
    await run(5000); // 5 s of silent count-in
    expect(result.current.silent).toBe(false);
    rerender({ rec: true });
    await run(2400);
    expect(result.current.silent).toBe(false);
    await run(1200);
    expect(result.current.silent).toBe(true);
  });

  it('restarts the window after a pause', async () => {
    const c = ctx();
    const { result, rerender } = renderHook(({ a }) => useInputLevel(fakeStream, c, a, true), { initialProps: { a: true } });
    await run(3600);
    expect(result.current.silent).toBe(true);
    rerender({ a: false });
    expect(result.current.silent).toBe(false);
    rerender({ a: true });
    await run(1200);
    expect(result.current.silent).toBe(false);
  });
});
