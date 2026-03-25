import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive accessibility audit for all pages in the demo website.
 *
 * Pages audited:
 *  1. Home Page            (/)
 *  2. New/Products Page    (/shop/new)
 *  3. Product Detail Page  (/product/:id)
 *  4. Checkout Page        (/checkout)
 *  5. Order Confirmation   (/order-confirmation)
 *
 * For each page, we run evAnalyze() and collect all issues.
 * The combined JSON report is saved to test-results/.
 */

const OUTPUT_DIR = path.join(__dirname, '..', 'test-results');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

test.describe('Full site accessibility audit – all pages', () => {
  test('Home Page (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    ensureOutputDir();

    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav, h1, h2', { timeout: 15000 });

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(OUTPUT_DIR, 'home-page-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));

    console.log(`\nHome Page: ${issues.length} issues found`);
    for (const issue of issues) {
      const sev = typeof issue.severity === 'object' ? JSON.stringify(issue.severity) : issue.severity;
      const typ = typeof issue.type === 'object' ? JSON.stringify(issue.type) : issue.type;
      console.log(`  [${sev}] ${typ}: ${issue.summary || issue.description || ''}`);
    }
  });

  test('New/Products Page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    ensureOutputDir();

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15000 });

    const pageIssues = await evinced.evAnalyze();

    const comboboxIssues = await evinced.components.analyzeCombobox({
      selector: '.sort-btn',
    });

    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });

    const allIssues = await evinced.evMergeIssues(pageIssues, comboboxIssues, navIssues);

    const reportPath = path.join(OUTPUT_DIR, 'new-page-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));

    console.log(`\nNew/Products Page: ${allIssues.length} total issues (page: ${pageIssues.length}, combobox: ${comboboxIssues.length}, nav: ${navIssues.length})`);
    for (const issue of allIssues) {
      console.log(`  [${issue.severity}] ${issue.type}: ${issue.summary || issue.description || ''}`);
    }
  });

  test('Product Detail Page (/product/:id)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    ensureOutputDir();

    // Navigate to shop/new first to find a product link
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15000 });

    // Click the first product
    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10000 });
    await page.waitForSelector('h3, .product-name', { timeout: 10000 });

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(OUTPUT_DIR, 'product-page-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));

    console.log(`\nProduct Detail Page: ${issues.length} issues found`);
    for (const issue of issues) {
      console.log(`  [${issue.severity}] ${issue.type}: ${issue.summary || issue.description || ''}`);
    }
  });

  test('Checkout Page (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    ensureOutputDir();

    // Add a product to cart first, then go to checkout
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15000 });

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10000 });
    await page.waitForSelector('h3, .product-name', { timeout: 10000 });

    await page.getByRole('button', { name: 'Add to cart' }).click();

    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });

    const basketIssues = await evinced.evAnalyze();

    // Continue to shipping step
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10000 });

    const shippingIssues = await evinced.evAnalyze();

    const allIssues = await evinced.evMergeIssues(basketIssues, shippingIssues);

    const reportPath = path.join(OUTPUT_DIR, 'checkout-page-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));

    console.log(`\nCheckout Page: ${allIssues.length} total issues (basket: ${basketIssues.length}, shipping: ${shippingIssues.length})`);
    for (const issue of allIssues) {
      console.log(`  [${issue.severity}] ${issue.type}: ${issue.summary || issue.description || ''}`);
    }
  });

  test('Order Confirmation Page (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    ensureOutputDir();

    // Navigate through the full flow to reach order confirmation
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15000 });

    const firstProductLink = page.locator('.products-grid [role="listitem"] a').first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10000 });

    await page.getByRole('button', { name: 'Add to cart' }).click();

    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });

    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10000 });

    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');

    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10000 });
    await page.waitForSelector('.confirm-page', { timeout: 10000 });

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(OUTPUT_DIR, 'order-confirmation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));

    console.log(`\nOrder Confirmation Page: ${issues.length} issues found`);
    for (const issue of issues) {
      console.log(`  [${issue.severity}] ${issue.type}: ${issue.summary || issue.description || ''}`);
    }
  });
});
