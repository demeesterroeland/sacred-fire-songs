import { afterEach, describe, expect, it, vi } from 'vitest';
import { ROLES, TEST_PASSWORD, passwordFor, type RoleKey } from '../../../e2e/fixtures/roles';

describe('e2e passwordFor', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to the shared test password when no role password is set', () => {
    for (const role of Object.keys(ROLES) as RoleKey[]) {
      vi.stubEnv(ROLES[role].passwordEnv, '');
      expect(passwordFor(role)).toBe(TEST_PASSWORD);
    }
  });

  it('uses the role-specific env var when set', () => {
    vi.stubEnv('E2E_PASSWORD_ADMIN', 'admin-secret');
    vi.stubEnv('E2E_PASSWORD_MEMBER', 'member-secret');

    expect(passwordFor('admin')).toBe('admin-secret');
    expect(passwordFor('member')).toBe('member-secret');
    expect(passwordFor('musician')).toBe(TEST_PASSWORD);
  });

  it('gives every role its own env var', () => {
    const envs = Object.values(ROLES).map((r) => r.passwordEnv);
    expect(new Set(envs).size).toBe(envs.length);
  });
});
