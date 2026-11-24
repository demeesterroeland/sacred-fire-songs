// @vitest-environment jsdom
// Story 6.1.34 / G9.2 (#418): Escape belongs to a widget that is busy with it (a keyboard drag) before the dialog.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { useModalFocus } from '@/hooks/useModalFocus';

afterEach(cleanup);

function Dialog({ onEscape, escapeBusy }: { onEscape: () => void; escapeBusy?: () => boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useModalFocus({ open: true, containerRef: ref, onEscape, escapeBusy });
  return (
    <div ref={ref} tabIndex={-1} data-testid="dlg">
      <button>inside</button>
    </div>
  );
}

describe('useModalFocus Escape', () => {
  it('closes on Escape', () => {
    const onEscape = vi.fn();
    const { getByText } = render(<Dialog onEscape={onEscape} />);
    getByText('inside').focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not close while a widget inside is busy with Escape (a keyboard drag), then closes again', () => {
    const onEscape = vi.fn();
    let busy = true;
    const { getByText } = render(<Dialog onEscape={onEscape} escapeBusy={() => busy} />);
    getByText('inside').focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
    busy = false;
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});

// #664: the Practice drawer may still be `visibility: hidden` (framer-motion's first frame) when the hook
// first focuses it; the browser then ignores focus(). The hook must try again on the next frames.
describe('useModalFocus initial focus', () => {
  function Opening() {
    const ref = useRef<HTMLDivElement>(null);
    useModalFocus({ open: true, containerRef: ref, onEscape: () => {} });
    return (
      <div ref={ref} tabIndex={-1} data-testid="dlg">
        <button>inside</button>
      </div>
    );
  }

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('keeps trying until focus lands in the dialog when the first focus() is ignored', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout'] });
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    // A hidden element does not take focus: the first two calls do nothing, like the first frames of the animation.
    const realFocus = HTMLElement.prototype.focus;
    let ignored = 2;
    vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, options?: FocusOptions) {
      if (this.dataset.testid === 'dlg' && ignored > 0) {
        ignored -= 1;
        return;
      }
      realFocus.call(this, options);
    });

    const { getByTestId } = render(<Opening />);
    vi.advanceTimersByTime(16);
    expect(document.activeElement).toBe(opener); // still hidden on the first frame
    vi.advanceTimersByTime(16 * 5);
    expect(getByTestId('dlg').contains(document.activeElement)).toBe(true);
    opener.remove();
  });

  it('stops retrying once the dialog closes', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout'] });
    const focus = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(() => {});
    const { unmount } = render(<Opening />);
    vi.advanceTimersByTime(16);
    unmount();
    const calls = focus.mock.calls.length;
    vi.advanceTimersByTime(16 * 30);
    // Only the opener restore may still run after close; the dialog is not focused again.
    expect(focus.mock.calls.length).toBeLessThanOrEqual(calls + 1);
  });
});
