import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

test.describe('Comprehensive a11y audit – all pages', () => {
  test('homepage (/)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const outPath = path.join(RESULTS_DIR, 'page-homepage.json');
    fs.writeFileSync(outPath, JSON.stringify(issues, null, 2));
    console.log(`Homepage: ${issues.length} issues → ${outPath}`);
  });

  test('products page (/shop/new)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const pageIssues = await evinced.evAnalyze();
    const comboboxIssues = await evinced.components.analyzeCombobox({ selector: '.sort-btn' });
    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });
    const allIssues = await evinced.evMergeIssues(pageIssues, comboboxIssues, navIssues);
    const outPath = path.join(RESULTS_DIR, 'page-products.json');
    fs.writeFileSync(outPath, JSON.stringify(allIssues, null, 2));
    console.log(`Products: ${allIssues.length} issues → ${outPath}`);
  });

  test('product detail (/product/:id)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const outPath = path.join(RESULTS_DIR, 'page-product-detail.json');
    fs.writeFileSync(outPath, JSON.stringify(issues, null, 2));
    console.log(`Product detail: ${issues.length} issues → ${outPath}`);
  });

  test('checkout page (/checkout)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    // Navigate to product, add to cart, proceed to checkout
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForSelector('h3', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const outPath = path.join(RESULTS_DIR, 'page-checkout.json');
    fs.writeFileSync(outPath, JSON.stringify(issues, null, 2));
    console.log(`Checkout: ${issues.length} issues → ${outPath}`);
  });

  test('order confirmation (/order-confirmation)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
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
    const outPath = path.join(RESULTS_DIR, 'page-order-confirmation.json');
    fs.writeFileSync(outPath, JSON.stringify(issues, null, 2));
    console.log(`Order confirmation: ${issues.length} issues → ${outPath}`);
  });
});
