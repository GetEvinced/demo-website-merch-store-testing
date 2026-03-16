import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive accessibility audit across all pages of the demo website.
 * Covers: Homepage, Products Page, Product Detail, Checkout, Order Confirmation
 * Also audits: Cart Modal, Wishlist Modal, Navigation, Sort Combobox, Filter Checkboxes
 */

const REPORT_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

test.describe('Full A11Y Audit – All Pages', () => {
  test('homepage', async ({ page }) => {
    ensureDir(REPORT_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/');
    await page.waitForSelector('.hero-banner, #root > *', { timeout: 15_000 });
    // Wait for content to fully load
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const reportPath = path.join(REPORT_DIR, 'homepage-a11y.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`Homepage issues: ${issues.length}`);
    console.log(JSON.stringify(issues, null, 2));
  });

  test('products page with combobox and nav', async ({ page }) => {
    ensureDir(REPORT_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const pageIssues = await evinced.evAnalyze();

    const comboboxIssues = await evinced.components.analyzeCombobox({
      selector: '.sort-btn',
    });

    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });

    const allIssues = await evinced.evMergeIssues(pageIssues, comboboxIssues, navIssues);
    const reportPath = path.join(REPORT_DIR, 'products-page-a11y.json');
    await evinced.evSaveFile(allIssues, 'json', reportPath);
    console.log(`Products page issues: ${allIssues.length}`);
    console.log(JSON.stringify(allIssues, null, 2));
  });

  test('product detail page', async ({ page }) => {
    ensureDir(REPORT_DIR);
    const evinced = new EvincedSDK(page);

    // Navigate to products and click the first one
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const reportPath = path.join(REPORT_DIR, 'product-detail-a11y.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`Product detail issues: ${issues.length}`);
    console.log(JSON.stringify(issues, null, 2));
  });

  test('cart modal on homepage', async ({ page }) => {
    ensureDir(REPORT_DIR);
    const evinced = new EvincedSDK(page);

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    // Add a product to cart first
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.waitForTimeout(1500);

    // Scan with cart modal open
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(REPORT_DIR, 'cart-modal-a11y.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`Cart modal issues: ${issues.length}`);
    console.log(JSON.stringify(issues, null, 2));
  });

  test('checkout page', async ({ page }) => {
    ensureDir(REPORT_DIR);
    const evinced = new EvincedSDK(page);

    // Navigate through the full flow to reach checkout
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.waitForTimeout(2000);

    // Scan basket step
    const basketIssues = await evinced.evAnalyze();
    const basketReportPath = path.join(REPORT_DIR, 'checkout-basket-a11y.json');
    await evinced.evSaveFile(basketIssues, 'json', basketReportPath);
    console.log(`Checkout basket issues: ${basketIssues.length}`);

    // Navigate to shipping step
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    await page.waitForTimeout(2000);

    const shippingIssues = await evinced.evAnalyze();
    const shippingReportPath = path.join(REPORT_DIR, 'checkout-shipping-a11y.json');
    await evinced.evSaveFile(shippingIssues, 'json', shippingReportPath);
    console.log(`Checkout shipping issues: ${shippingIssues.length}`);

    const allIssues = await evinced.evMergeIssues(basketIssues, shippingIssues);
    console.log(JSON.stringify(allIssues, null, 2));
  });

  test('order confirmation page', async ({ page }) => {
    ensureDir(REPORT_DIR);
    const evinced = new EvincedSDK(page);

    // Navigate through the full flow
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.waitForTimeout(1500);
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
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const reportPath = path.join(REPORT_DIR, 'order-confirmation-a11y.json');
    await evinced.evSaveFile(issues, 'json', reportPath);
    console.log(`Order confirmation issues: ${issues.length}`);
    console.log(JSON.stringify(issues, null, 2));
  });
});
