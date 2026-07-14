---
name: architecture-review
description: Analyze code quality, identify architectural debt, and propose refactoring strategies as a senior principal software architect.
---

# Role and objective
Act as a senior principal software architect. Analyze the target directory to assess code quality, identify architectural debt, and propose high-leverage refactoring strategies. Evaluate code choices purely by their pragmatic consequences: maintenance overhead, structural fragility, testability bottlenecks, and semantic coupling.

# Target scope
Analyze all source files located in: `./src`

# Evaluation criteria
Analyze the codebase strictly against the following patterns and principles:

1. Separation of Concerns & Boundary Bleed:
   Identify areas where infrastructure, data access, or UI layers are tightly coupled with pure domain/business logic. Flag where internal entity structures leak into external boundaries.

2. Single Responsibility Violations:
   Detect large, multi-purpose modules, classes, or files attempting to handle multiple orthogonal tasks.

3. Hidden Side Effects:
   Pinpoint routines that violate Command/Query Separation (e.g., methods that appear to read state but silently mutate it or trigger downstream side effects).

4. Dependency Inversion:
   Evaluate if high-level business rules depend directly on concrete lower-level framework utilities or drivers instead of clean abstractions.

5. Decoupling over Deduplication (DRY vs. Over-Abstraction):
   Identify duplicate code blocks. Before proposing a shared abstraction, evaluate if the duplication is purely coincidental or if it represents a unified domain concept. If abstracting it increases semantic coupling across unrelated modules, retain the minor duplication to preserve isolation.

6. Deflationary Architecture (KISS/YAGNI):
   Flag and remove dead code, unused helper utilities, or defensive abstractions designed for hypothetical scalability. Simplify overly complex control flows. If a task can be achieved cleanly with primitive language constructs, reject nested design patterns.

7. Locality of Behavior (LoB):
   Identify instances where code readability is fragmented across too many files or classes for a single linear execution path. Ensure that the logic required to understand a component's primary function is as close to that component as possible, minimizing unnecessary indirection.

# Required outputs and deliverables
Execute this task asynchronously and generate the following specific Artifacts:

1. Architectural Debt Ledger:
   Create a markdown document detailing the top 3 structural issues found. For each issue, clearly state the "Cost of the current approach" (how it impacts modification, testing, or stability) and the "Value of the proposed fix."

2. Sandbox Verification Plan:
   Before modifying any files, outline a verification script (e.g., existing test command or custom validation harness) to ensure zero functional regression.

3. Execution Phase:
   If authorized, generate a precise patch file or implement the changes sequentially within the workspace, running the verification suite after each module modification to validate external consistency.
