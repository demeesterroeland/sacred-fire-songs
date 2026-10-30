import { describe, it, expect } from 'vitest';
import { ROLE_COLOR, ROLE_ACCENT, roleFilterAccent } from '@/lib/admin/roleColors';
import type { UserRole } from '@/lib/admin/types';

const ROLES: UserRole[] = ['admin', 'gatekeeper', 'expert', 'musician', 'member'];

describe('role colors', () => {
  it('gives every role a color family', () => {
    expect(ROLE_COLOR).toEqual({
      admin: 'purple',
      gatekeeper: 'amber',
      expert: 'emerald',
      musician: 'emerald',
      member: 'blue',
    });
  });

  it('has a hex accent for every color family', () => {
    for (const role of ROLES) {
      expect(ROLE_ACCENT[ROLE_COLOR[role]]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('roleFilterAccent', () => {
  it('uses the same accent as the role badge for each role filter', () => {
    expect(roleFilterAccent('admin')).toBe(ROLE_ACCENT.purple);
    expect(roleFilterAccent('gatekeeper')).toBe(ROLE_ACCENT.amber);
    expect(roleFilterAccent('member')).toBe(ROLE_ACCENT.blue);
  });

  it('colors the "Musician / Expert" filter like the expert and musician badges', () => {
    expect(roleFilterAccent('musician')).toBe(ROLE_ACCENT[ROLE_COLOR.expert]);
    expect(roleFilterAccent('musician')).toBe(ROLE_ACCENT[ROLE_COLOR.musician]);
  });

  it('has no accent for "All roles" (default picker color)', () => {
    expect(roleFilterAccent('all')).toBeUndefined();
  });
});
