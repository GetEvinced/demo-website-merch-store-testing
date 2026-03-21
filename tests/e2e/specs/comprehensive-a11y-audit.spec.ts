/**
 * Comprehensive Accessibility Audit
 *
 * Covers all 5 app routes using Evinced SDK:
 *   - Homepage              /
 *   - Products page         /shop/new
 *   - Product detail        /product/1
 *   - Checkout              /checkout
 *   - Order confirmation    /order-confirmation
 *
 * For each page we run:
 *   1. evAnalyze()  – full-page static scan
 *   2. Targeted component scans where applicable
 *   3. evMergeIssues() – dedup across scans
 *   4. evSaveFile()  – persist JSON result
 */

import * as fs from 'fs';
import * as path from 'path';
import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveJson(name: string, issues: unknown[]) {
  ensureDir(RESULTS_DIR);
  const dest = path.join(RESULTS_DIR, `${name}.json`);
  fs.writeFileSync(dest, JSON.stringify(issues, null, 2), 'utf-8');
  return dest;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Homepage
// ─────────────────────────────────────────────────────────────────────────────
test('a11y – Homepage (/)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await page.goto('/');
  await page.waitForSelector('.hero-banner', { timeout: 15_000 });

  const pageIssues = await evinced.evAnalyze();

  // Navigation is present on all pages; scan it once here
  const navIssues = await evinced.components.analyzeSiteNavigation({
    selector: 'nav[aria-label="Main navigation"]',
  });

  const allIssues = await evinced.evMergeIssues(
    pageIssues as never[],
    navIssues,
  );

  const dest = saveJson('page-homepage', allIssues);
  console.log(`\n[Homepage] ${allIssues.length} issues → ${dest}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Products page
// ─────────────────────────────────────────────────────────────────────────────
test('a11y – Products page (/shop/new)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await page.goto('/shop/new');
  await page.waitForSelector('.products-grid', { timeout: 15_000 });

  // Full-page scan
  const pageIssues = await evinced.evAnalyze();

  // Sort combobox widget
  const comboboxIssues = await evinced.components.analyzeCombobox({
    selector: '.sort-btn',
  });

  // Filter sidebar checkboxes (Price / Size / Brand filter options)
  const checkboxIssues = await evinced.components.analyzeCheckbox({
    selector: '.filter-option',
  }).catch(() => []);

  // Filter disclosure buttons
  const disclosureIssues = await evinced.components.analyzeDisclosure({
    selector: '.filter-group-header',
  }).catch(() => []);

  const allIssues = await evinced.evMergeIssues(
    pageIssues as never[],
    comboboxIssues,
    checkboxIssues as never[],
    disclosureIssues as never[],
  );

  const dest = saveJson('page-products', allIssues);
  console.log(`\n[Products] ${allIssues.length} issues → ${dest}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Product detail
// ─────────────────────────────────────────────────────────────────────────────
test('a11y – Product detail (/product/1)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await page.goto('/product/1');
  // Use breadcrumb nav (stable, not CSS-module mangled) as ready indicator
  await page.waitForSelector('nav[aria-label="Breadcrumb"]', { timeout: 15_000 });

  const pageIssues = await evinced.evAnalyze();

  const dest = saveJson('page-product-detail', pageIssues as never[]);
  console.log(`\n[ProductDetail] ${(pageIssues as unknown[]).length} issues → ${dest}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Checkout (basket step)
// ─────────────────────────────────────────────────────────────────────────────
test('a11y – Checkout (/checkout)', async ({ page }) => {
  const evinced = new EvincedSDK(page);

  // Seed the cart via localStorage before loading the checkout page,
  // so the basket step renders with items instead of the empty-cart view.
  await page.goto('/');
  await page.evaluate(() => {
    const cartItems = [
      {
        id: 1,
        name: 'Google Super G Trucker Hat',
        price: 19.99,
        quantity: 1,
        image: '/images/products/GGOEGFBA241499.jpg',
        sku: 'GGOEGFBA241499',
        available: 5,
      },
    ];
    localStorage.setItem('cart-items', JSON.stringify(cartItems));
  });

  await page.goto('/checkout');
  await page.waitForSelector('.checkout-page', { timeout: 15_000 });

  // Scan basket step
  const basketIssues = await evinced.evAnalyze();

  // Advance to shipping step – the continue button is a div (a11y issue itself)
  await page.click('.checkout-continue-btn');
  await page.waitForSelector('.checkout-shipping', { timeout: 10_000 }).catch(() => {
    // Fallback: wait for the shipping form to appear
    return page.waitForSelector('form[aria-label="Shipping and payment form"]', { timeout: 10_000 });
  });

  // Scan shipping/payment step
  const shippingIssues = await evinced.evAnalyze();

  const allIssues = await evinced.evMergeIssues(
    basketIssues as never[],
    shippingIssues as never[],
  );

  const dest = saveJson('page-checkout', allIssues);
  console.log(`\n[Checkout] ${allIssues.length} issues → ${dest}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Order confirmation
//    Reached by completing the checkout flow.
// ─────────────────────────────────────────────────────────────────────────────
test('a11y – Order Confirmation (/order-confirmation)', async ({ page }) => {
  const evinced = new EvincedSDK(page);

  // Seed the cart so checkout has items
  await page.goto('/');
  await page.evaluate(() => {
    const cartItems = [
      {
        id: 1,
        name: 'Google Super G Trucker Hat',
        price: 19.99,
        quantity: 1,
        image: '/images/products/GGOEGFBA241499.jpg',
        sku: 'GGOEGFBA241499',
        available: 5,
      },
    ];
    localStorage.setItem('cart-items', JSON.stringify(cartItems));
  });

  await page.goto('/checkout');
  await page.waitForSelector('.checkout-page', { timeout: 15_000 });

  // Advance to shipping step
  await page.click('.checkout-continue-btn');
  await page.waitForSelector('form[aria-label="Shipping and payment form"]', { timeout: 10_000 });

  // Fill all required fields
  await page.fill('#firstName', 'Test');
  await page.fill('#lastName', 'User');
  await page.fill('#address', '123 Main St, Anytown, CA 90210');
  await page.fill('#cardNumber', '4111111111111111');
  await page.fill('#expirationDate', '12/28');

  // Submit the form
  await page.click('.ship-it-btn');
  await page.waitForSelector('.confirm-page', { timeout: 15_000 });

  const pageIssues = await evinced.evAnalyze();

  const dest = saveJson('page-order-confirmation', pageIssues as never[]);
  console.log(`\n[OrderConfirmation] ${(pageIssues as unknown[]).length} issues → ${dest}`);
});
