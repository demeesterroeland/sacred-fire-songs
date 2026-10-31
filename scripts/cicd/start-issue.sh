#!/usr/bin/env bash
set -e

# Usage: scripts/cicd/start-issue.sh <issue-number> <type> <description...>
# Example: scripts/cicd/start-issue.sh 239 fix rehearsal proxy apikey

if [ "$#" -lt 3 ]; then
  echo "Usage: scripts/cicd/start-issue.sh <issue-number> <type> <description...>"
  echo "  <issue-number> : The GitHub issue number (e.g. 239)"
  echo "  <type>         : feat, fix, chore or docs (branches from develop)"
  echo "                   or 'hotfix' for an urgent production fix (branches from main)"
  echo "  <description>  : A short description of the issue (spaces allowed)"
  echo ""
  echo "Example: scripts/cicd/start-issue.sh 239 fix rehearsal proxy apikey"
  echo "         scripts/cicd/start-issue.sh 179 feat new spotify menu"
  exit 1
fi

ISSUE_NUM="$1"
TYPE="$2"
shift 2
DESC="$*"

# Validate input before touching git (Epic 5.1, Story 5.1.6). The branch
# prefix must match the head-branch policy enforced by .github/workflows/pr-lint.yml.
ALLOWED_TYPES="feat fix chore docs hotfix"
if ! [[ "$ISSUE_NUM" =~ ^[0-9]+$ ]]; then
  echo "❌ Error: Issue number must be numeric (got '$ISSUE_NUM')."
  exit 2
fi
if ! [[ " $ALLOWED_TYPES " == *" $TYPE "* ]]; then
  echo "❌ Error: Unknown type '$TYPE'. Use one of: ${ALLOWED_TYPES// /, }."
  exit 2
fi

# Convert description to kebab-case for the branch name
KEBAB_DESC="$(echo "$DESC" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-z0-9]/-/g' -e 's/-\+/-/g' -e 's/^-//' -e 's/-$//')"

BRANCH_NAME="${TYPE}/${ISSUE_NUM}-${KEBAB_DESC}"
WORKTREE_DIR=".worktrees/issue-${ISSUE_NUM}"
PR_TITLE="${TYPE}: ${DESC} (#${ISSUE_NUM})"

# Gitflow: work branches start from develop; hotfixes start from main
# (production) and are back-merged into develop after release.
if [ "$TYPE" = "hotfix" ]; then
  BASE_BRANCH="main"
  PR_TITLE="fix: ${DESC} (#${ISSUE_NUM})"
else
  BASE_BRANCH="develop"
fi

echo "🚀 Starting Issue #$ISSUE_NUM"
echo "----------------------------------------"
echo "Type:        $TYPE"
echo "Description: $DESC"
echo "Branch:      $BRANCH_NAME"
echo "Base:        origin/$BASE_BRANCH"
echo "Worktree:    $WORKTREE_DIR"
echo "PR Title:    $PR_TITLE"
echo "----------------------------------------"

# 1. Create worktree and branch
if [ -d "$WORKTREE_DIR" ]; then
  echo "❌ Error: Worktree $WORKTREE_DIR already exists."
  exit 1
fi

echo "🌳 Creating git worktree and branch from origin/$BASE_BRANCH..."
git fetch origin "$BASE_BRANCH"
git worktree add --no-track -b "$BRANCH_NAME" "$WORKTREE_DIR" "origin/$BASE_BRANCH"

# 2. Symlink .env.local
echo "🔗 Symlinking .env.local..."
if [ -f ".env.local" ]; then
  cd "$WORKTREE_DIR"
  ln -s ../../.env.local .env.local
  cd ../../
else
  echo "⚠️  No .env.local found in root to symlink."
fi

# 3. Create an empty commit to set up the PR title template
echo "📝 Creating initial Release Please compliant commit..."
cd "$WORKTREE_DIR"
git commit --allow-empty -m "$PR_TITLE" -m "Initial automated commit for issue #$ISSUE_NUM to guarantee Release Please parses the PR title correctly."

echo ""
echo "✅ All done! Worktree is ready."
echo ""
echo "To get started:"
echo "  cd $WORKTREE_DIR"
echo ""
echo "💡 Tip: Because we created an empty initial commit with the title '$PR_TITLE',"
echo "   when you run 'gh pr create --base $BASE_BRANCH --fill-first' to open a PR, GitHub will use that"
echo "   exact Conventional Commit string for the PR Title!"
echo "   (Plain '--fill' falls back to the branch name once the branch has multiple commits.)"
