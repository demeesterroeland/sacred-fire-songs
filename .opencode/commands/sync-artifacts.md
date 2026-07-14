---
description: Sync session artifacts (task.md, walkthrough.md, time_tracking_report.md) to docs/logbook/ master files. Run before opening a PR or merging to main — NOT for intermediate commits.
---

# /sync-artifacts

Sync session brain artifacts to the master logbook files in `docs/logbook/`.

## Steps

### 1. Read session artifacts
Read these files from `.brain/`:

- `.brain/task.md` — current session tasks
- `.brain/walkthrough.md` — current session walkthrough
- `.brain/time_tracking_report.md` — current session time tracking

If any of these files don't exist, skip that artifact.

### 2. Sync Tasks & Time Tracking (APPEND only)

- Read `docs/logbook/master-tasks.md` first, then **append** the content of `.brain/task.md`.
- Read `docs/logbook/master-timetracking.md` first, then **append** the content of `.brain/time_tracking_report.md`.
- **Never overwrite** — always read first and append.
- Preserve the existing structure and formatting.

### 3. Sync Master Walkthrough (APPEND only)

- Read `docs/logbook/master-walkthrough.md` first.
- Add a header with the current date to separate the new entry.
- **Append** the content of `.brain/walkthrough.md`.
- Filter out any "Evidence" sections (screenshots, recordings) — keep it text-only.
- Do not overwrite existing history.

### 4. Verify

Run `git status` to confirm which files were modified.
