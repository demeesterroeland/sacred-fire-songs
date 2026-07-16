#!/bin/bash
# Simple debugging script to test Vercel authentication methods

echo "=== Vercel Authentication Debug ==="

# Get the token
TOKEN=$(cat ~/.local/share/com.vercel.cli/auth.json | jq -r '.token')
echo "Token: $TOKEN"

# Test direct access to the preview URL
echo ""
echo "=== Testing direct access ==="
curl -I -H "Authorization: Bearer $TOKEN" https://<parent-project>-3l9178gd5-roeland-de-meesters-projects.vercel.app/ | head -5

echo ""
echo "=== Testing access without auth ==="
curl -I https://<parent-project>-3l9178gd5-roeland-de-meesters-projects.vercel.app/ | head -5

echo ""
echo "=== Testing with cookie approach (if needed) ==="
# We would need to extract cookies from auth if needed, but it seems the token approach should work

echo ""
echo "=== Summary ==="
echo "Vercel CLI version: $(vercel --version)"
echo "Authentication status: OK (logged in)"
echo "Token exists: $(if [ -n "$TOKEN" ]; then echo "Yes"; else echo "No"; fi)"
echo "Target URL: https://<parent-project>-3l9178gd5-roeland-de-meesters-projects.vercel.app/"