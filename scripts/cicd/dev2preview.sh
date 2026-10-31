#!/usr/bin/env bash
#
# dev2preview.sh
# --------------
# Pushes the current development branch to origin, triggers/tracks the
# GitHub Actions Docker build, and outputs the exact slugified Docker image tag
# to deploy on the preview environment.
#
# Usage:
#   scripts/cicd/dev2preview.sh [--force] [--dry-run]
#     --force    Allow uncommitted changes (git stash will NOT be used)
#     --dry-run  Only print the image names; no push, no CI trigger
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"


FORCE=0
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      echo "Usage: scripts/cicd/dev2preview.sh [--force] [--dry-run]"
      echo ""
      echo "Options:"
      echo "  --force    Allow uncommitted changes (continues with committed changes only)"
      echo "  --dry-run  Only print the image names; no push, no CI trigger"
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

if [[ "$BRANCH" == "main" || "$BRANCH" == "develop" ]]; then
  echo "❌ Error: Cannot deploy '$BRANCH' to preview using this script."
  echo "   Preview environments are built from work branches; develop deploys to staging."
  exit 1
fi

# 2. Compute the Docker image names exactly as CI pushes them:
#    images  ghcr.io/<owner>/sacred-fire-songs-app / -migrator (.github/workflows/docker.yml)
#    tag     docker/metadata-action v5 sanitizeTag: replace runs of [^a-zA-Z0-9._-] with '-',
#            no lowercasing
REGISTRY="ghcr.io/demeesterroeland"
IMAGE_TAG="$(printf '%s' "$BRANCH" | sed -E 's/[^a-zA-Z0-9._-]+/-/g')"
IMAGE_NAME="${REGISTRY}/sacred-fire-songs-app:${IMAGE_TAG}"
MIGRATOR_NAME="${REGISTRY}/sacred-fire-songs-migrator:${IMAGE_TAG}"
PREVIEW_IMAGE="${REGISTRY}/sacred-fire-songs-app:preview"

print_images() {
  echo ""
  echo "======================================================================"
  echo "📦 Preview Docker Images:"
  echo "   App:      ${IMAGE_NAME}"
  echo "   Migrator: ${MIGRATOR_NAME}"
  echo "   Rolling:  ${PREVIEW_IMAGE} (what the preview server pulls)"
  echo "======================================================================"
  echo ""
}

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "🧪 Dry run for branch '$BRANCH': nothing is pushed and no workflow is triggered."
  print_images
  exit 0
fi

echo "🚀 Preparing preview deployment for branch: '$BRANCH'..."

# 3. Check for uncommitted changes
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

# 4. Check artifact sync on feature branch
if git status --porcelain docs/logbook | grep -q .; then
  echo "⚠️  Warning: Uncommitted logbook changes detected in docs/logbook/."
  echo "   Per project rules, please commit logbook updates to your feature branch."
fi

# 5. Push branch to remote and trigger the build (tags: <branch> + rolling :preview)
echo "📤 Pushing branch '$BRANCH' to origin..."
git push -u origin "$BRANCH"
echo "🚀 Triggering Docker build explicitly via GitHub Actions..."
gh workflow run docker.yml --ref "$BRANCH" -f version="preview" || { echo "❌ Failed to trigger workflow."; exit 1; }

print_images

# 6. Monitor workflow if gh CLI available
if command -v gh >/dev/null 2>&1; then
  echo "🔍 Looking up GitHub Actions Docker build workflow..."
  sleep 5 # Give GitHub a moment to queue the workflow run
  RUN_ID="$(gh run list --workflow=docker.yml --branch "$BRANCH" --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || true)"

  if [[ -n "$RUN_ID" && "$RUN_ID" != "null" ]]; then
    RUN_URL="$(gh run view "$RUN_ID" --json url -q .url 2>/dev/null || true)"
    echo "🔗 GitHub Actions Run: ${RUN_URL:-#$RUN_ID}"

      echo "⏳ Waiting for Docker build to complete..."
      gh run watch "$RUN_ID"
      echo "✅ Docker image build complete!"
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
echo "1. The preview server pulls the rolling tag: ${PREVIEW_IMAGE}"
echo "   (stacks/songbook-preview/docker-compose.yaml in cloud-infra)"
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
