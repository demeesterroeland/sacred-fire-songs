---
name: masterplan-orchestrator
description: "Transforms any project plan (MASTER_PLAN.md or equivalent) into an AI-Native Orchestrator on GitHub using native sub-issues (`gh sub-issue`), explicit dependency graphs, model tier classification (Tier 1 High-Reasoning vs Tier 2 Fast/Budget), Gherkin acceptance criteria, and multi-agent Git worktree handoff protocols."
---

# /masterplan-orchestrator

Transforms any markdown-based software architecture masterplan into a production-grade, asynchronous AI-Native Orchestrator on GitHub. Enables multiple AI agents (Claude, Gemini, OpenAI, Codex) and human developers to collaborate concurrently across isolated Git worktrees without losing context, colliding on branches, or duplicating work.

---

## When to Use This Skill

- When a new or existing repository has an architecture roadmap (e.g. `MASTER_PLAN.md`, `ROADMAP.md`, `PLAN.md`) that needs to be decomposed into actionable GitHub Issues.
- When orchestrating concurrent AI coding agents that require isolated worktrees, local port separation, and structured handoff comments.
- When migrating flat GitHub issues into GitHub's native issue hierarchy using `gh sub-issue`.
- When assigning model tiers to tasks based on cognitive complexity (high-reasoning architecture vs fast boilerplate).

---

## The 4-Step Orchestration Protocol

### Step 1: Ingest & Audit

1. **Read the Masterplan**:
   Inspect the project plan file (`MASTER_PLAN.md`, `ROADMAP.md`, or equivalent). Identify:
   - Core Mission & Boundary Non-Negotiables
   - Technical Stack & Target Runtimes
   - Component & Storage Architecture
   - Sequential Phases and Milestones
   - Task Breakdown & Input/Output deliverables

2. **Audit GitHub State & Git Environment**:
   ```bash
   git status
   git branch -a
   gh issue list --limit 50 --state all
   gh label list
   ```
   Check if GitHub CLI `sub-issue` extension or native sub-issue capability is present:
   ```bash
   gh sub-issue --help || gh extension install github/gh-sub-issue
   ```

3. **Ensure Required Model Tier Labels**:
   Ensure the repository has labels to classify cognitive workload:
   ```bash
   gh label create "model:tier-1" --color "d93f0b" --description "Tier 1 (High Reasoning / Creative): Architecture, complex parsers & fuzzy merge" --force
   gh label create "model:tier-2" --color "0e8a16" --description "Tier 2 (Fast / Budget): Standard batch imports, boilerplate, validation & docs" --force
   ```

---

### Step 2: Create the Master Epic (Single Source of Truth)

Create or update a central umbrella Epic issue on GitHub titled:
`[Epic] <Project / Initiative Name> Masterplan Orchestrator`
Tag it with labels `epic`, `type:infrastructure`, and any relevant domain labels.

The Master Epic issue body **MUST** contain these 5 core sections:

#### 1. Mission & Non-Negotiables
- Project goal and high-level deliverables.
- Strict project boundaries (e.g., zero data loss, provenance preservation, binary keep-out, syntax validation requirements).

#### 2. Architecture Blueprint
- System Mermaid diagram visualizing data flows, storage backends, and pipeline stages:
  ```mermaid
  flowchart TD
      Sources["Raw Inputs / External APIs"] --> Ingest["Ingestion / Extraction"]
      Ingest --> Staging["Staging / Intermediate DTOs"]
      Staging --> Engine["Core Business / Merge Engine"]
      Engine --> Canonical["Canonical Storage / DB"]
      Canonical --> Presentation["Exporters / Web Service / Presentation"]
  ```
- Summary table of key architectural decisions.

#### 3. Execution Roadmap & Dependency Graph
- Mermaid flowchart illustrating phase dependencies:
  ```mermaid
  flowchart LR
      P1["Phase 1: Foundation & Schemas"] --> P2["Phase 2: Core Pipeline"]
      P2 --> P3["Phase 3: Data Ingestion (Parallel Batches)"]
      P3 --> P4["Phase 4: Presentation / Web UI"]
  ```
- Explicit rules for **what can run in parallel** (e.g. isolated staging extractors) vs **what must run sequentially** (e.g. shared database migrations or canonical mergers).

