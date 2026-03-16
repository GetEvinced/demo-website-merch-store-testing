import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Comprehensive accessibility audit for all pages of the demo e-commerce website.
 *
 * Pages covered:
 *   - / (HomePage)
 *   - /shop/new (NewPage – products listing)
 *   - /product/1 (ProductPage – single product detail)
 *   - /checkout (CheckoutPage – basket step, requires cart item)
 *   - /checkout + continue (CheckoutPage – shipping/payment step)
 *
 * Saves JSON results to tests/e2e/test-results/a11y-audit-results.json
 */

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');
const OUTPUT_FILE = path.join(RESULTS_DIR, 'a11y-audit-results.json');

interface PageResult {
  page: string;
  url: string;
  violations: any[];
  incomplete: any[];
  passes: number;
}

const allResults: PageResult[] = [];

test.describe.configure({ mode: 'serial' });

test.describe('Demo website – full accessibility audit', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }
  });

  test.afterAll(() => {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2));
    console.log(`\n✅ Results written to: ${OUTPUT_FILE}`);
    const totalViolations = allResults.reduce((s, r) => s + r.violations.length, 0);
    const totalOccurrences = allResults.reduce(
      (s, r) => s + r.violations.reduce((vs, v) => vs + v.nodes.length, 0),
      0
    );
    console.log(`   Pages scanned: ${allResults.length}`);
    console.log(`   Unique violation types: ${totalViolations}`);
    console.log(`   Total affected node occurrences: ${totalOccurrences}`);
  });

  // ──────────────────────────────────────────────────────
  // 1. HOME PAGE
  // ──────────────────────────────────────────────────────
  test('HomePage (/)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.hero-banner, #root > *', { timeout: 15_000 });
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    allResults.push({
      page: 'HomePage',
      url: '/',
      violations: results.violations,
      incomplete: results.incomplete,
      passes: results.passes.length,
    });

    console.log(`\nHomePage violations: ${results.violations.length}`);
    results.violations.forEach((v) =>
      console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
    );
  });

  // ──────────────────────────────────────────────────────
  // 2. PRODUCTS PAGE (/shop/new)
  // ──────────────────────────────────────────────────────
  test('NewPage (/shop/new)', async ({ page }) => {
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    allResults.push({
      page: 'NewPage',
      url: '/shop/new',
      violations: results.violations,
      incomplete: results.incomplete,
      passes: results.passes.length,
    });

    console.log(`\nNewPage violations: ${results.violations.length}`);
    results.violations.forEach((v) =>
      console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
    );
  });

  // ──────────────────────────────────────────────────────
  // 3. PRODUCT DETAIL PAGE (/product/1)
  // ──────────────────────────────────────────────────────
  test('ProductPage (/product/1)', async ({ page }) => {
    await page.goto('/product/1');
    await page.waitForSelector('h3, h1', { timeout: 15_000 });
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    allResults.push({
      page: 'ProductPage',
      url: '/product/1',
      violations: results.violations,
      incomplete: results.incomplete,
      passes: results.passes.length,
    });

    console.log(`\nProductPage violations: ${results.violations.length}`);
    results.violations.forEach((v) =>
      console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
    );
  });

  // ──────────────────────────────────────────────────────
  // 4. CHECKOUT – BASKET STEP (add item first)
  // ──────────────────────────────────────────────────────
  test('CheckoutPage – basket step (/checkout)', async ({ page }) => {
    // Add a product to cart first
    await page.goto('/product/1');
    await page.waitForSelector('h3, h1', { timeout: 15_000 });
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Navigate to checkout
    await page.getByRole('button', { name: /proceed to checkout/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    allResults.push({
      page: 'CheckoutPage (basket step)',
      url: '/checkout',
      violations: results.violations,
      incomplete: results.incomplete,
      passes: results.passes.length,
    });

    console.log(`\nCheckoutPage (basket) violations: ${results.violations.length}`);
    results.violations.forEach((v) =>
      console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
    );
  });

  // ──────────────────────────────────────────────────────
  // 5. CHECKOUT – SHIPPING STEP
  // ──────────────────────────────────────────────────────
  test('CheckoutPage – shipping step', async ({ page }) => {
    await page.goto('/product/1');
    await page.waitForSelector('h3, h1', { timeout: 15_000 });
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.getByRole('button', { name: /proceed to checkout/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn').click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    allResults.push({
      page: 'CheckoutPage (shipping step)',
      url: '/checkout#shipping',
      violations: results.violations,
      incomplete: results.incomplete,
      passes: results.passes.length,
    });

    console.log(`\nCheckoutPage (shipping) violations: ${results.violations.length}`);
    results.violations.forEach((v) =>
      console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
    );
  });
});
