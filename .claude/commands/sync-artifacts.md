Sync session artifacts (tasks, walkthrough, time tracking) to the `/doc/logbook/` master files.

Run this workflow before opening a PR or merging to main. Do NOT run for intermediate commits.

## Steps

### 1. Read Session Artifacts
Read the current session's brain files:
- `task.md` (current session tasks)
- `walkthrough.md` (current session walkthrough)
- `time_tracking_report.md` (current session time tracking)

### 2. Sync Tasks & Time Tracking (APPEND only)
- Read `doc/logbook/master-tasks.md`, then append the session's `task.md` content.
- Read `doc/logbook/master-timetracking.md`, then append `time_tracking_report.md`.
- **Never overwrite** — always read first and merge.

### 3. Sync Master Walkthrough (APPEND only)
- Read `doc/logbook/master-walkthrough.md`.
- Add a header with the current date/session ID to separate this entry.
- Append the content of `walkthrough.md`.
- **Filter out** any "Evidence" sections (screenshots, recordings) — keep the file text-focused.
- Do not overwrite existing history.

### 4. Verify
Run `git status` to confirm which files were modified.
