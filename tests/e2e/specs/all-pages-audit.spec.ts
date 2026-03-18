import { test, chromium } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.resolve(__dirname, '../../../a11y-results');
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

function saveResults(name: string, results: unknown): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${name}.json`),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log(`Saved ${name}.json (${Array.isArray(results) ? results.length : 'N/A'} issues)`);
}

test.describe('All Pages Accessibility Audit', () => {
  test('Homepage audit', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await sdk.evStart();
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('main, #root > *', { timeout: 10000 });
    await page.waitForTimeout(1500);
    const results = await sdk.evAnalyze();
    await sdk.evStop();
    saveResults('homepage', results);
  });

  test('New Products page audit', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await sdk.evStart();
    await page.goto(`${BASE_URL}/shop/new`);
    await page.waitForSelector('main, .new-page, [class*="new"]', { timeout: 10000 });
    await page.waitForTimeout(1500);
    const results = await sdk.evAnalyze();
    await sdk.evStop();
    saveResults('new-products', results);
  });

  test('Product Detail page audit', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await sdk.evStart();
    await page.goto(`${BASE_URL}/product/1`);
    await page.waitForSelector('main', { timeout: 10000 });
    await page.waitForTimeout(1500);
    const results = await sdk.evAnalyze();
    await sdk.evStop();
    saveResults('product-detail', results);
  });

  test('Checkout Basket audit', async ({ page }) => {
    // Add product to cart first
    await page.goto(`${BASE_URL}/product/1`);
    await page.waitForSelector('main', { timeout: 10000 });
    await page.waitForTimeout(1000);
    const addToCartBtn = page.locator('button', { hasText: /add to cart/i });
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    const sdk = new EvincedSDK(page);
    await sdk.evStart();
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForSelector('.checkout-page, main, [class*="checkout"]', { timeout: 10000 });
    await page.waitForTimeout(1500);
    const results = await sdk.evAnalyze();
    await sdk.evStop();
    saveResults('checkout-basket', results);
  });

  test('Checkout Shipping audit', async ({ page }) => {
    // Add product to cart first
    await page.goto(`${BASE_URL}/product/1`);
    await page.waitForSelector('main', { timeout: 10000 });
    await page.waitForTimeout(1000);
    const addToCartBtn = page.locator('button', { hasText: /add to cart/i });
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForSelector('.checkout-page, main, [class*="checkout"]', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Proceed to shipping step
    const continueBtn = page.locator('.checkout-continue-btn, button', { hasText: /continue|proceed|next/i }).first();
    await continueBtn.click();
    await page.waitForTimeout(1500);

    const sdk = new EvincedSDK(page);
    await sdk.evStart();
    await page.waitForTimeout(1000);
    const results = await sdk.evAnalyze();
    await sdk.evStop();
    saveResults('checkout-shipping', results);
  });

  test('Order Confirmation page audit', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await sdk.evStart();
    await page.goto(`${BASE_URL}/order-confirmation`);
    await page.waitForSelector('main, [class*="order"], [class*="confirmation"]', { timeout: 10000 });
    await page.waitForTimeout(1500);
    const results = await sdk.evAnalyze();
    await sdk.evStop();
    saveResults('order-confirmation', results);
  });
});
