import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive accessibility audit for all pages of the demo website.
 *
 * Pages audited:
 *  1. Homepage  (/)
 *  2. Products listing page  (/shop/new)  — includes combobox + nav scans
 *  3. Product detail page  (/product/1)
 *  4. Checkout – basket step  (/checkout, step 1)
 *  5. Checkout – shipping step  (/checkout, step 2)
 *  6. Order confirmation  (/order-confirmation)
 *
 * Results are saved as:
 *  - Individual JSON files per page in tests/e2e/test-results/
 *  - A merged summary JSON with all issues across all pages
 */

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

test.describe('Demo website – full site accessibility audit', () => {
  test('a11y audit: homepage (/)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze() as any[];

    const reportPath = path.join(RESULTS_DIR, 'a11y-homepage.json');
    await evinced.evSaveFile(issues, 'json', reportPath);

    console.log(`\n[Homepage] Issues found: ${issues.length}`);
  });

  test('a11y audit: products listing (/shop/new)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const pageIssues = await evinced.evAnalyze() as any[];

    const comboboxIssues = await evinced.components.analyzeCombobox({
      selector: '.sort-btn',
    }) as any[];

    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    }) as any[];

    const allIssues = await evinced.evMergeIssues(pageIssues, comboboxIssues, navIssues);

    const reportPath = path.join(RESULTS_DIR, 'a11y-products.json');
    await evinced.evSaveFile(allIssues, 'json', reportPath);

    console.log(`\n[Products] Issues found: ${(allIssues as any[]).length} (page: ${pageIssues.length}, combobox: ${comboboxIssues.length}, nav: ${navIssues.length})`);
  });

  test('a11y audit: product detail (/product/1)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-detail', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze() as any[];

    const reportPath = path.join(RESULTS_DIR, 'a11y-product-detail.json');
    await evinced.evSaveFile(issues, 'json', reportPath);

    console.log(`\n[Product Detail] Issues found: ${issues.length}`);
  });

  test('a11y audit: checkout – basket step (/checkout step 1)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    // Navigate to product and add to cart first
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze() as any[];

    const reportPath = path.join(RESULTS_DIR, 'a11y-checkout-basket.json');
    await evinced.evSaveFile(issues, 'json', reportPath);

    console.log(`\n[Checkout Basket] Issues found: ${issues.length}`);
  });

  test('a11y audit: checkout – shipping step (/checkout step 2)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    // Navigate to product, add to cart, go to checkout basket, then continue
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze() as any[];

    const reportPath = path.join(RESULTS_DIR, 'a11y-checkout-shipping.json');
    await evinced.evSaveFile(issues, 'json', reportPath);

    console.log(`\n[Checkout Shipping] Issues found: ${issues.length}`);
  });

  test('a11y audit: order confirmation (/order-confirmation)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    // Full journey to reach order confirmation
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy, Mountain View, CA 94043');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10_000 });
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze() as any[];

    const reportPath = path.join(RESULTS_DIR, 'a11y-order-confirmation.json');
    await evinced.evSaveFile(issues, 'json', reportPath);

    console.log(`\n[Order Confirmation] Issues found: ${issues.length}`);
  });
});
