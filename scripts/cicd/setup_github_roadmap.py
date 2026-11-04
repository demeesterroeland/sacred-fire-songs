#!/usr/bin/env python3
"""
setup_github_roadmap.py
-----------------------
Idempotently creates the GitHub issue tree for Epic 5.1 (Gitflow CI/CD Migration)
following the masterplan-orchestrator skill (.agents/skills/masterplan-orchestrator):

  [Epic 5.1] Master Epic
   ├── [Epic 5.1 · Phase N] phase epics (sub-issues)
   │    └── [Story 5.1.x] / [Task 5.1.0] (sub-issues)
   └── labels model:tier-1 / model:tier-2, blocked-by dependencies

Gherkin acceptance criteria are read from docs/testing/gitflow-cicd.feature
(scenarios tagged @story-5.1.x), so the spec stays the single source of truth.

Re-running updates bodies and links instead of creating duplicates.

Usage:
  python3 scripts/cicd/setup_github_roadmap.py [--dry-run]

Requires: gh (authenticated) + gh-sub-issue extension.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

REPO = "demeesterroeland/sacred-fire-songs"
ROOT = Path(__file__).resolve().parents[2]
FEATURE = ROOT / "docs/testing/gitflow-cicd.feature"
PLAN = "docs/plans/2026-10-30-gitflow-cicd-migration.md"
DRY = "--dry-run" in sys.argv

TIER = {
    1: ("model:tier-1", "Claude Opus / Sonnet, Gemini Argon"),
    2: ("model:tier-2", "Claude Haiku, Gemini Flash"),
}

# ── Data ────────────────────────────────────────────────────────────────────
PHASES = [
    (0, "Specification & test harness", "BDD feature + contract/bats harness run (red where expected); lint/typecheck scripts exist."),
    (1, "Quality gate on today's flow", "Every PR runs required CI; no false greens; actions pinned."),
    (2, "Introduce develop + branch policy", "`develop` exists and is protected; new work targets it; scripts follow Gitflow."),
    (3, "Staging CD from develop", "Merge to `develop` updates staging (images, migrations, deploy) automatically; nightly slow tests."),
    (4, "Release, production & hotfix", "`develop` → `main` → tag → approved prod deploy → back-merge, all in CI; hotfix path."),
    (5, "Documentation, agent tooling & cut-over", "Docs 100% aligned; dress rehearsal passed; open branches retargeted."),
]

# code, phase, type, title, tier, blocked_by (codes or "#n"), parallel_with, deliverables, context
ITEMS = [
    ("5.1.0", 0, "Task", "Scaffold Gitflow CI spec & test harness (Cucumber ci profile, YAML contract tests, bats, lint/typecheck scripts)", 2,
     [], ["5.1.3", "5.1.12"],
     ["Add `docs/testing/gitflow-cicd.feature` to `cucumber.json` as profile `ci` (`@ci-contract`)",
      "Add `yaml` devDependency; scaffold `testing/unit/tests/ci/workflowContract.test.ts` with `loadWorkflow(name)` helper",
      "Add `bats` devDependency + `testing/scripts/*.bats` scaffold; `npm run test:scripts`",
      "Add `npm run lint` (`eslint .`) and `npm run typecheck` (`tsc --noEmit`); record error baseline"],
     "The pipeline is developed test-first. This task creates the harness so every later story starts with a failing contract/bats test."),
    ("5.1.1", 1, "Story", "As a Maintainer, I want a required PR quality gate (ci.yml) so broken code cannot be merged", 1,
     ["5.1.0"], ["5.1.3", "5.1.12"],
     ["TDD: contract test for `ci.yml` triggers + jobs `lint`, `typecheck`, `unit`, `bdd`, `build`",
      "Create `.github/workflows/ci.yml` (no `integration` job: PR smoke stays in `e2e.yml`, D4)",
      "Lint ratchet: `no-explicit-any` → warn, `--max-warnings` cap",
      "`pipeline` job: actionlint, shellcheck, bats, strict `test:bdd:ci-gate`",
      "Ruleset on `main`: required checks `lint`, `typecheck`, `unit`, `bdd`, `build`, `pipeline`, `e2e`; remove legacy classic protection",
      "Absorb #267 (wire BDD into CI, document testing pyramid) — linked as sub-issue"],
     "Today no lint, typecheck, unit, BDD or build check runs on any PR. Owner decision D4: PR smoke E2E stays in `e2e.yml` (no local Supabase job)."),
    ("5.1.2", 1, "Story", "As a Maintainer, I want E2E and Docker jobs to fail closed so a green check means tests really ran", 2,
     ["5.1.1"], ["5.1.3", "5.1.12"],
     ["TDD: contract — staging E2E fails (not skips) when secrets are missing",
      "Fix `e2e.yml` secret check; set or retire `SUPABASE_PROJECT_ID_STAGING` / `SUPABASE_DB_PASSWORD_STAGING`",
      "Replace `docker.yml` sleep + `gh run watch` polling with `needs`/`workflow_run` on CI success",
      "Remove stale `deploy-db.yml` references from `e2e.yml` header"],
     "E2E currently reports success while skipping (run 41120358783: missing `SUPABASE_PROJECT_ID_STAGING`, `SUPABASE_DB_PASSWORD_STAGING`). `docker.yml` proceeds when no E2E run is found."),
    ("5.1.3", 1, "Story", "As a Contributor, I want one unit-test tree and all feature files wired into Cucumber so tests are not duplicated or ignored", 2,
     ["5.1.0"], ["5.1.1", "5.1.12"],
     ["Merge `lib/unit-tests/*.test.ts` into `testing/unit/tests/` (move `artistUtils`, diff the rest, delete copies)",
      "Point `npm test` / `test:unit` at the single tree; update CLAUDE.md testing section",
      "Wire `setlist-pdf-export.feature` and `gitflow-cicd.feature` into `cucumber.json`",
      "Flip Cucumber `strict: true` for implemented tags"],
     "Unit tests exist in two diverged directories; `setlist-pdf-export.feature` is not run."),
    ("5.1.12", 1, "Story", "As a Maintainer, I want pinned actions, least-privilege permissions and Dependabot so the pipeline is not a supply-chain risk", 2,
     ["5.1.0"], ["5.1.1", "5.1.3"],
     ["Pin all third-party actions to commit SHAs",
      "Top-level `permissions:` in every workflow",
      "`.github/dependabot.yml` for `github-actions` + `npm` (target `develop` once it exists)"],
     "All actions are referenced by mutable tags (`@v4`, `@v6`)."),
    ("5.1.4", 2, "Story", "As a Maintainer, I want protected main and develop branches with develop as default branch", 2,
     ["5.1.1", "5.1.2"], [],
     ["Create `develop` from `main`",
      "Ruleset `develop`: required CI checks, squash-only, block force-push/deletion, include admins",
      "Ruleset `main`: merge-commit (from develop) + squash (hotfix), no rebase, include admins",
      "Set default branch → `develop` (decision D1)"],
     "Introduces the integration branch. Requires the CI check names from 5.1.1."),
    ("5.1.5", 2, "Story", "As a Maintainer, I want PR title and head/base policy checks (pr-lint.yml) so work never skips develop", 2,
     ["5.1.4"], ["5.1.6", "5.1.7"],
     ["TDD: contract tests for head/base matrix",
      "`pr-lint.yml`: Conventional-Commit title check (pinned action) + head/base policy",
      "Reject squash of `develop` → `main` (must be merge commit)"],
     "PR titles drive Release Please; work branches must target `develop`."),
    ("5.1.6", 2, "Story", "As a Contributor, I want start-issue, preview and promotion scripts to follow Gitflow", 2,
     ["5.1.4", "#274"], ["5.1.5", "5.1.7"],
     ["bats: `start-issue.sh` bases on `origin/develop`; `hotfix` type on `origin/main`; validates type",
      "bats: `dev2preview.sh` prints `…/sacred-fire-songs-app:<tag>`; add `--dry-run`; fix header name",
      "Remove every `gh pr merge --admin` from `scripts/`",
      "Coordinate with #274 (scripts/ reorganisation) — #274 lands first, then paths are updated here"],
     "`start-issue.sh` branches from local `main`; `dev2preview.sh` prints the wrong image name; `preview2prod.sh` merges with `--admin`."),
    ("5.1.7", 3, "Story", "As a Maintainer, I want every merge into develop to build, migrate and redeploy staging automatically", 1,
     ["5.1.4"], ["5.1.5", "5.1.6"],
     ["TDD: contract — `docker.yml` on push `develop` tags `:develop` + short SHA, never `:latest`",
      "Rename environment `Preview` → `Staging`; environment-scoped secrets",
      "`deploy-staging.yml`: `supabase db push --include-all` (restore from `2eac72a^:.github/workflows/deploy-db.yml`) → deploy (D3) → health check"],
     "`deploy-db.yml` was deleted in 2eac72a; staging migrations are manual."),
    ("5.1.11", 3, "Story", "As a Maintainer, I want nightly full E2E and k6 runs against staging so per-PR CI stays fast", 2,
     ["5.1.7"], ["5.1.8"],
     ["`schedule` trigger on `e2e.yml` (full suite) and `performance.yml` vs staging",
      "k6 thresholds fail the job",
      "Failure opens/updates issue labelled `ci-nightly`"],
     "Slow layers of the test pyramid move to nightly + promotion PRs."),
    ("5.1.8", 4, "Story", "As a Maintainer, I want develop → main promotion with full checks and an approved production deploy", 1,
     ["5.1.7", "5.1.5"], ["5.1.11"],
     ["`scripts/develop2main.sh`: PR `develop` → `main`, merge commit, no `--admin`",
      "Required checks on PRs to `main`: full E2E vs staging + k6 thresholds",
      "`release-please.yml`: pinned, `target-branch: main` (D5: draft/force-tag-creation)",
      "`deploy-production.yml` on `release: published`, `environment: Production` (owner approval), prod migrations, explicit `vX.Y.Z`, release-summary injection",
      "Retire/reduce `preview2prod.sh`"],
     "Promotion is currently a local script that squash-merges straight to `main` with admin bypass."),
    ("5.1.9", 4, "Story", "As a Maintainer, I want main automatically merged back into develop after every release or hotfix", 1,
     ["5.1.8"], [],
     ["TDD: contract for `back-merge.yml` (push `main` → PR `main` → `develop`)",
      "Auto-merge when clean; label + notify on conflict"],
     "Release PR bumps `package.json`, `CHANGELOG.md`, manifest on `main` only."),
    ("5.1.10", 4, "Story", "As a Maintainer, I want a hotfix/* path from main so I can fix production without shipping develop", 1,
     ["5.1.9", "5.1.6"], [],
     ["`start-issue.sh <n> hotfix …` from `origin/main`",
      "`pr-lint` allows `hotfix/*` → `main`",
      "Patch release + back-merge verified on sandbox"],
     "No hotfix path exists today."),
    ("5.1.13", 5, "Story", "As a Contributor, I want guides, CLAUDE.md, PR template, design doc and skills aligned to Gitflow", 2,
     ["5.1.8", "5.1.9", "5.1.10"], [],
     ["`docs/guides/git-workflow.md` → v2.0 Gitflow",
      "`docs/guides/development-workflow.md`: version header, environments table",
      "Project `CLAUDE.md` + global ship triggers (confirm with owner)",
      "PR template: target branch, test-pyramid checklist",
      "`application-analysis&design.md`: Delivery Pipeline & Branching section",
      "`e2e-test-overview.md`: drop `deploy-db.yml` claim",
      "Skills `/start-story`, `/create-issue`, `/sync-artifacts`: base `develop`"],
     "Docs describe GitHub Flow and state there is no `develop` branch."),
    ("5.1.14", 5, "Story", "As a Maintainer, I want a dress rehearsal and open branches retargeted before cut-over", 1,
     ["5.1.13"], [],
     ["Trivial `docs:` change through develop → staging → release PR → prod approval → back-merge (draft release)",
      "Record run URLs in `docs/logbook/master-walkthrough.md`",
      "Retarget open PRs/branches (`feat/246-…`, `feat/userstory-3.6`) to `develop`; announce in README"],
     "Final verification of the whole pipeline end to end."),
]

ABSORB = {"5.1.1": [267]}  # existing issues re-parented under a story


# ── gh helpers ──────────────────────────────────────────────────────────────
def gh(*args, check=True):
    if DRY and args[0] in ("label", "issue", "sub-issue") and args[1] in ("create", "edit", "add", "remove", "comment"):
        print("DRY:", "gh", *args[:3], "…")
        return ""
    r = subprocess.run(["gh", *args], capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=120)
    if check and r.returncode != 0:
        raise RuntimeError(f"gh {' '.join(args[:4])} failed: {r.stderr.strip()}")
    return r.stdout.strip()


def api(path, method="GET", **fields):
    args = ["api", "-X", method, f"repos/{REPO}/{path}"]
    for k, v in fields.items():
        args += ["-F", f"{k}={v}"]
    if DRY and method != "GET":
        print("DRY: api", method, path, fields)
        return None
    r = subprocess.run(["gh", *args], capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=120)
    return json.loads(r.stdout) if r.returncode == 0 and r.stdout else None


EXISTING = {}


def load_existing():
    out = gh("issue", "list", "-R", REPO, "--state", "all", "--limit", "500",
             "--label", "epic-5.1", "--json", "number,title")
    for i in json.loads(out or "[]"):
        EXISTING[i["title"]] = i["number"]


def upsert(title, body, labels, parent=None):
    if title in EXISTING:
        n = EXISTING[title]
        gh("issue", "edit", str(n), "-R", REPO, "--body", body, *sum([["--add-label", l] for l in labels], []))
        print(f"updated #{n} {title}")
    else:
        lab = sum([["--label", l] for l in labels], [])
        if parent:
            url = gh("sub-issue", "create", "-R", REPO, "--parent", str(parent), "--title", title, "--body", body, *lab)
        else:
            url = gh("issue", "create", "-R", REPO, "--title", title, "--body", body, *lab)
        n = int(url.rstrip("/").split("/")[-1]) if url else 0
        EXISTING[title] = n
        print(f"created #{n} {title}")
    if parent and n:
        link_parent(parent, n)
    return n


def link_parent(parent, child):
    cur = api(f"issues/{child}/parent")
    if cur and cur.get("number") == parent:
        return
    if cur and cur.get("number"):
        gh("sub-issue", "remove", str(cur["number"]), str(child), "-R", REPO, "--force", check=False)
    gh("sub-issue", "add", str(parent), str(child), "-R", REPO)


def add_blocked_by(issue, blocker):
    existing = api(f"issues/{issue}/dependencies/blocked_by") or []
    if any(e.get("number") == blocker for e in existing):
        return
    bid = (api(f"issues/{blocker}") or {}).get("id")
    if bid:
        api(f"issues/{issue}/dependencies/blocked_by", "POST", issue_id=bid)


# ── Body builders ───────────────────────────────────────────────────────────
def gherkin_for(code):
    text = FEATURE.read_text()
    blocks, cur = [], None
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("@story-"):
            if cur:
                blocks.append(cur)
            cur = [line] if f"@story-{code} " in s + " " else None
            continue
        if s.startswith("# ──"):
            if cur:
                blocks.append(cur)
            cur = None
            continue
        if cur is not None:
            cur.append(line)
    if cur:
        blocks.append(cur)
    body = "\n".join("\n".join(b).rstrip() for b in blocks)
    return f"Feature: Gitflow branching and CI/CD pipeline\n\n{body}" if body else ""


def ref(code, num):
    if code.startswith("#"):
        return code
    return f"#{num[code]}" if num.get(code) else f"Story {code}"


SOP = """---
### 🤖 Agent SOP
- **Worktree:** `scripts/cicd/start-issue.sh <issue#> <type> <desc>` → `.worktrees/issue-<issue#>` (base `main` until 5.1.4 creates `develop`, then `origin/develop`). Symlink `.env.local`, never copy.
- **Ports:** dev `3<issue#>`, build/E2E `4<issue#>`.
- **TDD:** failing contract/bats test first → change → green → actionlint/shellcheck → tick Gherkin scenario.
- **Pre-close checklist:**
  - [ ] `npx vitest run` (incl. `testing/unit/tests/ci/`)
  - [ ] `npm run test:bdd` (profile `ci` once 5.1.0 lands)
  - [ ] `npm run lint` / `actionlint` / `shellcheck`
  - [ ] `npm run build`
  - [ ] Docs synced (plan checkbox, epic story status, changelog bumps)
