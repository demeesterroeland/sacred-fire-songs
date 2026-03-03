import { FilterConfig, FilterFieldDef, FilterResult } from "./types";

export function executeFilter<TItem, TFilterState extends Record<string, unknown>>(
  items: TItem[],
  config: FilterConfig<TItem, TFilterState>,
  state: TFilterState
): FilterResult<TItem, TFilterState> {
  const definitions = Object.entries(config) as [keyof TFilterState, FilterFieldDef<TItem, unknown>][];

  // 1. Identify active filters and Create Facet Maps
  const activeFilters: Array<{ key: keyof TFilterState; def: FilterFieldDef<TItem, unknown>; value: unknown }> = [];
  const facets: Record<keyof TFilterState, Map<string, number>> = {} as Record<keyof TFilterState, Map<string, number>>;

  for (const [key, def] of definitions) {
    facets[key as keyof TFilterState] = new Map();

    if (def.isActive(state[key])) {
      activeFilters.push({
        key: key as keyof TFilterState,
        def: def,
        value: state[key]
      });
    }
  }

  const filteredItems: TItem[] = [];

  // 2. Single Pass Loop
  for (const item of items) {
    let matchesAll = true;

    // Check main match first
    for (const filter of activeFilters) {
      if (!filter.def.match(item, filter.value)) {
        matchesAll = false;
        break;
      }
    }

    if (matchesAll) {
      filteredItems.push(item);
    }

    // 3. Calculate Facets
    // An item contributes to a Facet Count for Filter X if it matches ALL filters EXCEPT X.
    for (const [targetKey, targetDef] of definitions) {
      if (!targetDef.getFacetKeys) continue;

      // Does it match everything else?
      let matchesOthers = true;
      for (const filter of activeFilters) {
        if (filter.key === targetKey) continue; // Skip self
        if (!filter.def.match(item, filter.value)) {
          matchesOthers = false;
          break;
        }
      }

      if (matchesOthers) {
        const keys = targetDef.getFacetKeys(item);
        const facetMap = facets[targetKey as keyof TFilterState];
        for (const key of keys) {
          facetMap.set(key, (facetMap.get(key) || 0) + 1);
        }
      }
    }
  }

  return { filteredItems, facets };
}
