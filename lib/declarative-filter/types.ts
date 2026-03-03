/**
 * Generic Declarative Filter Engine Types
 * 
 * This module defines the core interfaces for a generic filtering system that
 * supports faceted search (counts per category/tag) in O(n) time.
 */

// A predicate function that tests if an item matches a specific filter value
export type Matcher<TItem, TValue> = (item: TItem, filterValue: TValue) => boolean;

// Definition of a single filter field (e.g. "category" or "minPrice")
export interface FilterFieldDef<TItem, TValue = unknown> {
  // Is this filter active? (Usually check if filterValue is non-empty)
  isActive: (value: TValue | undefined) => boolean;

  // Does the item match the current filter value?
  match: Matcher<TItem, TValue>;

  // (Optional) Function to extract facet keys from an item for counting.
  // If provided, the engine will count occurrences of each key.
  // Returns string[] because an item might belong to multiple buckets (e.g. multiple tags)
  getFacetKeys?: (item: TItem) => string[];
}

// Configuration object mapping keys (e.g. "category") to their definitions
export type FilterConfig<TItem, TFilterState> = {
  [K in keyof TFilterState]: FilterFieldDef<TItem, TFilterState[K]>;
};

// The result of the filtering operation
export interface FilterResult<TItem, TFilterState> {
  // The items that match ALL active filters
  filteredItems: TItem[];

  // Facet counts for each filter field
  // Map<FilterKey, Map<FacetKey, Count>>
  // e.g. facets.category.get('water') -> 15
  facets: Record<keyof TFilterState, Map<string, number>>;
}
