#!/usr/bin/env bash
set -e

# Usage: scripts/start-issue.sh <issue-number> <type> <description...>
# Example: scripts/start-issue.sh 239 fix rehearsal proxy apikey

if [ "$#" -lt 3 ]; then
  echo "Usage: scripts/start-issue.sh <issue-number> <type> <description...>"
  echo "  <issue-number> : The GitHub issue number (e.g. 239)"
  echo "  <type>         : The Conventional Commit type (e.g. fix, feat, docs, chore)"
  echo "  <description>  : A short description of the issue (spaces allowed)"
  echo ""
  echo "Example: scripts/start-issue.sh 239 fix rehearsal proxy apikey"
  echo "         scripts/start-issue.sh 179 feat new spotify menu"
  exit 1
fi

ISSUE_NUM="$1"
TYPE="$2"
shift 2
DESC="$*"

# Convert description to kebab-case for the branch name
KEBAB_DESC="$(echo "$DESC" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-z0-9]/-/g' -e 's/-\+/-/g' -e 's/^-//' -e 's/-$//')"

BRANCH_NAME="${TYPE}/${ISSUE_NUM}-${KEBAB_DESC}"
WORKTREE_DIR=".worktrees/issue-${ISSUE_NUM}"
PR_TITLE="${TYPE}: ${DESC} (#${ISSUE_NUM})"

echo "🚀 Starting Issue #$ISSUE_NUM"
echo "----------------------------------------"
echo "Type:        $TYPE"
echo "Description: $DESC"
echo "Branch:      $BRANCH_NAME"
echo "Worktree:    $WORKTREE_DIR"
echo "PR Title:    $PR_TITLE"
echo "----------------------------------------"

# 1. Create worktree and branch
if [ -d "$WORKTREE_DIR" ]; then
  echo "❌ Error: Worktree $WORKTREE_DIR already exists."
  exit 1
fi

echo "🌳 Creating git worktree and branch..."
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" main

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
echo "   when you run 'gh pr create --fill' to open a PR, GitHub will use that"
echo "   exact Conventional Commit string for the PR Title!"
