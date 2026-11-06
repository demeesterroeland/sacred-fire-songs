import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Follows `value` after it has stayed unchanged for `delayMs`.
 * Returns `[debounced, flush]`; `flush()` makes `debounced` the latest value at once.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): [T, () => void] {
  const [debounced, setDebounced] = useState(value);
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  const flush = useCallback(() => setDebounced(latest.current), []);
  return [debounced, flush];
}
