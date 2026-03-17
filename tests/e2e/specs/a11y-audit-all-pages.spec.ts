import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveJson(filename: string, data: unknown) {
  ensureDir(RESULTS_DIR);
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.setTimeout(180_000);

test.describe('Full site accessibility audit', () => {

  test('Homepage (/)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJson('homepage.json', issues);
    console.log(`\nHomepage issues: ${issues.length}`);
  });

  test('Products page (/shop/new)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const pageIssues = await sdk.evAnalyze();
    const comboboxIssues = await sdk.components.analyzeCombobox({ selector: '.sort-btn' });
    const navIssues = await sdk.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });
    const issues = await sdk.evMergeIssues(pageIssues, comboboxIssues, navIssues);
    saveJson('products.json', issues);
    console.log(`\nProducts page issues: ${issues.length}`);
  });

  test('Product detail (/product/:id)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.locator('.product-card-image-link').first().click();
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJson('product-detail.json', issues);
    console.log(`\nProduct detail issues: ${issues.length}`);
  });

  test('Checkout – basket step', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.locator('.product-card-image-link').first().click();
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    const issues = await sdk.evAnalyze();
    saveJson('checkout-basket.json', issues);
    console.log(`\nCheckout basket issues: ${issues.length}`);
  });

  test('Checkout – shipping step', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.locator('.product-card-image-link').first().click();
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn').click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    const issues = await sdk.evAnalyze();
    saveJson('checkout-shipping.json', issues);
    console.log(`\nCheckout shipping issues: ${issues.length}`);
  });

  test('Order confirmation (/order-confirmation)', async ({ page }) => {
    test.setTimeout(180_000);
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.locator('.product-card-image-link').first().click();
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
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
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 30_000 });
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });
    const issues = await sdk.evAnalyze();
    saveJson('order-confirmation.json', issues);
    console.log(`\nOrder confirmation issues: ${issues.length}`);
  });

});
