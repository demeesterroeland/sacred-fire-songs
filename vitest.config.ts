import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    // Single unit-test tree (Epic 5.1, Story 5.1.3). Playwright specs live in
    // e2e/ and run with `npm run test:e2e`, never with Vitest.
    include: ['testing/unit/tests/**/*.test.{ts,tsx,mjs}'],
  },
});
