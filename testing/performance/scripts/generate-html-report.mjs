#!/usr/bin/env node
/**
 * Sacred Fire Songs — Benchmark Comparison Report Generator
 *
 * Compares two benchmark runs side-by-side and generates an HTML report.
 *
 * Usage:
 *   node generate-html-report.mjs <runId1> <runId2>
 *
 * Example:
 *   node generate-html-report.mjs 2026-08-09T14-00-00-000Z 2026-08-09T16-00-00-000Z
 *
 * Run IDs are printed at the end of each `run-benchmark.mjs` execution.
 * JSON report files live in: testing/performance/reports/<runId>.json
 *
 * Output:
 *   testing/performance/reports/compare-<runId1>-vs-<runId2>.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.resolve(__dirname, '../reports');

// ─── CLI args ─────────────────────────────────────────────────────────────────

const [runId1, runId2] = process.argv.slice(2);

if (!runId1 || !runId2) {
  console.error('Usage: node generate-html-report.mjs <runId1> <runId2>');
  console.error('\nAvailable run IDs:');
  if (fs.existsSync(reportsDir)) {
    fs.readdirSync(reportsDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()
      .forEach((f) => console.error(`  ${f.replace('.json', '')}`));
  }
  process.exit(1);
}

function loadReport(runId) {
  const filePath = path.join(reportsDir, `${runId}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Report not found: ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

function delta(a, b) {
  if (!a || !b) return { value: 0, pct: 0, faster: null };
  const diff = b - a;
  const pct = Math.round((diff / a) * 100);
  return { value: diff, pct, faster: diff > 0 ? 'a' : diff < 0 ? 'b' : 'tie' };
}

function badge(ms, isWinner) {
  if (ms <= 0) return `<span class="text-gray-500">—</span>`;
  const color = isWinner ? 'text-emerald-400 font-bold' : 'text-amber-300';
  return `<span class="${color}">${ms} ms</span>`;
}

function winnerBadge(d) {
  if (d.faster === 'a') return `<span class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">🏆 A faster</span>`;
  if (d.faster === 'b') return `<span class="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-semibold">🏆 B faster</span>`;
  return `<span class="text-xs text-gray-500">tie</span>`;
}

function deltaBadge(d) {
  if (d.faster === null || d.faster === 'tie') return '';
  const sign = d.value > 0 ? '+' : '';
  const color = d.value > 0 ? 'text-red-400' : 'text-emerald-400';
  return `<span class="text-xs ${color} ml-1">(${sign}${d.pct}%)</span>`;
}

// ─── HTML generation ──────────────────────────────────────────────────────────

function generateHTML(a, b) {
  const now = new Date().toLocaleString();

  // Build per-group comparison rows
  const groupMap = new Map();
  for (const g of a.groups) groupMap.set(g.label, { a: g, b: null });
  for (const g of b.groups) {
    if (groupMap.has(g.label)) groupMap.get(g.label).b = g;
    else groupMap.set(g.label, { a: null, b: g });
  }

  const rows = Array.from(groupMap.entries()).map(([label, { a: ga, b: gb }]) => {
    const ttfbDelta = delta(ga?.avgTtfb, gb?.avgTtfb);
    const totalDelta = delta(ga?.avgTotal, gb?.avgTotal);

    return `
      <tr class="border-b border-gray-800/60 hover:bg-gray-800/30 transition">
        <td class="py-3 px-4 font-semibold text-gray-200 text-sm">${label}</td>
        <td class="py-3 px-4 text-center text-xs text-gray-400">${ga ? `${ga.successCount}/${ga.totalPages}` : '—'}</td>
        <td class="py-3 px-4 text-center">${ga ? badge(ga.avgTtfb, ttfbDelta.faster === 'a') : '—'}</td>
        <td class="py-3 px-4 text-center">${gb ? badge(gb.avgTtfb, ttfbDelta.faster === 'b') : '—'}</td>
        <td class="py-3 px-4 text-center">${winnerBadge(ttfbDelta)} ${deltaBadge(ttfbDelta)}</td>
        <td class="py-3 px-4 text-center">${ga ? badge(ga.avgTotal, totalDelta.faster === 'a') : '—'}</td>
        <td class="py-3 px-4 text-center">${gb ? badge(gb.avgTotal, totalDelta.faster === 'b') : '—'}</td>
      </tr>`;
  }).join('');

  // Overall winner: count wins per side across TTFB
  let winsA = 0, winsB = 0;
  for (const [, { a: ga, b: gb }] of groupMap) {
    if (!ga || !gb) continue;
    const d = delta(ga.avgTtfb, gb.avgTtfb);
    if (d.faster === 'a') winsA++;
    else if (d.faster === 'b') winsB++;
  }
  const overallWinner = winsA > winsB ? `Run A — ${a.label}` : winsB > winsA ? `Run B — ${b.label}` : 'Tie';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sacred Fire Songs — Benchmark Comparison</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #030712; }
    code, .mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen p-6 md:p-10">
  <div class="max-w-6xl mx-auto space-y-10">

    <!-- Header -->
    <header class="border-b border-gray-800 pb-6">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-3xl">⚡</span>
        <h1 class="text-3xl font-extrabold tracking-tight text-white">Sacred Fire Songs</h1>
        <span class="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold px-3 py-1 rounded-full">
          Benchmark Comparison
        </span>
      </div>
      <p class="text-gray-400 text-sm">Generated: ${now}</p>
    </header>

    <!-- Run metadata cards -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="bg-gray-900 border border-gray-700 rounded-2xl p-5">
        <div class="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Run A</div>
        <div class="text-lg font-bold text-white truncate">${a.label}</div>
        <div class="text-xs text-gray-400 mt-1 mono">${a.runId}</div>
        <div class="text-xs text-gray-500 mt-2">
          ${new Date(a.timestamp).toLocaleString()} · ${a.discoveredSongs} songs discovered · sample ${a.sampleSize}
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-700 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
        <div class="text-4xl mb-2">🏆</div>
        <div class="text-xs text-gray-400 uppercase tracking-wider mb-1">Overall Winner (TTFB)</div>
        <div class="text-base font-bold text-white">${overallWinner}</div>
        <div class="text-xs text-gray-500 mt-1">${winsA}–${winsB} group wins</div>
      </div>

      <div class="bg-gray-900 border border-gray-700 rounded-2xl p-5">
        <div class="text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">Run B</div>
        <div class="text-lg font-bold text-white truncate">${b.label}</div>
        <div class="text-xs text-gray-400 mt-1 mono">${b.runId}</div>
        <div class="text-xs text-gray-500 mt-2">
          ${new Date(b.timestamp).toLocaleString()} · ${b.discoveredSongs} songs discovered · sample ${b.sampleSize}
        </div>
      </div>
    </section>

    <!-- Comparison table -->
    <section class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 class="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <span>📊</span> TTFB &amp; Load Time Comparison
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-300">
          <thead class="bg-gray-950 text-xs text-gray-400 uppercase border-b border-gray-800">
            <tr>
              <th class="py-3 px-4">Page Group</th>
              <th class="py-3 px-4 text-center">Sample</th>
              <th class="py-3 px-4 text-center text-emerald-400">TTFB A</th>
              <th class="py-3 px-4 text-center text-sky-400">TTFB B</th>
              <th class="py-3 px-4 text-center">Winner</th>
              <th class="py-3 px-4 text-center text-emerald-400">Total A</th>
              <th class="py-3 px-4 text-center text-sky-400">Total B</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>

    <!-- Raw run IDs footer -->
    <footer class="text-xs text-gray-600 text-center border-t border-gray-800/50 pt-4 mono">
      A: ${a.runId} &nbsp;|&nbsp; B: ${b.runId}
    </footer>
  </div>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const reportA = loadReport(runId1);
const reportB = loadReport(runId2);

console.log(`📂 Loaded Run A: ${reportA.label} (${reportA.timestamp})`);
console.log(`📂 Loaded Run B: ${reportB.label} (${reportB.timestamp})`);

const html = generateHTML(reportA, reportB);
const outFile = path.join(reportsDir, `compare-${runId1}-vs-${runId2}.html`);
fs.writeFileSync(outFile, html);

console.log(`\n✅ Comparison report saved:`);
console.log(`   testing/performance/reports/compare-${runId1}-vs-${runId2}.html`);
