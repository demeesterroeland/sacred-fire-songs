#!/bin/bash
# Sacred Fire Songs — Performance Benchmark Runner
#
# Usage:
#   ./run-performance-benchmark.sh                              # benchmark localhost:3000
#   ./run-performance-benchmark.sh https://my-app.vercel.app   # benchmark any URL
#   ./run-performance-benchmark.sh http://localhost:3000 --sample 30
#
# List saved run IDs:
#   ./run-performance-benchmark.sh --list
#
# Compare two previous runs:
#   ./run-performance-benchmark.sh --compare <runId1> <runId2>
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================================="
echo "⚡ Sacred Fire Songs — Performance Benchmark"
echo "=========================================================================="

if [ "$1" == "--list" ]; then
  REPORTS_DIR="testing/performance/reports"
  if [ ! -d "$REPORTS_DIR" ] || [ -z "$(ls "$REPORTS_DIR"/*.json 2>/dev/null)" ]; then
    echo "No benchmark reports found in $REPORTS_DIR"
    exit 0
  fi
  echo "📋 Available benchmark runs:"
  echo ""
  for f in $(ls "$REPORTS_DIR"/*.json 2>/dev/null | sort -r); do
    RUN_ID=$(basename "$f" .json)
    LABEL=$(node -e "const d=JSON.parse(require('fs').readFileSync('$f','utf8')); console.log(d.label + '  (' + new Date(d.timestamp).toLocaleString() + ')')" 2>/dev/null || echo "?")
    echo "  $RUN_ID"
    echo "    $LABEL"
  done
  echo ""
  exit 0
fi

if [ "$1" == "--compare" ]; then
  if [ -z "$2" ] || [ -z "$3" ]; then
    echo "Usage: $0 --compare <runId1> <runId2>"
    exit 1
  fi
  echo "📊 Generating comparison report for:"
  echo "   A: $2"
  echo "   B: $3"
  node testing/performance/scripts/generate-html-report.mjs "$2" "$3"
  exit 0
fi

# First positional arg is the target URL (optional, defaults to localhost:3000)
TARGET_URL="${1:-http://localhost:3000}"

# Optional --sample flag: ./run-performance-benchmark.sh <url> --sample 30
if [ "$2" == "--sample" ] && [ -n "$3" ]; then
  export SAMPLE_SIZE="$3"
fi

export BASE_URL="$TARGET_URL"

echo "🚀 Running benchmark against: $BASE_URL"
node testing/performance/scripts/run-benchmark.mjs

echo ""
echo "✅ Done! Use the Run ID above with --compare to generate a comparison report."
echo "   Example: $0 --compare <runIdA> <runIdB>"
