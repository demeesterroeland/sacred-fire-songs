#!/bin/bash

# Set BASE_URL from argument or use default
BASE_URL="${1:-https://<parent-project>-3l9178gd5-roeland-de-meesters-projects.vercel.app}"

# Create timestamp for results file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_FILE="perf-tests/results/perf-results_${TIMESTAMP}.json"

# Run k6 test with JSON output
echo "Running performance tests against $BASE_URL"
echo "Results will be saved to $RESULTS_FILE"

~/bin/k6 run \
  --env BASE_URL="$BASE_URL" \
  --out json="$RESULTS_FILE" \
  perf-tests/scripts/load-test.js

echo "Performance tests completed!"
echo "Results saved to: $RESULTS_FILE"