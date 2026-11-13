import { After, AfterAll } from '@cucumber/cucumber';
import pg from 'pg';

/**
 * Direct Postgres access for @seed scenarios. Uses DATABASE_URL, falling back
 * to the local Supabase stack (same default as scripts/db/setup-test-db.mjs).
 *
 * Each @seed scenario gets one client inside a transaction that is always
 * rolled back, so scenarios may insert fixtures without touching the seed.
 */

const DEFAULT_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

let pool: pg.Pool | null = null;
let scenarioClient: pg.PoolClient | null = null;

function getPool(): pg.Pool {
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL ?? DEFAULT_URL, max: 2 });
  return pool;
}

/** Client bound to the current scenario's (rolled-back) transaction. */
export async function seedDb(): Promise<pg.PoolClient> {
  if (!scenarioClient) {
    scenarioClient = await getPool().connect();
    await scenarioClient.query('BEGIN');
  }
  return scenarioClient;
}

/**
 * Runs `sql` as the `authenticated` role with `userId` as auth.uid(), so
 * row-level security applies exactly as for a signed-in Supabase user.
 */
export async function queryAsUser<T extends pg.QueryResultRow>(
  userId: string,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const db = await seedDb();
  await db.query('SAVEPOINT as_user');
  try {
    await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify({ sub: userId, role: 'authenticated' }),
    ]);
    await db.query('SET LOCAL ROLE authenticated');
    const { rows } = await db.query<T>(sql, params);
    return rows;
  } finally {
    await db.query('ROLLBACK TO SAVEPOINT as_user');
  }
}

/** Runs `sql` as the `anon` role (a guest with no session), so RLS applies as for a signed-out visitor. */
export async function queryAsAnon<T extends pg.QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = await seedDb();
  await db.query('SAVEPOINT as_anon');
  try {
    await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ role: 'anon' })]);
    await db.query('SET LOCAL ROLE anon');
    const { rows } = await db.query<T>(sql, params);
    return rows;
  } finally {
    await db.query('ROLLBACK TO SAVEPOINT as_anon');
  }
}

/** Runs `sql` as the `service_role` role, the trusted server context. */
export async function queryAsServiceRole<T extends pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const db = await seedDb();
  await db.query('SAVEPOINT as_service');
  try {
    await db.query('SET LOCAL ROLE service_role');
    const { rows } = await db.query<T>(sql, params);
    return rows;
  } finally {
    await db.query('ROLLBACK TO SAVEPOINT as_service');
  }
}

/** Seeded profile id for an e-mail address (see supabase/seeds/02_profiles.sql). */
export async function profileIdByEmail(email: string): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [email]);
  if (!rows[0]) throw new Error(`No seeded profile for ${email}. Run: npx supabase db reset`);
  return rows[0].id;
}

After({ tags: '@seed' }, async function () {
  if (!scenarioClient) return;
  try {
    await scenarioClient.query('ROLLBACK');
  } finally {
    scenarioClient.release();
    scenarioClient = null;
  }
});

AfterAll(async function () {
  await pool?.end();
  pool = null;
});
