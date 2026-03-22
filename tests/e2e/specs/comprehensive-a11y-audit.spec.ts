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

test.describe('Comprehensive A11Y Audit – all pages', () => {
  test.setTimeout(120_000);

  test('Homepage (/)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav, #main-content', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const issues = await sdk.evAnalyze();
    saveJson('page-homepage.json', issues);
    console.log(`Homepage: ${issues.length} issues`);
  });

  test('Products page (/shop/new)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const issues = await sdk.evAnalyze();
    saveJson('page-products.json', issues);
    console.log(`Products: ${issues.length} issues`);
  });

  test('Product Detail (/product/1)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-page, .product-detail', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const issues = await sdk.evAnalyze();
    saveJson('page-product-detail.json', issues);
    console.log(`Product Detail: ${issues.length} issues`);
  });

  test('Checkout page (/checkout)', async ({ page }) => {
    const sdk = new EvincedSDK(page);

    // Navigate to a product and add to cart to reach checkout
    await page.goto('/product/1');
    await page.waitForSelector('button', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    // Click "ADD TO CART"
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    // Click "Proceed to Checkout"
    await page.getByRole('button', { name: /proceed to checkout/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.waitForTimeout(1500);

    const issues = await sdk.evAnalyze();
    saveJson('page-checkout.json', issues);
    console.log(`Checkout: ${issues.length} issues`);
  });

  test('Order Confirmation (/order-confirmation)', async ({ page }) => {
    const sdk = new EvincedSDK(page);

    // Navigate through the full purchase flow to reach order confirmation
    await page.goto('/product/1');
    await page.waitForSelector('button', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /proceed to checkout/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    // Continue to shipping step
    await page.locator('.checkout-continue-btn').click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });

    // Fill in form
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '123 Main St, Springfield, CA 94000');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');

    // Submit
    await page.getByRole('button', { name: /ship it/i }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 15_000 });
    await page.waitForSelector('.confirm-page, #main-content', { timeout: 10_000 });
    await page.waitForTimeout(1500);

    const issues = await sdk.evAnalyze();
    saveJson('page-order-confirmation.json', issues);
    console.log(`Order Confirmation: ${issues.length} issues`);
  });
});
