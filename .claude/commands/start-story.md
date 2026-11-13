Start working on a new user story end-to-end: branch → design/brainstorm → plan → implement → merge → mark as implemented.

## Full Story Lifecycle

### 1. Branch Creation
- Ask for the Story ID (e.g., "3.3.1") if not provided via `$ARGUMENTS`.
- Create the worktree and branch from `origin/develop` with `scripts/cicd/start-issue.sh <issue#> feat <short description>` (branch `feat/<issue#>-<desc>`; Gitflow, see `docs/guides/git-workflow.md`).
- Confirm you are NOT on `main` or `develop` before proceeding.

### 2. Story Analysis
- Read `docs/logbook/epic&user stories.md` to find the story and its acceptance criteria.
- Check the corresponding GitHub Issue (search by `[Story X.X.X]`).
- Note the story's GH issue number for later reference.

### 3. UX/UI Evaluation
- Check `docs/design/screens/` for relevant HTML mockups.
- **If no mockup exists or it is outdated:** Create or update the HTML mockup, present it to the user for validation before proceeding.
- **If mockup is ready:** Confirm with the user.

### 4. Design / Brainstorm (BEFORE any code or assets)
- **REQUIRED:** Use the `superpowers:brainstorming` skill if the story involves UI design, new architecture, or creative assets.
- Ask all clarifying questions BEFORE making any assets, writing any code, or drafting the plan.
- For visual work (icons, illustrations, color palettes): ask about style, colors, references, and constraints first.
- Do NOT produce any output (icons, code, schema) until the user has answered design questions.

### 5. Implementation Planning
Draft a plan covering:
- **Goal**: One-sentence summary.
- **Files to touch**: Frontend, Backend, DB, assets.
- **Open questions**: Anything still ambiguous.
- **Verification**: Manual steps + automated tests.

Save the plan to `docs/plans/YYYY-MM-DD-<story-slug>.md`.

**STOP here.** Do NOT begin coding until the user approves the plan.

### 6. Implementation
- Follow the approved plan task by task.
- Commit frequently with Conventional Commit messages referencing the story (`feat(scope): ... (Story X.X.X)`).
- Run tests after each significant change.

### 7. PR, Merge & Cleanup
- Run `/sync-artifacts` and commit the logbook updates on the branch.
- Push the branch and open a PR into `develop` (`gh pr create --base develop`).
- PR title: Conventional Commit, e.g. `feat(scope): <short description> (Story X.X.X)` — the `pr-policy` check rejects other titles.
- Merge only after the user explicitly approves (squash into `develop`); then remove the worktree and local branch.

### 8. Mark as Implemented (on the story branch, before the PR)
1. In `docs/logbook/epic&user stories.md`, update the story header in the same PR:
   ```
   **Story X.X.X: [Implemented]** ...title...
   <!-- Branch: feat/<issue#>-<desc> | PR: #NNN -->
   ```
2. Put `Closes #<issue>` in the PR body so the issue closes on merge; never close issues yourself unless the user says so.
3. After the merge, run `/sync-stories` to confirm the MD and GitHub agree; any follow-up edit goes through a `docs/…` branch and a PR into `develop` (never commit to `main` or `develop`).

Story ID: $ARGUMENTS
