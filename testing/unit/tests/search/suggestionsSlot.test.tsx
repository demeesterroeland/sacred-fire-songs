// @vitest-environment jsdom
// Validation 1 (fix 4): the suggestions panel is rendered in the page flow (a slot at the top of the main
// column), so it pushes the list down instead of floating over it.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SuggestionsPortal, SuggestionsSlot } from '@/components/search/SuggestionsSlot';

afterEach(cleanup);

describe('SuggestionsSlot', () => {
  it('renders the panel inside the slot, before the page content, not where the caller sits', () => {
    render(
      <div>
        <header data-testid="header">
          <SuggestionsPortal>
            <div data-testid="panel">panel</div>
          </SuggestionsPortal>
        </header>
        <main data-testid="main">
          <SuggestionsSlot />
          <ul data-testid="list" />
        </main>
      </div>,
    );
    const panel = screen.getByTestId('panel');
    expect(screen.getByTestId('header').contains(panel)).toBe(false);
    const slot = screen.getByTestId('search-suggestions-slot');
    expect(slot.contains(panel)).toBe(true);
    // The slot comes before the list in the document: opening the panel pushes the list down.
    expect(slot.compareDocumentPosition(screen.getByTestId('list')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // And it takes part in the flow (never positioned out of it).
    expect(slot.className).not.toMatch(/\babsolute\b|\bfixed\b/);
  });

  it('shows nothing and takes no room when no panel is open', () => {
    render(<SuggestionsSlot />);
    expect(screen.getByTestId('search-suggestions-slot').childElementCount).toBe(0);
    expect(screen.getByTestId('search-suggestions-slot').className).toMatch(/empty:hidden/);
  });

  it('renders nothing when there is no slot on the page', () => {
    render(
      <SuggestionsPortal>
        <div data-testid="panel">panel</div>
      </SuggestionsPortal>,
    );
    expect(screen.queryByTestId('panel')).toBeNull();
  });

  // Validation 1 review, H1: the panel must not move the scroll position of the column it pushes down.
  it('never scrolls the page when it opens: it sticks to the top of the column instead', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(
      <div>
        <SuggestionsPortal>
          <div data-testid="panel">panel</div>
        </SuggestionsPortal>
        <SuggestionsSlot />
      </div>,
    );
    expect(screen.getByTestId('panel')).toBeTruthy();
    expect(scrollIntoView).not.toHaveBeenCalled();
    const cls = screen.getByTestId('search-suggestions-slot').className;
    expect(cls).toMatch(/\bsticky\b/);
    expect(cls).toMatch(/\btop-0\b/);
    expect(cls).toMatch(/\bbg-bg\b/); // rows pass under it while the column is scrolled
    // @ts-expect-error cleanup of the stub
    delete Element.prototype.scrollIntoView;
  });
});
