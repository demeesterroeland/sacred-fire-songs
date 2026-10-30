import { describe, it, expect } from 'vitest';
import { keyToIndex, typeaheadIndex } from '@/lib/ui/listbox';

describe('keyToIndex', () => {
  it('moves down and up, clamped at the ends', () => {
    expect(keyToIndex('ArrowDown', 0, 3)).toBe(1);
    expect(keyToIndex('ArrowDown', 2, 3)).toBe(2);
    expect(keyToIndex('ArrowUp', 1, 3)).toBe(0);
    expect(keyToIndex('ArrowUp', 0, 3)).toBe(0);
  });

  it('jumps to the first and last option', () => {
    expect(keyToIndex('Home', 2, 3)).toBe(0);
    expect(keyToIndex('End', 0, 3)).toBe(2);
  });

  it('ignores other keys', () => {
    expect(keyToIndex('a', 0, 3)).toBeNull();
    expect(keyToIndex('Enter', 0, 3)).toBeNull();
  });
});

describe('typeaheadIndex', () => {
  const labels = ['All roles', 'Admin', 'Gatekeeper', 'Member', 'Musician / Expert'];

  it('finds the next option starting with the typed character, case-insensitively', () => {
    expect(typeaheadIndex(labels, 0, 'g')).toBe(2);
    expect(typeaheadIndex(labels, 0, 'M')).toBe(3);
  });

  it('cycles through options with the same first letter and wraps', () => {
    expect(typeaheadIndex(labels, 3, 'm')).toBe(4);
    expect(typeaheadIndex(labels, 4, 'm')).toBe(3);
    expect(typeaheadIndex(labels, 1, 'a')).toBe(0);
  });

  it('returns null for no match or non-character keys', () => {
    expect(typeaheadIndex(labels, 0, 'z')).toBeNull();
    expect(typeaheadIndex(labels, 0, 'ArrowDown')).toBeNull();
  });
});
