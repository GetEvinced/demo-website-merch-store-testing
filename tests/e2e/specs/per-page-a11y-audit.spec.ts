import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function saveIssues(filename: string, issues: unknown[]) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(RESULTS_DIR, filename),
    JSON.stringify(issues, null, 2),
    'utf8'
  );
}

test.describe('Per-page a11y audit', () => {
  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    // Wait for dynamic content to settle
    await page.waitForTimeout(1500);
    const issues = await evinced.evAnalyze();
    saveIssues('page-homepage.json', issues);
    console.log(`\nHomepage issues: ${issues.length}`);
  });

  test('Products page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1500);
    const issues = await evinced.evAnalyze();
    saveIssues('page-products.json', issues);
    console.log(`\nProducts page issues: ${issues.length}`);
  });

  test('Product detail page (/product/:id)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });
    await page.waitForTimeout(1500);
    const issues = await evinced.evAnalyze();
    saveIssues('page-product-detail.json', issues);
    console.log(`\nProduct detail page issues: ${issues.length}`);
  });

  test('Checkout page (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate through the journey to reach checkout with cart items
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
    await page.waitForTimeout(1500);
    const issues = await evinced.evAnalyze();
    saveIssues('page-checkout.json', issues);
    console.log(`\nCheckout page issues: ${issues.length}`);
  });

  test('Order confirmation page (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate full journey to reach order confirmation
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
    await page.waitForTimeout(1500);
    const issues = await evinced.evAnalyze();
    saveIssues('page-order-confirmation.json', issues);
    console.log(`\nOrder confirmation page issues: ${issues.length}`);
  });
});
