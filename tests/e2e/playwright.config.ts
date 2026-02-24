import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for demo-website e2e accessibility tests.
 *
 * Prerequisites:
 *   - Set EVINCED_SERVICE_ID and EVINCED_API_KEY environment variables
 *     (or EVINCED_AUTH_TOKEN for offline mode) before running.
 *   - Start the demo-website dev server: `npm start` in the demo-website root.
 *     The server must be running at http://localhost:8080 (or set BASE_URL env var).
 *
 * Run tests:
 *   cd tests/e2e && npm install && npx playwright install chromium && npm test
 */
export default defineConfig({
  testDir: './specs',

  /* Run tests sequentially — accessibility scans are stateful */
  fullyParallel: false,

  /* Fail the build on CI if test.only is accidentally left in source */
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 1 : 0,
  workers: 1,

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],

  use: {
    /* Base URL of the running demo-website dev server */
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

    /* Keep a trace on first retry to ease debugging */
    trace: 'on-first-retry',

    /* Capture screenshots on test failure */
    screenshot: 'only-on-failure',

    /* Viewport that matches a typical desktop browser */
    viewport: { width: 1280, height: 800 },
  },

  /* Authenticate Evinced SDK once before all tests */
  globalSetup: path.resolve(__dirname, 'global-setup.ts'),

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Output folder for Evinced HTML reports and other test artefacts */
  outputDir: 'test-results',
});
