import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SEED_ACCOUNTS, assertLocalDatabase, renameSql } from '../../../scripts/db/rename-seed-accounts.mjs';

const seed = (file: string) => readFileSync(path.resolve('supabase/seeds', file), 'utf8');

describe('rename-seed-accounts', () => {
  it('maps the four seeded user ids to placeholder addresses', () => {
    expect(SEED_ACCOUNTS).toEqual({
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': 'admin@sfs.example',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12': 'expert@sfs.example',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13': 'member@sfs.example',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14': 'gatekeeper@sfs.example',
    });
  });

  it('matches the seed files, so a fresh stack and a renamed stack agree', () => {
    const users = seed('01_auth_users.sql');
    const profiles = seed('02_profiles.sql');
    for (const [id, email] of Object.entries(SEED_ACCOUNTS)) {
      expect(users).toContain(id);
      expect(users).toContain(`"email":"${email}"`);
      expect(profiles).toContain(`'${email}'`);
    }
  });

  it('updates auth.users, auth.identities and profiles by id, never by an old address', () => {
    const { text, values } = renameSql('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@sfs.example');
    expect(values).toEqual(['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@sfs.example']);
    expect(text).toMatch(/UPDATE auth\.users SET email = \$2 WHERE id = \$1/);
    expect(text).toMatch(/UPDATE auth\.identities SET provider_id = \$2/);
    expect(text).toMatch(/jsonb_set\(identity_data, '\{email\}', to_jsonb\(\$2::text\)\)/);
    expect(text).toMatch(/WHERE user_id = \$1 AND provider = 'email'/);
    expect(text).toMatch(/UPDATE public\.profiles SET email = \$2 WHERE id = \$1/);
  });

  it('refuses any database that is not on this machine', () => {
    expect(() => assertLocalDatabase('postgresql://postgres:postgres@127.0.0.1:54322/postgres')).not.toThrow();
    expect(() => assertLocalDatabase('postgresql://postgres:postgres@localhost:54322/postgres')).not.toThrow();
    expect(() => assertLocalDatabase('postgresql://u:p@db.example.org:5432/postgres')).toThrow(/local/);
  });
});
