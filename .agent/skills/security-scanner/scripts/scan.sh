#!/bin/bash
# Antigravity Security Skill - Wrapper for Trivy & npm audit
echo "--- STARTING SECURITY SCAN ---"

# 1. Dependency Check
if [ -f "package.json" ]; then
    echo "[1/3] Running npm audit..."
    npm audit --audit-level=high --json > .agent/audit-npm.json || true
fi

# 2. Secret & Vulnerability Scan (Trivy)
if command -v trivy &> /dev/null; then
    echo "[2/3] Running Trivy (Filesystem & Secrets)..."
    trivy fs --security-checks vuln,secret --severity HIGH,CRITICAL --format json -o .agent/audit-trivy.json .
else
    echo "⚠️ Trivy not installed. Skipping deep scan."
fi

# 3. CI/CD Check (Semgrep or manual grep)
echo "[3/3] Checking CI/CD workflows for exposed secrets..."
grep -rE "password:|api_key:|secret:" .github/workflows/ > .agent/audit-cicd.txt || true

echo "--- SCAN COMPLETE. RESULTS SAVED TO .agent/ ---"