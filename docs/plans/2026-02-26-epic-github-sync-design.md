# Design: Epic & User Stories ↔ GitHub Issues Sync

**Date:** 2026-02-26
**Status:** Approved
**Author:** Claude Code (brainstorming session)

---

## Problem

`doc/logbook/epic&user stories.md` is the source of truth for all user stories, but GitHub Issues must be maintained manually. This creates drift — stories can exist in the doc without issues, and closed issues may not be reflected back in the doc.

## Goals

- **MD → GitHub**: Automatically push story changes to GitHub Issues when the epic file is saved
- **GitHub → MD**: Pull issue state back into the doc on demand
- Zero-friction: works in the background without changing the authoring workflow

## Non-Goals

- Does not sync bugs or non-story issues
- Does not create epics as GitHub milestones
- Does not handle story deletion (stories are never deleted, only marked)

---

## Architecture

Three components:

| Component | File | Trigger |
|---|---|---|
| MD → GH sync script | `.claude/scripts/sync-stories-to-gh.mjs` | PostToolUse hook (automatic) |
| GH → MD sync script | `.claude/scripts/sync-stories-from-gh.mjs` | `/sync-stories` command (manual) |
| Slash command | `.claude/commands/sync-stories.md` | User-invoked |
| Hook config | `.claude/settings.json` | Claude Code internal |

---

## Component Details

### 1. PostToolUse Hook

Added to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "node .claude/scripts/sync-stories-to-gh.mjs"
      }]
    }]
  }
}
```

The hook fires on every Write/Edit. The script reads the tool payload from stdin and exits immediately if the modified file is not the epic file (fast no-op for all other edits).

### 2. `sync-stories-to-gh.mjs` (MD → GitHub)

**Input:** Hook JSON payload via stdin (contains the file path)
**Steps:**

1. Parse stdin — extract file path; exit if not the epic file
2. Read `doc/logbook/epic&user stories.md`
3. Extract all stories using regex:
   - Pattern: `\*\*Story ([\d.]+(?:-bis)?):?\s*(?:\[([^\]]+)\])?\*\*\s*(.+)`
   - Capture groups: ID, status, title text
   - Capture Gherkin blocks (``` code blocks following each story)
4. For each story:
   - Run `gh issue list --search "[Story ID]" --json number,title,state,body`
   - Apply sync rules (see below)
5. Log a summary line to stdout

**Sync rules (MD → GH):**

| MD status | Issue exists? | Issue state | Action |
|---|---|---|---|
| any / none | No | — | Create open issue |
| `[Implemented]` | No | — | Skip (don't create closed issue) |
| `[Implemented]` | Yes | open | Close issue |
| `[Not Implemented]` | Yes | closed | Reopen issue |
| `[Partial]` | Yes | closed | Reopen issue |
| any | Yes | any | Update title if changed |
| any | Yes | any | Update body if Gherkin changed |

**Issue body format:**

```markdown
**Story X.X.X**
As a [Role], I want to [Action] so that [Benefit].

**Acceptance Criteria (Gherkin):**

```gherkin
Scenario: ...
  Given ...
  When ...
  Then ...
```
```

**Labels:** `user-story`, `epic-X.X` (derived from story ID, e.g. Story 1.1.4 → `epic-1.1`)

### 3. `sync-stories-from-gh.mjs` (GitHub → MD)

**Input:** None (reads from GH API and local file)
**Steps:**

1. Fetch all issues with label `user-story` via `gh issue list --label user-story --state all --json number,title,state --limit 200`
2. Read the MD file
3. For each issue:
   - Extract story ID from issue title `[Story X.X.X]`
   - Find the corresponding story in MD
   - If issue is **closed** and MD status is not `[Implemented]` → update MD to `[Implemented]`
   - If issue is **open** and MD status is `[Implemented]` → leave MD as-is (closed in code = source of truth)
4. Write updated MD back to disk

### 4. `/sync-stories` Slash Command

Instructs Claude to:
1. Run `node .claude/scripts/sync-stories-from-gh.mjs` to pull GH → MD
2. Optionally run `node .claude/scripts/sync-stories-to-gh.mjs` to push MD → GH
3. Report what changed

---

## Error Handling

- If `gh` CLI is not authenticated: print clear error and exit non-zero
- If a story ID cannot be parsed: skip and warn
- If rate-limited: the hook exits cleanly and logs a warning (no crash)
- The GH → MD script never downgrades a story from `[Implemented]` to a worse status

## Story ID Format

Supported formats: `1.1.1`, `1.1.2-bis`, `2.3.1`, etc.
Epic label derived by taking the first two segments: `1.1.1` → `epic-1.1`.

## File Paths

- Epic file: `doc/logbook/epic&user stories.md`
- Scripts: `.claude/scripts/sync-stories-to-gh.mjs`, `.claude/scripts/sync-stories-from-gh.mjs`
- Command: `.claude/commands/sync-stories.md`
- Settings: `.claude/settings.json`
