# Development Workflow Guidelines

The industry standard process we use is called **GitHub Flow**.
It is a lightweight, branch-based workflow that supports teams and projects where deployments happen regularly.

## The Cycle: 6 Steps

### 1. The Issue (The "Why")
**Goal**: Defining the work.
*   **Action**: Create a **GitHub Issue** (or User Story).
*   **Format**: Use our `/create-issue` template.
*   **Rule**: Never write code without an Issue to track it.

### 2. The Branch (The workspace)
**Goal**: Isolation. Don't break `main`.
*   **Command**: `git checkout -b <type>/<issue-id>-<description>`
*   **Naming Convention**:
    *   `feat/12-add-login-page` (New features)
    *   `fix/15-resolve-auth-bug` (Bug fixes)
    *   `docs/10-update-readme` (Documentation only)
    *   `chore/18-upgrade-deps` (Maintenance)

### 3. The Work (Development)
**Goal**: Incremental progress.
*   **Committing**: exact "when" to commit is personal preference, but generally:
    *   *Frequency*: Commit whenever you complete a logical unit (e.g., "styled one button", "added database column"). **Don't wait until the end of the day.**
    *   *Message*: Use **Conventional Commits**:
        *   `feat: add login button`
        *   `fix: resolve null pointer in header`
        *   `style: adjust padding on mobile`
*   **Pushing**:
    *   Push to `origin` regularly to back up your work: `git push`.
    *   **Vercel Preview**: This triggers a build of your Preview URL.
    *   **Staging Database**: If you added migration files, this **automatically** deploys them to the **Staging DB**.

### 4. The Pull Request (The Review)
**Goal**: Validation.
*   **When**: When the feature is "code complete" or you want feedback.
*   **Action**: Open a Pull Request (PR) on GitHub from your branch to `main`.
*   **Where to Test (Solo Developer)**:
    1.  **Local (`npm run dev`)**: *While coding.* Validates logic and UI fast.
    2.  **Preview URL (Vercel)**: *After opening PR.* Validates that the build works in the cloud and connects efficiently to the Staging DB. **This is your "QA" step.**
*   **Checklist**:
    *   [ ] Does the Vercel Preview work?
    *   [ ] Do the automated tests (CI) pass?
    *   [ ] Did I update the relevant documentation?

### 5. The Merge (The Release)
**Goal**: Ship it.
*   **Action**: Click "Squash and Merge" on GitHub.
*   **Effect**:
    *   Your code moves to `main`.
    *   **Vercel Production** deploy is triggered.
    *   **Supabase Production** DB migration is triggered (via GitHub Actions).
*   **Verification**:
    *   **Production URL**: Now is the time to do your final sanity check on the live site (`sacred-fire-songs.com`).

### 6. Cleanup
**Goal**: Hygiene.
*   **Action**: Delete the branch on GitHub (automatically offered after merge) and locally (`git branch -d branchname`).
*   **Next**: `git checkout main` -> `git pull` -> Start over at Step 1.

### 7. What if something goes wrong? (Troubleshooting)

**Scenario A: The Build/Tests Failed (Red 'X' on GitHub)**
1.  Click 'Details' on the red X to see the error log.
2.  Fix the issue locally.
3.  Commit and Push again (`git push`).
4.  *Result*: GitHub updates the SAME PR automatically. You do **not** need to close/re-open.

**Scenario B: The Preview is broken (Bug found)**
1.  Debug locally.
2.  Commit and Push the fix.
3.  *Result*: Vercel deploys a **new** Preview URL for the update.

**Scenario C: I merged it, but it broke Production!**
1.  Go to the specific Pull Request on GitHub.
2.  Click the **"Revert"** button (top right).
3.  This creates a *new* PR that does the exact opposite (undoes your changes).
4.  Merge that new PR immediately to restore Production.

### 8. Enforcing Safety (Branch Protection)

To prevent mistakes (like accidentally pushing broken code to `main`), you should enable **Branch Protection** on GitHub.

1.  Go to **GitHub Repo -> Settings -> Branches**.
2.  Click **"Add branch protection rule"**.
3.  **Branch name pattern**: `main`
4.  Check these boxes:
    *   [x] **Require a pull request before merging** (This stops direct pushes!)
    *   [x] **Require status checks to pass before merging** (Forces Vercel/Tests to be green).
5.  Click **Create**.

Now, if you try `git push origin main`, GitHub will reject it and tell you to create a Branch instead. Same for the interface.
