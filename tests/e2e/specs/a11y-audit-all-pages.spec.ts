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
  test.setTimeout(120_000);

  test('Homepage (/)', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('#root > *', { timeout: 15_000 });
    await page.waitForTimeout(1_500);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(
      issues,
      'json',
      path.join(RESULTS_DIR, 'homepage.json')
    );
    console.log(`\nHomepage: ${issues.length} issues`);
  });

  test('Products page (/shop/new)', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1_000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(
      issues,
      'json',
      path.join(RESULTS_DIR, 'products.json')
    );
    console.log(`\nProducts: ${issues.length} issues`);
  });

  test('Product detail page', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.product-card-image-link', { timeout: 15_000 });
    await page.click('.product-card-image-link');
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.waitForTimeout(1_000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(
      issues,
      'json',
      path.join(RESULTS_DIR, 'product-detail.json')
    );
    console.log(`\nProduct Detail: ${issues.length} issues`);
  });

  test('Checkout – basket (cart modal open)', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.product-card-image-link', { timeout: 15_000 });
    await page.click('.product-card-image-link');
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.click('button[aria-label="Add to cart"]');
    await page.waitForSelector('button:has-text("Proceed to Checkout")', { timeout: 15_000 });
    await page.waitForTimeout(1_000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(
      issues,
      'json',
      path.join(RESULTS_DIR, 'checkout-basket.json')
    );
    console.log(`\nCheckout Basket: ${issues.length} issues`);
  });

  test('Checkout – shipping form (step 2)', async ({ page }) => {
    ensureResultsDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.product-card-image-link', { timeout: 15_000 });
    await page.click('.product-card-image-link');
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.click('button[aria-label="Add to cart"]');
    await page.waitForSelector('button:has-text("Proceed to Checkout")', { timeout: 15_000 });
    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL('**/checkout', { timeout: 15_000 });
    await page.waitForSelector('.checkout-continue-btn', { timeout: 15_000 });
    await page.click('.checkout-continue-btn');
    await page.waitForSelector('input[name="firstName"]', { timeout: 15_000 });
    await page.waitForTimeout(1_000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(
      issues,
      'json',
      path.join(RESULTS_DIR, 'checkout-shipping.json')
    );
    console.log(`\nCheckout Shipping: ${issues.length} issues`);
  });

  test('Order confirmation page', async ({ page }) => {
    test.setTimeout(90_000);
    ensureResultsDir();
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.product-card-image-link', { timeout: 15_000 });
    await page.click('.product-card-image-link');
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.click('button[aria-label="Add to cart"]');
    await page.waitForSelector('button:has-text("Proceed to Checkout")', { timeout: 15_000 });
    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL('**/checkout', { timeout: 15_000 });
    await page.waitForSelector('.checkout-continue-btn', { timeout: 15_000 });
    await page.click('.checkout-continue-btn');
    await page.waitForSelector('input[name="firstName"]', { timeout: 15_000 });
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="cardNumber"]', '4111111111111111');
    await page.fill('input[name="expirationDate"]', '12/28');
    await page.click('button:has-text("Ship It!")');
    await page.waitForURL('**/order-confirmation', { timeout: 30_000 });
    await page.waitForTimeout(1_500);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(
      issues,
      'json',
      path.join(RESULTS_DIR, 'order-confirmation.json')
    );
    console.log(`\nOrder Confirmation: ${issues.length} issues`);
  });
});
