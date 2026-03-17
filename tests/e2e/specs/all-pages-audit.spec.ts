import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive accessibility audit for all website pages.
 *
 * Pages covered:
 *   1. Homepage        (/)
 *   2. New Products    (/shop/new)
 *   3. Product Detail  (/product/:id)
 *   4. Checkout        (/checkout) — basket + shipping steps
 *   5. Order Confirm   (/order-confirmation)
 */

const RESULTS_DIR = path.join(__dirname, '..', '..', '..', 'a11y-results');

function ensureResultsDir() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

function saveIssues(filename: string, issues: any[]) {
  ensureResultsDir();
  const filePath = path.join(RESULTS_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(issues, null, 2));
  return filePath;
}

test.describe('All Pages — Evinced A11Y Audit', () => {

  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, #root > *', { timeout: 15000 });
    // Also wait for dynamic content
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    const filePath = saveIssues('homepage-issues.json', issues);
    console.log(`\nHomepage: ${issues.length} issues found → ${filePath}`);
    for (const issue of issues) {
      console.log(`  [${issue.type}] severity=${issue.severity} | ${issue.summary || issue.message || ''}`);
    }
  });

  test('New Products (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    const filePath = saveIssues('new-products-issues.json', issues);
    console.log(`\nNew Products: ${issues.length} issues found → ${filePath}`);
    for (const issue of issues) {
      console.log(`  [${issue.type}] severity=${issue.severity} | ${issue.summary || issue.message || ''}`);
    }
  });

  test('Product Detail (/product/:id)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate to products first to get a real product ID
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15000 });
    const href = await page.locator('.products-grid [role="listitem"] a').first().getAttribute('href');
    const productUrl = href || '/product/1';

    await page.goto(productUrl);
    await page.waitForSelector('h3, .product-detail, [class*="productName"]', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    const filePath = saveIssues('product-detail-issues.json', issues);
    console.log(`\nProduct Detail (${productUrl}): ${issues.length} issues found → ${filePath}`);
    for (const issue of issues) {
      console.log(`  [${issue.type}] severity=${issue.severity} | ${issue.summary || issue.message || ''}`);
    }
  });

  test('Checkout (/checkout) — basket step', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Add item to cart first via the journey, then navigate to checkout
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15000 });
    const firstProduct = page.locator('.products-grid [role="listitem"] a').first();
    await firstProduct.click();
    await page.waitForURL('**/product/**', { timeout: 10000 });
    await page.waitForSelector('h3', { timeout: 10000 });

    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    const filePath = saveIssues('checkout-basket-issues.json', issues);
    console.log(`\nCheckout Basket: ${issues.length} issues found → ${filePath}`);
    for (const issue of issues) {
      console.log(`  [${issue.type}] severity=${issue.severity} | ${issue.summary || issue.message || ''}`);
    }
  });

  test('Checkout (/checkout) — shipping step', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15000 });
    const firstProduct = page.locator('.products-grid [role="listitem"] a').first();
    await firstProduct.click();
    await page.waitForURL('**/product/**', { timeout: 10000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    const filePath = saveIssues('checkout-shipping-issues.json', issues);
    console.log(`\nCheckout Shipping: ${issues.length} issues found → ${filePath}`);
    for (const issue of issues) {
      console.log(`  [${issue.type}] severity=${issue.severity} | ${issue.summary || issue.message || ''}`);
    }
  });

  test('Order Confirmation (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15000 });
    await page.locator('.products-grid [role="listitem"] a').first().click();
    await page.waitForURL('**/product/**', { timeout: 10000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10000 });
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy, Mountain View, CA 94043');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10000 });
    await page.waitForSelector('.confirm-page', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    const filePath = saveIssues('order-confirmation-issues.json', issues);
    console.log(`\nOrder Confirmation: ${issues.length} issues found → ${filePath}`);
    for (const issue of issues) {
      console.log(`  [${issue.type}] severity=${issue.severity} | ${issue.summary || issue.message || ''}`);
    }
  });

});
