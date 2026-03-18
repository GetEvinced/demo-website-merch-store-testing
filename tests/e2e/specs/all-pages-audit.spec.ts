import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.join(__dirname, '..', '..', '..', 'a11y-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveJson(filename: string, data: unknown) {
  ensureDir(RESULTS_DIR);
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('All Pages Accessibility Audit', () => {
  test('Homepage (/)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('main', { timeout: 15000 });
    // Wait for content to render
    await page.waitForTimeout(2000);
    const issues = await sdk.evAnalyze();
    console.log(`Homepage issues: ${issues.length}`);
    saveJson('homepage.json', issues);
  });

  test('New Products (/shop/new)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const issues = await sdk.evAnalyze();
    console.log(`New Products issues: ${issues.length}`);
    saveJson('new-products.json', issues);
  });

  test('Product Detail (/product/1)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const issues = await sdk.evAnalyze();
    console.log(`Product Detail issues: ${issues.length}`);
    saveJson('product-detail.json', issues);
  });

  test('Checkout - Basket (/checkout)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Add a product to cart first
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15000 });
    await page.waitForTimeout(1000);
    const addToCartBtn = page.locator('button', { hasText: /add to cart/i });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const issues = await sdk.evAnalyze();
    console.log(`Checkout Basket issues: ${issues.length}`);
    saveJson('checkout-basket.json', issues);
  });

  test('Checkout - Shipping (/checkout step 2)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Add a product to cart first
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15000 });
    await page.waitForTimeout(1000);
    const addToCartBtn = page.locator('button', { hasText: /add to cart/i });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15000 });
    await page.waitForTimeout(1000);
    // Proceed to shipping step
    const continueBtn = page.locator('.checkout-continue-btn');
    await continueBtn.click();
    await page.waitForTimeout(2000);
    const issues = await sdk.evAnalyze();
    console.log(`Checkout Shipping issues: ${issues.length}`);
    saveJson('checkout-shipping.json', issues);
  });

  test('Order Confirmation (/order-confirmation)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/order-confirmation');
    await page.waitForSelector('main', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const issues = await sdk.evAnalyze();
    console.log(`Order Confirmation issues: ${issues.length}`);
    saveJson('order-confirmation.json', issues);
  });
});
