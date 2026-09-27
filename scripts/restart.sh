#!/bin/bash

# Exit on any error
set -e

# Check if issue number is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide an issue number."
  echo "Usage: ./scripts/restart.sh <issue-number>"
  exit 1
fi

# Clean up input (remove # if user typed it)
ISSUE=$(echo "$1" | tr -d '#')
WORKTREE_DIR=".worktrees/issue-${ISSUE}"

# Check if worktree exists
if [ ! -d "$WORKTREE_DIR" ]; then
  echo "❌ Error: Worktree directory '$WORKTREE_DIR' does not exist."
  echo "Did you mean to run: ./scripts/start-issue.sh $ISSUE <description> ?"
  exit 1
fi

echo "🔄 Rebuilding and restarting Issue #${ISSUE}..."

# Navigate to the worktree
cd "$WORKTREE_DIR"

echo "📦 Building project..."
npm run build

# Calculate the conventional test port (4xxx)
PORT="4${ISSUE}"

echo "🚀 Starting production test server on http://localhost:${PORT}..."
PORT=$PORT npm run start
