// @vitest-environment jsdom
// Validation 2, item 6 (#392): the truncated sticky title shows only after the full title has scrolled away.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useScrolledPast } from '@/hooks/useScrolledPast';

type Entry = Partial<IntersectionObserverEntry> & { boundingClientRect: DOMRect };
let callback: ((entries: Entry[]) => void) | undefined;
let observed: Element | undefined;
let options: IntersectionObserverInit | undefined;

class FakeIO {
  constructor(cb: (entries: Entry[]) => void, opts?: IntersectionObserverInit) {
    callback = cb;
    options = opts;
  }
  observe(el: Element) { observed = el; }
  disconnect() { callback = undefined; }
  unobserve() {}
}

function Probe() {
  const ref = useRef<HTMLHeadingElement>(null);
  const past = useScrolledPast(ref, 56);
  return (
    <>
      <h1 ref={ref}>Title</h1>
      <output data-testid="past">{String(past)}</output>
    </>
  );
}

const rect = (bottom: number) => ({ bottom, top: bottom - 30 }) as DOMRect;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  callback = undefined;
  observed = undefined;
});

describe('useScrolledPast', () => {
  it('is false at first and observes the element with the bar height as top margin', () => {
    vi.stubGlobal('IntersectionObserver', FakeIO);
    render(<Probe />);
    expect(screen.getByTestId('past').textContent).toBe('false');
    expect(observed?.tagName).toBe('H1');
    expect(options?.rootMargin).toBe('-56px 0px 0px 0px');
  });

  it('turns true once the title has left above the bar, false when it comes back', () => {
    vi.stubGlobal('IntersectionObserver', FakeIO);
    render(<Probe />);
    act(() => callback!([{ isIntersecting: false, boundingClientRect: rect(20) }]));
    expect(screen.getByTestId('past').textContent).toBe('true');
    act(() => callback!([{ isIntersecting: true, boundingClientRect: rect(120) }]));
    expect(screen.getByTestId('past').textContent).toBe('false');
  });

  it('is not "past" when the title is merely not in view below the window', () => {
    vi.stubGlobal('IntersectionObserver', FakeIO);
    render(<Probe />);
    act(() => callback!([{ isIntersecting: false, boundingClientRect: rect(900) }]));
    expect(screen.getByTestId('past').textContent).toBe('false');
  });

  it('stays false without IntersectionObserver (the full title is simply always in the page)', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Probe />);
    expect(screen.getByTestId('past').textContent).toBe('false');
  });
});
