#!/usr/bin/env bats
# Contract tests for scripts/dev/ops-guard.sh --claude-hook (#630).
# Server operations (ssh, scp, remote rsync, remote docker) from this public
# repo get a confirmation prompt ("ask"); everything else passes silently.
# Run with: npm run test:scripts

setup() {
  SCRIPT="$BATS_TEST_DIRNAME/../../scripts/dev/ops-guard.sh"
}

# Feed a Claude Code PreToolUse call to the hook.
hook_bash() {
  local cmd="$1"
  run bash -c 'python3 -c "import json,sys; print(json.dumps({\"tool_name\":\"Bash\",\"tool_input\":{\"command\":sys.argv[1]}}))" "$1" | bash "$2" --claude-hook' _ "$cmd" "$SCRIPT"
}

asks() {
  [ "$status" -eq 0 ]
  echo "$output" | python3 -c 'import json,sys; o=json.load(sys.stdin)["hookSpecificOutput"]; assert o["hookEventName"]=="PreToolUse"; assert o["permissionDecision"]=="ask"; assert "infra repo" in o["permissionDecisionReason"]'
}

allows() {
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "ssh asks for confirmation and points to the infra repo" {
  hook_bash "ssh root@server.example docker ps"
  asks
}

@test "ssh after another command asks" {
  hook_bash "cd /tmp && ssh server.example 'uptime'"
  asks
}

@test "scp to a server asks" {
  hook_bash "scp file.txt server.example:/tmp/"
  asks
}

@test "sftp asks" {
  hook_bash "sftp server.example"
  asks
}

@test "rsync to a host: target asks" {
  hook_bash "rsync -a dir/ server.example:/srv/dir/"
  asks
}

@test "DOCKER_HOST over ssh asks" {
  hook_bash "DOCKER_HOST=ssh://server.example docker ps"
  asks
}

@test "docker -H asks" {
  hook_bash "docker -H ssh://server.example ps"
  asks
}

@test "docker --context asks" {
  hook_bash "docker --context prod ps"
  asks
}

@test "local commands pass silently" {
  for cmd in "npm test" "git status" "rsync -a a/ b/" "docker ps" "grep -r sshd docs/" "echo ssh-keygen is a tool"; do
    hook_bash "$cmd"
    echo "cmd: $cmd -> $output"
    allows
  done
}

@test "Write and Edit calls pass silently" {
  run bash -c 'echo "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/tmp/x\",\"content\":\"ssh server\"}}" | bash "$1" --claude-hook' _ "$SCRIPT"
  allows
}

@test "without --claude-hook it prints usage and exits 2" {
  run bash "$SCRIPT"
  [ "$status" -eq 2 ]
}
