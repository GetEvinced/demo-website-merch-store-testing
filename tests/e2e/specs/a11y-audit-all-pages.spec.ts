import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveJson(filename: string, data: unknown) {
  ensureDir(RESULTS_DIR);
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('Demo Website – Full Accessibility Audit', () => {
  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('#root', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const issues = await evinced.evAnalyze();
    saveJson('homepage.json', issues);
    console.log(`Homepage: ${issues.length} issues`);
  });

  test('Products page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const pageIssues = await evinced.evAnalyze();

    // Also scan the sort combobox
    const comboboxIssues = await evinced.components.analyzeCombobox({
      selector: '.sort-btn',
    });

    // Scan main navigation
    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });

    const allIssues = await evinced.evMergeIssues(pageIssues, comboboxIssues, navIssues);
    saveJson('products.json', allIssues);
    console.log(`Products: ${allIssues.length} issues (page=${pageIssues.length}, combobox=${comboboxIssues.length}, nav=${navIssues.length})`);
  });

  test('Product detail page (/product/:id)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.product-card-image-link', { timeout: 15_000 });
    await page.waitForTimeout(500);

    // Navigate to first product via click
    await page.click('.product-card-image-link');
    // Wait for product detail page to load (breadcrumb is rendered with CSS module)
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const issues = await evinced.evAnalyze();
    saveJson('product-detail.json', issues);
    console.log(`Product detail: ${issues.length} issues`);
  });

  test('Checkout – basket step', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    // Add a product to cart first
    await page.goto('/shop/new');
    await page.waitForSelector('.product-card-image-link', { timeout: 15_000 });
    await page.click('.product-card-image-link');
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.click('button[aria-label="Add to cart"]');
    await page.waitForSelector('button:has-text("Proceed to Checkout")', { timeout: 10_000 });
    await page.waitForTimeout(500);

    const issues = await evinced.evAnalyze();
    saveJson('checkout-basket.json', issues);
    console.log(`Checkout basket (CartModal): ${issues.length} issues`);
  });

  test('Checkout – shipping step', async ({ page }) => {
    test.setTimeout(60_000);
    const evinced = new EvincedSDK(page);

    // Navigate through to checkout page
    await page.goto('/shop/new');
    await page.waitForSelector('.product-card-image-link', { timeout: 15_000 });
    await page.click('.product-card-image-link');
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.click('button[aria-label="Add to cart"]');
    await page.waitForSelector('button:has-text("Proceed to Checkout")', { timeout: 10_000 });

    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL('**/checkout', { timeout: 15_000 });
    await page.waitForTimeout(500);

    // Click Continue to move to Shipping & Payment step (step 2)
    await page.click('.checkout-continue-btn');
    await page.waitForSelector('input[name="firstName"]', { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    saveJson('checkout-shipping.json', issues);
    console.log(`Checkout shipping: ${issues.length} issues`);
  });

  test('Order confirmation (/order-confirmation)', async ({ page }) => {
    test.setTimeout(90_000);
    const evinced = new EvincedSDK(page);

    // Complete the checkout flow
    await page.goto('/shop/new');
    await page.waitForSelector('.product-card-image-link', { timeout: 15_000 });
    await page.click('.product-card-image-link');
    await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 15_000 });
    await page.click('button[aria-label="Add to cart"]');
    await page.waitForSelector('button:has-text("Proceed to Checkout")', { timeout: 10_000 });
    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL('**/checkout', { timeout: 15_000 });
    await page.waitForTimeout(500);

    // Step 1: Shopping Cart — click Continue to move to Shipping & Payment (step 2)
    await page.click('.checkout-continue-btn');
    await page.waitForSelector('input[name="firstName"]', { timeout: 10_000 });
    await page.waitForTimeout(500);

    // Step 2: Fill out shipping & payment form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="cardNumber"]', '4111111111111111');
    await page.fill('input[name="expirationDate"]', '12/28');

    // Submit order
    await page.click('button:has-text("Ship It!")');
    await page.waitForURL('**/order-confirmation', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const issues = await evinced.evAnalyze();
    saveJson('order-confirmation.json', issues);
    console.log(`Order confirmation: ${issues.length} issues`);
  });
});
