import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive per-page accessibility audit using the Evinced SDK.
 * Each test navigates to a specific page/route, runs evAnalyze(), and
 * writes its raw JSON results to test-results/page-<name>.json.
 */

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveResults(filename: string, data: unknown) {
  ensureDir(RESULTS_DIR);
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
}

test.describe('Accessibility audit – Homepage (/)', () => {
  test('a11y scan: homepage', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    // Wait a moment for all dynamic content to settle
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-homepage.json', issues);

    console.log(`Homepage issues: ${issues.length}`);
    issues.forEach((i: any) => {
      console.log(`  [${i?.severity?.id ?? i?.severity ?? 'UNKNOWN'}] ${i?.type?.id ?? i?.type ?? '-'} | ${i?.summary ?? ''}`);
    });
  });
});

test.describe('Accessibility audit – Products page (/shop/new)', () => {
  test('a11y scan: products listing', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-products.json', issues);

    console.log(`Products page issues: ${issues.length}`);
    issues.forEach((i: any) => {
      console.log(`  [${i?.severity?.id ?? i?.severity ?? 'UNKNOWN'}] ${i?.type?.id ?? i?.type ?? '-'} | ${i?.summary ?? ''}`);
    });
  });
});

test.describe('Accessibility audit – Product detail page (/product/:id)', () => {
  test('a11y scan: product detail', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate to products first to find a real product link
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const firstProductHref = await page
      .locator('.products-grid [role="listitem"] a')
      .first()
      .getAttribute('href');

    const productUrl = firstProductHref ?? '/product/1';
    await page.goto(productUrl);
    await page.waitForSelector('h3', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-product-detail.json', issues);

    console.log(`Product detail page issues: ${issues.length}`);
    issues.forEach((i: any) => {
      console.log(`  [${i?.severity?.id ?? i?.severity ?? 'UNKNOWN'}] ${i?.type?.id ?? i?.type ?? '-'} | ${i?.summary ?? ''}`);
    });
  });
});

test.describe('Accessibility audit – Checkout page (/checkout)', () => {
  test('a11y scan: checkout', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    // Need items in cart to access checkout; do a quick add-to-cart flow
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForSelector('h3', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-checkout.json', issues);

    console.log(`Checkout page issues: ${issues.length}`);
    issues.forEach((i: any) => {
      console.log(`  [${i?.severity?.id ?? i?.severity ?? 'UNKNOWN'}] ${i?.type?.id ?? i?.type ?? '-'} | ${i?.summary ?? ''}`);
    });
  });
});

test.describe('Accessibility audit – Order confirmation page (/order-confirmation)', () => {
  test('a11y scan: order confirmation', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    // Full journey to reach order-confirmation
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
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
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveResults('page-order-confirmation.json', issues);

    console.log(`Order confirmation page issues: ${issues.length}`);
    issues.forEach((i: any) => {
      console.log(`  [${i?.severity?.id ?? i?.severity ?? 'UNKNOWN'}] ${i?.type?.id ?? i?.type ?? '-'} | ${i?.summary ?? ''}`);
    });
  });
});
