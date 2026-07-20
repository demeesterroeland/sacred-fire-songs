#!/bin/bash
# Script to run performance tests against the Vercel target URL

# First, get the Vercel token
TOKEN=$(cat ~/.local/share/com.vercel.cli/auth.json | jq -r '.token')

# Check if token exists
if [ -z "$TOKEN" ]; then
  echo "❌ Not logged in to Vercel. Run: vercel login"
  exit 1
fi

echo "✅ Vercel token found"

# Export environment variables for k6
export VERCEL_TOKEN=$TOKEN
export BASE_URL=https://<parent-project>-3l9178gd5-roeland-de-meesters-projects.vercel.app/

echo "Running k6 test with Vercel authentication..."

# Run the k6 performance test
k6 run testing/performance/tests/scripts/load-test.js