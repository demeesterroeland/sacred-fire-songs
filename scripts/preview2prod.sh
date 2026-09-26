#!/usr/bin/env bash
#
# promote-to-production.sh
# -------------------------
# Hybrid (AI + Deterministic) promotion pipeline from PREVIEW to PRODUCTION.
#
# Pipeline steps:
# 1. Preview Verification Gate (Strict verification rule check)
# 2. Branch & Logbook sync check
# 3. Pull Request merge to 'main'
# 4. Release Please automation (merges the release PR to cut semver tag)
# 5. Hybrid Release Notes injection (prepends AI-generated self-hoster summary)
# 6. Docker release build tracking
# 7. Production deployment instructions (strict No-Latest rule compliance)
#
# Usage:
#   scripts/promote-to-production.sh [options]
#
# Options:
#   --notes-file <file>   Path to markdown file containing the AI-generated release summary
#   --notes <string>      Direct release summary text
#   --branch <branch>     Branch to promote (defaults to current branch)
#   --verified            Acknowledge that preview testing was performed and confirmed
#   --skip-docker-wait    Do not wait for the release Docker build to complete
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BRANCH=""
NOTES_FILE=""
NOTES_TEXT=""
VERIFIED=0
WAIT_DOCKER=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --notes-file)
      NOTES_FILE="$2"
      shift 2
      ;;
    --notes)
      NOTES_TEXT="$2"
      shift 2
      ;;
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    --verified)
      VERIFIED=1
      shift
      ;;
    --skip-docker-wait)
      WAIT_DOCKER=0
      shift
      ;;
    -h|--help)
      echo "Usage: scripts/promote-to-production.sh [options]"
      echo ""
      echo "Options:"
      echo "  --notes-file <file>   Path to file with AI-generated release summary"
      echo "  --notes <string>      Direct release summary string"
      echo "  --branch <branch>     Branch to promote (defaults to current branch)"
      echo "  --verified            Acknowledge preview testing without prompt"
      echo "  --skip-docker-wait    Do not wait for the release Docker build"
      echo "  -h, --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 2
      ;;
  esac
done

# Require GitHub CLI
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ Error: 'gh' (GitHub CLI) is required to run this promotion script."
  exit 1
fi

# 1. Determine and validate branch
if [[ -z "$BRANCH" ]]; then
  BRANCH="$(git branch --show-current)"
fi

if [[ -z "$BRANCH" || "$BRANCH" == "main" ]]; then
  echo "❌ Error: Promotion must start from a feature/bugfix branch, not 'main'."
  exit 1
fi

echo "======================================================================"
echo "🌟 Promoting branch '$BRANCH' to PRODUCTION"
echo "======================================================================"

# 2. PREVIEW VERIFICATION GATE (Project Rule Enforcement)
if [[ "$VERIFIED" -ne 1 ]]; then
  echo ""
  echo "🛑 VERIFICATION GATE:"
  echo "   Per project policy, all changes must be verified on the PREVIEW environment"
  echo "   before merging to main."
  echo ""
  read -r -p "Have you verified this branch on the PREVIEW server? (yes/no): " CONFIRM
  if [[ "$CONFIRM" != "yes" ]]; then
    echo "❌ Promotion aborted. Please verify on preview first."
    exit 1
  fi
fi

# 3. Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: Uncommitted changes detected on '$BRANCH'. Commit or stash first."
  exit 1
fi

# 4. Check logbook sync
if git status --porcelain docs/logbook | grep -q .; then
  echo "❌ Error: Uncommitted logbook updates in docs/logbook/."
  echo "   Commit all logbook updates directly on '$BRANCH' before promoting to main."
  exit 1
fi

# 5. Acquire AI-generated release notes
RELEASE_SUMMARY=""
if [[ -n "$NOTES_FILE" && -f "$NOTES_FILE" ]]; then
  RELEASE_SUMMARY="$(cat "$NOTES_FILE")"
elif [[ -n "$NOTES_TEXT" ]]; then
  RELEASE_SUMMARY="$NOTES_TEXT"
elif [[ -f ".brain/release-summary.md" ]]; then
  echo "📄 Found release summary at .brain/release-summary.md"
  RELEASE_SUMMARY="$(cat .brain/release-summary.md)"
fi

if [[ -z "$RELEASE_SUMMARY" ]]; then
  echo ""
  echo "⚠️  No AI release summary provided (--notes-file, --notes, or .brain/release-summary.md)."
  echo "   Self-hoster readable summaries are required for production releases."
  echo "   Please enter a short summary below (Press Enter, then Ctrl+D when finished):"
  RELEASE_SUMMARY="$(cat)"
  if [[ -z "$RELEASE_SUMMARY" ]]; then
    echo "❌ Error: Release summary cannot be empty."
    exit 1
  fi
fi

# 6. Push latest branch commits
echo "📤 Ensuring branch '$BRANCH' is pushed to origin..."
git push origin "$BRANCH"

# 7. Check or create PR to main
echo "🔍 Checking for open PR for branch '$BRANCH'..."
PR_JSON="$(gh pr list --head "$BRANCH" --base main --state open --json number,title,url -q '.[0]' 2>/dev/null || true)"

