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
echo "{\"tool_input\":{\"file_path\":\"$(pwd)/docs/logbook/epic\&user stories.md\"}}" \
  | node .claude/scripts/sync-stories-to-gh.mjs
```

### 3. Report summary

Show the user:
- How many stories were marked [Implemented] in the MD
- How many GitHub issues were created, closed, reopened, or updated

$ARGUMENTS
