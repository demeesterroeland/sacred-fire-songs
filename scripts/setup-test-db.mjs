import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.test if it exists
try {
  const envPath = path.resolve(process.cwd(), '.env.test');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const index = trimmed.indexOf('=');
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          const val = trimmed.substring(index + 1).trim();
          process.env[key] = val.replace(/^["']|["']$/g, '');
        }
      }
    }
  }
} catch (e) {
  console.warn('[setup-test-db] Warning: Failed to load .env.test:', e.message);
}

const { Client } = pg;

// Helper to mask password in connection string for safe logging
function maskPassword(connStr) {
  if (!connStr) return '';
  try {
    const url = new URL(connStr);
    if (url.password) {
      url.password = '********';
    }
    return url.toString();
  } catch {
    return connStr.replace(/:([^:@]+)@/, ':********@');
  }
}

async function wakeupSupabase(supabaseUrl, anonKey) {
  if (!supabaseUrl || supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost') || supabaseUrl.includes('192.168.')) {
    return;
  }
  console.log(`[setup-test-db] Checking if Supabase project at ${supabaseUrl} is active...`);
  const maxRetries = 12; // 2 minutes total
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      if (res.status === 200 || res.status === 400 || res.status === 401 || res.status === 404) {
        console.log(`[setup-test-db] Supabase project is active (HTTP ${res.status}).`);
        return;
      }
      console.log(`[setup-test-db] Project waking up... HTTP status: ${res.status}. Retrying in 10s... (${i}/${maxRetries})`);
    } catch (err) {
      console.log(`[setup-test-db] Project waking up... Connection error: ${err.message}. Retrying in 10s... (${i}/${maxRetries})`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  console.warn(`[setup-test-db] Warning: Project wake-up limit reached. Attempting database connection anyway.`);
}

async function main() {
  console.log('[setup-test-db] Starting database setup...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  // Wake up remote Supabase project if needed
  if (supabaseUrl && anonKey) {
    await wakeupSupabase(supabaseUrl, anonKey);
  }

  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    if (supabaseUrl) {
      if (supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost') || supabaseUrl.includes('192.168.')) {
        connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
      } else {
        const match = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/);
        if (match && match[1]) {
          const projectId = match[1];
          const dbHost = process.env.SUPABASE_DB_HOST || 'aws-1-eu-west-1.pooler.supabase.com';
          if (!dbPassword) {
            throw new Error('SUPABASE_DB_PASSWORD environment variable is required for remote database setup.');
          }
          const encodedPassword = encodeURIComponent(dbPassword);
          connectionString = `postgresql://postgres.${projectId}:${encodedPassword}@${dbHost}:5432/postgres`;
        } else {
          throw new Error(`Could not parse project ID from NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
        }
      }
    } else {
      // Default to local Supabase
      connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
    }
  }

  console.log(`[setup-test-db] Connecting to database: ${maskPassword(connectionString)}`);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    // We exclude the static/lookup 'categories' table from truncation so taxonomy is preserved
    const tablesRes = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
        AND tablename != 'categories'
    `);
    const tables = tablesRes.rows.map(row => row.tablename);

    await client.query('BEGIN');

    if (tables.length > 0) {
      console.log(`[setup-test-db] Truncating public tables: ${tables.join(', ')}`);
      // Use CASCADE to handle foreign key dependencies automatically
      const truncateQuery = `TRUNCATE TABLE ${tables.map(t => `public."${t}"`).join(', ')} CASCADE;`;
      await client.query(truncateQuery);
    } else {
      console.log('[setup-test-db] No public tables found to truncate.');
    }

    // 2. Clear auth.users (cascades to other auth tables like identities)
    console.log('[setup-test-db] Clearing auth.users...');
    await client.query('DELETE FROM auth.users;');

    // 3. Seeding data
    const seedsDir = path.join(process.cwd(), 'supabase', 'seeds');
    if (!fs.existsSync(seedsDir)) {
      throw new Error(`Seeds directory not found at: ${seedsDir}`);
    }

    if (process.env.E2E_RANDOM_SEED === '1') {
      console.log('[setup-test-db] Running in RANDOM SEED mode.');
      
      console.log('[setup-test-db] Executing seed: 01_auth_users.sql');
      const authSql = fs.readFileSync(path.join(seedsDir, '01_auth_users.sql'), 'utf8');
      await client.query(authSql);
      
      console.log('[setup-test-db] Executing seed: 02_profiles.sql');
      const profilesSql = fs.readFileSync(path.join(seedsDir, '02_profiles.sql'), 'utf8');
      await client.query(profilesSql);

      const { seedRandomData } = await import('./random-seeder.mjs');
      const songsCount = process.env.E2E_RANDOM_SONGS_COUNT ? parseInt(process.env.E2E_RANDOM_SONGS_COUNT, 10) : 80;
      await seedRandomData(client, songsCount);
    } else {
      const files = fs.readdirSync(seedsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      console.log(`[setup-test-db] Found ${files.length} seed files in ${seedsDir}`);

      for (const file of files) {
        console.log(`[setup-test-db] Executing seed: ${file}`);
        const sqlPath = path.join(seedsDir, file);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the sql queries
        await client.query(sql);
      }
    }

    await client.query('COMMIT');
    console.log('[setup-test-db] Database setup and seeding completed successfully!');
  } catch (error) {
    console.error('[setup-test-db] Error during database setup, rolling back transactions:', error);
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('[setup-test-db] Error during transaction rollback:', rollbackError);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('[setup-test-db] Fatal error in main function:', err);
  process.exit(1);
});
