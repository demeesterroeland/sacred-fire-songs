import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_REUSE_DB === '1') {
    console.log('[e2e globalSetup] E2E_REUSE_DB=1 — skipping database setup.');
    return;
  }

  const root = path.resolve(__dirname, '..');
  console.log('[e2e globalSetup] Running setup-test-db.mjs...');
  
  execSync('node scripts/setup-test-db.mjs', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env },
  });
  
  console.log('[e2e globalSetup] Database setup complete.');
}
