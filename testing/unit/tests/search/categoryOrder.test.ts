// Story 6.1.29 / G7.1 (#413): the chips use the same category order as the home grid.
import { describe, expect, it } from 'vitest';
import { sortCategories } from '@/lib/categoryOrder';

describe('sortCategories', () => {
  it('puts the curated categories first, the rest alphabetically, without mutating the input', () => {
    const input = [{ name: 'Zeta' }, { name: 'Languages' }, { name: 'Alpha' }, { name: 'The Elements' }];
    expect(sortCategories(input).map((c) => c.name)).toEqual(['The Elements', 'Languages', 'Alpha', 'Zeta']);
    expect(input.map((c) => c.name)).toEqual(['Zeta', 'Languages', 'Alpha', 'The Elements']);
  });
});
