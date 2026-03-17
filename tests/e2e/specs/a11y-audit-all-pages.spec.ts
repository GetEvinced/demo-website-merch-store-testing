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

function saveJson(filename: string, data: unknown) {
  ensureDir(RESULTS_DIR);
  const filepath = path.join(RESULTS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`Saved: ${filepath}`);
  return filepath;
}

/** Navigate from products list → product detail → add to cart → proceed to checkout */
async function navigateToCheckout(page: any) {
  await page.goto('/shop/new');
  await page.waitForSelector('.products-grid', { timeout: 15_000 });
  await page.waitForTimeout(500);

  // Click first product card link to go to product detail
  await page.locator('.product-card-image-link, .product-card-name-link').first().click();
  await page.waitForTimeout(1500);

  // Add to cart — button is on the product detail page
  await page.locator('button[aria-label="Add to cart"]').click({ timeout: 10_000 });
  await page.waitForTimeout(500);

  // Cart modal opens — click "Proceed to Checkout"
  await page.locator('button:has-text("Proceed to Checkout")').click({ timeout: 10_000 });
  await page.waitForURL('**/checkout**', { timeout: 15_000 });
  await page.waitForTimeout(1000);
}

test.describe('Comprehensive A11Y Audit — All Pages', () => {

  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, #root > *', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const issues = await evinced.evAnalyze();
    saveJson('homepage.json', issues);
    console.log(`Homepage issues: ${issues.length}`);
  });

  test('Products Page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const pageIssues = await evinced.evAnalyze();

    const comboboxIssues = await evinced.components.analyzeCombobox({
      selector: '.sort-btn',
    });

    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });

    const allIssues = await evinced.evMergeIssues(pageIssues, comboboxIssues, navIssues);
    saveJson('products-page.json', allIssues);
    console.log(`Products page issues: ${allIssues.length} (page: ${pageIssues.length}, combobox: ${comboboxIssues.length}, nav: ${navIssues.length})`);
  });

  test('Product Detail Page (/product/:id)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(500);

    // Click first product card to navigate to product detail
    await page.locator('.product-card-image-link, .product-card-name-link').first().click();
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`Product detail URL: ${currentUrl}`);

    const issues = await evinced.evAnalyze();
    saveJson('product-detail.json', issues);
    saveJson('product-detail-url.json', { url: currentUrl });
    console.log(`Product detail issues: ${issues.length}`);
  });

  test('Checkout - Basket Step (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await navigateToCheckout(page);

    // Now on the basket step of checkout
    await page.waitForSelector('.checkout-basket, .checkout-page', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveJson('checkout-basket.json', issues);
    console.log(`Checkout basket issues: ${issues.length}`);
  });

  test('Checkout - Shipping Step', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await navigateToCheckout(page);

    // Click Continue (it's a div, not a button)
    await page.locator('.checkout-continue-btn').click({ timeout: 10_000 });
    await page.waitForTimeout(1500);

    const issues = await evinced.evAnalyze();
    saveJson('checkout-shipping.json', issues);
    console.log(`Checkout shipping issues: ${issues.length}`);
  });

  test('Order Confirmation Page', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await navigateToCheckout(page);

    // Continue to shipping step
    await page.locator('.checkout-continue-btn').click({ timeout: 10_000 });
    await page.waitForTimeout(1000);

    // Fill in the shipping form
    await page.locator('input[name="firstName"]').fill('Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="address"]').fill('123 Main Street');
    await page.locator('input[name="cardNumber"]').fill('4111111111111111');
    await page.locator('input[name="expirationDate"]').fill('12/28');
    await page.waitForTimeout(500);

    // Submit the order
    await page.locator('button:has-text("Ship It!")').click({ timeout: 10_000 });
    await page.waitForURL('**/order-confirmation**', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const issues = await evinced.evAnalyze();
    saveJson('order-confirmation.json', issues);
    console.log(`Order confirmation issues: ${issues.length}`);
  });

});
