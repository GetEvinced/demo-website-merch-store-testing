import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for axe-core based accessibility audit.
 * Does not require Evinced SDK credentials.
 */
export default defineConfig({
  testDir: './specs',
  testMatch: '**/a11y-all-pages-audit.spec.ts',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  reporter: [['html', { outputFolder: 'playwright-report-axe', open: 'never' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  outputDir: 'test-results',
});
