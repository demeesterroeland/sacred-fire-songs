#!/usr/bin/env node
// Give the four seeded accounts their placeholder addresses on an existing
// local stack, so it matches a fresh `supabase db reset` without wiping data.
// Rows are matched by their fixed seed ids, never by an address.
// Idempotent. Local stack only: refuses any database host that is not localhost.
//
//   npm run seed:rename-accounts
//   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npm run seed:rename-accounts

import pg from 'pg';
import { pathToFileURL } from 'node:url';

export const SEED_ACCOUNTS = Object.freeze({
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': 'admin@sfs.example',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12': 'expert@sfs.example',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13': 'member@sfs.example',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14': 'gatekeeper@sfs.example',
});

const DEFAULT_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

export function assertLocalDatabase(connectionString) {
  const host = new URL(connectionString).hostname;
  if (!['127.0.0.1', 'localhost'].includes(host)) {
    throw new Error(`Refusing to rename accounts on non-local database at ${host}; local stack only.`);
  }
}

export function renameSql(id, email) {
  return {
    text: `
      UPDATE auth.users SET email = $2 WHERE id = $1;
      UPDATE auth.identities SET provider_id = $2,
             identity_data = jsonb_set(identity_data, '{email}', to_jsonb($2::text))
       WHERE user_id = $1 AND provider = 'email';
      UPDATE public.profiles SET email = $2 WHERE id = $1;`,
    values: [id, email],
  };
}

async function main() {
  const connectionString = process.env.DATABASE_URL || DEFAULT_URL;
  assertLocalDatabase(connectionString);
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query('BEGIN');
    for (const [id, email] of Object.entries(SEED_ACCOUNTS)) {
      // pg runs one statement per parameterised query; each uses $1 and $2.
      const { text, values } = renameSql(id, email);
      for (const statement of text.split(';').map((s) => s.trim()).filter(Boolean)) {
        await client.query(statement, values);
      }
    }
    await client.query('COMMIT');
    console.log(`[rename-seed-accounts] ${Object.keys(SEED_ACCOUNTS).length} seeded accounts use placeholder addresses.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(`[rename-seed-accounts] ${err.message}`);
    process.exit(1);
  });
}
