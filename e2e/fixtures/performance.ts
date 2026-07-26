import { Page } from '@playwright/test';

export interface PerformanceMetrics {
  ttfb: number;
  firstContentfulPaint: number;
  domContentLoaded: number;
  load: number;
}

export interface PerformanceResult {
  page: string;
  viewport: 'desktop' | 'mobile';
  timestamp: string;
  metrics: PerformanceMetrics;
  gitCommit: string;
  iteration: number;
}

export const performanceUtils = {
  async measurePageLoadTime(page: Page, pageName: string): Promise<PerformanceMetrics> {
    const timingJson = await page.evaluate(() => {
      const navEntries = performance.getEntriesByType('navigation');
      const perf = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming) : null;
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(p => p.name === 'first-contentful-paint');

      const ttfb = perf && perf.responseStart > 0 && perf.requestStart > 0
        ? Math.max(0, Math.round(perf.responseStart - perf.requestStart))
        : 0;

      const domContentLoaded = perf && perf.domContentLoadedEventEnd > 0
        ? Math.max(0, Math.round(perf.domContentLoadedEventEnd - perf.startTime))
        : 0;

      const load = perf && perf.loadEventEnd > 0
        ? Math.max(0, Math.round(perf.loadEventEnd - perf.startTime))
        : 0;

      const firstContentfulPaint = fcp ? Math.round(fcp.startTime) : 0;

      return { ttfb, firstContentfulPaint, domContentLoaded, load };
    });

    return timingJson;
  }
};
