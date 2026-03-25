import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Full accessibility audit of all pages in the demo e-commerce website.
 *
 * Pages audited:
 *   1. Home            /
 *   2. New (products)  /shop/new
 *   3. Product detail  /product/:id  (uses first product from listing)
 *   4. Checkout        /checkout     (requires an item in cart first)
 *   5. Order confirm   /order-confirmation (requires full checkout flow)
 */
test.describe('Full site accessibility audit – all pages', () => {
  test('audit: Home page (/)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(RESULTS_DIR, 'a11y-home-page.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`\n[Home /] Issues saved to: ${reportPath}`);
    if (Array.isArray(issues)) {
      console.log(`  Total issues: ${issues.length}`);
    }
  });

  test('audit: New/Products page (/shop/new)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(RESULTS_DIR, 'a11y-new-page.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`\n[New /shop/new] Issues saved to: ${reportPath}`);
    if (Array.isArray(issues)) {
      console.log(`  Total issues: ${issues.length}`);
    }
  });

  test('audit: Product detail page (/product/:id)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    // Navigate to products page first to get the first product link
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    // Click first product
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3, h1, h2', { timeout: 10_000 });

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(RESULTS_DIR, 'a11y-product-detail-page.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`\n[Product detail /product/:id] Issues saved to: ${reportPath}`);
    if (Array.isArray(issues)) {
      console.log(`  Total issues: ${issues.length}`);
    }
  });

  test('audit: Checkout page (/checkout)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    // Navigate to products page and add an item to the cart
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    // Click first product
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('button[aria-label="Add to cart"], button', { timeout: 10_000 });

    // Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Go to checkout
    await page.getByRole('button', { name: /proceed to checkout/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(RESULTS_DIR, 'a11y-checkout-page.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`\n[Checkout /checkout] Issues saved to: ${reportPath}`);
    if (Array.isArray(issues)) {
      console.log(`  Total issues: ${issues.length}`);
    }
  });

  test('audit: Order confirmation page (/order-confirmation)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    // Full flow to reach order confirmation
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('button', { timeout: 10_000 });

    await page.getByRole('button', { name: /add to cart/i }).click();

    await page.getByRole('button', { name: /proceed to checkout/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    // Continue to shipping step
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });

    // Fill shipping form
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy, Mountain View, CA 94043');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');

    await page.getByRole('button', { name: /ship it/i }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10_000 });
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(RESULTS_DIR, 'a11y-order-confirmation-page.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`\n[Order Confirmation /order-confirmation] Issues saved to: ${reportPath}`);
    if (Array.isArray(issues)) {
      console.log(`  Total issues: ${issues.length}`);
    }
  });
});
