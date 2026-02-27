---
name: agent-flow
description: Executes tasks using the 7-step Agentic Workflow methodology.
---

# 7-Step Agentic Workflow Skill

Use this skill when a task requires a high level of rigor, complexity management, or when specifically requested by the user. You must follow these 7 steps sequentially and transparently.

## Workflow Phases

### 1. Discovery
- **Actions**: Analyze the local environment, read key configuration files (`package.json`, `CLAUDE.md`, `.env`), and search the codebase for relevant patterns.
- **Output**: A summary of what you've found and how it affects the task.

### 2. Step-by-Step Planning
- **Actions**: Break down the objective into discrete, manageable sub-tasks. Update `task.md`.
- **Output**: An implementation plan (`implementation_plan.md`) describing the goal, proposed changes, and verification steps.

### 3. Context Assembly
- **Actions**: Gather all necessary code files, documentation, and database schemas into your active context.
- **Output**: A list of "active context" files you are working with.

### 4. Implementation
- **Actions**: Perform the actual code modifications, file creations, or deletions. Follow the project's coding standards.
- **Output**: Diffs or summaries of the changes made.

### 5. Verification
- **Actions**: Run technical verification steps (linters, unit tests, build checks) or perform manual checks (UI inspection).
- **Output**: Results of the verification steps.

### 6. Self-Correction
- **Actions**: If verification reveals errors (lint failures, failed tests), analyze the output, identify the root cause, and apply fixes.
- **Output**: Record of fixes applied during the session.

### 7. Finalization
- **Actions**: Create a `walkthrough.md` summarizing the work, run `/sync-artifacts`, and prepare the final response to the user.
- **Output**: Completion summary with proof of work.

## Core Rules
- **Transparency**: Always announce which phase you are entering.
- **Rigor**: Do not skip verification or planning.
- **Artifacts**: Maintain `task.md`, `implementation_plan.md`, and `walkthrough.md` throughout the process.
