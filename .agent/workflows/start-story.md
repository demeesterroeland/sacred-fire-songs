---
description: Start working on a new user story: Branch, UX check, and Plan.
---

1.  **Branch Creation**:
    -   Ask the user for the Story ID (e.g., "1.1.4") if not provided, and find its GitHub issue number.
    -   Create the worktree and branch from `origin/develop` with `scripts/cicd/start-issue.sh <issue#> feat <short description>` (branch `feat/<issue#>-<desc>`; Gitflow, see `docs/guides/git-workflow.md`).
    -   *Crucial*: Ensure you are NOT on `main` or `develop` before starting work.

2.  **Story Analysis**:
    -   Read `docs/logbook/epic&user stories.md` to find the specific user story and its acceptance criteria.
    -   Check the GitHub issue (search by `[Story X.X.X]`).

3.  **UX/UI Evaluation**:
    -   Check `docs/design/screens/` for relevant HTML mockups.
    -   Compare the story requirements with the visual mockups.
    -   **Action Required**:
        -   If **No Mockup** exists or it is **Outdated**:
            -   Create or update the HTML mockup in `docs/design/screens/`.
            -   **Present** the mockup to the user for validation.
        -   If **Mockup is Ready**: Confirm this with the user.

4.  **Implementation Planning**:
    -   **Draft** the plan in `docs/plans/YYYY-MM-DD-<story-slug>.md`.
    -   Include:
        -   **Goal**: Summary of the story.
        -   **User Review Required**: Any ambiguous points.
        -   **Proposed Changes**: Files to touch (Frontend, Backend, DB).
        -   **Verification Plan**: Manual steps and automated tests.
    -   **Stop**: Do NOT start coding the implementation yet. Wait for user approval of the plan.

5.  **PR**:
    -   Open the PR into `develop` (`gh pr create --base develop`) with a Conventional Commit title and `Closes #<issue>` in the body.
    -   Merge only after the user explicitly approves; never commit to `main` or `develop`, never close issues yourself.
