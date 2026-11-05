// @vitest-environment jsdom
// Story 6.1.20 / G4.7 (#404): level meter, optional count-in, remaining time and the review step (L3, RTL, English copy).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import AudioRecorder from '@/components/song/AudioRecorder';
import { countPaletteClasses } from '@/lib/design/paletteAudit';
import { DICTIONARIES } from '@/lib/i18n';
import { readFileSync } from 'node:fs';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      Object.entries(p ?? {}).reduce((s, [n, v]) => s.replace(`{${n}}`, String(v)), dict[k] ?? k),
  }),
}));
vi.mock('sonner', () => ({ toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() } }));
vi.mock('@/lib/actions/rehearsal', () => ({ uploadRehearsalRecording: vi.fn() }));

// The hook is tested on its own; here the component gets a controllable level.
const meter = { level: 0, levels: new Array(8).fill(0) as number[], silent: false };
const useInputLevel = vi.hoisted(() => vi.fn());
const createAudioContext = vi.hoisted(() => vi.fn());
vi.mock('@/lib/recorder/useInputLevel', () => ({ useInputLevel, createAudioContext }));

class FakeContext {
  closed = false;
  close = vi.fn(() => { this.closed = true; return Promise.resolve(); });
}

class FakeMediaRecorder {
  static isTypeSupported = () => true;
  static instances: FakeMediaRecorder[] = [];
  static failOnConstruct = false;
  constructor() {
    if (FakeMediaRecorder.failOnConstruct) throw new Error('NotSupportedError');
    FakeMediaRecorder.instances.push(this);
  }
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  start() { this.state = 'recording'; }
  pause() { this.state = 'paused'; }
  resume() { this.state = 'recording'; }
  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['x'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

const stopTrack = vi.fn();
let getUserMedia: ReturnType<typeof vi.fn>;
let contexts: FakeContext[];

beforeEach(() => {
  vi.useFakeTimers();
  meter.level = 0;
  meter.levels = new Array(8).fill(0);
  meter.silent = false;
  contexts = [];
  useInputLevel.mockReset();
  useInputLevel.mockImplementation(() => meter);
  createAudioContext.mockReset();
  createAudioContext.mockImplementation(() => { const c = new FakeContext(); contexts.push(c); return c; });
  FakeMediaRecorder.instances = [];
  FakeMediaRecorder.failOnConstruct = false;
  vi.spyOn(console, 'error').mockImplementation(() => {});
  stopTrack.mockClear();
  getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
  URL.createObjectURL = vi.fn(() => 'blob:take');
  URL.revokeObjectURL = vi.fn();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const setup = () => render(<AudioRecorder songVersionId="v1" onRecordingSaved={vi.fn()} />);
const tick = async (ms: number) => { await act(async () => { vi.advanceTimersByTime(ms); }); };
const press = async (name: string) => { await act(async () => { fireEvent.click(screen.getByTitle(name)); }); };

describe('count-in toggle', () => {
  it('is on by default, in words, and states the 3-minute limit', () => {
    setup();
    const toggle = screen.getByRole('switch', { name: 'Count in 3-2-1 before recording' }) as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    expect(screen.getByText('Maximum take length: 3 minutes')).toBeTruthy();
  });

  it('on: 3-2-1 is announced, then recording starts', async () => {
    setup();
    await press('Start recording');
    expect(screen.getByText(/^Starting in \d$/).textContent).toBe('Starting in 3');
    await tick(1000);
    expect(screen.getByText(/^Starting in \d$/).textContent).toBe('Starting in 2');
    await tick(1000);
    expect(screen.getByText(/^Starting in \d$/).textContent).toBe('Starting in 1');
    expect(screen.queryByText('Recording...')).toBeNull();
    await tick(1000);
    expect(screen.getByText('Recording...')).toBeTruthy();
    expect(screen.getAllByRole('status').every((el) => el.textContent === '')).toBe(true);
  });

  it('the live region is mounted empty before the count-in fills it (so screen readers announce it)', async () => {
    setup();
    const region = screen.getAllByRole('status')[0];
    expect(region.textContent).toBe('');
    await press('Start recording');
    expect(screen.getAllByRole('status')[0]).toBe(region); // same element, now with text
    expect(region.textContent).toBe('Starting in 3');
  });

  it('off: recording starts at once, and the choice is remembered', async () => {
    const { unmount } = setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    expect(screen.getByText('Recording...')).toBeTruthy();
    unmount();
    cleanup();
    setup();
    await act(async () => {});
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(false);
  });

  it('can be cancelled during the count-in (microphone released)', async () => {
    setup();
    await press('Start recording');
    await press('Cancel and discard');
    expect(stopTrack).toHaveBeenCalled();
    expect(screen.getByText('Ready to record')).toBeTruthy();
    await tick(5000);
    expect(screen.queryByText('Recording...')).toBeNull();
  });
});

describe('level meter', () => {
  it('shows an accessible meter that follows the input while recording', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    const el = screen.getByRole('meter', { name: 'Input level' });
    expect(el.getAttribute('aria-valuenow')).toBe('0');
    meter.level = 0.5;
    meter.levels = [0, 0, 0, 0, 0, 0.2, 0.5, 0.5];
    await tick(100); // any re-render picks up the new level
    await act(async () => { fireEvent.click(screen.getByTitle('Pause recording')); });
    await act(async () => { fireEvent.click(screen.getByTitle('Resume recording')); });
    const again = screen.getByRole('meter', { name: 'Input level' });
    expect(again.getAttribute('aria-valuenow')).toBe('50');
    const bars = again.querySelectorAll('[data-bar]');
    expect(bars).toHaveLength(8);
    // level is bar height, not colour: a louder bar is taller
    const h = (i: number) => parseFloat((bars[i] as HTMLElement).style.height);
    expect(h(7)).toBeGreaterThan(h(0));
  });

  it('shows the no-sound hint while recording when the hook reports a silent window', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    const hint = screen.getAllByRole('status').find((el) => el.getAttribute('data-testid') === 'recorder-silent-hint')!;
    expect(hint.textContent).toBe(''); // mounted empty, always present
    meter.silent = true;
    await tick(1000); // the timer re-renders, which picks up the mocked hook's new value
    expect(screen.getAllByRole('status').find((el) => el.getAttribute('data-testid') === 'recorder-silent-hint')).toBe(hint);
    expect(hint.textContent).toBe('No sound yet. Check that your microphone is on and not muted.');
    await press('Pause recording');
    expect(hint.textContent).toBe(''); // not while paused
  });

  it('the meter listens during the count-in but only counts silence while recording', async () => {
    setup();
    await press('Start recording');
    let [, , active, counting] = useInputLevel.mock.calls.at(-1)!;
    expect([active, counting]).toEqual([true, false]);
    await tick(3000);
    [, , active, counting] = useInputLevel.mock.calls.at(-1)!;
    expect([active, counting]).toEqual([true, true]);
    await press('Pause recording');
    [, , active, counting] = useInputLevel.mock.calls.at(-1)!;
    expect([active, counting]).toEqual([false, false]);
  });
});

describe('remaining time', () => {
  it('shows "1:00 left" at 2:00 and nothing before the last minute', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    await tick(119_000);
    expect(screen.queryByText(/left$/)).toBeNull();
    expect(screen.getByText('01:59')).toBeTruthy();
    await tick(1000);
    expect(screen.getByText('02:00')).toBeTruthy();
    expect(screen.getByText('1:00 left')).toBeTruthy();
    await tick(20_000);
    expect(screen.getByText('0:40 left')).toBeTruthy();
  });

  it('colour is never alone in the last 10 s: the line also turns bold', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    await tick(169_000);
    expect(screen.getByText('0:11 left').className).toContain('font-semibold');
    expect(screen.getByText('0:11 left').className).not.toContain('font-bold');
    await tick(1000);
    const urgent = screen.getByText('0:10 left');
    expect(urgent.className).toContain('text-danger');
    expect(urgent.className).toContain('font-bold');
    expect(urgent.className).not.toContain('font-semibold');
  });

  it('stops by itself at 3:00 and goes to review', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    for (let i = 0; i < 182; i++) await tick(1000); // second by second, like a real clock
    expect(screen.getByText('Review your take')).toBeTruthy();
    expect(screen.getByText('03:00')).toBeTruthy();
  });
});

