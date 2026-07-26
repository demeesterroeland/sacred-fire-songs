#!/bin/bash
# Universal Performance Benchmark Script
# Runs multi-category benchmark suite against Vercel Cloud and VPS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================================="
echo "⚡ Sacred Fire Songs Performance Benchmark Suite"
echo "=========================================================================="

FIXTURE_FILE="testing/performance/benchmark-song-fixtures.json"

if [ ! -f "$FIXTURE_FILE" ] || [ "$1" == "--refresh-fixtures" ]; then
  echo "🔄 Generating/refreshing song fixtures from production database..."
  node testing/performance/scripts/generate-fixtures.mjs
fi

echo "🚀 Executing performance benchmark..."
node testing/performance/scripts/run-benchmark.mjs

echo "🌐 Generating HTML benchmark report..."
node testing/performance/scripts/generate-html-report.mjs

echo ""
echo "✅ Performance benchmark run complete!"
echo "📁 Historical results are saved in: testing/performance/reports/"