- **Handoff:** post the *AI Agent Handoff Snapshot* comment (template in the Master Epic) before stopping.
"""


def item_body(it, num):
    code, phase, typ, title, tier, blocked, parallel, deliv, ctx = it
    unblocks = [x[0] for x in ITEMS if code in x[5]]
    lab, models = TIER[tier]
    g = gherkin_for(code)
    lines = [
        f"**Epic:** 5.1 Gitflow CI/CD Migration · **Phase {phase}** · **Plan:** `{PLAN}`",
        f"**Model tier:** `{lab}` ({models})", "",
        "## Context", ctx, "",
        "## Scope & Deliverables", *[f"- [ ] {d}" for d in deliv], "",
        "## Dependencies",
        f"- **Blocked By:** {', '.join(ref(b, num) for b in blocked) or 'None'}",
        f"- **Unblocks:** {', '.join(ref(u, num) for u in unblocks) or 'None'}",
        f"- **Parallelizable With:** {', '.join(ref(p, num) for p in parallel) or 'None'}", "",
        "## Acceptance Criteria (Gherkin)",
        f"Source: `docs/testing/gitflow-cicd.feature` (`@story-{code}`)" if g else "Harness exists and runs: `npm run test:bdd -- --profile ci`, contract tests and `npm run test:scripts` execute (red until stories land).",
    ]
    if g:
        lines += ["```gherkin", g, "```"]
    if code in ABSORB:
        lines += ["", "## Absorbed issues", *[f"- [ ] #{n}" for n in ABSORB[code]]]
    return "\n".join(lines) + "\n\n" + SOP


def phase_body(p, num, phase_items):
    pid, name, exit_ = p
    rows = [f"- [ ] #{num[c]} — {c} {t}" for c, ph, _ty, t, *_r in ITEMS if ph == pid]
    return "\n".join([
        f"Phase {pid} of Epic 5.1 Gitflow CI/CD Migration. Plan: `{PLAN}` §6.", "",
        f"**Exit criterion:** {exit_}", "",
        "## Children", *rows, "",
        "Close this phase epic only when every child is closed and the exit criterion is verified.",
    ])


MASTER_TITLE = "[Epic 5.1] Gitflow CI/CD Migration Masterplan Orchestrator"


def master_body(num, phase_num):
    table = ["| Issue | Code | Title | Phase | Model Tier | Recommended Models | Blocked By | Status |",
             "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |"]
    for c, ph, _ty, t, tier, blocked, *_r in ITEMS:
        lab, models = TIER[tier]
        status = "🟢 Ready" if not blocked else "⏳ Blocked"
        table.append(f"| #{num[c]} | `{c}` | {t} | {ph} | `{lab}` | {models} | {', '.join(ref(b, num) for b in blocked) or 'None'} | {status} |")
    phases = [f"- [ ] #{phase_num[p[0]]} — Phase {p[0]}: {p[1]}" for p in PHASES]
    return f"""## 1. Mission & Non-Negotiables
