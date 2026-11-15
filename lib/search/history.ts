// Story 6.1.29 / G7.1 (#413): recent searches, kept in localStorage on this device only.
// Every access is wrapped: private windows and blocked site data must never break the search field.
export const SEARCH_HISTORY_KEY = 'sacred-fire-songs-search-history';
export const MAX_RECENT_SEARCHES = 5;

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function readRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return parse(window.localStorage.getItem(SEARCH_HISTORY_KEY));
  } catch {
    return [];
  }
}

function write(terms: string[]): string[] {
  const next = terms.slice(0, MAX_RECENT_SEARCHES);
  try {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: the list still works for this page view */
  }
  return next;
}

/** Newest first; a repeated term moves to the top. Returns the new list. */
export function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  const current = readRecentSearches();
  if (!trimmed) return current;
  return write([trimmed, ...current.filter((t) => t !== trimmed)]);
}

export function removeRecentSearch(term: string): string[] {
  return write(readRecentSearches().filter((t) => t !== term));
}

export function clearRecentSearches(): string[] {
  return write([]);
}
