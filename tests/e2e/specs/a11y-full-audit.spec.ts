import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Full-site accessibility audit using Evinced SDK.
 * Scans all 6 page states across the demo website.
 */

const RESULTS_DIR = path.join(__dirname, '..', 'test-results', 'a11y-audit');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

test.describe('Full-site accessibility audit', () => {
  test.setTimeout(120_000);

  test('Homepage (/)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });

    const issues = await evinced.evAnalyze();

    await evinced.evSaveFile(
      issues,
      'csv',
      path.join(RESULTS_DIR, 'homepage.csv')
    );

    console.log(`\nHomepage: ${issues.length} issues`);
    issues.forEach((i: any) => {
      console.log(`  [${i.type?.id ?? i.type}] ${i.severity} | ${i.summary ?? ''} | selector: ${i.selector ?? ''}`);
    });
  });

  test('Products page (/shop/new)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const pageIssues = await evinced.evAnalyze();

    const comboboxIssues = await evinced.components.analyzeCombobox({
      selector: '.sort-btn',
    });

    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });

    const allIssues = await evinced.evMergeIssues(pageIssues, comboboxIssues, navIssues);

    await evinced.evSaveFile(
      allIssues,
      'csv',
      path.join(RESULTS_DIR, 'products-page.csv')
    );

    console.log(`\nProducts page: ${allIssues.length} issues (page:${pageIssues.length}, combobox:${comboboxIssues.length}, nav:${navIssues.length})`);
    allIssues.forEach((i: any) => {
      console.log(`  [${i.type?.id ?? i.type}] ${i.severity} | ${i.summary ?? ''} | selector: ${i.selector ?? ''}`);
    });
  });

  test('Product detail page (/product/1)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/product/1');
    // Wait for the breadcrumb nav which is always rendered on the product detail page
    await page.waitForSelector('nav[aria-label="Breadcrumb"]', { timeout: 15_000 });

    const issues = await evinced.evAnalyze();

    await evinced.evSaveFile(
      issues,
      'csv',
      path.join(RESULTS_DIR, 'product-detail.csv')
    );

    console.log(`\nProduct detail: ${issues.length} issues`);
    issues.forEach((i: any) => {
      console.log(`  [${i.type?.id ?? i.type}] ${i.severity} | ${i.summary ?? ''} | selector: ${i.selector ?? ''}`);
    });
  });

  test('Checkout page – basket step (/checkout)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    // Seed the cart via localStorage before navigating (key: 'cart-items')
    await page.goto('/');
    await page.evaluate(() => {
      const cart = [{
        id: 1,
        sku: 'GGOEGFBA241499',
        name: 'Chrome Dino Maps Tourist Accessory Pack',
        price: 16.0,
        available: 292,
        quantity: 1,
        image: '/images/products/GGOEGFBA241499.jpg',
        category: 'Accessories',
        brand: 'Google'
      }];
      localStorage.setItem('cart-items', JSON.stringify(cart));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15_000 });

    const issues = await evinced.evAnalyze();

    await evinced.evSaveFile(
      issues,
      'csv',
      path.join(RESULTS_DIR, 'checkout-basket.csv')
    );

    console.log(`\nCheckout basket: ${issues.length} issues`);
    issues.forEach((i: any) => {
      console.log(`  [${i.type?.id ?? i.type}] ${i.severity} | ${i.summary ?? ''} | selector: ${i.selector ?? ''}`);
    });
  });

  test('Checkout page – shipping step (/checkout)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/');
    await page.evaluate(() => {
      const cart = [{
        id: 1,
        sku: 'GGOEGFBA241499',
        name: 'Chrome Dino Maps Tourist Accessory Pack',
        price: 16.0,
        available: 292,
        quantity: 1,
        image: '/images/products/GGOEGFBA241499.jpg',
        category: 'Accessories',
        brand: 'Google'
      }];
      localStorage.setItem('cart-items', JSON.stringify(cart));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15_000 });

    // Advance to shipping step by clicking the Continue button
    const continueBtn = page.locator('.checkout-continue-btn');
    const continueCount = await continueBtn.count();
    if (continueCount > 0) {
      await continueBtn.first().click();
      await page.waitForTimeout(1000);
    }

    const issues = await evinced.evAnalyze();

    await evinced.evSaveFile(
      issues,
      'csv',
      path.join(RESULTS_DIR, 'checkout-shipping.csv')
    );

    console.log(`\nCheckout shipping: ${issues.length} issues`);
    issues.forEach((i: any) => {
      console.log(`  [${i.type?.id ?? i.type}] ${i.severity} | ${i.summary ?? ''} | selector: ${i.selector ?? ''}`);
    });
  });

  test('Order confirmation page (/order-confirmation)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);

    // The order confirmation page requires completing the checkout flow.
    // Seed the cart and navigate through basket → shipping → submit.
    await page.goto('/');
    await page.evaluate(() => {
      const cart = [{
        id: 1,
        sku: 'GGOEGFBA241499',
        name: 'Chrome Dino Maps Tourist Accessory Pack',
        price: 16.0,
        available: 292,
        quantity: 1,
        image: '/images/products/GGOEGFBA241499.jpg',
        category: 'Accessories',
        brand: 'Google'
      }];
      localStorage.setItem('cart-items', JSON.stringify(cart));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15_000 });

    // Click Continue to move from basket to shipping step
    await page.locator('.checkout-continue-btn').click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });

    // Fill out the shipping/payment form
    await page.fill('#firstName', 'Tester');
    await page.fill('#lastName', 'User');
    await page.fill('#address', '123 Test Street');
    await page.fill('#cardNumber', '4111111111111111');
    await page.fill('#expirationDate', '12/26');

    // Submit the form
    await page.locator('.ship-it-btn').click();
    await page.waitForSelector('.confirm-page', { timeout: 15_000 });

    const issues = await evinced.evAnalyze();

    await evinced.evSaveFile(
      issues,
      'csv',
      path.join(RESULTS_DIR, 'order-confirmation.csv')
    );

    console.log(`\nOrder confirmation: ${issues.length} issues`);
    issues.forEach((i: any) => {
      console.log(`  [${i.type?.id ?? i.type}] ${i.severity} | ${i.summary ?? ''} | selector: ${i.selector ?? ''}`);
    });
  });
});