Migrate Sacred Fire Songs from GitHub Flow to a lightweight Gitflow: `main` = production, `develop` = integration + staging, `feat|fix|chore|docs/*` = work branches (squash into `develop`), `hotfix/*` = urgent fixes from `main`. Quality gates follow the test pyramid; the pipeline is built test-first (TDD) against an executable BDD spec.

**Non-negotiables**
- No direct commits to `main` or `develop`; no `gh pr merge --admin`; no force-push on long-lived branches.
- No false greens: a skipped test job is a failed job on protected targets.
- `develop` → `main` is a **merge commit**; work → `develop` is a **squash**.
- Production deploys an explicit `vX.Y.Z` tag, never `:latest`, after owner approval.
- Docs, tests and code stay 100% aligned (CLAUDE.md Definition of Done).

**Sources of truth:** plan `{PLAN}` · spec `docs/testing/gitflow-cicd.feature` · stories `docs/logbook/epic&user stories.md` (Epic 5.1)

## 2. Architecture Blueprint
```mermaid
flowchart TD
    W["feat / fix / chore / docs branch"] -->|"PR: ci.yml (lint, typecheck, unit, bdd, build, integration on local Supabase)"| D["develop"]
    D -->|"docker.yml :develop + sha"| S["Staging (staging Supabase + server)"]
    D -->|"PR merge commit: + full E2E + k6 vs staging"| M["main"]
    M -->|"release-please"| R["Release vX.Y.Z"]
    R -->|"deploy-production.yml, env Production (approval)"| P["Production"]
    M -->|"back-merge.yml"| D
    H["hotfix/* from main"] -->|"PR squash"| M
```

