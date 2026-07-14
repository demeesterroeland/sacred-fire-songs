# Session Brain Files

These files are created by the agent during a session and synced to `docs/logbook/` via `/sync-artifacts` before opening a PR or merging.

## `.brain/task.md`

Checklist of tasks completed this session. Use markdown checkboxes.

```markdown
# Task: <Session Title>

- [x] <Task description>
- [x] <Another task>
```

## `.brain/walkthrough.md`

Narrative summary of what was done. Use a structured date heading.

```markdown
## <Date> (<Brief Title>)

### 1. <Major Change Area>
- <Specific change description> in `<filepath>`.
- <Reason or effect of the change>.

### 2. <Another Change Area>
- ...
```

Keep it factual and file-path-specific. No screenshots or evidence sections.

## `.brain/time_tracking_report.md`

Single table row for the session.

```markdown
| **<Date>** | **<Category>**: <Brief description of work> | ~<Hours> Hours | ✅ Completed |
```

## Notes

- **Append only** — the `/sync-artifacts` command reads these files and appends
  their content to the master logbooks. Never overwrite the master files.
- If you haven't created a brain file for this session, the sync command skips
  that artifact gracefully.
- Run `git status` after syncing to verify the modified files.
