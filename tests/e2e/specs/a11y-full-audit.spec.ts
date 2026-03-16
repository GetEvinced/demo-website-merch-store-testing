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

test.describe('Demo website – full a11y audit (all pages)', () => {

  test('Homepage (/) – a11y scan', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);

    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });

    const issues = await evinced.evAnalyze();

    const jsonPath = path.join(RESULTS_DIR, 'homepage-issues.json');
    await evinced.evSaveFile(issues, 'json', jsonPath);

    console.log(`\n[Homepage] issues: ${issues.length}`);
    console.log(`  JSON report: ${jsonPath}`);
  });

  test('Products page (/shop/new) – a11y scan', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const issues = await evinced.evAnalyze();

    const jsonPath = path.join(RESULTS_DIR, 'products-issues.json');
    await evinced.evSaveFile(issues, 'json', jsonPath);

    console.log(`\n[Products] issues: ${issues.length}`);
  });

  test('Product detail page (/product/:id) – a11y scan', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });

    const issues = await evinced.evAnalyze();

    const jsonPath = path.join(RESULTS_DIR, 'product-detail-issues.json');
    await evinced.evSaveFile(issues, 'json', jsonPath);

    console.log(`\n[Product Detail] issues: ${issues.length}`);
  });

  test('Checkout page (/checkout) – basket step – a11y scan', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);

    // Navigate and add product to cart
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });

    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    const issues = await evinced.evAnalyze();

    const jsonPath = path.join(RESULTS_DIR, 'checkout-basket-issues.json');
    await evinced.evSaveFile(issues, 'json', jsonPath);

    console.log(`\n[Checkout Basket] issues: ${issues.length}`);
  });

  test('Checkout page (/checkout) – shipping step – a11y scan', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);

    // Navigate and add product to cart
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });

    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    // Move to shipping step
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });

    const issues = await evinced.evAnalyze();

    const jsonPath = path.join(RESULTS_DIR, 'checkout-shipping-issues.json');
    await evinced.evSaveFile(issues, 'json', jsonPath);

    console.log(`\n[Checkout Shipping] issues: ${issues.length}`);
  });

  test('Order confirmation page (/order-confirmation) – a11y scan', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);

    // Complete full checkout flow to reach order confirmation
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
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

    const jsonPath = path.join(RESULTS_DIR, 'order-confirmation-issues.json');
    await evinced.evSaveFile(issues, 'json', jsonPath);

    console.log(`\n[Order Confirmation] issues: ${issues.length}`);
  });
});