| Decision | Choice |
|---|---|
| Release branches | None — Release Please on `main` prepares releases |
| PR E2E target | Disposable local Supabase in runner (D4) |
| Staging | `develop` auto-deploy (D3) |
| Default branch | `develop` (D1) |
| Open decisions | D1–D7 in the plan §8 |

## 3. Execution Roadmap & Dependency Graph
```mermaid
flowchart LR
    P0["Phase 0: Spec & harness"] --> P1["Phase 1: Quality gate"]
    P1 --> P2["Phase 2: develop + policy"]
    P2 --> P3["Phase 3: Staging CD"]
    P3 --> P4["Phase 4: Release, prod, hotfix"]
    P4 --> P5["Phase 5: Docs & cut-over"]
```

**Parallel:** 5.1.1 ∥ 5.1.3 ∥ 5.1.12 (after 5.1.0) · 5.1.5 ∥ 5.1.6 ∥ 5.1.7 (after 5.1.4) · 5.1.11 ∥ 5.1.8.
**Sequential:** repo settings/rulesets (5.1.4) · promotion → back-merge → hotfix (5.1.8 → 5.1.9 → 5.1.10) · docs → dress rehearsal (5.1.13 → 5.1.14).

### Phase epics
{chr(10).join(phases)}

## 4. Model Tier Matrix
{chr(10).join(table)}

