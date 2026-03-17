import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = path.join('/workspace', 'a11y-results');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

test.describe('All Pages Accessibility Audit', () => {

  test('Homepage (/)', async ({ page }) => {
    ensureOutputDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const outputPath = path.join(OUTPUT_DIR, 'homepage.json');
    fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
    console.log(`Homepage: ${issues.length} issues → ${outputPath}`);
  });

  test('Products Page (/shop/new)', async ({ page }) => {
    ensureOutputDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const outputPath = path.join(OUTPUT_DIR, 'products-page.json');
    fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
    console.log(`Products Page: ${issues.length} issues → ${outputPath}`);
  });

  test('Product Detail (/product/1)', async ({ page }) => {
    ensureOutputDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-name', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const outputPath = path.join(OUTPUT_DIR, 'product-detail.json');
    fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
    console.log(`Product Detail: ${issues.length} issues → ${outputPath}`);
  });

  test('Checkout - Basket Step (/checkout)', async ({ page }) => {
    ensureOutputDir();
    // Add item to cart first
    await page.goto('/product/1');
    await page.waitForSelector('button', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.waitForTimeout(2000);

    const evinced = new EvincedSDK(page);
    const issues = await evinced.evAnalyze();
    const outputPath = path.join(OUTPUT_DIR, 'checkout-basket.json');
    fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
    console.log(`Checkout Basket: ${issues.length} issues → ${outputPath}`);
  });

  test('Checkout - Shipping Step', async ({ page }) => {
    ensureOutputDir();
    // Add item to cart first
    await page.goto('/product/1');
    await page.waitForSelector('button', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    await page.waitForTimeout(2000);

    const evinced = new EvincedSDK(page);
    const issues = await evinced.evAnalyze();
    const outputPath = path.join(OUTPUT_DIR, 'checkout-shipping.json');
    fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
    console.log(`Checkout Shipping: ${issues.length} issues → ${outputPath}`);
  });

  test('Order Confirmation (/order-confirmation)', async ({ page }) => {
    ensureOutputDir();
    // Navigate through the full purchase flow
    await page.goto('/product/1');
    await page.waitForSelector('button', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10_000 });
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });
    await page.waitForTimeout(2000);

    const evinced = new EvincedSDK(page);
    const issues = await evinced.evAnalyze();
    const outputPath = path.join(OUTPUT_DIR, 'order-confirmation.json');
    fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
    console.log(`Order Confirmation: ${issues.length} issues → ${outputPath}`);
  });

});
