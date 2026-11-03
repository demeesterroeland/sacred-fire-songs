#!/usr/bin/env bash
#
# isolation-guard.sh — keep private deployment details out of this public repo.
#
# The list of forbidden patterns is NOT part of this repository (it would leak
# the very names it protects). It is read from $SFS_DENYLIST, default
# ~/.config/sfs/denylist: one extended regex per line, '#' comments allowed.
#
# Usage:
#   isolation-guard.sh --staged          # pre-commit: scan the staged diff
#   isolation-guard.sh --tree            # scan every tracked text file
#   isolation-guard.sh --claude-hook     # Claude Code PreToolUse hook (JSON on stdin)
#   isolation-guard.sh FILE...           # scan the given files
#
# Exit 0 = clean, 1 = match found, 2 = denylist missing (fail closed).
set -euo pipefail

DENYLIST="${SFS_DENYLIST:-$HOME/.config/sfs/denylist}"

if [[ ! -r "$DENYLIST" ]]; then
  echo "isolation-guard: denylist not found at $DENYLIST (set SFS_DENYLIST). Refusing to continue." >&2
  exit 2
fi

# Build one alternation from the non-comment, non-empty lines.
PATTERN="$(grep -vE '^\s*(#|$)' "$DENYLIST" | paste -sd'|' -)"
if [[ -z "$PATTERN" ]]; then
  echo "isolation-guard: denylist is empty. Refusing to continue." >&2
  exit 2
fi

report() {
  # $1 = label, stdin = text to scan. Prints matches with the matched text masked.
  local label="$1" hits
  hits="$(grep -nIiE -- "$PATTERN" || true)"
  if [[ -n "$hits" ]]; then
    echo "isolation-guard: private deployment reference in $label:" >&2
    echo "$hits" | sed -E "s/($PATTERN)/<redacted>/Ig" | head -20 >&2
    return 1
  fi
}

case "${1:-}" in
  --staged)
    git diff --cached -U0 --diff-filter=ACMR -- . ':!package-lock.json' \
      | grep -E '^\+[^+]' | report "staged changes" ;;
  --tree)
    status=0
    while IFS= read -r -d '' f; do
      [[ "$f" == package-lock.json ]] && continue
      grep -Iq . "$f" 2>/dev/null || continue   # skip binary / empty
      report "$f" < "$f" || status=1
    done < <(git ls-files -z)
    exit $status ;;
  --claude-hook)
    # Claude Code passes the tool call as JSON on stdin. Only scan what would
    # end up in this public repo:
    #  - Write/Edit/MultiEdit: the NEW text, and only for files inside the repo
    #    (removing a forbidden term must stay possible; other repos are not ours)
    #  - Bash: only outward actions (commit, PR, issue, release, API) - files
    #    written through the shell are caught by pre-commit and CI.
    text="$(REPO_ROOT="$(git rev-parse --show-toplevel)" python3 -I -c '
import json, os, re, sys
call = json.load(sys.stdin)
tool, d = call.get("tool_name", ""), call.get("tool_input", {})
root = os.path.realpath(os.environ["REPO_ROOT"]) + os.sep
if tool in ("Write", "Edit", "MultiEdit"):
    path = os.path.realpath(d.get("file_path", ""))
    if not path.startswith(root):
        sys.exit(0)
    parts = [d.get("content", ""), d.get("new_string", "")]
    parts += [e.get("new_string", "") for e in d.get("edits", []) or []]
    print("\n".join(p for p in parts if p))
elif tool == "Bash":
    cmd = d.get("command", "")
    if re.search(r"\bgit\s+(commit|tag|push)\b|\bgh\s+(pr|issue|release|api|repo|secret|variable)\b", cmd):
        print(cmd)
')"
    if ! printf '%s\n' "$text" | report "Claude tool input" 2>/tmp/isolation-guard.msg; then
      # exit 2 makes Claude Code block the tool call and show stderr to the model
      cat /tmp/isolation-guard.msg >&2
      echo "Blocked by isolation-guard: this repo is public; put deployment details in the private infra repo." >&2
      exit 2
    fi ;;
  "")
    echo "usage: $0 --staged | --tree | --claude-hook | FILE..." >&2; exit 2 ;;
  *)
    status=0
    for f in "$@"; do report "$f" < "$f" || status=1; done
    exit $status ;;
esac
