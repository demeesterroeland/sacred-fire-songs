Start working on a new user story end-to-end: branch → design/brainstorm → plan → implement → merge → mark as implemented.

## Full Story Lifecycle

### 1. Branch Creation
- Ask for the Story ID (e.g., "3.3.1") if not provided via `$ARGUMENTS`.
- Create branch `feat/userstory-<epic-id>` from `main` (use the epic number, e.g. `feat/userstory-3.3` for stories 3.3.x).
- Confirm you are NOT on `main` before proceeding.

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
- Commit frequently with descriptive messages referencing the story (`feat: [Story X.X.X] ...`).
- Run tests after each significant change.

### 7. PR, Merge & Cleanup
- Push branch and open a PR.
- PR title: `[Story X.X.X] <short description>`.
- After user approves and merges: delete the remote and local branch.

### 8. Mark as Implemented (REQUIRED after merge)
After the PR is merged:
1. In `docs/logbook/epic&user stories.md`, update the story header:
   ```
   **Story X.X.X: [Implemented]** ...title...
   <!-- Branch: feat/userstory-X.X | PR: #NNN -->
   ```
2. Close the corresponding GitHub Issue (or confirm it was auto-closed by the PR).
3. Run `/sync-stories` to pull the closed status back and confirm the MD is in sync.
4. Commit the MD update directly to `main` (or via a `chore/` branch if branch protection is strict).

Story ID: $ARGUMENTS
