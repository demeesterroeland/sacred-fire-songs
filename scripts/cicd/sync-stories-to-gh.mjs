#!/usr/bin/env node
/**
 * sync-stories-to-gh.mjs
 * Called by Claude Code PostToolUse hook after Write/Edit.
 * Reads hook JSON from stdin, exits immediately if the epic file wasn't changed.
 * Then syncs all stories to GitHub Issues.
 */
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { parseStories, buildIssueTitle, buildIssueBody } from './lib/parseStories.mjs';

// ── 1. Resolve file path ──────────────────────────────────────────────────────
// Support two calling conventions:
//   CLI:  node sync-stories-to-gh.mjs /path/to/epic&user stories.md
//   Hook: echo '{"tool_input":{"file_path":"..."}}' | node sync-stories-to-gh.mjs
let filePath = process.argv[2] ?? '';

if (!filePath) {
  try {
    const stdin = readFileSync('/dev/stdin', 'utf8').trim();
    const payload = stdin ? JSON.parse(stdin) : {};
    filePath = payload?.tool_input?.file_path ?? '';
  } catch {
    process.exit(0);
  }
}

if (!filePath.includes('epic')) {
  process.exit(0); // Not the epic file — nothing to do
}

// ── 2. Parse stories ──────────────────────────────────────────────────────────
const content = readFileSync(filePath, 'utf8');
const stories = parseStories(content);

// ── 3. Sync each story ────────────────────────────────────────────────────────
let created = 0, closed = 0, reopened = 0, updated = 0;

for (const story of stories) {
  try {
    syncStory(story);
  } catch (e) {
    console.error(`[sync-stories] ✗ Story ${story.id}: ${e.message}`);
  }
}

console.log(
  `[sync-stories] ✓ ${created} created · ${closed} closed · ${reopened} reopened · ${updated} updated`
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureLabel(name) {
  const result = spawnSync('gh', ['label', 'create', name, '--color', '0075ca'], { encoding: 'utf8' });
  if (result.status !== 0 && !result.stderr.includes('already exists')) {
    throw new Error(`Failed to create label '${name}': ${result.stderr.trim()}`);
  }
}

function gh(...args) {
  const result = spawnSync('gh', args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout.trim();
}

function ghJson(...args) {
  return JSON.parse(gh(...args));
}

function withTempBody(body, fn) {
  const tmp = join(tmpdir(), `sync-story-${Date.now()}.md`);
  writeFileSync(tmp, body, 'utf8');
  try { fn(tmp); } finally { unlinkSync(tmp); }
}

function syncStory(story) {
  const tag = `[Story ${story.id}]`;
  const issues = ghJson(
    'issue', 'list',
    '--search', tag,
    '--state', 'all',
    '--json', 'number,title,state',
    '--limit', '5'
  );

  const existing = issues.find(i => i.title.startsWith(tag) || i.title.includes(tag));
  const isImplemented = story.status === 'Implemented';

  const desiredTitle = buildIssueTitle(story);
  const desiredBody = buildIssueBody(story);

  if (!existing) {
    if (isImplemented) return; // Don't create already-completed issues
    ensureLabel(story.epicLabel);
    withTempBody(desiredBody, tmp => {
      gh('issue', 'create',
        '--title', desiredTitle,
        '--body-file', tmp,
        '--label', `user-story,${story.epicLabel}`
      );
    });
    console.log(`[sync-stories] + Created: ${desiredTitle}`);
    created++;
    return;
  }

  // Update title if it changed
  if (existing.title !== desiredTitle) {
    gh('issue', 'edit', String(existing.number), '--title', desiredTitle);
    console.log(`[sync-stories] ~ Title updated #${existing.number}`);
    updated++;
  }

  // Update body if content changed (compare current body)
  const current = ghJson('issue', 'view', String(existing.number), '--json', 'body');
  if (current.body !== desiredBody) {
    withTempBody(desiredBody, tmp => {
      gh('issue', 'edit', String(existing.number), '--body-file', tmp);
    });
    console.log(`[sync-stories] ~ Body updated #${existing.number}`);
    updated++;
  }

  // Close/reopen based on MD status
  if (isImplemented && existing.state === 'OPEN') {
    gh('issue', 'close', String(existing.number));
    console.log(`[sync-stories] ✓ Closed #${existing.number}: ${existing.title}`);
    closed++;
  } else if (!isImplemented && existing.state === 'CLOSED') {
    gh('issue', 'reopen', String(existing.number));
    console.log(`[sync-stories] ↺ Reopened #${existing.number}: ${existing.title}`);
    reopened++;
  }
}
