#!/bin/bash
# Get Vercel token
TOKEN=$(cat ~/.local/share/com.vercel.cli/auth.json | jq -r '.token')

if [ -z "$TOKEN" ]; then
  echo "❌ Not logged in to Vercel. Run: vercel login"
  exit 1
fi

echo "✅ Vercel token found"

# Set environment variable for k6
export VERCEL_TOKEN=$TOKEN
export BASE_URL=https://<parent-project>-lfcaj6onn-roeland-de-meesters-projects.vercel.app/

echo "Running k6 test with Vercel authentication..."
k6 run testing/performance/tests/scripts/load-test-auth.js