# Epic ↔ GitHub Issues Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically keep `doc/logbook/epic&user stories.md` in sync with GitHub Issues — writing the file pushes changes to GH, and a `/sync-stories` command pulls GH state back.

**Architecture:** A PostToolUse hook triggers `sync-stories-to-gh.mjs` whenever the epic file is saved (MD → GH). A `/sync-stories` command runs `sync-stories-from-gh.mjs` to pull issue state back into the MD (GH → MD). Parsing logic lives in a shared `.mjs` module so it can be unit-tested with vitest.

**Tech Stack:** Node.js 24 ESM (`.mjs`), `gh` CLI (already installed + authed), vitest (project test runner), Claude Code PostToolUse hook.

---

## Task 1: Create shared parsing library with tests

**Files:**
- Create: `.claude/scripts/lib/parseStories.mjs`
- Create: `lib/unit-tests/parseStories.test.mjs`

### Step 1: Write the failing tests

Create `lib/unit-tests/parseStories.test.mjs`:

```javascript
import { describe, it, expect } from 'vitest';
import { parseStories, buildIssueTitle, buildIssueBody } from '../../.claude/scripts/lib/parseStories.mjs';

const SAMPLE_MD = `
**Story 1.1.1: [Implemented]** As a Member, I want to add a song using a web form so that I can share medicine.

\`\`\`
Scenario: Admin uploads via Form
  Given I am logged in as an Admin
  When I fill in the Title and click "Add Song"
  Then a new song should be created
\`\`\`

**Story 1.1.2:** As an Admin, I want to upload a raw \`.cho\` file so that I don't have to type manually.

**Story 1.1.2-bis: [Not Implemented]** As an Admin, I want pasted metadata to populate fields.

**Story 2.3.1: [Partial]** As a Guest, I want to filter songs by category.
`;

describe('parseStories', () => {
  it('extracts all story IDs', () => {
    const stories = parseStories(SAMPLE_MD);
    expect(stories.map(s => s.id)).toEqual(['1.1.1', '1.1.2', '1.1.2-bis', '2.3.1']);
  });

  it('extracts status correctly', () => {
    const stories = parseStories(SAMPLE_MD);
    expect(stories[0].status).toBe('Implemented');
    expect(stories[1].status).toBeNull();
    expect(stories[2].status).toBe('Not Implemented');
    expect(stories[3].status).toBe('Partial');
  });

  it('derives epic label from story ID', () => {
    const stories = parseStories(SAMPLE_MD);
    expect(stories[0].epicLabel).toBe('epic-1.1');
    expect(stories[3].epicLabel).toBe('epic-2.3');
  });

  it('extracts Gherkin from code blocks', () => {
    const stories = parseStories(SAMPLE_MD);
    expect(stories[0].gherkin).toContain('Scenario: Admin uploads via Form');
    expect(stories[1].gherkin).toBe('');
  });
});

describe('buildIssueTitle', () => {
  it('formats title as [Story X.X.X] short description', () => {
    const story = { id: '1.1.1', title: 'As a Member, I want to add a song so that I can share.' };
    expect(buildIssueTitle(story)).toBe('[Story 1.1.1] As a Member, I want to add a song');
  });

  it('handles -bis IDs', () => {
    const story = { id: '1.1.2-bis', title: 'As an Admin, I want pasted metadata so that things.' };
    expect(buildIssueTitle(story)).toMatch(/^\[Story 1\.1\.2-bis\]/);
  });
});

describe('buildIssueBody', () => {
  it('includes story ID and title', () => {
    const story = { id: '1.1.1', title: 'As a Member, I want to add a song.', gherkin: '' };
    const body = buildIssueBody(story);
    expect(body).toContain('**Story 1.1.1**');
    expect(body).toContain('As a Member');
  });

  it('includes Gherkin when present', () => {
    const story = { id: '1.1.1', title: 'As a Member.', gherkin: 'Scenario: X\n  Given Y' };
    const body = buildIssueBody(story);
    expect(body).toContain('Acceptance Criteria (Gherkin)');
    expect(body).toContain('Scenario: X');
  });

  it('omits Gherkin section when empty', () => {
    const story = { id: '1.1.1', title: 'As a Member.', gherkin: '' };
    const body = buildIssueBody(story);
    expect(body).not.toContain('Gherkin');
  });
});
```

### Step 2: Run tests to verify they fail

```bash
npx vitest run lib/unit-tests/parseStories.test.mjs
```

Expected: FAIL — "Cannot find module '../../.claude/scripts/lib/parseStories.mjs'"

### Step 3: Create the parsing library

Create `.claude/scripts/lib/parseStories.mjs`:

```javascript
/**
 * Parse all user stories from the epic & user stories MD file.
 * @param {string} content - Full file content
 * @returns {Array<{id: string, status: string|null, title: string, gherkin: string, epicLabel: string}>}
 */
