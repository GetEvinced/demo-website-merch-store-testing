import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const PAGES = [
  { name: 'Homepage', url: '/', waitFor: '.hero-banner' },
  { name: 'Products (New)', url: '/shop/new', waitFor: '.products-grid' },
  { name: 'Product Detail', url: '/product/1', waitFor: '.product-detail' },
  { name: 'Checkout', url: '/checkout', waitFor: '.checkout-page' },
  { name: 'Order Confirmation', url: '/order-confirmation', waitFor: '.order-confirmation' },
];

const resultsDir = path.join(__dirname, '..', 'test-results');

test.beforeAll(() => {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
});

for (const pageConfig of PAGES) {
  test(`a11y audit: ${pageConfig.name}`, async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await page.goto(pageConfig.url, { waitUntil: 'networkidle' });
    try {
      await page.waitForSelector(pageConfig.waitFor, { timeout: 10000 });
    } catch {
      // Continue even if selector not found
    }

    const issues = await evinced.evAnalyze();

    const safeName = pageConfig.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const jsonPath = path.join(resultsDir, `page-${safeName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify({ page: pageConfig.name, url: pageConfig.url, issues }, null, 2));

    console.log(`\n[${pageConfig.name}] Issues found: ${issues.length}`);
    const bySeverity: Record<string, number> = {};
    for (const issue of issues) {
      const sev = (issue as any).severity?.id ?? 'UNKNOWN';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
    }
    for (const [sev, count] of Object.entries(bySeverity)) {
      console.log(`  ${sev}: ${count}`);
    }
  });
}
