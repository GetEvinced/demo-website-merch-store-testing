import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = path.join(__dirname, '..', 'test-results', 'a11y-audit');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

test.describe('Full A11Y Audit – All Pages', () => {
  test.beforeAll(() => {
    ensureDir(OUTPUT_DIR);
  });

  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, #root > *', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();

    const csvPath = path.join(OUTPUT_DIR, 'homepage.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\n[Homepage] Issues found: ${issues.length}`);
    issues.forEach((issue: any) => {
      console.log(`  [${issue.type || issue.severity}] ${issue.summary || issue.message || JSON.stringify(issue).slice(0, 120)}`);
    });
  });

  test('Products page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid, #root > *', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();

    const csvPath = path.join(OUTPUT_DIR, 'products.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\n[Products Page] Issues found: ${issues.length}`);
    issues.forEach((issue: any) => {
      console.log(`  [${issue.type || issue.severity}] ${issue.summary || issue.message || JSON.stringify(issue).slice(0, 120)}`);
    });
  });

  test('Product detail page (/product/1)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-page, #root > *', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();

    const csvPath = path.join(OUTPUT_DIR, 'product-detail.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\n[Product Detail] Issues found: ${issues.length}`);
    issues.forEach((issue: any) => {
      console.log(`  [${issue.type || issue.severity}] ${issue.summary || issue.message || JSON.stringify(issue).slice(0, 120)}`);
    });
  });

  test('Checkout – basket step (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    // Add a product to cart first so checkout is populated
    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-page, #root > *', { timeout: 15_000 });
    await page.waitForTimeout(500);

    // Add to cart
    await page.getByRole('button', { name: 'Add to cart' }).click();

    // Proceed to checkout
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket, #root > *', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();

    const csvPath = path.join(OUTPUT_DIR, 'checkout-basket.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\n[Checkout Basket] Issues found: ${issues.length}`);
    issues.forEach((issue: any) => {
      console.log(`  [${issue.type || issue.severity}] ${issue.summary || issue.message || JSON.stringify(issue).slice(0, 120)}`);
    });
  });

  test('Checkout – shipping step', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-page, #root > *', { timeout: 15_000 });
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket, #root > *', { timeout: 10_000 });

    // Click Continue to go to shipping step
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form, #root > *', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();

    const csvPath = path.join(OUTPUT_DIR, 'checkout-shipping.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\n[Checkout Shipping] Issues found: ${issues.length}`);
    issues.forEach((issue: any) => {
      console.log(`  [${issue.type || issue.severity}] ${issue.summary || issue.message || JSON.stringify(issue).slice(0, 120)}`);
    });
  });

  test('Order confirmation (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-page, #root > *', { timeout: 15_000 });
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket, #root > *', { timeout: 10_000 });

    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });

    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();

    await page.waitForURL('**/order-confirmation', { timeout: 10_000 });
    await page.waitForSelector('.confirm-page, #root > *', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();

    const csvPath = path.join(OUTPUT_DIR, 'order-confirmation.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\n[Order Confirmation] Issues found: ${issues.length}`);
    issues.forEach((issue: any) => {
      console.log(`  [${issue.type || issue.severity}] ${issue.summary || issue.message || JSON.stringify(issue).slice(0, 120)}`);
    });
  });
});
