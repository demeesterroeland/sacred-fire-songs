#!/usr/bin/env bash
#
# deploy-to-preview.sh
# --------------------
# Pushes the current development branch to origin, triggers/tracks the
# GitHub Actions Docker build, and outputs the exact slugified Docker image tag
# to deploy on the preview environment.
#
# Usage:
#   scripts/deploy-to-preview.sh [--wait] [--force]
#     --wait   Wait for the GitHub Actions Docker build workflow to finish
#     --force  Allow uncommitted changes (git stash will NOT be used)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WAIT=0
FORCE=0

for arg in "$@"; do
  case "$arg" in
    --wait) WAIT=1 ;;
    --force) FORCE=1 ;;
    -h|--help)
      echo "Usage: scripts/deploy-to-preview.sh [--wait] [--force]"
      echo ""
      echo "Options:"
      echo "  --wait   Wait for the GitHub Actions Docker build workflow to finish"
      echo "  --force  Allow uncommitted changes (continues with committed changes only)"
      echo "  -h, --help  Show this help message"
      exit 0
      ;;
    *) echo "Unknown option: $arg"; exit 2 ;;
  esac
done

# 1. Identify current branch
BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  echo "❌ Error: Detached HEAD state. Please checkout a feature/fix branch first."
  exit 1
fi

if [[ "$BRANCH" == "main" ]]; then
  echo "❌ Error: Cannot deploy 'main' to preview using this script."
  echo "   Preview environments are built from feature/fix branches."
  exit 1
fi

echo "🚀 Preparing preview deployment for branch: '$BRANCH'..."

# 2. Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  if [[ "$FORCE" -eq 1 ]]; then
    echo "⚠️  Warning: Uncommitted changes detected, but --force was provided. Continuing with committed changes only."
  else
    echo "❌ Error: You have uncommitted changes on branch '$BRANCH'."
    echo "   Please commit or stash your changes before deploying to preview."
    echo "   (Remember to sync logbooks via /sync-artifacts before committing if finishing work!)"
    exit 1
  fi
fi

# 3. Check artifact sync on feature branch
if git status --porcelain docs/logbook | grep -q .; then
  echo "⚠️  Warning: Uncommitted logbook changes detected in docs/logbook/."
  echo "   Per project rules, please commit logbook updates to your feature branch."
fi

# 4. Push branch to remote
echo "📤 Pushing branch '$BRANCH' to origin..."
git push -u origin "$BRANCH"

# 5. Compute Docker image tag based on GitHub Actions slugify logic
# (docker/metadata-action slugifies branch refs by replacing non-alphanumeric chars with '-' and lowercasing)
IMAGE_TAG="$(echo "$BRANCH" | sed -e 's/[^a-zA-Z0-9._-]/-/g' | tr '[:upper:]' '[:lower:]')"
IMAGE_NAME="ghcr.io/demeesterroeland/sacred-fire-songs:${IMAGE_TAG}"
MIGRATOR_NAME="ghcr.io/demeesterroeland/sacred-fire-songs-migrator:${IMAGE_TAG}"

echo ""
echo "======================================================================"
echo "📦 Preview Docker Images:"
echo "   App:      ${IMAGE_NAME}"
echo "   Migrator: ${MIGRATOR_NAME}"
echo "======================================================================"
echo ""

# 6. Monitor workflow if --wait or gh CLI available
if command -v gh >/dev/null 2>&1; then
  echo "🔍 Looking up GitHub Actions Docker build workflow..."
  sleep 3 # Give GitHub a moment to register the push event
  RUN_ID="$(gh run list --workflow=docker.yml --branch "$BRANCH" --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || true)"

  if [[ -n "$RUN_ID" && "$RUN_ID" != "null" ]]; then
    RUN_URL="$(gh run view "$RUN_ID" --json url -q .url 2>/dev/null || true)"
    echo "🔗 GitHub Actions Run: ${RUN_URL:-#$RUN_ID}"

    if [[ "$WAIT" -eq 1 ]]; then
      echo "⏳ Waiting for Docker build to complete..."
      gh run watch "$RUN_ID"
      echo "✅ Docker image build complete!"
    else
      echo "💡 Tip: Run 'scripts/deploy-to-preview.sh --wait' to watch the build until completion,"
      echo "   or run 'gh run watch $RUN_ID'."
    fi
  else
    echo "ℹ️  Docker build run not detected yet. Check: https://github.com/demeesterroeland/sacred-fire-songs/actions"
  fi
else
  echo "ℹ️  'gh' CLI not installed or not authenticated. Monitor build at:"
  echo "   https://github.com/demeesterroeland/sacred-fire-songs/actions"
fi

echo ""
echo "📋 Preview Server Deployment Steps:"
echo "----------------------------------------------------------------------"
echo "1. On the preview server, update your image tag to:"
echo "   ${IMAGE_TAG}"
echo ""
echo "2. Pull and start containers:"
echo "   docker compose pull"
echo "   docker compose up -d"
echo ""
echo "⚠️  Important Checks & Rules:"
echo "   - Database: Preview should always point to the staging Supabase project."
echo "   - Staging DB Inactivity: If songs list is empty, verify the staging"
echo "     Supabase project is active (it auto-pauses after inactivity)."
echo "   - Verification Rule: Test all features on preview thoroughly."
echo "     Do NOT merge to main without explicit user confirmation of verification."
echo "----------------------------------------------------------------------"
