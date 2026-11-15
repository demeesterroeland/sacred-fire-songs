#!/usr/bin/env bash
# Before/after screenshots for UX v2 validation round 2 at 390 px, light and dark (plus desktop), as WebP.
# Usage: scripts/dev/ux/capture-validation-2.sh <before|after> <base-url>
# Output: docs/ux-research/screenshots/ux-v2/validation-2/<before|after>-<light|dark>/<mobile|desktop>/<role>/<name>.webp
set -euo pipefail
phase="${1:?before|after}"; base="${2:?base url}"
here="$(cd "$(dirname "$0")" && pwd)"
for scheme in light dark; do
  out="docs/ux-research/screenshots/ux-v2/validation-2/${phase}-${scheme}"
  UX_PHASE="$phase" UX_BASE_URL="$base" UX_OUT="$out" UX_SCHEME="$scheme" node "$here/capture-validation-2.mjs"
done
find "docs/ux-research/screenshots/ux-v2/validation-2" -path "*${phase}-*" \( -name '*.png' -o -name '*.webp' \) -print0 |
  while IFS= read -r -d '' f; do
    width=390; case "$f" in */desktop/*) width=720 ;; esac
    if file "$f" | grep -q PNG; then cwebp -quiet -q 75 -resize "$width" 0 "$f" -o "$f.tmp" && mv "$f.tmp" "$f"; fi
  done
