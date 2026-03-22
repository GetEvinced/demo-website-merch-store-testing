import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function saveJSON(filename: string, data: unknown) {
  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('Per-page a11y audit', () => {

  test('homepage: /', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJSON('page-homepage.json', issues);
    console.log(`Homepage issues: ${issues.length}`);
  });

  test('products page: /shop/new', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const pageIssues = await sdk.evAnalyze();

    const comboboxIssues = await sdk.components.analyzeCombobox({
      selector: '.sort-btn',
    });

    const navIssues = await sdk.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });

    // Analyse each filter-group checkbox individually (SDK requires a unique match)
    const filterGroups = ['.filter-group:nth-child(1) .filter-option:first-child',
                          '.filter-group:nth-child(2) .filter-option:first-child',
                          '.filter-group:nth-child(3) .filter-option:first-child'];
    const checkboxIssueSets = await Promise.all(
      filterGroups.map(sel => sdk.components.analyzeCheckbox({ selector: sel }).catch(() => [] as typeof pageIssues))
    );
    const allIssues = await sdk.evMergeIssues(pageIssues, comboboxIssues, navIssues, ...checkboxIssueSets);
    saveJSON('page-products.json', allIssues);
    const checkboxTotal = checkboxIssueSets.reduce((s, a) => s + a.length, 0);
    console.log(`Products issues: ${allIssues.length} (page=${pageIssues.length}, combobox=${comboboxIssues.length}, nav=${navIssues.length}, checkbox=${checkboxTotal})`);
  });

  test('product detail: /product/:id', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Navigate to products page first to find a product ID
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const productLink = page.locator('.product-card-image-link').first();
    const href = await productLink.getAttribute('href');
    if (href) {
      await page.goto(href);
    } else {
      await page.goto('/product/1');
    }
    await page.waitForSelector('.product-detail, .product-page, h1, h3', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJSON('page-product-detail.json', issues);
    console.log(`Product detail issues: ${issues.length}`);
  });

  test('checkout: /checkout (via cart flow)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Add a product to cart first so checkout is accessible
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    // Click the first product
    const productLink = page.locator('.product-card-image-link').first();
    await productLink.click();
    await page.waitForSelector('.product-detail, .product-page, .add-to-cart-btn, button', { timeout: 15_000 });

    // Click "Add to Cart"
    try {
      const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
      await addToCartBtn.click({ timeout: 5_000 });
      await page.waitForTimeout(1000);
    } catch {
      // If can't click, proceed anyway
    }

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForSelector('.checkout, .checkout-page, .checkout-container, h3, h1', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJSON('page-checkout.json', issues);
    console.log(`Checkout issues: ${issues.length}`);
  });

  test('order confirmation: /order-confirmation', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/order-confirmation');
    await page.waitForSelector('body', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJSON('page-order-confirmation.json', issues);
    console.log(`Order confirmation issues: ${issues.length}`);
  });

});
