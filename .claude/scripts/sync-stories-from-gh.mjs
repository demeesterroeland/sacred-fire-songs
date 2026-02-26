#!/usr/bin/env node
/**
 * sync-stories-from-gh.mjs
 * Fetches all user-story issues from GitHub and updates the MD status markers.
 * Run manually via /sync-stories command.
 *
 * Rules:
 *   - Issue CLOSED → mark story [Implemented] in MD (if not already)
 *   - Issue OPEN   → leave MD as-is (don't downgrade)
 */
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const EPIC_FILE = 'doc/logbook/epic&user stories.md';

// ── 1. Fetch all user-story issues ───────────────────────────────────────────
const result = spawnSync('gh', [
  'issue', 'list',
  '--label', 'user-story',
  '--state', 'all',
  '--json', 'number,title,state',
  '--limit', '200',
], { encoding: 'utf8' });

if (result.status !== 0) {
  console.error('[sync-stories] gh CLI error:', result.stderr);
  process.exit(1);
}

const issues = JSON.parse(result.stdout);

// ── 2. Read the MD file ───────────────────────────────────────────────────────
let content = readFileSync(EPIC_FILE, 'utf8');
let changes = 0;

// ── 3. Apply updates ──────────────────────────────────────────────────────────
for (const issue of issues) {
  // Extract story ID from title like "[Story 1.1.1] ..."
  const m = issue.title.match(/\[Story ([\d.]+(?:-bis)?)\]/i);
  if (!m) continue;
  const id = m[1];

  if (issue.state !== 'CLOSED') continue; // Only promote to Implemented, never downgrade

  // Pattern: **Story 1.1.1:** or **Story 1.1.1: [Something]**
  const storyRe = new RegExp(
    `(\\*\\*Story ${id.replace('.', '\\.').replace('-', '\\-')}:?)\\s*(?:\\[[^\\]]*\\])?\\s*(\\*\\*)`,
    'g'
  );

  const updated = content.replace(storyRe, (_, prefix, suffix) => {
    return `${prefix} [Implemented]${suffix}`;
  });

  if (updated !== content) {
    content = updated;
    changes++;
    console.log(`[sync-stories] ✓ Marked Story ${id} as [Implemented] (issue #${issue.number} is closed)`);
  }
}

// ── 4. Write back if changed ──────────────────────────────────────────────────
if (changes > 0) {
  writeFileSync(EPIC_FILE, content, 'utf8');
  console.log(`[sync-stories] Updated ${changes} story status(es) in ${EPIC_FILE}`);
} else {
  console.log('[sync-stories] No changes needed — MD is already in sync with GitHub.');
}