describe('review step', () => {
  async function toReview() {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    await tick(2000);
    await press('Stop recording');
  }

  it('Save is the single full-width primary, Discard a text button below it', async () => {
    await toReview();
    const save = screen.getByRole('button', { name: 'Save Take' });
    const discard = screen.getByRole('button', { name: 'Discard' });
    expect(save.className).toContain('w-full');
    expect(save.className).toContain('bg-accent');
    expect(discard.className).not.toContain('bg-accent');
    expect(discard.className).not.toMatch(/\bborder\b/);
    expect(save.compareDocumentPosition(discard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(save.className).toContain('min-h-tap');
    expect(discard.className).toContain('min-h-tap');
  });

  it('Discard returns to the start', async () => {
    await toReview();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Discard' })); });
    expect(screen.getByText('Ready to record')).toBeTruthy();
  });
});

describe('microphone lifecycle', () => {
  it('releases the microphone and the audio context when the recorder cannot start (no count-in)', async () => {
    FakeMediaRecorder.failOnConstruct = true;
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    expect(stopTrack).toHaveBeenCalled();
    expect(contexts[0].closed).toBe(true);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Ready to record')).toBeTruthy();
  });

  it('releases the microphone and shows the error when it fails after the count-in, without an uncaught error', async () => {
    FakeMediaRecorder.failOnConstruct = true;
    setup();
    await press('Start recording');
    expect(stopTrack).not.toHaveBeenCalled();
    await tick(3000);
    expect(stopTrack).toHaveBeenCalled();
    expect(contexts[0].closed).toBe(true);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Ready to record')).toBeTruthy();
    await tick(5000); // the interval is gone
    expect(screen.queryByText('Recording...')).toBeNull();
  });

  it('stops a microphone that arrives after the recorder was closed', async () => {
    let resolve!: (s: unknown) => void;
    getUserMedia.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { unmount } = setup();
    await press('Start recording');
    unmount();
    await act(async () => { resolve({ getTracks: () => [{ stop: stopTrack }] }); });
    expect(stopTrack).toHaveBeenCalled();
    expect(contexts[0].closed).toBe(true);
    expect(FakeMediaRecorder.instances).toHaveLength(0);
  });

  it('creates the audio context synchronously in the tap, before the microphone prompt resolves (iOS)', async () => {
    getUserMedia.mockReturnValue(new Promise(() => {})); // permission prompt still open
    setup();
    fireEvent.click(screen.getByTitle('Start recording'));
    expect(createAudioContext).toHaveBeenCalledTimes(1);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(createAudioContext.mock.invocationCallOrder[0]).toBeLessThan(getUserMedia.mock.invocationCallOrder[0]);
  });

  it('shares one context per take, over pause and resume, and closes it on stop', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    const shared = useInputLevel.mock.calls.at(-1)![1];
    expect(shared).toBe(contexts[0]);
    await press('Pause recording');
    await press('Resume recording');
    expect(createAudioContext).toHaveBeenCalledTimes(1);
    expect(useInputLevel.mock.calls.at(-1)![1]).toBe(contexts[0]);
    expect(contexts[0].closed).toBe(false);
    await press('Stop recording');
    expect(contexts[0].closed).toBe(true);
  });

  it('closes the context when the microphone is denied', async () => {
    getUserMedia.mockRejectedValue(new Error('NotAllowedError'));
    setup();
    await press('Start recording');
    expect(contexts[0].closed).toBe(true);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

describe('discard during recording', () => {
  it('cannot refill the take afterwards: the recorder is detached and stopped', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    const recorder = FakeMediaRecorder.instances[0];
    await press('Cancel and discard');
    expect(recorder.state).toBe('inactive');
    expect(recorder.onstop).toBeNull();
    expect(recorder.ondataavailable).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(screen.getByText('Ready to record')).toBeTruthy();
    expect(screen.queryByText('Review your take')).toBeNull();
  });

  it('revokes the old blob URL when the take is discarded or replaced', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    await tick(1000);
    await press('Stop recording');
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Discard' })); });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:take');
  });

  it('revokes the blob URL when the recorder unmounts', async () => {
    const { unmount } = setup();
    fireEvent.click(screen.getByRole('switch'));
    await press('Start recording');
    await press('Stop recording');
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:take');
  });
});

describe('design', () => {
  it('the recorder uses semantic tokens only', () => {
    for (const file of ['components/song/AudioRecorder.tsx', 'components/song/RecorderMeter.tsx']) {
      expect(countPaletteClasses(readFileSync(file, 'utf8')), file).toBe(0);
    }
    expect(readFileSync('components/song/AudioRecorder.tsx', 'utf8')).toContain('motion-safe:');
  });
});
