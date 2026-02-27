# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` *before* implementation
3. **Branching Strategy (Feature Branches):** All work for a specific track MUST be performed on a separate branch named `feat/<track_id>`. Never implement track tasks directly on `main`.
4. **Test-Driven Development:** Write unit tests before implementing functionality
5. **High Code Coverage:** Aim for >80% code coverage for all modules
6. **User Experience First:** Every decision should prioritize user experience
7. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for watch-mode tools (tests, linters) to ensure single execution.

## Task Workflow

All tasks follow a strict lifecycle:

### Track Initialization Workflow (Branch Management)

**Trigger:** This protocol is executed once when beginning the implementation of a new track.

1. **Create Feature Branch:**
   - Resolve the `<track_id>` from the implementation plan.
   - Execute `git checkout -b feat/<track_id>`.
   - **Announce:** "Switched to new feature branch `feat/<track_id>` for this track."

### Standard Task Workflow

1. **Select Task:** Choose the next available task from `plan.md` in sequential order

2. **Mark In Progress:** Before beginning work, edit `plan.md` and change the task from `[ ]` to `[~]`

3. **Write Failing Tests (Red Phase):**
   - Create a new test file for the feature or bug fix.
   - Write one or more unit tests that clearly define the expected behavior and acceptance criteria for the task.
   - **CRITICAL:** Run the tests and confirm that they fail as expected. This is the "Red" phase of TDD. Do not proceed until you have failing tests.

4. **Implement to Pass Tests (Green Phase):**
   - Write the minimum amount of application code necessary to make the failing tests pass.
   - Run the test suite again and confirm that all tests now pass. This is the "Green" phase.

5. **Refactor (Optional but Recommended):**
   - With the safety of passing tests, refactor the implementation code and the test code to improve clarity, remove duplication, and enhance performance without changing the external behavior.
   - Rerun tests to ensure they still pass after refactoring.

6. **Verify Coverage:** Run coverage reports using the project's chosen tools. For example, in a Next.js project: `npm run coverage`.
   Target: >80% coverage for new code.

7. **Document Deviations:** If implementation differs from tech stack:
   - **STOP** implementation
   - Update `tech-stack.md` with new design
   - Add dated note explaining the change
   - Resume implementation

8. **Commit Code Changes:**
   - Stage all code changes related to the task.
   - Propose a clear, concise commit message e.g, `feat(ui): Create basic HTML structure for calculator`.
   - Perform the commit on the current `feat/` branch.

9. **Attach Task Summary with Git Notes:**
   - **Step 9.1: Get Commit Hash:** Obtain the hash of the *just-completed commit* (`git log -1 --format="%H"`).
   - **Step 9.2: Draft Note Content:** Create a detailed summary for the completed task. This should include the task name, a summary of changes, a list of all created/modified files, and the core "why" for the change.
   - **Step 9.3: Attach Note:** Use the `git notes` command to attach the summary to the commit.

10. **Get and Record Task Commit SHA:**
    - **Step 10.1: Update Plan:** Read `plan.md`, find the line for the completed task, update its status from `[~]` to `[x]`, and append the first 7 characters of the *just-completed commit's* commit hash.
    - **Step 10.2: Write Plan:** Write the updated content back to `plan.md`.

11. **Commit Plan Update:**
    - **Action:** Stage the modified `plan.md` file.
    - **Action:** Commit this change with a descriptive message (e.g., `conductor(plan): Mark task 'Create user model' as complete`).

### Phase Completion Verification and Checkpointing Protocol

**Trigger:** This protocol is executed immediately after a task is completed that also concludes a phase in `plan.md`.

1.  **Announce Protocol Start:** Inform the user that the phase is complete and the verification and checkpointing protocol has begun.

2.  **Ensure Test Coverage for Phase Changes:**
    -   **Step 2.1: Determine Phase Scope:** Read `plan.md` to find the Git commit SHA of the *previous* phase's checkpoint.
    -   **Step 2.2: List Changed Files:** Execute `git diff --name-only <previous_checkpoint_sha> HEAD`
    -   **Step 2.3: Verify and Create Tests:** For each code file, verify a corresponding test file exists or create one.

3.  **Execute Automated Tests:**
    - **Command:** `CI=true npm test`
    - If tests fail, debug (max 2 attempts) then ask for guidance.

4.  **Propose Manual Verification Plan:**
    - Analyze project context and goals to generate step-by-step verification steps.

5.  **Await Explicit User Feedback:**
    - Ask: "**Does this meet your expectations? Please confirm with yes or provide feedback on what needs to be changed.**"
    - **PAUSE** for response.

6.  **Create Checkpoint Commit:**
    - Perform commit on the feature branch: `conductor(checkpoint): Checkpoint end of Phase X`.

7.  **Attach Verification Report using Git Notes:**
    - Attach report including test results and manual verification confirmation.

8.  **Record Checkpoint SHA in Plan:**
    - Update `plan.md` heading with the short SHA.

9. **Commit Plan Update:**
    - Stage and commit `plan.md` on the feature branch.

10.  **Announce Completion:** Notify user phase is complete and checkpointed.

### Track Finalization and Merge Protocol

**Trigger:** This protocol is executed after the final phase of a track is successfully checkpointed.

1. **Push and Create Pull Request:**
   - Execute `git push -u origin feat/<track_id>`.
   - Execute `gh pr create --title "feat: <track_description>" --body "Implementation of track <track_id> complete. All tests passing and verified."`.
   - **Announce:** "Created Pull Request for track `<track_id>`."

2. **Merge Pull Request:**
   - Execute `gh pr merge --squash --delete-branch`.
   - **Announce:** "Merged and closed Pull Request for track `<track_id>`. Feature branch deleted from remote."

3. **Cleanup Local Branch:**
   - Execute `git checkout main`.
   - Execute `git pull origin main`.
   - Execute `git branch -d feat/<track_id>`.
   - **Announce:** "Updated local `main` and deleted local feature branch."

4. **Update Registry:**
   - Mark track as complete `[x]` in `conductor/tracks.md`.
   - Commit registry update on `main`.

### Quality Gates

Before marking any task complete, verify:

- [ ] All tests pass
- [ ] Code coverage meets requirements (>80%)
- [ ] Code follows project's code style guidelines
- [ ] Type safety is enforced
- [ ] Works correctly on mobile (if applicable)
- [ ] Documentation updated if needed

## Commit Guidelines

### Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintenance tasks

## Definition of Done

A task is complete when:

1. All code implemented to specification
2. Unit tests written and passing
3. Coverage >80%
4. Documentation complete
5. Code passes linting
6. Changes committed to the `feat/` branch with proper message
7. Git note with task summary attached
