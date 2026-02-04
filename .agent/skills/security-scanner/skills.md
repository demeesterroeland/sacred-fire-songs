---
name: security-scanner
description: Runs automated security tools (Trivy, npm audit) to find vulnerabilities and leaked secrets in code and CI/CD pipelines.
---

# Security Scanning Protocol
Use this skill when the user asks for a "security audit," "vulnerability scan," or "CI/CD review."

## Instructions
1. **Execute Scan:** Run the shell script `./scripts/scan.sh`.
2. **Analyze Artifacts:**
   - Read `.agent/audit-npm.json` for dependency risks.
   - Read `.agent/audit-trivy.json` for CVEs and hardcoded secrets.
   - Read `.agent/audit-cicd.txt` for plain-text keys in YAML files.
3. **Synthesize Findings:** Do not just paste the JSON. Interpret the severity. If a high-severity CVE is found in a route you are auditing, highlight it as [CRITICAL].

## Constraints
- Do not suggest fixes that introduce new dependencies without checking their security scores.
- If no secrets are found, explicitly state "No common secret patterns detected in CI/CD."