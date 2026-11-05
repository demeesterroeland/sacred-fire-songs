// Story 6.1.24 (#408): the bottom bar's Search tab asks the header search field
// to take focus. A window event keeps the two components decoupled and runs
// inside the tap, so phone keyboards open.
export const FOCUS_SEARCH_EVENT = 'sfs:focus-search';

export function requestSearchFocus(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(FOCUS_SEARCH_EVENT));
}
