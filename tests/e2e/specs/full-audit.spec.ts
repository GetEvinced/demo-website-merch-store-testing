import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive per-page accessibility audit for all 5 routes.
 * Saves JSON results for report generation.
 */

const PAGES = [
  { name: 'Home Page', path: '/', waitFor: '.hero-banner, .header-nav' },
  { name: 'New / Shop Page', path: '/shop/new', waitFor: '.products-grid' },
  { name: 'Checkout Page', path: '/checkout', waitFor: '.checkout-basket' },
  { name: 'Order Confirmation Page', path: '/order-confirmation', waitFor: 'body' },
];

test.describe('Per-page accessibility audit', () => {
  test('scan each page individually', async ({ page }) => {
    const allResults: Record<string, unknown>[] = [];

    for (const pageInfo of PAGES) {
      const evinced = new EvincedSDK(page);
      await page.goto(pageInfo.path);
      await page.waitForSelector(pageInfo.waitFor, { timeout: 15_000 });

      const issues = await evinced.evAnalyze();

      const serialized = issues.map((issue: Record<string, unknown>) => ({
        ...issue,
        page: pageInfo.name,
        pageUrl: pageInfo.path,
      }));

      allResults.push(...serialized);
      console.log(`\n[${pageInfo.name}] Issues found: ${issues.length}`);
    }

    // Also scan a product page by clicking from the shop
    {
      const evinced = new EvincedSDK(page);
      await page.goto('/shop/new');
      await page.waitForSelector('.products-grid', { timeout: 15_000 });
      const firstLink = page.locator('.products-grid [role="listitem"] a').first();
      await firstLink.waitFor({ state: 'visible', timeout: 10_000 });
      await firstLink.click();
      await page.waitForURL('**/product/**', { timeout: 10_000 });
      await page.waitForSelector('h3', { timeout: 10_000 });

      const issues = await evinced.evAnalyze();
      const productUrl = page.url();

      const serialized = issues.map((issue: Record<string, unknown>) => ({
        ...issue,
        page: 'Product Detail Page',
        pageUrl: productUrl,
      }));
      allResults.push(...serialized);
      console.log(`\n[Product Detail Page] Issues found: ${issues.length}`);
    }

    const outputDir = path.join(__dirname, '..', 'test-results');
    fs.mkdirSync(outputDir, { recursive: true });
    const jsonPath = path.join(outputDir, 'all-pages-audit.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2));
    console.log(`\n✅ JSON audit saved to: ${jsonPath}`);
    console.log(`   Total issues: ${allResults.length}`);
  });
});
