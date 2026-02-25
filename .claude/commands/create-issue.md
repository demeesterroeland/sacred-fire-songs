Create a standardized GitHub Issue with Gherkin Acceptance Criteria and optional sub-issue linking.

## Prerequisites
- GitHub CLI (`gh`) must be installed.
- `gh-sub-issue` extension required for sub-issue linking.

## Steps

### 1. Determine Context & Labels
- Ask the user: "Is this a new top-level issue or a sub-issue?"
- **If sub-issue:**
  - Ask for the Parent Issue ID.
  - Run: `gh issue view [Parent_ID] --json labels`
  - Extract any label starting with `epic-` (e.g., `epic-1.1`) and use it for the new issue.
- **If top-level:**
  - Ask which Epic it belongs to (or check `doc/epic&user stories.md`).

### 2. Draft the Issue Content
Create a temporary file `issue_draft.md` with this structure:

```markdown
# [Story X.X.X] Description

**Description:**
> **Story X.X.X**
> (Optional: Sub-issue of #ParentID ([Parent Title]))
> As a [Role], I want to [Action] so that [Benefit].

**Acceptance Criteria (Gherkin):**

```gherkin
Scenario: [Title]
  Given [Context]
  When [Action]
  Then [Outcome]
```

**Labels:** `user-story`, `epic-X.X`
```

### 3. Review with User
- Present the draft for approval.
- Ensure Gherkin covers the main requirements.

### 4. Create the Issue
```bash
gh issue create --title "[Title]" --body-file issue_draft.md --label "label1,label2"
```

### 5. Link as Sub-Issue (if applicable)
```bash
gh sub-issue add [Parent_ID] [New_Issue_ID]
```

### 6. Clean Up
Delete `issue_draft.md` after successful creation.

$ARGUMENTS
