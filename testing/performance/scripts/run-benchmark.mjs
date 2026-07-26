import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = [
  { name: 'Vercel Cloud (app.example.com)', hostname: 'app.example.com', port: 443, isTailscale: false },
  { name: 'VPS (prod.example.com)', hostname: '100.x.x.x', port: 443, isTailscale: true }
];

const fixturesPath = path.resolve(__dirname, '../benchmark-song-fixtures.json');
const reportsDir = path.resolve(__dirname, '../reports');

function measureUrl(target, path) {
  return new Promise((resolve) => {
    const start = Date.now();
    let ttfb = 0;

    const options = {
      hostname: target.hostname,
      port: target.port,
      path: path,
      method: 'GET',
      rejectUnauthorized: false,
      headers: {
        'Host': 'prod.example.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    if (!target.isTailscale) {
      delete options.headers.Host;
      options.hostname = 'app.example.com';
    }

    const req = https.request(options, (res) => {
      ttfb = Date.now() - start;
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const total = Date.now() - start;
        resolve({
          status: res.statusCode,
          ttfb: ttfb,
          total: total,
          bytes: Buffer.byteLength(body, 'utf8')
        });
      });
    });

    req.on('error', () => {
      resolve({ status: 500, ttfb: -1, total: -1, bytes: 0 });
    });

    req.end();
  });
}

async function benchmarkUrlList(itemList, groupName, isPlaylistPage = false) {
  console.log(`\n================ Benchmarking Category: ${groupName} (${itemList.length} Items) ================`);

  const categoryResults = [];

  for (const target of targets) {
    const ttfbArray = [];
    const totalArray = [];
    let successCount = 0;

    for (const item of itemList) {
      const urlPath = isPlaylistPage ? item.urlPath : `/songs/${item.id}`;
      const res = await measureUrl(target, urlPath);
      if (res.status === 200) {
        ttfbArray.push(res.ttfb);
        totalArray.push(res.total);
        successCount++;
      }
    }

    const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / (arr.length || 1));
    const min = arr => Math.min(...arr);
    const max = arr => Math.max(...arr);

    categoryResults.push({
      Category: groupName,
      Target: target.name,
      'Sample Size': `${successCount}/${itemList.length}`,
      'TTFB Avg (ms)': avg(ttfbArray),
      'TTFB Min (ms)': min(ttfbArray),
      'TTFB Max (ms)': max(ttfbArray),
      'Total Load Avg (ms)': avg(totalArray)
    });
  }

  return categoryResults;
}

async function main() {
  if (!fs.existsSync(fixturesPath)) {
    console.error(`❌ Fixtures file not found at: ${fixturesPath}. Please run generate-fixtures.mjs first.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(fixturesPath, 'utf8');
  const fixtures = JSON.parse(rawData);

  console.log(`📂 Loaded benchmark fixtures from: ${fixturesPath}`);
  console.log(`📅 Fixtures Last Updated: ${fixtures.updatedAt}`);
  console.log(`📜 Public Playlist: "${fixtures.publicPlaylist.title}" (${fixtures.playlistSongs.length} Songs) -> ${fixtures.publicPlaylist.urlPath}`);
  console.log(`🆕 Latest Songs: ${fixtures.latestSongs.length} Songs | 🎲 Random: ${fixtures.randomSongs.length} | 🎧 Media: ${fixtures.mediaSongs.length} | 📜 Longest: ${fixtures.longestSongs.length}`);

  console.log('\n🚀 Warming Up Endpoints...');
  for (const t of targets) {
    await measureUrl(t, fixtures.publicPlaylist.urlPath);
    await measureUrl(t, `/songs/${fixtures.latestSongs[0].id}`);
  }

  const allSummary = [];

  const resPlaylistPage = await benchmarkUrlList([fixtures.publicPlaylist], `Public Playlist Page ("${fixtures.publicPlaylist.title}")`, true);
  allSummary.push(...resPlaylistPage);

  const resPlaylistSongs = await benchmarkUrlList(fixtures.playlistSongs, `Playlist Songs ("${fixtures.publicPlaylist.title}" - ${fixtures.playlistSongs.length} Songs)`);
  allSummary.push(...resPlaylistSongs);

  const resLatest = await benchmarkUrlList(fixtures.latestSongs, 'Latest 10 Added Songs');
  allSummary.push(...resLatest);

  const resRandom = await benchmarkUrlList(fixtures.randomSongs, '25 Random Songs');
  allSummary.push(...resRandom);

  const resMedia = await benchmarkUrlList(fixtures.mediaSongs, '10 Media Songs (YT/SoundCloud)');
  allSummary.push(...resMedia);

  const resLongest = await benchmarkUrlList(fixtures.longestSongs, '5 Longest Lyrics Songs');
  allSummary.push(...resLongest);

  console.log('\n================ EXTENDED MULTI-CATEGORY BENCHMARK COMPARISON TABLE ================');
  console.table(allSummary);

  // Save report to disk safely
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportData = {
    timestamp: new Date().toISOString(),
    fixturesLastUpdated: fixtures.updatedAt,
    results: allSummary
  };

  const timeReportPath = path.join(reportsDir, `${timestamp}-benchmark.json`);
  const latestReportPath = path.join(reportsDir, `latest-benchmark.json`);

  fs.writeFileSync(timeReportPath, JSON.stringify(reportData, null, 2));
  fs.writeFileSync(latestReportPath, JSON.stringify(reportData, null, 2));

  console.log(`\n💾 Historical report saved to: ${timeReportPath}`);
  console.log(`💾 Latest report updated at: ${latestReportPath}`);
}

main().catch(console.error);
