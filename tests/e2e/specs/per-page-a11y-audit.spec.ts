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
  const filePath = path.join(RESULTS_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved: ${filePath}`);
}

test.describe('Per-page a11y audit', () => {
  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const issuesArr = Array.isArray(issues) ? issues : (issues as any).report ?? [];
    saveJson('page-homepage.json', issuesArr);
    console.log(`Homepage issues: ${issuesArr.length}`);
  });

  test('Products page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const issuesArr = Array.isArray(issues) ? issues : (issues as any).report ?? [];
    saveJson('page-products.json', issuesArr);
    console.log(`Products page issues: ${issuesArr.length}`);
  });

  test('Product detail (/product/:id)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate to products page first to find a real product ID
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const issuesArr = Array.isArray(issues) ? issues : (issues as any).report ?? [];
    saveJson('page-product-detail.json', issuesArr);
    console.log(`Product detail issues: ${issuesArr.length}`);
  });

  test('Checkout page (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate through the flow to reach checkout
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const issuesArr = Array.isArray(issues) ? issues : (issues as any).report ?? [];
    saveJson('page-checkout.json', issuesArr);
    console.log(`Checkout issues: ${issuesArr.length}`);
  });

  test('Order confirmation (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate through the full purchase flow
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstLink.waitFor({ state: 'visible', timeout: 10_000 });
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
    const issuesArr = Array.isArray(issues) ? issues : (issues as any).report ?? [];
    saveJson('page-order-confirmation.json', issuesArr);
    console.log(`Order confirmation issues: ${issuesArr.length}`);
  });
});
