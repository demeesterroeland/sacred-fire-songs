# Sacred Fire Songs – Project Instructions

## Branch Protection (CRITICAL)

You are **STRICTLY FORBIDDEN** from committing directly to `main` or `master`.

- For **every** change (including typos and one-liners), create a branch: `feat/…`, `fix/…`, `chore/…`, or `docs/…`
- `main` is updated **only** via merges from verified feature branches.
- No exceptions. If the user says "just fix it quickly", still branch first, then ask to merge.

## Documentation Sync Policy

All project artifacts must stay 100% synchronized with the codebase.

- Every code change must be reflected in `application-analysis&design.md`.
- Before completing a task, verify the implementation against acceptance criteria in `epic&user stories.md`.
- If a UI screen is modified, compare against the visual description in `doc/screens/screen*.html` mockups.
- Propose specific edits to inconsistent files as soon as discrepancies are found.
- Update version status in `application-analysis&design.md` and related docs if significant changes are made.
- **Definition of Done**: A task is not "Done" until documentation, tests, and code are in 100% alignment.

## Artifact Synchronization Policy

The agent does NOT retain memory across conversations. To avoid data loss:

| Artifact | Strategy |
| :--- | :--- |
| `master-walkthrough.md` | **APPEND** only – safe |
| `master-tasks.md` | **READ first**, then append/merge |
| `master-timetracking.md` | **READ first**, then update totals |

- At the start of a session, **READ** files in `doc/logbook/` to initialize context.
- Run `/sync-artifacts` at the end of a session (before creating a PR or merging).
- Never overwrite any of those files with an empty or partial list.

## Glob-Triggered Rules

### When modifying `doc/*.{md,sql,html}`
1. Increment the version number in the file header.
2. Update the date to today.
3. Add a new changelog entry.
4. Use the `/update-doc-changelog` command for consistency.

### When modifying `supabase/migrations/*.sql`
1. Update `doc/db-schema.sql` to reflect the changes.
2. Use the `/update-schema` command if helpful.
3. Keep `doc/db-schema.sql` valid as a single-file fresh-install setup script.

## Supabase Patterns

- Use `.maybeSingle()` (not `.single()`) when a row may not exist — `.single()` returns 406 if zero rows match.
- Server-side queries belong in `lib/*/serverQueries.ts`; import `createClient` from `@/lib/supabase/server`.
- Only import server queries from Server Components or Server Actions (never from client components).

## Available Custom Commands

| Command | Description |
| :--- | :--- |
| `/senior-architect` | Staff-level security, performance, and architecture audit |
| `/code-review` | Rigorous PR / codebase code review |
| `/security-scan` | Run automated vulnerability and secret scan |
| `/tutor` | Teaching-assistant mode (explains, doesn't code for you) |
| `/create-issue` | Create a structured GitHub issue with Gherkin criteria |
| `/start-story` | Start a user story: branch, UX check, and plan |
| `/sync-artifacts` | Sync session artifacts to `/doc/logbook/` |
| `/audit` | Full consistency audit of all docs against the codebase |
| `/update-doc-changelog` | Update version, date, and changelog in a doc file |
| `/update-schema` | Sync `doc/db-schema.sql` with latest Supabase migrations |
