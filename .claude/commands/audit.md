Perform a full consistency audit of all documentation against the codebase and each other.

## Phase 1: Audit

### Read All Documents
- `doc/application-analysis&design.md`
- `doc/epic&user stories.md`
- `doc/db-schema.sql`
- `doc/test-cases.md`
- `doc/user-guide.md`
- All `doc/screens/screen*.html` files

### Cross-Reference Requirements
- Every feature in `application-analysis&design.md` must have corresponding User Stories in `epic&user stories.md`.
- Every user story marked "complete" must have corresponding tests in `test-cases.md` or the codebase.
- Every public-facing feature must be mentioned in `user-guide.md`.

### Cross-Reference Data & UI
- All data fields shown in `screen*.html` mockups must exist in `db-schema.sql`.
- `db-schema.sql` must support all entities required by the User Stories.
- Identify UI changes in the codebase not reflected in documentation or mockups.

## Phase 2: Report

Generate a **Consistency Report** with:
- **Passed Checks**: Areas where everything aligns.
- **Gaps**: Missing documentation or tests for features.
- **Contradictions**: Discrepancies between docs or between docs and implementation.

## Phase 3: Rectify

Propose a plan or specific edits to fix the identified discrepancies. Ensure documentation and code reach 100% alignment before concluding.
