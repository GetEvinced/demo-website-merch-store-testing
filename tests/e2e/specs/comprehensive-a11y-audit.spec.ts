import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive per-page accessibility audit for the demo e-commerce website.
 *
 * Pages tested:
 *  1. Homepage         /
 *  2. Products listing /shop/new
 *  3. Product detail   /product/1  (first product)
 *  4. Checkout         /checkout   (accessed via cart flow)
 *  5. Order confirm    /order-confirmation (accessed via full checkout flow)
 *
 * Each test page uses evAnalyze() for a full-page static snapshot scan.
 * Results are saved as JSON to tests/e2e/test-results/page-*.json
 */

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function saveResults(filename: string, data: unknown) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('Comprehensive per-page a11y audit', () => {
  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-homepage.json', issues);

    console.log(`Homepage issues: ${issues.length}`);
  });

  test('Products listing (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-products.json', issues);

    console.log(`Products page issues: ${issues.length}`);
  });

  test('Product detail (/product/:id)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate to products list first to get a real product ID
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    const href = await firstProductLink.getAttribute('href');
    const productUrl = href ?? '/product/1';
    await page.goto(productUrl);
    await page.waitForSelector('h3, .product-name', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-product-detail.json', issues);

    console.log(`Product detail issues: ${issues.length}`);
  });

  test('Checkout (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Must add an item to cart before checkout is accessible
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.click();
    await page.waitForSelector('button[aria-label="Add to cart"], .add-to-cart', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-checkout.json', issues);

    console.log(`Checkout page issues: ${issues.length}`);
  });

  test('Order confirmation (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Full purchase flow to reach order confirmation
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    await page.locator('.products-grid [role="listitem"] a').first().click();
    await page.waitForSelector('button[aria-label="Add to cart"], .add-to-cart', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
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
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-order-confirmation.json', issues);

    console.log(`Order confirmation issues: ${issues.length}`);
  });
});
