import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveJson(filename: string, data: unknown) {
  ensureDir(RESULTS_DIR);
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('Demo website – per-page a11y audit', () => {
  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evAnalyze();
    saveJson('audit-homepage.json', issues);
    console.log(`Homepage issues: ${issues.length}`);
  });

  test('Shop New (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evAnalyze();
    saveJson('audit-shop-new.json', issues);
    console.log(`ShopNew issues: ${issues.length}`);
  });

  test('Product Detail (/product/1)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-name', { timeout: 15_000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evAnalyze();
    saveJson('audit-product-detail.json', issues);
    console.log(`ProductDetail issues: ${issues.length}`);
  });

  test('Cart Modal (/ with open cart)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('button[aria-label="Add to cart"], button', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    // add to cart
    const addBtn = page.getByRole('button', { name: /add to cart/i });
    await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await addBtn.click();
    await page.waitForTimeout(1500);
    const issues = await evinced.evAnalyze();
    saveJson('audit-cart-modal.json', issues);
    console.log(`CartModal issues: ${issues.length}`);
  });

  test('Checkout (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Add item first then navigate
    await page.goto('/product/1');
    await page.waitForSelector('button', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    const addBtn = page.getByRole('button', { name: /add to cart/i });
    await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await addBtn.click();
    await page.waitForTimeout(1000);
    await page.goto('/checkout');
    await page.waitForSelector('.checkout-basket, .checkout-page', { timeout: 15_000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evAnalyze();
    saveJson('audit-checkout.json', issues);
    console.log(`Checkout issues: ${issues.length}`);
  });

  test('Order Confirmation (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/order-confirmation');
    await page.waitForSelector('.confirm-page, body', { timeout: 15_000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evAnalyze();
    saveJson('audit-order-confirmation.json', issues);
    console.log(`OrderConfirmation issues: ${issues.length}`);
  });
});
