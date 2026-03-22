import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureResultsDir() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

function saveJson(filename: string, data: unknown) {
  ensureResultsDir();
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('Comprehensive A11Y Audit', () => {
  test.setTimeout(120_000);

  test('page-homepage', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    saveJson('page-homepage.json', issues);
    console.log(`Homepage issues: ${issues.length}`);
  });

  test('page-products', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    saveJson('page-products.json', issues);
    console.log(`Products issues: ${issues.length}`);
  });

  test('page-product-detail', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    saveJson('page-product-detail.json', issues);
    console.log(`Product detail issues: ${issues.length}`);
  });

  test('page-checkout', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate to products, add item to cart, go to checkout
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    saveJson('page-checkout.json', issues);
    console.log(`Checkout issues: ${issues.length}`);
  });

  test('page-order-confirmation', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });
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
    const issues = await evinced.evAnalyze();
    saveJson('page-order-confirmation.json', issues);
    console.log(`Order confirmation issues: ${issues.length}`);
  });
});
