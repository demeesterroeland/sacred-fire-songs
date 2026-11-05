// Story 6.1.16 / G4.3 (#400): status pills of a take row, as data.
import { describe, expect, it } from 'vitest';
import { takeStatusPills } from '@/lib/songs/takeStatus';

const share = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, user_id: `u${i}`, email: `u${i}@example.org`, full_name: null }));

describe('takeStatusPills', () => {
  it('is empty for a private take nobody has seen', () => {
    expect(takeStatusPills({ is_owner: true, is_public: false, shared_with: [] })).toEqual([]);
  });

  it('shows Public and Shared with the count for a public take shared with two people', () => {
    expect(takeStatusPills({ is_owner: true, is_public: true, shared_with: share(2) })).toEqual([
      { kind: 'public' },
      { kind: 'shared', count: 2 },
    ]);
  });

  it('shows Shared with the count for a private take shared with one person', () => {
    expect(takeStatusPills({ is_owner: true, is_public: false, shared_with: share(1) })).toEqual([{ kind: 'shared', count: 1 }]);
  });

  it('shows only Public for a public take of someone else, never a share count', () => {
    expect(takeStatusPills({ is_owner: false, is_public: true, shared_with: undefined })).toEqual([{ kind: 'public' }]);
  });

  it('shows no pill for a take shared with me (the row says who shared it)', () => {
    expect(takeStatusPills({ is_owner: false, is_public: false, is_shared: true })).toEqual([]);
  });

  it('marks a singer linked to a musician profile as verified', () => {
    expect(
      takeStatusPills({ is_owner: true, singer_profile_id: 'p1', singer_profile: { id: 'p1', email: '', full_name: 'Nina', avatar_url: null, is_musician: true } })
    ).toEqual([{ kind: 'verified' }]);
  });

  it('shows nothing extra for a singer linked to a plain member profile', () => {
    expect(
      takeStatusPills({ is_owner: true, singer_profile_id: 'p1', singer_profile: { id: 'p1', email: '', full_name: 'Nina', avatar_url: null, is_musician: false } })
    ).toEqual([]);
  });

  it('marks a singer without an account as a pending invite', () => {
    expect(takeStatusPills({ is_owner: true, singer_name: 'Ana' })).toEqual([{ kind: 'pending' }]);
  });

  it('shows "Pending invite" only to the owner (it is the owner\'s to-do)', () => {
    expect(takeStatusPills({ is_owner: false, is_public: true, singer_name: 'Ana' })).toEqual([{ kind: 'public' }]);
  });

  it('lists visibility before the singer status', () => {
    expect(takeStatusPills({ is_owner: true, is_public: true, singer_name: 'Ana' }).map((p) => p.kind)).toEqual(['public', 'pending']);
  });
});