export function parseStories(content) {
  // Split into chunks, one per story header
  const chunks = content.split(/(?=\*\*Story [\d.]+)/);
  const HEADER_RE = /^\*\*Story ([\d.]+(?:-bis)?):?\s*(?:\[([^\]]*)\])?\*\*\s*(.+)/;
  const results = [];

  for (const chunk of chunks) {
    const m = HEADER_RE.exec(chunk);
    if (!m) continue;

    const [, id, rawStatus, titleText] = m;
    const status = rawStatus ? rawStatus.trim() : null;

    // Extract all gherkin/plain code blocks
    const gherkinBlocks = [];
    const CODE_BLOCK_RE = /```(?:gherkin)?\n([\s\S]*?)```/g;
    let cb;
    while ((cb = CODE_BLOCK_RE.exec(chunk)) !== null) {
      const block = cb[1].trim();
      if (block) gherkinBlocks.push(block);
    }

    results.push({
      id,
      status,
      title: titleText.trim(),
      gherkin: gherkinBlocks.join('\n\n'),
      epicLabel: 'epic-' + id.split('.').slice(0, 2).join('.'),
    });
  }

  return results;
}

/**
 * Build the GitHub issue title for a story.
 * Strips "so that ..." clause for brevity.
 */
export function buildIssueTitle(story) {
  const short = story.title.replace(/\s+so that\b.*/i, '').trim();
  return `[Story ${story.id}] ${short}`;
}

/**
 * Build the GitHub issue body for a story.
 */
export function buildIssueBody(story) {
  const gherkinSection = story.gherkin
    ? `\n\n**Acceptance Criteria (Gherkin):**\n\n\`\`\`gherkin\n${story.gherkin}\n\`\`\``
    : '';
  return `**Story ${story.id}**\n${story.title}${gherkinSection}`;
}
```

### Step 4: Run tests to verify they pass

```bash
npx vitest run lib/unit-tests/parseStories.test.mjs
```

Expected: All tests PASS.

### Step 5: Commit

```bash
git add .claude/scripts/lib/parseStories.mjs lib/unit-tests/parseStories.test.mjs
git commit -m "feat: add story parser with vitest unit tests"
```

---

## Task 2: Create the MD → GitHub sync script

**Files:**
- Create: `.claude/scripts/sync-stories-to-gh.mjs`

### Step 1: Create the script

```javascript
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

// ── 1. Read hook payload ──────────────────────────────────────────────────────
let payload;
try {
  const stdin = readFileSync('/dev/stdin', 'utf8').trim();
  payload = stdin ? JSON.parse(stdin) : {};
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path ?? '';
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
```

### Step 2: Make it executable and smoke-test

```bash
chmod +x .claude/scripts/sync-stories-to-gh.mjs
# Dry-run by piping a fake hook payload for a non-epic file (should exit silently)
echo '{"tool_input":{"file_path":"/tmp/foo.md"}}' | node .claude/scripts/sync-stories-to-gh.mjs
```

Expected: No output, exit 0.

### Step 3: Test with the actual epic file path (dry-run without changes)

```bash
# Point at epic file but just verify parsing — check output
echo "{\"tool_input\":{\"file_path\":\"$(pwd)/doc/logbook/epic\&user stories.md\"}}" \
  | node .claude/scripts/sync-stories-to-gh.mjs
```

Expected: `[sync-stories] ✓ 0 created · 0 closed · 0 reopened · 0 updated` (all stories already exist on GH).

### Step 4: Commit

```bash
git add .claude/scripts/sync-stories-to-gh.mjs
git commit -m "feat: add MD→GitHub story sync script"
```

---

## Task 3: Create the GitHub → MD sync script

**Files:**
- Create: `.claude/scripts/sync-stories-from-gh.mjs`

### Step 1: Create the script

```javascript
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
```

### Step 2: Make executable and test

```bash
chmod +x .claude/scripts/sync-stories-from-gh.mjs
node .claude/scripts/sync-stories-from-gh.mjs
```

Expected: Either "No changes needed" or a list of stories marked [Implemented].

### Step 3: Commit

```bash
git add .claude/scripts/sync-stories-from-gh.mjs
git commit -m "feat: add GitHub→MD story sync script"
```

---

## Task 4: Add the PostToolUse hook

**Files:**
- Create: `.claude/settings.json`

> **Note:** `.claude/settings.local.json` holds per-user permissions. `.claude/settings.json` is the project-level settings file (committed to the repo). Add the hook there.

### Step 1: Create `.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/sync-stories-to-gh.mjs"
          }
        ]
      }
    ]
  }
}
```

### Step 2: Verify hook fires

Edit the epic file with a trivial whitespace change (don't change any story content), save it, then check the terminal — you should see:

```
[sync-stories] ✓ 0 created · 0 closed · 0 reopened · 0 updated
```

If nothing appears, double-check the hook matcher and that `.claude/settings.json` is in the project root.

### Step 3: Commit

```bash
git add .claude/settings.json
git commit -m "feat: add PostToolUse hook to sync epic file to GitHub on save"
```

---

## Task 5: Create the `/sync-stories` slash command

**Files:**
- Create: `.claude/commands/sync-stories.md`

### Step 1: Create the command

```markdown
Sync the epic & user stories document with GitHub Issues (bidirectional).

