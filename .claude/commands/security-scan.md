Run a full security audit of the project.

## Steps

1. **Execute Scan**: Run the shell script `.agent/skills/security-scanner/scripts/scan.sh`.

2. **Analyze Artifacts** (once the scan completes):
   - Read `.agent/audit-npm.json` for dependency risks.
   - Read `.agent/audit-trivy.json` for CVEs and hardcoded secrets (if Trivy is installed).
   - Read `.agent/audit-cicd.txt` for plain-text keys in YAML files.

3. **Synthesize Findings**: Do NOT just paste raw JSON. Interpret severity in context:
   - If a high-severity CVE is found in a route being audited, mark it **[CRITICAL]**.
   - If no secrets are found, explicitly state: "No common secret patterns detected in CI/CD."

## Constraints
- Do not suggest fixes that introduce new dependencies without checking their security scores first.
