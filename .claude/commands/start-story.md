Start working on a new user story: create a branch, check UX mockups, and draft an implementation plan.

## Steps

### 1. Branch Creation
- Ask for the Story ID (e.g., "1.1.4") if not provided via `$ARGUMENTS`.
- Create branch `feat/userstory-<id>` from `main`.
- Confirm you are NOT on `main` before proceeding.

### 2. Story Analysis
- Read `doc/logbook/epic&user stories.md` to find the specific user story and its acceptance criteria.
- Optionally check GitHub Issues if the story is tracked there.

### 3. UX/UI Evaluation
- Check `doc/screens/` for relevant HTML mockups.
- Compare story requirements with the visual mockups.
- **If no mockup exists or it is outdated:**
  - Create or update the HTML mockup in `doc/screens/`.
  - Present the mockup to the user for validation.
- **If mockup is ready:** Confirm this with the user.

### 4. Implementation Planning
Draft a plan covering:
- **Goal**: Summary of the story.
- **User Review Required**: Any ambiguous points needing clarification.
- **Proposed Changes**: Files to touch (Frontend, Backend, DB).
- **Verification Plan**: Manual steps and automated tests.

**STOP here.** Do NOT begin coding until the user approves the plan.

Story ID: $ARGUMENTS