## Steps

### 1. Pull GitHub → MD

Run the from-GH script to update status markers in the MD based on closed issues:

```bash
node .claude/scripts/sync-stories-from-gh.mjs
```

Report what changed.

### 2. Push MD → GitHub (optional)

If the user also wants to push any remaining differences from the MD to GitHub, run:

```bash
echo "{\"tool_input\":{\"file_path\":\"$(pwd)/doc/logbook/epic\&user stories.md\"}}" \
  | node .claude/scripts/sync-stories-to-gh.mjs
```

### 3. Report summary

Show the user:
- How many stories were marked [Implemented] in the MD
- How many GitHub issues were created, closed, reopened, or updated

$ARGUMENTS
```

### Step 2: Test the command

In Claude Code, run `/sync-stories` and verify it runs both scripts and reports results.

### Step 3: Commit

```bash
git add .claude/commands/sync-stories.md
git commit -m "feat: add /sync-stories command for bidirectional epic/GH sync"
```

---

## Task 6: End-to-end validation

### Step 1: Create a test story in the MD

Add a new story at the bottom of `doc/logbook/epic&user stories.md`:

```markdown
**Story 4.99.1:** As a Developer, I want the sync to work so that issues stay in sync.
```

Save the file. The hook should fire and create a new GitHub issue.

### Step 2: Verify issue was created

```bash
gh issue list --search "[Story 4.99.1]" --json number,title,state
```

Expected: One open issue with title `[Story 4.99.1] As a Developer, I want the sync to work`.

### Step 3: Mark story as [Implemented]

Change the story in the MD to:

```markdown
**Story 4.99.1: [Implemented]** As a Developer, I want the sync to work so that issues stay in sync.
```

Save. Hook fires. Verify:

```bash
gh issue list --search "[Story 4.99.1]" --state all --json number,title,state
```

Expected: Issue is now CLOSED.

### Step 4: Run /sync-stories (GH → MD direction)

Reopen the issue manually on GitHub, then run `/sync-stories`. Verify the MD does NOT downgrade (we don't revert `[Implemented]` based on GH reopen — only upgrades are automatic).

### Step 5: Clean up the test story

Remove the test story from the MD and close/delete the test issue:

```bash
gh issue close $(gh issue list --search "[Story 4.99.1]" --json number --jq '.[0].number')
```

### Step 6: Final commit

```bash
git add doc/logbook/epic\&user\ stories.md
git commit -m "chore: remove test story 4.99.1 used for sync validation"
```

---

## Task 7: Open a PR

```bash
git push -u origin feat/epic-github-sync
gh pr create \
  --title "feat: bidirectional sync between epic doc and GitHub Issues" \
  --body "Adds a PostToolUse hook and two Node.js scripts to keep \`doc/logbook/epic & user stories.md\` in sync with GitHub Issues. Also adds a \`/sync-stories\` command for on-demand bidirectional sync."
```
