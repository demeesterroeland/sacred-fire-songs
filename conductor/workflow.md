# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` *before* implementation
3. **User Story Driven:** Every track MUST be linked to one or more User Stories (GitHub Issues). If a story does not exist, create it before starting.
4. **Branching Strategy (Feature Branches):** All work for a specific track MUST be performed on a separate branch named `feat/<track_id>`. Never implement track tasks directly on `main`.
5. **Test-Driven Development:** Write unit tests before implementing functionality
6. **High Code Coverage:** Aim for >80% code coverage for all modules
7. **User Experience First:** Every decision should prioritize user experience
8. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for watch-mode tools (tests, linters) to ensure single execution.

## Task Workflow

All tasks follow a strict lifecycle:

### Track Initialization Workflow (Branch & Story Management)

**Trigger:** This protocol is executed once when beginning the implementation of a new track.

1. **Verify User Stories:**
   - Check the track's `spec.md` for linked User Story IDs (GitHub Issues).
   - Verify these issues exist and are open in GitHub using `gh issue list`.
   - **Action:** If no user stories are linked or exist, ask the user to provide them or use the `/create-issue` command to generate them.

2. **Create Feature Branch:**
   - Resolve the `<track_id>` from the implementation plan.
   - Execute `git checkout -b feat/<track_id>`.
   - **Announce:** "Switched to new feature branch `feat/<track_id>`. This track is linked to User Stories: <list_of_ids>."

### Standard Task Workflow

1. **Select Task:** Choose the next available task from `plan.md` in sequential order.

2. **Mark In Progress:** Before beginning work, edit `plan.md` and change the task from `[ ]` to `[~]`.

3. **Write Failing Tests (Red Phase):**
   - Create a new test file for the feature or bug fix.
   - Write unit tests that define the expected behavior.
   - **CRITICAL:** Run tests and confirm they fail as expected.

4. **Implement to Pass Tests (Green Phase):**
   - Write implementation code to make tests pass.
   - Confirm all tests pass.

5. **Refactor:**
   - Improve code/test quality without changing behavior.
   - Confirm tests still pass.

6. **Verify Coverage:** Run coverage reports (Target: >80% for new code).

7. **Document Deviations:** Update `tech-stack.md` if the design changes.

8. **Commit Code Changes:**
   - Stage all code changes related to the task.
   - **Linking to Stories:** Include the relevant User Story ID(s) in the commit message.
   - **Format:** `feat(<scope>): <description> (Story #<id>)`
   - Perform the commit on the `feat/` branch.

9. **Attach Task Summary with Git Notes:**
   - Obtain commit hash and attach a detailed summary via `git notes`.

10. **Record Task Commit SHA in Plan:**
    - Update `plan.md` with the `[x]` status and the 7-character SHA.

11. **Commit Plan Update:**
    - Stage and commit `plan.md` on the feature branch.

### Phase Completion Verification and Checkpointing Protocol

... (Standard Protocol: Determine Scope, List Files, Verify/Create Tests, Execute Tests, Manual Verification, Checkpoint Commit, Git Notes Report, SHA Recording) ...

### Track Finalization and Merge Protocol

**Trigger:** This protocol is executed after the final phase of a track is successfully checkpointed.

1. **Push and Create Pull Request:**
   - Execute `git push -u origin feat/<track_id>`.
   - **Link for Auto-Close:** In the PR body, use the "Closes #<id>" syntax for every User Story linked to the track.
   - Execute `gh pr create --title "feat: <track_description>" --body "Implementation of track <track_id> complete.\n\nCloses #<id1>, Closes #<id2>\n\nAll tests passing and verified."`.
   - **Action:** Provide the PR link to the user and ask: "**The Pull Request has been created. It is linked to close User Stories #<ids>. Would you like me to merge it now, or would you prefer to review it manually?**"
   - **PAUSE** for response.

2. **Merge Pull Request (Conditional):**
   - If the user approves:
     - Execute `gh pr merge --squash --delete-branch`.
     - **Announce:** "Merged and closed Pull Request for track `<track_id>`. Linked User Stories have been closed automatically. Feature branch deleted."
   - If the user prefers manual review:
     - **Announce:** "PR left open for review. Run `/conductor:implement` later to finish."
     - **HALT**.

3. **Cleanup Local Branch:**
   - Checkout `main`, pull, and delete the local feature branch.

4. **Update Registry & Sync Logbook:**
   - Mark track as complete `[x]` in `conductor/tracks.md`.
   - **Sync Local Stories:** Execute `node .claude/scripts/sync-stories-from-gh.mjs` to pull the latest issue statuses (Closed) from GitHub into `docs/logbook/epic&user stories.md`.
   - Stage `conductor/tracks.md` and `docs/logbook/epic&user stories.md`.
   - Commit registry and logbook updates on `main` with message `chore(conductor): Mark track '<track_description>' as complete and sync user stories`.

### Quality Gates

Before marking any task complete, verify:
- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets requirements (>80%)
- [ ] Commits are linked to User Story IDs
- [ ] **Type safety is enforced (`npx tsc --noEmit` passes)**
- [ ] Documentation updated if needed

## Development Commands

### Pre-Commit / Pre-Push Checks
Execute these commands to ensure the build will succeed remotely:
```bash
# Run full TypeScript compiler check (simulates production build strictness)
npx tsc --noEmit

# Run linting
npm run lint

# Run all tests
npm test
```

## Definition of Done

A task is complete when:
1. All code implemented to specification
2. Unit tests written and passing
3. Coverage >80%
4. **Commit message includes User Story ID (#<id>)**
5. Implementation notes added to `plan.md`
6. Changes committed to the `feat/` branch
7. Git note with task summary attached
