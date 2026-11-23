#!/usr/bin/env bash
#
# ops-guard.sh — ask before server operations from this public repo (#630).
#
# Server work (deploys, restarts, logs on a deployment host) belongs in the
# maintainer's private infra repo and its own agent session. This Claude Code
# PreToolUse hook does not block: for Bash commands that act on a remote server
# (ssh, scp, sftp, rsync to host:, docker -H / --context / DOCKER_HOST) it
# answers "ask", so the user confirms or declines. Everything else passes.
# It matches commands, not names: no host list is needed or read.
#
# Usage:
#   ops-guard.sh --claude-hook     # Claude Code PreToolUse hook (JSON on stdin)
set -euo pipefail

if [[ "${1:-}" != "--claude-hook" ]]; then
  echo "usage: $0 --claude-hook" >&2
  exit 2
fi

python3 -I -c '
import json, re, sys
call = json.load(sys.stdin)
if call.get("tool_name") != "Bash":
    sys.exit(0)
cmd = call.get("tool_input", {}).get("command", "")
# A command word: at the start or after a shell separator / env assignment.
start = r"(?:^|[;&|(\n]|\$\(|`)\s*(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*"
remote = [
    start + r"(?:ssh|scp|sftp)\b",
    start + r"rsync\b[^;&|\n]*\s[^\s:/]+:",
    r"\bDOCKER_HOST=",
    start + r"docker\s+(?:[^;&|\n]*\s)?(?:-H|--host|--context|-c)\b",
]
if any(re.search(p, cmd) for p in remote):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "ask",
        "permissionDecisionReason": "Server operation from the public app repo: confirm it, or run it from your private infra repo session.",
    }}))
'
