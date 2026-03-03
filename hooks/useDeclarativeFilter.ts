import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FilterConfig, FilterResult } from '@/lib/declarative-filter/types';
import { executeFilter } from '@/lib/declarative-filter/engine';

/**
 * Generic Hook using the Declarative Filter Engine.
 * 
 * Features:
 * - Automatically syncs filter state with URL Search Params.
 * - Memoizes filtering operations (single-pass).
 * - Typesafe integration with config.
 */
export function useDeclarativeFilter<TItem, TFilterState extends Record<string, unknown>>(
  items: TItem[],
  config: FilterConfig<TItem, TFilterState>,
  defaultState: TFilterState,
  callbacks?: {
    parseUrl?: (params: URLSearchParams) => Partial<TFilterState>;
    serializeUrl?: (state: Partial<TFilterState>) => Record<string, string>;
  }
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Parse State from URL
  const currentState = useMemo(() => {
    // Start with defaults
    const state = { ...defaultState };

    // Apply URL params
    if (callbacks?.parseUrl) {
      const urlState = callbacks.parseUrl(searchParams);
      return { ...state, ...urlState };
    }

    // Default parser (very basic, usually you want custom parsing per domain)
    searchParams.forEach((value, key) => {
      if (key in state) {
        // Very naive type conversion - prefer callbacks.parseUrl
        (state as Record<string, unknown>)[key] = value;
      }
    });

    return state;
  }, [searchParams, defaultState, callbacks]);

  // 2. Execute Engine (Memoized)
  const result: FilterResult<TItem, TFilterState> = useMemo(() => {
    return executeFilter(items, config, currentState);
  }, [items, config, currentState]);

  // 3. Update URL Handler
  const setFilter = useCallback((key: keyof TFilterState, value: unknown) => {
    const newState = { ...currentState, [key]: value };

    // Serialize
    let urlParams: Record<string, string> = {};
    if (callbacks?.serializeUrl) {
      urlParams = callbacks.serializeUrl(newState);
    } else {
      // Fallback serializer
      Object.entries(newState).forEach(([k, v]) => {
        if (v) urlParams[k] = String(v);
      });
    }

    // Construct Query String
    const params = new URLSearchParams();
    Object.entries(urlParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'false') {
        params.set(k, v);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentState, callbacks, pathname, router]);

  // 4. Reset Handler
  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filteredItems: result.filteredItems,
    facets: result.facets,
    state: currentState,
    setFilter,
    resetFilters
  };
}
