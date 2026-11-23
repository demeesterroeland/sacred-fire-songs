---
description: Review all files in /doc/ against the current codebase and each other.
---

# /audit

Follow these steps to ensure that the Design Document, User Stories, DB Schema, UI Screens, Test Cases, and User Documentation remain consistent with each other and the implementation.

## 1. Audit Phase
1.  **Read all local documents** in the `doc/` directory:
    - `application-analysis&design.md`
    - `epic&user stories.md`
    - `db-schema.sql`
    - `test-cases.md`
    - `user-guide.md`
    - Any `screen*.html` files.

2.  **Cross-Reference Requirements**:
    - Verify that every feature mentioned in `application-analysis&design.md` has corresponding User Stories in `epic&user stories.md`.
    - Identify any user stories marked 'complete' in `epic&user stories.md` that lack corresponding tests in `test-cases.md` or the codebase.
    - Verify that every public-facing feature is mentioned in `user-guide.md`.

3.  **Cross-Reference Data & UI**:
    - Verify that all data fields displayed in `screen*.html` mockups are present in the `db-schema.sql`.
    - Verify that the `db-schema.sql` supports all entities required by the User Stories (e.g., Playlists, Versions).
    - Identify UI changes in the codebase not reflected in documentation or HTML mockups.

## 2. Reporting Phase
1.  Generate a **Consistency Report** identifying:
    - **Passed Checks**: Areas where everything aligns.
    - **Gaps**: Missing documentation or tests for features.
    - **Contradictions**: Discrepancies between docs (e.g., naming mismatches between stories and schema) or implementation.

## 3. Rectification Phase
1.  Propose a plan or specific edits to fix the identified discrepancies.
2.  Ensure that all documentation and code are brought into 100% alignment before concluding the task.
