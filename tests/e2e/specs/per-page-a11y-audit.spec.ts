import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function saveResults(filename: string, data: unknown) {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('Per-page accessibility audit', () => {
  test.setTimeout(120_000);

  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });
    // Wait for full render
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });
    const allIssues = await evinced.evMergeIssues(issues, navIssues);

    saveResults('page-homepage.json', allIssues);
    console.log(`Homepage: ${allIssues.length} issues`);
  });

  test('Products page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const pageIssues = await evinced.evAnalyze();
    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });
    const comboboxIssues = await evinced.components.analyzeCombobox({
      selector: '.sort-btn',
    });
    const allIssues = await evinced.evMergeIssues(pageIssues, navIssues, comboboxIssues);

    saveResults('page-products.json', allIssues);
    console.log(`Products: ${allIssues.length} issues`);
  });

  test('Product detail page (/product/1)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    // Wait for breadcrumb nav which is always present on the product page
    await page.waitForSelector('nav[aria-label="Breadcrumb"]', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });
    const allIssues = await evinced.evMergeIssues(issues, navIssues);

    saveResults('page-product-detail.json', allIssues);
    console.log(`Product Detail: ${allIssues.length} issues`);
  });

  test('Checkout page (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    // Add a product to cart first so checkout has content
    await page.goto('/product/1');
    await page.waitForSelector('nav[aria-label="Breadcrumb"]', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    // Click add to cart
    const addToCartBtn = page.locator('button:has-text("ADD TO CART"), .add-to-cart-btn').first();
    if (await addToCartBtn.count() > 0) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-container, .checkout-page', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });
    const allIssues = await evinced.evMergeIssues(issues, navIssues);

    saveResults('page-checkout.json', allIssues);
    console.log(`Checkout: ${allIssues.length} issues`);
  });

  test('Order confirmation page (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    // Navigate with state to avoid redirect — set localStorage to simulate completed order
    await page.goto('/');
    await page.waitForTimeout(1000);
    // Inject router state via navigation
    await page.evaluate(() => {
      window.history.pushState({ fromCheckout: true }, '', '/order-confirmation');
    });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });
    const allIssues = await evinced.evMergeIssues(issues, navIssues);

    saveResults('page-order-confirmation.json', allIssues);
    console.log(`Order Confirmation: ${allIssues.length} issues`);
  });
});
