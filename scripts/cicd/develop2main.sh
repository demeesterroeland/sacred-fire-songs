#!/usr/bin/env bash
#
# develop2main.sh
# ---------------
# Gitflow promotion of `develop` into `main` (Epic 5.1, Story 5.1.8).
#
# Steps:
# 1. Check that origin/develop has commits that origin/main does not have.
# 2. Open (or reuse) the promotion PR develop → main and wait for all checks.
# 3. Ask the owner for explicit confirmation, then merge with a MERGE COMMIT
#    (never --squash, --admin, --auto or --delete-branch: develop is long-lived).
# 4. Unless --skip-release: wait for the Release Please PR on main, wait for its
#    checks, confirm and merge it (creates the vX.Y.Z tag and GitHub Release),
#    and prepend the optional human-readable summary to the release notes.
# 5. Print the explicit release image tags (never :latest).
#
# Deploying a release is NOT part of this public repository: CI here builds,
# tests and publishes images to GHCR; each self-hoster deploys them their own way.
# After the release, back-merge.yml opens the PR main → develop (Story 5.1.9).
#
# Usage:
#   scripts/cicd/develop2main.sh [options]
#
# Options:
#   --yes                 Skip the interactive confirmation (owner already approved)
#   --skip-release        Only promote develop → main; do not merge the Release Please PR
#   --notes-file <file>   Markdown summary to prepend to the GitHub Release notes
#   --notes <string>      Summary text to prepend to the GitHub Release notes
#   --dry-run             Print what would happen; call no gh command, push nothing
#   -h, --help            Show this help
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

APP_IMAGE="ghcr.io/demeesterroeland/sacred-fire-songs-app"
MIGRATOR_IMAGE="ghcr.io/demeesterroeland/sacred-fire-songs-migrator"
PROMOTION_TITLE="chore(release): promote develop to main"

ASSUME_YES=0
SKIP_RELEASE=0
DRY_RUN=0
NOTES_FILE=""
NOTES_TEXT=""

usage() {
  sed -n '/^# Usage:/,/^set -euo/p' "$0" | sed '$d; s/^# \{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes) ASSUME_YES=1; shift ;;
    --skip-release) SKIP_RELEASE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --notes-file) NOTES_FILE="${2:?--notes-file needs a path}"; shift 2 ;;
    --notes) NOTES_TEXT="${2:?--notes needs a text}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

confirm() {
  # $1 = question. Returns 0 only on an explicit "yes".
  if [[ "$ASSUME_YES" -eq 1 ]]; then return 0; fi
  local answer=""
  read -r -p "$1 (yes/no): " answer || true
  [[ "$answer" == "yes" ]]
}

print_images() {
  local tag="$1"
  echo ""
  echo "📦 Release images (pin these explicitly, never :latest):"
  echo "   App:      ${APP_IMAGE}:${tag}"
  echo "   Migrator: ${MIGRATOR_IMAGE}:${tag}"
  echo ""
  echo "ℹ️  Deploying the release is outside this repository."
  echo "   Next: merge the back-merge PR main → develop that back-merge.yml opens (merge commit)."
}

# 1. Is there anything to promote?
git fetch -q origin main develop
AHEAD="$(git rev-list --count origin/main..origin/develop)"
if [[ "$AHEAD" -eq 0 ]]; then
  echo "❌ Nothing to promote: origin/develop has no commits that origin/main lacks."
  exit 1
fi
echo "🌿 origin/develop is $AHEAD commit(s) ahead of origin/main."

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "🧪 Dry run — would run:"
  echo "   gh pr create --base main --head develop --title \"$PROMOTION_TITLE\""
  echo "   gh pr checks <pr> --watch"
  echo "   gh pr merge <pr> --merge"
  [[ "$SKIP_RELEASE" -eq 1 ]] || echo "   gh pr merge <release-please-pr> --merge"
  print_images "vX.Y.Z"
  exit 0
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "❌ 'gh' (GitHub CLI) is required." >&2
  exit 1
fi

# 2. Promotion PR develop → main
PR_NUMBER="$(gh pr list --base main --head develop --state open --json number -q '.[0].number' 2>/dev/null || true)"
if [[ -z "$PR_NUMBER" || "$PR_NUMBER" == "null" ]]; then
  echo "📝 Opening the promotion PR develop → main..."
  PR_URL="$(gh pr create --base main --head develop --title "$PROMOTION_TITLE" --body "Gitflow promotion of \`develop\` into \`main\` (merge commit). Release Please derives the next version from the squashed commits on develop.")"
  PR_NUMBER="$(gh pr view "$PR_URL" --json number -q .number)"
fi
echo "🔗 Promotion PR #$PR_NUMBER"

echo "⏳ Waiting for checks on PR #$PR_NUMBER..."
if ! gh pr checks "$PR_NUMBER" --watch; then
  echo "❌ Checks failed on PR #$PR_NUMBER. Promotion halted."
  exit 1
fi

# 3. Owner confirmation, then merge commit (keeps develop's squashed history).
if ! confirm "Merge promotion PR #$PR_NUMBER into main with a merge commit?"; then
  echo "❌ Promotion not confirmed. PR #$PR_NUMBER stays open."
  exit 1
fi
gh pr merge "$PR_NUMBER" --merge
echo "✅ develop promoted into main (PR #$PR_NUMBER)."

if [[ "$SKIP_RELEASE" -eq 1 ]]; then
  print_images "vX.Y.Z"
  exit 0
fi

# 4. Release Please PR on main
echo "⏳ Waiting for the Release Please PR on main..."
RP_PR_NUMBER=""
for _ in $(seq 1 30); do
  RP_PR_NUMBER="$(gh pr list --base main --state open --search "chore(main): release in:title" --json number -q '.[0].number' 2>/dev/null || true)"
  [[ -n "$RP_PR_NUMBER" && "$RP_PR_NUMBER" != "null" ]] && break
  RP_PR_NUMBER=""
  sleep 10
done
if [[ -z "$RP_PR_NUMBER" ]]; then
  echo "⚠️  No Release Please PR found after 5 minutes. Check the open PRs into main."
  exit 1
fi
echo "📦 Release Please PR #$RP_PR_NUMBER"

if ! gh pr checks "$RP_PR_NUMBER" --watch; then
  echo "❌ Checks failed on Release Please PR #$RP_PR_NUMBER."
  exit 1
fi
if ! confirm "Merge Release Please PR #$RP_PR_NUMBER to cut the release?"; then
  echo "❌ Release not confirmed. PR #$RP_PR_NUMBER stays open."
  exit 1
fi
gh pr merge "$RP_PR_NUMBER" --merge
echo "✅ Release Please PR merged."

echo "⏳ Waiting for the GitHub Release..."
sleep 15
TAG="$(gh release view --json tagName -q .tagName)"
echo "🏷️  Released $TAG"

SUMMARY=""
if [[ -n "$NOTES_FILE" ]]; then
  SUMMARY="$(cat "$NOTES_FILE")"
elif [[ -n "$NOTES_TEXT" ]]; then
  SUMMARY="$NOTES_TEXT"
fi
if [[ -n "$SUMMARY" ]]; then
  BODY="$(gh release view "$TAG" --json body -q .body 2>/dev/null || true)"
  gh release edit "$TAG" --notes "${SUMMARY}

---

${BODY}"
  echo "✍️  Release notes of $TAG updated with the summary."
fi

print_images "$TAG"
