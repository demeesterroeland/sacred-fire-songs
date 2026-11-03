@AGENTS.md

# Claude Code specifics

`AGENTS.md` (imported above) is the canonical instruction file for all agents. Put shared rules there, not here.

- The isolation guard runs as a `PreToolUse` hook (`.claude/settings.json`) on Write/Edit inside this repo and on outward Bash commands (commit, push, `gh pr/issue/release/api`). If it blocks, do not work around it.
- Run `/sync-artifacts` at the end of a session (before creating a PR or merging).
- Use `/update-doc-changelog` when modifying `docs/**`, `/update-schema` after a migration.

## Available Custom Commands

| Command | Description |
| :--- | :--- |
| `/senior-architect` | Staff-level security, performance, and architecture audit |
| `/code-review` | Rigorous PR / codebase code review |
| `/security-scan` | Run automated vulnerability and secret scan |
| `/tutor` | Teaching-assistant mode (explains, doesn't code for you) |
| `/create-issue` | Create a structured GitHub issue with Gherkin criteria |
| `/start-story` | Start a user story: branch, UX check, and plan |
| `/sync-artifacts` | Sync session artifacts to `docs/logbook/` |
| `/audit` | Full consistency audit of all docs against the codebase |
| `/update-doc-changelog` | Update version, date, and changelog in a doc file |
| `/update-schema` | Sync `docs/design/db-schema.sql` with latest Supabase migrations |
