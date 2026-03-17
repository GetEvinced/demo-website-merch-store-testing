import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

test.setTimeout(120_000);

test.describe('Accessibility Audit – All Pages', () => {

  test('Homepage (/)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const json = JSON.stringify(issues, null, 2);
    fs.writeFileSync(path.join(RESULTS_DIR, 'homepage.json'), json);
    console.log(`Homepage issues: ${issues.length}`);
    expect(issues).toBeDefined();
  });

  test('Products Page (/shop/new)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const json = JSON.stringify(issues, null, 2);
    fs.writeFileSync(path.join(RESULTS_DIR, 'products.json'), json);
    console.log(`Products issues: ${issues.length}`);
    expect(issues).toBeDefined();
  });

  test('Product Detail Page (/product/:id)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstProductLink = page.locator('.product-card-image-link').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const json = JSON.stringify(issues, null, 2);
    fs.writeFileSync(path.join(RESULTS_DIR, 'product-detail.json'), json);
    console.log(`Product Detail issues: ${issues.length}`);
    expect(issues).toBeDefined();
  });

  test('Checkout – Basket Step (/checkout step 1)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstProductLink = page.locator('.product-card-image-link').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const json = JSON.stringify(issues, null, 2);
    fs.writeFileSync(path.join(RESULTS_DIR, 'checkout-basket.json'), json);
    console.log(`Checkout Basket issues: ${issues.length}`);
    expect(issues).toBeDefined();
  });

  test('Checkout – Shipping Step (/checkout step 2)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstProductLink = page.locator('.product-card-image-link').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn').click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const json = JSON.stringify(issues, null, 2);
    fs.writeFileSync(path.join(RESULTS_DIR, 'checkout-shipping.json'), json);
    console.log(`Checkout Shipping issues: ${issues.length}`);
    expect(issues).toBeDefined();
  });

  test('Order Confirmation (/order-confirmation)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstProductLink = page.locator('.product-card-image-link').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn').click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy, Mountain View, CA 94043');
    await page.fill('#cardNumber', '4111111111111111');
    await page.fill('#expirationDate', '12/28');
    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 30_000 });
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const json = JSON.stringify(issues, null, 2);
    fs.writeFileSync(path.join(RESULTS_DIR, 'order-confirmation.json'), json);
    console.log(`Order Confirmation issues: ${issues.length}`);
    expect(issues).toBeDefined();
  });

});
