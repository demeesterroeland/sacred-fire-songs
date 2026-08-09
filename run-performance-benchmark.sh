#!/bin/bash
# Sacred Fire Songs — Performance Benchmark Runner
#
# Usage:
#   ./run-performance-benchmark.sh                          # benchmark localhost:3000
#   BASE_URL=https://my-app.vercel.app ./run-performance-benchmark.sh
#   SAMPLE_SIZE=30 BASE_URL=http://localhost:3000 ./run-performance-benchmark.sh
#
# To compare two previous runs:
#   ./run-performance-benchmark.sh --compare <runId1> <runId2>
#
# Run IDs are printed at the end of each benchmark run.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================================="
echo "⚡ Sacred Fire Songs — Performance Benchmark"
echo "=========================================================================="

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

echo "🚀 Running benchmark against: ${BASE_URL:-http://localhost:3000}"
node testing/performance/scripts/run-benchmark.mjs

echo ""
echo "✅ Done! Use the Run ID above with --compare to generate a comparison report."
echo "   Example: ./run-performance-benchmark.sh --compare <runIdA> <runIdB>"
