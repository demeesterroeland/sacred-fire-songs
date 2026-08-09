#!/usr/bin/env node
/**
 * Sacred Fire Songs — Performance Benchmark
 *
 * Benchmarks a single target URL by:
 *   1. Fetching the /songs page and discovering song IDs from rendered HTML
 *   2. Randomly sampling up to SAMPLE_SIZE song detail pages
 *   3. Measuring TTFB and total load time for each page
 *   4. Saving a timestamped JSON report to testing/performance/reports/
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node run-benchmark.mjs
 *   BASE_URL=https://my-deployment.vercel.app node run-benchmark.mjs
 *
 * Options (env vars):
 *   BASE_URL      Target base URL  (default: http://localhost:3000)
 *   SAMPLE_SIZE   Number of random song pages to benchmark (default: 20)
 *   LABEL         Human-readable label for this run (default: BASE_URL value)
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.resolve(__dirname, '../reports');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const SAMPLE_SIZE = parseInt(process.env.SAMPLE_SIZE || '50', 10);
const LABEL = process.env.LABEL || BASE_URL;
const REUSE_RUN_ID = process.env.REUSE_RUN_ID || null;

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function fetchUrl(rawUrl) {
  return new Promise((resolve) => {
    const url = new URL(rawUrl);
    const transport = url.protocol === 'https:' ? https : http;
    const start = Date.now();
    let ttfb = null;

    const req = transport.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
          'User-Agent': 'sacred-fire-songs-benchmark/1.0',
          'Accept': 'text/html,application/json',
        },
      },
      (res) => {
        ttfb = Date.now() - start;
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            ttfb,
            total: Date.now() - start,
            bytes: Buffer.byteLength(body, 'utf8'),
            body,
          });
        });
      }
    );

    req.on('error', () =>
      resolve({ status: 0, ttfb: -1, total: -1, bytes: 0, body: '' })
    );
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ status: 0, ttfb: -1, total: -1, bytes: 0, body: '' });
    });
    req.end();
  });
}

// ─── Song discovery ───────────────────────────────────────────────────────────

async function discoverSongIds() {
  console.log(`\n🔍 Discovering song IDs from ${BASE_URL}/songs ...`);
  const res = await fetchUrl(`${BASE_URL}/songs`);

  if (res.status !== 200) {
    throw new Error(`Failed to fetch /songs — HTTP ${res.status}`);
  }

  // Extract all /songs/{uuid} hrefs from rendered HTML
  const pattern = /href="\/songs\/([a-f0-9-]{36})"/g;
  const ids = new Set();
  let match;
  while ((match = pattern.exec(res.body)) !== null) {
    ids.add(match[1]);
  }

  if (ids.size === 0) {
    throw new Error(
      'No song IDs found in /songs HTML. Is the app running and returning songs?'
    );
  }

  console.log(`   Found ${ids.size} unique song IDs`);
  return Array.from(ids);
}

function loadSongIdsFromRun(runId) {
  const reportPath = path.join(reportsDir, `${runId}.json`);
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Cannot reuse run — report not found: ${reportPath}`);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  // Song detail pages are in the third group
  const songGroup = report.groups.find((g) => g.label.startsWith('Random Song Detail'));
  if (!songGroup || !songGroup.pages.length) {
    throw new Error(`Run ${runId} has no song detail pages to reuse.`);
  }
  // Extract UUIDs from stored URLs (strip whatever base URL was used)
  const ids = songGroup.pages
    .map((p) => { const m = p.url.match(/\/songs\/([a-f0-9-]{36})/); return m ? m[1] : null; })
    .filter(Boolean);
  console.log(`\n♻️  Reusing ${ids.length} song IDs from run: ${runId}`);
  return ids;
}

function shuffleAndSample(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// ─── Benchmark runner ─────────────────────────────────────────────────────────

async function measurePage(url) {
  const res = await fetchUrl(url);
  return {
    url,
    status: res.status,
    ttfb: res.ttfb,
    total: res.total,
    bytes: res.bytes,
  };
}

async function benchmarkGroup(label, urls) {
  console.log(`\n📐 ${label} (${urls.length} pages)`);
  const results = [];
  for (const url of urls) {
    const r = await measurePage(url);
    const ok = r.status === 200;
    console.log(
      `   ${ok ? '✓' : '✗'} ${r.url.replace(BASE_URL, '')}  ` +
        `TTFB: ${r.ttfb}ms  Total: ${r.total}ms  ${ok ? '' : `[HTTP ${r.status}]`}`
    );
    results.push(r);
  }

  const successful = results.filter((r) => r.status === 200);
  const avg = (arr) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const ttfbs = successful.map((r) => r.ttfb);
  const totals = successful.map((r) => r.total);

  return {
    label,
    totalPages: urls.length,
    successCount: successful.length,
    avgTtfb: avg(ttfbs),
    minTtfb: ttfbs.length ? Math.min(...ttfbs) : 0,
    maxTtfb: ttfbs.length ? Math.max(...ttfbs) : 0,
    avgTotal: avg(totals),
    pages: results,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(70));
  console.log('⚡ Sacred Fire Songs — Performance Benchmark');
  console.log('='.repeat(70));
  console.log(`🎯 Target:      ${LABEL}`);
  if (REUSE_RUN_ID) {
    console.log(`♻️  Reusing IDs from run: ${REUSE_RUN_ID}`);
  } else {
    console.log(`📊 Sample size: ${SAMPLE_SIZE} random song pages`);
  }

  // Discover or reuse song IDs
  let sampledIds;
  try {
    if (REUSE_RUN_ID) {
      // Reuse exact song IDs from a previous run for fair comparison
      sampledIds = loadSongIdsFromRun(REUSE_RUN_ID);
    } else {
      const allIds = await discoverSongIds();
      sampledIds = shuffleAndSample(allIds, SAMPLE_SIZE);
    }
  } catch (err) {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
  }

  // Warm-up pass (uncounted)
  console.log('\n🌡️  Warming up...');
  await fetchUrl(`${BASE_URL}/`);
  await fetchUrl(`${BASE_URL}/songs/${sampledIds[0]}`);

  // Benchmark groups
  const groups = [];

  groups.push(
    await benchmarkGroup('Homepage', [`${BASE_URL}/`])
  );

  groups.push(
    await benchmarkGroup('Song Library (/songs)', [`${BASE_URL}/songs`])
  );

  groups.push(
    await benchmarkGroup(
      `Random Song Detail Pages (sample of ${sampledIds.length})`,
      sampledIds.map((id) => `${BASE_URL}/songs/${id}`)
    )
  );

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 Summary');
  console.log('='.repeat(70));
  for (const g of groups) {
    console.log(
      `${g.label.padEnd(45)} ` +
        `✓ ${g.successCount}/${g.totalPages}  ` +
        `TTFB avg: ${g.avgTtfb}ms  Total avg: ${g.avgTotal}ms`
    );
  }

  // Save report
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const runId = timestamp.replace(/[:.]/g, '-');
  const reportData = {
    runId,
    timestamp,
    label: LABEL,
    baseUrl: BASE_URL,
    sampleSize: sampledIds.length,
    reusedFromRunId: REUSE_RUN_ID || null,
    groups,
  };

  const reportPath = path.join(reportsDir, `${runId}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n💾 Report saved: testing/performance/reports/${runId}.json`);
  console.log(`\n   Run ID: ${runId}`);
  console.log(`   (Use this ID with generate-html-report.mjs to compare runs)`);
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
});
