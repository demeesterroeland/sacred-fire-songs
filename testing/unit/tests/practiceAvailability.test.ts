import { describe, it, expect } from 'vitest';
import { practiceAvailability } from '@/lib/song/practiceAvailability';

// Story 6.1.40 / G4 (#586): one dot on Practice; the drawer tabs say where.
describe('practiceAvailability', () => {
  it('a member: Listen counts reference providers, Record counts every take they can open', () => {
    expect(practiceAvailability({ providerCount: 2, takeCount: 3, isMember: true }))
      .toEqual({ listen: 2, record: 3, available: true, tabs: true });
  });

  it('a guest: public takes are listed under Listen, Record has nothing to open', () => {
    expect(practiceAvailability({ providerCount: 1, takeCount: 2, isMember: false }))
      .toEqual({ listen: 3, record: 0, available: true, tabs: true });
  });

  it('takes alone make the song available', () => {
    expect(practiceAvailability({ providerCount: 0, takeCount: 1, isMember: true }).available).toBe(true);
  });

  it('media alone makes the song available', () => {
    expect(practiceAvailability({ providerCount: 1, takeCount: 0, isMember: true }).available).toBe(true);
  });

  it('nothing to listen to or open: no dot, no counts', () => {
    expect(practiceAvailability({ providerCount: 0, takeCount: 0, isMember: false }))
      .toEqual({ listen: 0, record: 0, available: false, tabs: true });
  });
});

// #601 / #586: the drawer shows its Listen · Record tabs whenever a tab has something to show.
describe('practiceAvailability tabs', () => {
  it('a member with takes but no reference media gets the tabs (so the Record count shows)', () => {
    expect(practiceAvailability({ providerCount: 0, takeCount: 2, isMember: true }))
      .toEqual({ listen: 0, record: 2, available: true, tabs: true });
  });

  it('a member with reference media gets the tabs', () => {
    expect(practiceAvailability({ providerCount: 1, takeCount: 0, isMember: true }).tabs).toBe(true);
  });

  it('a member with neither media nor takes gets no tabs: the drawer opens on Record', () => {
    expect(practiceAvailability({ providerCount: 0, takeCount: 0, isMember: true }).tabs).toBe(false);
  });

  it('a guest always gets the tabs: the public takes live under Listen', () => {
    expect(practiceAvailability({ providerCount: 0, takeCount: 0, isMember: false }).tabs).toBe(true);
  });
});