#### 4. Model Tier Matrix
Tag every task with its recommended model class:
- **Tier 1 (`model:tier-1` — High Reasoning / Creative)**: Complex algorithms, layout heuristics, fuzzy deduplication, deep debugging, architecture design.
  - *Recommended Models*: Claude Sonnet 4.6 / Opus, Gemini 3.1 Pro / Argon, GPT-5.4
- **Tier 2 (`model:tier-2` — Fast / Budget)**: Repetitive boilerplate, standard CRUD endpoints, unit tests, schema scaffolding, docs.
  - *Recommended Models*: Gemini 3.8 Flash, Claude Haiku, GPT-5.4-mini

Markdown table format:
```markdown
| Issue | Code | Title | Model Tier | Recommended Models | Blocked By | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| #10 | `Task 1.1` | SQLite Schema Scaffolding | `model:tier-2` | Gemini 3 Flash / Haiku | None | 🟢 Ready |
```

#### 5. AI Agent Standard Operating Procedure (SOP)
Include the exact rules for agents working on child issues:
- **Git Worktree Isolation**:
  ```bash
  git worktree add .worktrees/issue-<number> -b feat/<number>-<slug>
  cd .worktrees/issue-<number>
  ```
- **Local Port Isolation**:
  - Dev/Preview Port: `3<issue#>` (e.g., Issue #9 -> `3009`, Issue #60 -> `3060`)
  - Test/Validator Port: `4<issue#>` (e.g., Issue #9 -> `4009`, Issue #60 -> `4060`)
- **Pre-Close Verification Checklist**:
  - [ ] `test` (Zero unit or integration test failures)
  - [ ] `lint` / `validate` (Static analysis and syntax AST checks)
  - [ ] `build` (Clean compilation/build)
- **Asynchronous Handoff Protocol (Snapshot Comment Template)**:
  ```markdown
  ### 🤖 AI Agent Handoff Snapshot
  - **Agent / Model**: `<e.g. Claude Sonnet 4.6 / Gemini 3.8 Flash>`
  - **Worktree & Branch**: `.worktrees/issue-<number>` (`feat/<number>-<slug>`)
  - **Head Commit SHA**: `<git rev-parse --short HEAD>`
  - **Current Lifecycle Label**: `status:ready` | `status:in-progress` | `status:completed`

  #### Completed in This Turn
  - ...

  #### Metrics & Verification Output
  - Tests: `PASS`
  - Lint / Validation: `PASS`

  #### Blockers / Next Steps for Next Agent
  - ...
  ```

---

### Step 3: Generate Granular Sub-Issues

Break down every phase into atomic, self-contained sub-issues linked to their parent phase epic using `gh sub-issue`:

```bash
gh sub-issue create \
  --parent <parent_epic_issue_number> \
  --title "[Feature/Chore/Bug] [Task X.Y] <Clear Action-Oriented Title>" \
  --body "<Body Content>" \
  --label "<labels>" \
  --milestone "<milestone_name>"
```

#### Standard Sub-Issue Structure
Every sub-issue body **MUST** contain:
1. **Context**: Background and rationale.
2. **Scope & Deliverables**: Checkbox list of exact files, classes, or scripts to create/modify.
3. **Explicit Dependencies**:
   - `Blocked By`: Issue numbers and status.
   - `Unblocks`: Downstream issues unlocked by completing this task.
   - `Parallelizable With`: Other sibling tasks that can run concurrently.
4. **Acceptance Criteria (Strict Gherkin)**:
   ```gherkin
   Feature: <Feature Name>

     Scenario: <Happy Path Scenario>
       Given <initial state or prerequisites>
       When <action or command is executed>
       Then <expected observable outcome>
       And <invariants maintained>
   ```
5. **SOP Footer**: Worktree commands, port assignments, and pre-close checklist.

---

### Step 4: Verification & Handoff

1. **Verify Issue Tree**:
   ```bash
   gh sub-issue list <master_epic_number> -s all
   ```
2. **Check Checklist Synchronization**:
   Ensure each parent Epic's description has checkbox links (`- [ ] #<number> — <Title>`) so progress is visible at a glance.
3. **Output Executive Summary**:
   Provide the user with:
   - Links to the Master Epic and Phase Epics.
   - A summary table of all sub-issues, their assigned model tiers, and current status.
   - The primary unblocked issue(s) ready for Phase 1 dispatch.

---

## Automation Helper Script Template

For projects with 20+ tasks, generate a reproducible Python script (e.g. `scripts/setup_github_roadmap.py`) that uses `gh api` and `gh sub-issue` to create labels, milestones, epics, and sub-issues idempotently.
