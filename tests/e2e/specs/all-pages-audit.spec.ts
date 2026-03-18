import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = path.join('/workspace', 'a11y-results');

test.beforeAll(() => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
});

async function saveJson(evinced: EvincedSDK, issues: unknown[], filename: string) {
  const dest = path.join(OUTPUT_DIR, filename);
  await evinced.evSaveFile(issues as never, 'json', dest);
  console.log(`Saved: ${dest} (${(issues as unknown[]).length} issues)`);
}

test.describe('All-pages accessibility audit', () => {
  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    const issues = await evinced.evAnalyze();
    await saveJson(evinced, issues as never[], 'homepage.json');
    console.log(`Homepage issues: ${(issues as unknown[]).length}`);
  });

  test('New Products page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    const issues = await evinced.evAnalyze();
    await saveJson(evinced, issues as never[], 'new-products.json');
    console.log(`New Products issues: ${(issues as unknown[]).length}`);
  });

  test('Product Detail page (/product/1)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    const issues = await evinced.evAnalyze();
    await saveJson(evinced, issues as never[], 'product-detail.json');
    console.log(`Product Detail issues: ${(issues as unknown[]).length}`);
  });

  test('Checkout - Basket step (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Add a product to cart first
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15_000 });
    await page.waitForTimeout(500);
    const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
    await addToCartBtn.click();
    await page.waitForTimeout(500);
    // Close cart modal if open
    const closeBtn = page.locator('.closeBtn').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    const issues = await evinced.evAnalyze();
    await saveJson(evinced, issues as never[], 'checkout-basket.json');
    console.log(`Checkout Basket issues: ${(issues as unknown[]).length}`);
  });

  test('Checkout - Shipping step (/checkout step 2)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Add a product to cart first
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15_000 });
    await page.waitForTimeout(500);
    const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
    await addToCartBtn.click();
    await page.waitForTimeout(500);
    const closeBtn = page.locator('.closeBtn').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15_000 });
    await page.waitForTimeout(500);
    // Click continue to shipping step
    const continueBtn = page.locator('.checkout-continue-btn').first();
    await continueBtn.click();
    await page.waitForTimeout(1000);
    const issues = await evinced.evAnalyze();
    await saveJson(evinced, issues as never[], 'checkout-shipping.json');
    console.log(`Checkout Shipping issues: ${(issues as unknown[]).length}`);
  });

  test('Order Confirmation (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/order-confirmation');
    await page.waitForSelector('main', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    const issues = await evinced.evAnalyze();
    await saveJson(evinced, issues as never[], 'order-confirmation.json');
    console.log(`Order Confirmation issues: ${(issues as unknown[]).length}`);
  });
});