## 5. AI Agent Standard Operating Procedure
- **Worktree isolation:** `scripts/cicd/start-issue.sh <issue#> <type> <desc>` → `.worktrees/issue-<issue#>`; symlink `.env.local`; never bare `git stash`.
- **Ports:** dev `3<issue#>`, build/E2E `4<issue#>`.
- **Pre-close checklist:** vitest · BDD · lint/actionlint/shellcheck · build · docs synced.
- **Handoff snapshot comment:**
```markdown
### 🤖 AI Agent Handoff Snapshot
- **Agent / Model**: `<e.g. Claude Sonnet / Gemini Flash>`
- **Worktree & Branch**: `.worktrees/issue-<number>` (`<type>/<number>-<slug>`)
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
"""


# ── Main ────────────────────────────────────────────────────────────────────
def main():
    gh("label", "create", "model:tier-1", "-R", REPO, "--color", "d93f0b", "--force",
       "--description", "Tier 1 (High Reasoning): architecture, prod safety, complex pipelines")
    gh("label", "create", "model:tier-2", "-R", REPO, "--color", "0e8a16", "--force",
       "--description", "Tier 2 (Fast / Budget): boilerplate, config, tests, docs")
    gh("label", "create", "epic-5.1", "-R", REPO, "--color", "5319e7", "--force",
       "--description", "Epic 5.1: Gitflow CI/CD Migration")
    load_existing()

    master = upsert(MASTER_TITLE, "Bootstrapping…", ["epic", "epic-5.1", "epic-infra"])

    phase_num = {}
    for p in PHASES:
        t = f"[Epic 5.1 · Phase {p[0]}] {p[1]}"
        phase_num[p[0]] = upsert(t, "Bootstrapping…", ["epic", "epic-5.1", "epic-infra"], parent=master)

    num = {}
    for it in ITEMS:
        code, phase, typ, title, tier = it[:5]
        labels = ["epic-5.1", TIER[tier][0], "user-story" if typ == "Story" else "chore"]
        num[code] = upsert(f"[{typ} {code}] {title}", "Bootstrapping…", labels, parent=phase_num[phase])

    # Second pass: bodies with resolved issue numbers, dependencies, absorbed issues
    for it in ITEMS:
        code, phase, typ, title = it[:4]
        n = num[code]
        gh("issue", "edit", str(n), "-R", REPO, "--body", item_body(it, num))
        for b in it[5]:
            add_blocked_by(n, int(b[1:]) if b.startswith("#") else num[b])
        for child in ABSORB.get(code, []):
            link_parent(n, child)
    for p in PHASES:
        gh("issue", "edit", str(phase_num[p[0]]), "-R", REPO, "--body", phase_body(p, num, ITEMS))
    gh("issue", "edit", str(master), "-R", REPO, "--body", master_body(num, phase_num))

    print(f"\nMaster epic: https://github.com/{REPO}/issues/{master}")
    print(json.dumps({"master": master, "phases": phase_num, "items": num}, indent=2))


if __name__ == "__main__":
    main()
