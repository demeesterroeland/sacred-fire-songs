#!/usr/bin/env bash
# Capture before/after screenshots for one UX v2 story at 390 px, light and dark,
# and convert them to WebP (Epic 6.1, docs/ux-research/README.md).
#
# Usage: scripts/dev/ux/capture-story.sh <issue> <before|after> <base-url> [routes] [roles]
#   routes: comma list of route-name prefixes from capture-routes.mjs (default: all)
#   roles:  comma list (default: guest,member)
# Output: docs/ux-research/screenshots/ux-v2/<issue>/<before|after>-<light|dark>/mobile/<role>/<name>.webp
set -euo pipefail
issue="${1:?issue}"; phase="${2:?before|after}"; base="${3:?base url}"
routes="${4:-}"; roles="${5:-guest,member}"
here="$(cd "$(dirname "$0")" && pwd)"
for scheme in light dark; do
  out="docs/ux-research/screenshots/ux-v2/${issue}/${phase}-${scheme}"
  UX_BASE_URL="$base" UX_OUT="$out" UX_SCHEME="$scheme" UX_ROUTES="$routes" UX_ROLES="$roles" \
    node "$here/capture-routes.mjs" mobile
done
# Playwright writes PNG data at 2x; re-encode as real WebP at 390 px wide (quality 75)
# so a story's set stays small in the repo.
find "docs/ux-research/screenshots/ux-v2/${issue}" -name '*.webp' -print0 |
  while IFS= read -r -d '' f; do
    if file "$f" | grep -q PNG; then cwebp -quiet -q 75 -resize 390 0 "$f" -o "$f.tmp" && mv "$f.tmp" "$f"; fi
  done
