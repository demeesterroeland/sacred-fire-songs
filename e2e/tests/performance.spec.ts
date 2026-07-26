/**
 * Performance Tests
 * 
 * This test suite includes performance measurements for the Sacred Fire Songs application.
 * 
 * Usage examples:
 * 
 * # Test with demo data (221 songs)
 * npx playwright test --grep @performance
 * 
 * # Test with 500 songs
 * E2E_RANDOM_SEED=1 E2E_RANDOM_SONGS_COUNT=500 npx playwright test --grep @performance
 * 
 * # Test with 1000 songs (stress test)
 * E2E_RANDOM_SEED=1 E2E_RANDOM_SONGS_COUNT=1000 npx playwright test --grep @performance
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { performanceUtils } from '../fixtures/performance';
import { PerformanceResult } from '../fixtures/performance';

// Helper function to clear browser cache
const clearBrowserCache = async (page: any) => {
  try {
    // Attempt to clear cache (this sometimes fails due to security restrictions in Playwright)
    await page.evaluate(() => {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies using document.cookie
      document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
    });
  } catch (error) {
    // If we can't clear cache due to security restrictions, just proceed
    console.warn('Could not clear browser cache - proceeding anyway:', error);
  }
};

// Get git commit hash
const getGitCommit = (): string => {
  try {
    const commit = require('child_process').execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    return commit;
  } catch (error) {
    return 'unknown';
  }
};

// Create results directory
const resultsDir = 'e2e/performance-results';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

test.describe.configure({ mode: 'parallel' });

// Test page load time for /songs page (desktop)
test('@performance Desktop: Time to Load /songs page', async ({ page }) => {
  const startTime = Date.now();
  const gitCommit = getGitCommit();
  
  // Run multiple iterations to get average/median
  const iterations = 3;
  const results: PerformanceResult[] = [];
  
  for (let i = 1; i <= iterations; i++) {
    // Just navigate to page (no explicit cache clearing due to security restrictions)
    await page.goto('/songs', { waitUntil: 'networkidle' });
    
    // Measure performance
    const metrics = await performanceUtils.measurePageLoadTime(page, '/songs');
    
    const result: PerformanceResult = {
      page: '/songs',
      viewport: 'desktop',
      timestamp: new Date().toISOString(),
      metrics,
      gitCommit,
      iteration: i
    };
    
    results.push(result);
    
    // Add assertion to check that metrics are within reasonable thresholds
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(metrics.load).toBeLessThan(3000); // 3 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1000); // 1 second
  }
  
  // Save results to JSON file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-results.json`;
  const fullPath = path.join(resultsDir, filename);
  
  fs.writeFileSync(fullPath, JSON.stringify(results, null, 2));
  
  // Log performance report
  console.log(`Performance results saved to ${fullPath}`);
  
  // Log summary
  const avgDomContentLoaded = results.reduce((sum, r) => sum + r.metrics.domContentLoaded, 0) / results.length;
  const avgLoad = results.reduce((sum, r) => sum + r.metrics.load, 0) / results.length;
  const avgFcp = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
  
  console.log(`Average Performance Metrics:`);
  console.log(`- DOM Content Loaded: ${avgDomContentLoaded.toFixed(2)}ms`);
  console.log(`- Load: ${avgLoad.toFixed(2)}ms`);
  console.log(`- FCP: ${avgFcp.toFixed(2)}ms`);
});

// Test page load time for /songs/[id] page (desktop)
test('@performance Desktop: Time to Load /songs/[id] page', async ({ page }) => {
  const startTime = Date.now();
  const gitCommit = getGitCommit();
  
  // Get a song id from the main songs page first
  await page.goto('/songs');
  const firstSongLink = page.locator('a[href^="/songs/"]').first();
  const songId = await firstSongLink.getAttribute('href');
  
  if (!songId) {
    throw new Error('Could not find a song link on the songs page');
  }
  
  // Run multiple iterations
  const iterations = 3;
  const results: PerformanceResult[] = [];
  
  for (let i = 1; i <= iterations; i++) {
    // Just navigate to page (no explicit cache clearing due to security restrictions)
    await page.goto(songId, { waitUntil: 'networkidle' });
    
    // Measure performance
    const metrics = await performanceUtils.measurePageLoadTime(page, songId);
    
    const result: PerformanceResult = {
      page: `/songs/[id]`,
      viewport: 'desktop',
      timestamp: new Date().toISOString(),
      metrics,
      gitCommit,
      iteration: i
    };
    
    results.push(result);
    
    // Add assertions
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(metrics.load).toBeLessThan(3000); // 3 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1000); // 1 second
  }
  
  // Save results to JSON file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-results.json`;
  const fullPath = path.join(resultsDir, filename);
  
  fs.writeFileSync(fullPath, JSON.stringify(results, null, 2));
  
  // Log performance report
  console.log(`Performance results saved to ${fullPath}`);
  
  // Log summary
  const avgDomContentLoaded = results.reduce((sum, r) => sum + r.metrics.domContentLoaded, 0) / results.length;
  const avgLoad = results.reduce((sum, r) => sum + r.metrics.load, 0) / results.length;
  const avgFcp = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
  
  console.log(`Average Performance Metrics:`);
  console.log(`- DOM Content Loaded: ${avgDomContentLoaded.toFixed(2)}ms`);
  console.log(`- Load: ${avgLoad.toFixed(2)}ms`);
  console.log(`- FCP: ${avgFcp.toFixed(2)}ms`);
});

// Test search interaction performance (desktop)
test('@performance Desktop: Search interaction performance', async ({ page }) => {
  const startTime = Date.now();
  const gitCommit = getGitCommit();
  
  // Go to songs page first
  await page.goto('/songs');
  
  // Run multiple iterations
  const iterations = 3;
  const results: PerformanceResult[] = [];
  
  for (let i = 1; i <= iterations; i++) {
    // Clear browser cache before each test iteration (using workaround)
    await page.evaluate(() => {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies using document.cookie
      document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
    });
    
    // Perform a search
    const searchInput = page.locator('input[placeholder="Search 200+ songs"]');
    await searchInput.click();
    await searchInput.fill('test');
    
    // Wait a bit for results to load
    await page.waitForTimeout(500);
    
    // Measure performance after search
    const metrics = await performanceUtils.measurePageLoadTime(page, '/songs');
    
    const result: PerformanceResult = {
      page: '/songs-search',
      viewport: 'desktop',
      timestamp: new Date().toISOString(),
      metrics,
      gitCommit,
      iteration: i
    };
    
    results.push(result);
    
    // Add assertions
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(metrics.load).toBeLessThan(3000); // 3 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1000); // 1 second
  }
  
  // Save results to JSON file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-results.json`;
  const fullPath = path.join(resultsDir, filename);
  
  fs.writeFileSync(fullPath, JSON.stringify(results, null, 2));
  
  // Log performance report
  console.log(`Performance results saved to ${fullPath}`);
  
  // Log summary
  const avgDomContentLoaded = results.reduce((sum, r) => sum + r.metrics.domContentLoaded, 0) / results.length;
  const avgLoad = results.reduce((sum, r) => sum + r.metrics.load, 0) / results.length;
  const avgFcp = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
  
  console.log(`Average Performance Metrics:`);
  console.log(`- DOM Content Loaded: ${avgDomContentLoaded.toFixed(2)}ms`);
  console.log(`- Load: ${avgLoad.toFixed(2)}ms`);
  console.log(`- FCP: ${avgFcp.toFixed(2)}ms`);
});

// Test filter interaction performance (desktop)
test('@performance Desktop: Filter interaction performance', async ({ page }) => {
  const startTime = Date.now();
  const gitCommit = getGitCommit();
  
  // Go to songs page first
  await page.goto('/songs');
  
  // Run multiple iterations
  const iterations = 3;
  const results: PerformanceResult[] = [];
  
  for (let i = 1; i <= iterations; i++) {
    // Clear browser cache before each test iteration (using workaround)
    await page.evaluate(() => {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies using document.cookie
      document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
    });
    
    // Open filter modal
    const filterBtn = page.locator('button[aria-label="Search options"]');
    await filterBtn.click();
    
    // Wait for modal to open
    await page.waitForTimeout(200);
    
    // Apply some filter (e.g., select first category)
    const firstCategory = page.locator('input[type="checkbox"]').first();
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
    }
    
    // Click "Show results" to apply filters
    const submitBtn = page.locator('button:has-text("Show results")');
    await submitBtn.click();
    
    // Wait for results to load
    await page.waitForTimeout(500);
    
    // Measure performance after filtering
    const metrics = await performanceUtils.measurePageLoadTime(page, '/songs');
    
    const result: PerformanceResult = {
      page: '/songs-filter',
      viewport: 'desktop',
      timestamp: new Date().toISOString(),
      metrics,
      gitCommit,
      iteration: i
    };
    
    results.push(result);
    
    // Add assertions
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(metrics.load).toBeLessThan(3000); // 3 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1000); // 1 second
  }
  
  // Save results to JSON file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-results.json`;
  const fullPath = path.join(resultsDir, filename);
  
  fs.writeFileSync(fullPath, JSON.stringify(results, null, 2));
  
  // Log performance report
  console.log(`Performance results saved to ${fullPath}`);
  
  // Log summary
  const avgDomContentLoaded = results.reduce((sum, r) => sum + r.metrics.domContentLoaded, 0) / results.length;
  const avgLoad = results.reduce((sum, r) => sum + r.metrics.load, 0) / results.length;
  const avgFcp = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
  
  console.log(`Average Performance Metrics:`);
  console.log(`- DOM Content Loaded: ${avgDomContentLoaded.toFixed(2)}ms`);
  console.log(`- Load: ${avgLoad.toFixed(2)}ms`);
  console.log(`- FCP: ${avgFcp.toFixed(2)}ms`);
});

// Test mobile performance for /songs page
test('@performance Mobile: Time to Load /songs page', async ({ page }) => {
  const startTime = Date.now();
  const gitCommit = getGitCommit();
  
  // Run multiple iterations
  const iterations = 3;
  const results: PerformanceResult[] = [];
  
  for (let i = 1; i <= iterations; i++) {
    // Clear browser cache before each test iteration (using workaround)
    await page.evaluate(() => {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies using document.cookie
      document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
    });
    
    // Measure performance
    const metrics = await performanceUtils.measurePageLoadTime(page, '/songs');
    
    const result: PerformanceResult = {
      page: '/songs',
      viewport: 'mobile',
      timestamp: new Date().toISOString(),
      metrics,
      gitCommit,
      iteration: i
    };
    
    results.push(result);
    
    // Add assertion to check that metrics are within reasonable thresholds
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(metrics.load).toBeLessThan(3000); // 3 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1000); // 1 second
  }
  
  // Save results to JSON file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-results.json`;
  const fullPath = path.join(resultsDir, filename);
  
  fs.writeFileSync(fullPath, JSON.stringify(results, null, 2));
  
  // Log performance report
  console.log(`Performance results saved to ${fullPath}`);
  
  // Log summary
  const avgDomContentLoaded = results.reduce((sum, r) => sum + r.metrics.domContentLoaded, 0) / results.length;
  const avgLoad = results.reduce((sum, r) => sum + r.metrics.load, 0) / results.length;
  const avgFcp = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
  
  console.log(`Average Performance Metrics:`);
  console.log(`- DOM Content Loaded: ${avgDomContentLoaded.toFixed(2)}ms`);
  console.log(`- Load: ${avgLoad.toFixed(2)}ms`);
  console.log(`- FCP: ${avgFcp.toFixed(2)}ms`);
});

// Test mobile performance for /songs/[id] page
test('@performance Mobile: Time to Load /songs/[id] page', async ({ page }) => {
  const startTime = Date.now();
  const gitCommit = getGitCommit();
  
  // Get a song id from the main songs page first
  await page.goto('/songs');
  const firstSongLink = page.locator('a[href^="/songs/"]').first();
  const songId = await firstSongLink.getAttribute('href');
  
  if (!songId) {
    throw new Error('Could not find a song link on the songs page');
  }
  
  // Run multiple iterations
  const iterations = 3;
  const results: PerformanceResult[] = [];
  
  for (let i = 1; i <= iterations; i++) {
    // Clear browser cache before each test iteration (using workaround)
    await page.evaluate(() => {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies using document.cookie
      document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
    });
    
    // Measure performance
    const metrics = await performanceUtils.measurePageLoadTime(page, songId);
    
    const result: PerformanceResult = {
      page: `/songs/[id]`,
      viewport: 'mobile',
      timestamp: new Date().toISOString(),
      metrics,
      gitCommit,
      iteration: i
    };
    
    results.push(result);
    
    // Add assertions
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(metrics.load).toBeLessThan(3000); // 3 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1000); // 1 second
  }
  
  // Save results to JSON file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-results.json`;
  const fullPath = path.join(resultsDir, filename);
  
  fs.writeFileSync(fullPath, JSON.stringify(results, null, 2));
  
  // Log performance report
  console.log(`Performance results saved to ${fullPath}`);
  
  // Log summary
  const avgDomContentLoaded = results.reduce((sum, r) => sum + r.metrics.domContentLoaded, 0) / results.length;
  const avgLoad = results.reduce((sum, r) => sum + r.metrics.load, 0) / results.length;
  const avgFcp = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
  
  console.log(`Average Performance Metrics:`);
  console.log(`- DOM Content Loaded: ${avgDomContentLoaded.toFixed(2)}ms`);
  console.log(`- Load: ${avgLoad.toFixed(2)}ms`);
  console.log(`- FCP: ${avgFcp.toFixed(2)}ms`);
});

// Performance test with demo Nina Urku dataset (179 songs)
test.describe('Performance Tests with Larger Datasets', () => {
  test('@performance Demo Dataset: Nina Urku (179 songs)', async ({ page }) => {
    const startTime = Date.now();
    const gitCommit = getGitCommit();
    
    // Get the song count from database (using a simpler approach to avoid cookie issues)
    // Since we can't reliably connect to the database from E2E tests, we'll skip this part for now
    const songCount = 179; // Hardcoded for now
    
    // Run multiple iterations to get average/median
    const iterations = 3;
    const results: PerformanceResult[] = [];
    
    for (let i = 1; i <= iterations; i++) {
      // Clear browser cache before each test iteration (using workaround)
      await page.evaluate(() => {
        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        // Clear cookies using document.cookie
        document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
      });
      
      // Measure performance
      const metrics = await performanceUtils.measurePageLoadTime(page, '/songs');
      
      const result: PerformanceResult = {
        page: '/songs',
        viewport: 'desktop',
        timestamp: new Date().toISOString(),
        metrics,
        gitCommit,
        iteration: i,
        songCount: songCount,
        seedMode: 'demo',
        testMode: 'baseline'
      };
      
      results.push(result);
      
      // Add assertion to check that metrics are within reasonable thresholds
      expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds for larger dataset
      expect(metrics.load).toBeLessThan(5000); // 5 seconds for larger dataset
      expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds for larger dataset
    }
    
    // Save results to JSON file with song count and metadata
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-demo-dataset-results.json`;
    const fullPath = path.join(resultsDir, filename);
    
    fs.writeFileSync(fullPath, JSON.stringify(results, null, 2));
    
    // Log performance report
    console.log(`Performance results saved to ${fullPath}`);
    
    // Log summary
    const avgDomContentLoaded = results.reduce((sum, r) => sum + r.metrics.domContentLoaded, 0) / results.length;
    const avgLoad = results.reduce((sum, r) => sum + r.metrics.load, 0) / results.length;
    const avgFcp = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
    
    console.log(`Performance with ${songCount} songs (${results[0].seedMode} dataset):`);
    console.log(`- DOM Content Loaded: ${avgDomContentLoaded.toFixed(2)}ms`);
    console.log(`- Load: ${avgLoad.toFixed(2)}ms`);
    console.log(`- FCP: ${avgFcp.toFixed(2)}ms`);
  });

  // Performance test with custom dataset size
  test('@performance Custom Dataset: Random songs count', async ({ page }) => {
    const startTime = Date.now();
    const gitCommit = getGitCommit();
    
    // Get the song count from environment variable or default to 221
    const customSongCount = parseInt(process.env.E2E_RANDOM_SONGS_COUNT || '221', 10);
    const seedMode = process.env.E2E_RANDOM_SEED === '1' ? 'random' : 'custom';
    const testMode = customSongCount > 500 ? 'stress' : 'baseline';
    
    // Since we can't reliably connect to the database from E2E tests, we'll use the environment variable
    const songCount = customSongCount;
    
    // Run multiple iterations to get average/median
    const iterations = 3;
    const results: PerformanceResult[] = [];
    
    for (let i = 1; i <= iterations; i++) {
      // Clear browser cache before each test iteration (using workaround)
      await page.evaluate(() => {
        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        // Clear cookies using document.cookie
        document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
      });
      
      // Measure performance
      const metrics = await performanceUtils.measurePageLoadTime(page, '/songs');
      
      const result: PerformanceResult = {
        page: '/songs',
        viewport: 'desktop',
        timestamp: new Date().toISOString(),
        metrics,
        gitCommit,
        iteration: i,
        songCount: songCount,
        seedMode: seedMode,
        testMode: testMode
      };
      
      results.push(result);
      
      // Add assertions based on dataset size
      if (testMode === 'stress') {
        expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds for stress test
        expect(metrics.load).toBeLessThan(8000); // 8 seconds for stress test
        expect(metrics.firstContentfulPaint).toBeLessThan(3000); // 3 seconds for stress test
      } else {
        expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds for baseline
        expect(metrics.load).toBeLessThan(5000); // 5 seconds for baseline
        expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds for baseline
      }
    }
    
    // Save results to JSON file with song count and metadata
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-custom-dataset-results.json`;
    const fullPath = path.join(resultsDir, filename);
    
    fs.writeFileSync(fullPath, JSON.stringify(results, null, 2));
    
    // Log performance report
    console.log(`Performance results saved to ${fullPath}`);
    
    // Log summary
    const avgDomContentLoaded = results.reduce((sum, r) => sum + r.metrics.domContentLoaded, 0) / results.length;
    const avgLoad = results.reduce((sum, r) => sum + r.metrics.load, 0) / results.length;
    const avgFcp = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
    
    console.log(`Performance with ${songCount} songs (${results[0].seedMode} dataset, ${results[0].testMode} test):`);
    console.log(`- DOM Content Loaded: ${avgDomContentLoaded.toFixed(2)}ms`);
    console.log(`- Load: ${avgLoad.toFixed(2)}ms`);
    console.log(`- FCP: ${avgFcp.toFixed(2)}ms`);
  });
});