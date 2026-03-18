import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.resolve(__dirname, '../../../a11y-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveJson(filename: string, data: unknown) {
  ensureDir(RESULTS_DIR);
  const filepath = path.join(RESULTS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Saved: ${filepath}`);
}

test.describe('Per-page a11y audit (Evinced SDK)', () => {
  test('homepage (/)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15000 });
    const results = await sdk.evAnalyze();
    saveJson('homepage.json', results);
    const count = Array.isArray(results) ? results.length : results.failedValidations?.length ?? 0;
    console.log(`Homepage issues: ${count}`);
  });

  test('new products page (/shop/new)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15000 });
    const results = await sdk.evAnalyze();
    saveJson('new-products.json', results);
    const count = Array.isArray(results) ? results.length : results.failedValidations?.length ?? 0;
    console.log(`New Products issues: ${count}`);
  });

  test('product detail page (/product/1)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15000 });
    const results = await sdk.evAnalyze();
    saveJson('product-detail.json', results);
    const count = Array.isArray(results) ? results.length : results.failedValidations?.length ?? 0;
    console.log(`Product Detail issues: ${count}`);
  });

  test('checkout basket (/checkout) – basket state', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Must add a product to cart first so checkout is populated
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    const results = await sdk.evAnalyze();
    saveJson('checkout-basket.json', results);
    const count = Array.isArray(results) ? results.length : results.failedValidations?.length ?? 0;
    console.log(`Checkout Basket issues: ${count}`);
  });

  test('checkout shipping (/checkout) – shipping state', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10000 });
    const results = await sdk.evAnalyze();
    saveJson('checkout-shipping.json', results);
    const count = Array.isArray(results) ? results.length : results.failedValidations?.length ?? 0;
    console.log(`Checkout Shipping issues: ${count}`);
  });

  test('order confirmation page (/order-confirmation)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Navigate through full purchase to reach order confirmation
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10000 });
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10000 });
    await page.waitForSelector('.confirm-page', { timeout: 10000 });
    const results = await sdk.evAnalyze();
    saveJson('order-confirmation.json', results);
    const count = Array.isArray(results) ? results.length : results.failedValidations?.length ?? 0;
    console.log(`Order Confirmation issues: ${count}`);
  });
});