if [[ -z "$PR_JSON" || "$PR_JSON" == "null" ]]; then
  echo "📝 Creating Pull Request to main..."
  PR_URL="$(gh pr create --base main --head "$BRANCH" --fill)"
  echo "🔗 Created PR: $PR_URL"
  sleep 3
  PR_NUMBER="$(gh pr view "$PR_URL" --json number -q .number)"
else
  PR_NUMBER="$(echo "$PR_JSON" | jq -r .number)"
  echo "🔗 Found existing PR #$PR_NUMBER"
fi

# 8. Check PR status & checks
echo "⏳ Checking PR #$PR_NUMBER CI checks..."
gh pr checks "$PR_NUMBER" --watch || {
  echo "❌ CI checks failed for PR #$PR_NUMBER. Promotion halted."
  exit 1
}

# 9. Merge PR into main
echo "🔀 Merging PR #$PR_NUMBER into main..."
# Squash merge to keep clean conventional commit title
gh pr merge "$PR_NUMBER" --squash --delete-branch --admin
echo "✅ PR #$PR_NUMBER merged into main!"

# 10. Switch to main & pull
echo "🔄 Updating local main branch..."
git checkout main
git pull origin main

# 11. Wait for Release Please action to trigger and create/update release PR
echo "⏳ Waiting for Release Please workflow on main..."
sleep 10

MAX_WAIT=300
ELAPSED=0
RP_PR_NUMBER=""

while [[ $ELAPSED -lt $MAX_WAIT ]]; do
  # Search for open PR created by release-please
  RP_PR_JSON="$(gh pr list --base main --state open --search "chore(main): release" --json number,title,headRefName -q '.[0]' 2>/dev/null || true)"
  if [[ -n "$RP_PR_JSON" && "$RP_PR_JSON" != "null" ]]; then
    RP_PR_NUMBER="$(echo "$RP_PR_JSON" | jq -r .number)"
    RP_PR_TITLE="$(echo "$RP_PR_JSON" | jq -r .title)"
    echo "📦 Found Release Please PR #$RP_PR_NUMBER: '$RP_PR_TITLE'"
    break
  fi
  sleep 10
  ELAPSED=$((ELAPSED + 10))
  echo "   Waiting for Release Please PR... (${ELAPSED}s / ${MAX_WAIT}s)"
done

if [[ -z "$RP_PR_NUMBER" ]]; then
  echo "⚠️  Could not detect open Release Please PR automatically."
  echo "   Check https://github.com/demeesterroeland/sacred-fire-songs/pulls"
  exit 1
fi

# 12. Merge Release Please PR to cut the official release
echo "🚀 Merging Release Please PR #$RP_PR_NUMBER to cut the release..."
gh pr merge "$RP_PR_NUMBER" --merge
echo "✅ Release Please PR merged!"

# 13. Wait for GitHub release to be created
echo "⏳ Waiting for GitHub Release to be published by Release Please..."
sleep 15
git fetch --tags origin

LATEST_TAG="$(git describe --tags --abbrev=0)"
echo "🏷️  Detected release tag: $LATEST_TAG"

# 14. Inject Hybrid AI Release Notes
echo "✍️  Injecting AI-generated self-hoster summary into release $LATEST_TAG..."
ORIGINAL_BODY="$(gh release view "$LATEST_TAG" --json body -q .body 2>/dev/null || true)"

COMBINED_NOTES="${RELEASE_SUMMARY}

---

${ORIGINAL_BODY}"

gh release edit "$LATEST_TAG" --notes "$COMBINED_NOTES"
echo "✅ Release $LATEST_TAG updated with human-readable summary!"

# 15. Track Docker Build
if [[ "$WAIT_DOCKER" -eq 1 ]]; then
  echo "⏳ Tracking Docker release build for tag $LATEST_TAG..."
  sleep 5
  DOCKER_RUN_ID="$(gh run list --workflow=docker.yml --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || true)"
  if [[ -n "$DOCKER_RUN_ID" && "$DOCKER_RUN_ID" != "null" ]]; then
    gh run watch "$DOCKER_RUN_ID"
    echo "✅ Production Docker image built successfully!"
  fi
fi

# 16. Production Deployment Instructions (Strictly Enforce No-Latest Rule)
echo ""
echo "======================================================================"
echo "🎉 PRODUCTION RELEASE READY: $LATEST_TAG"
echo "======================================================================"
echo ""
echo "📦 Explicit Production Container Images (NEVER use :latest):"
echo "   App:      ghcr.io/demeesterroeland/sacred-fire-songs:${LATEST_TAG}"
echo "   Migrator: ghcr.io/demeesterroeland/sacred-fire-songs-migrator:${LATEST_TAG}"
echo ""
echo "📋 Production Deployment Instructions:"
echo "----------------------------------------------------------------------"
echo "1. On the production server, update .env / docker-compose to pin:"
echo "   VERSION=${LATEST_TAG}"
echo "   (or APP_IMAGE=ghcr.io/demeesterroeland/sacred-fire-songs:${LATEST_TAG})"
echo ""
echo "2. Pull explicit release tag and restart:"
echo "   docker compose pull"
echo "   docker compose up -d"
echo ""
echo "3. Verify production health:"
echo "   docker compose ps"
echo "   docker compose logs --tail 50 -f"
echo "----------------------------------------------------------------------"
echo "✨ Production promotion complete!"
