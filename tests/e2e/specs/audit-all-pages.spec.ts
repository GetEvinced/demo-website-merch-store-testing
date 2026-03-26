import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive a11y audit covering every page/route in the demo website.
 *
 * Pages audited:
 *  1. Homepage          (/)
 *  2. Shop/New          (/shop/new)
 *  3. Product Detail    (/product/<first product>)
 *  4. Checkout          (/checkout) — basket step
 *  5. Order Confirm     (/order-confirmation) — reached via checkout submit
 *
 * For each page we also open cart & wishlist drawers to capture modal issues.
 * Results are saved as JSON so we can produce the final report.
 */

const OUTPUT_DIR = path.join(__dirname, '..', 'test-results');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function saveJson(name: string, data: unknown) {
  ensureOutputDir();
  const p = path.join(OUTPUT_DIR, name);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  return p;
}

// ─── Homepage ────────────────────────────────────────────────────────────────
test('audit: Homepage (/)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await evinced.evStart({ enableScreenshots: false });

  await page.goto('/');
  await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });

  // Open wishlist drawer
  const wishlistBtn = page.locator('.wishlist-btn, .icon-btn.wishlist-btn').first();
  if (await wishlistBtn.isVisible().catch(() => false)) {
    await wishlistBtn.click({ force: true });
    await page.waitForTimeout(800);
    // close it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  const issues = await evinced.evStop();
  const saved = saveJson('homepage-issues.json', issues);
  console.log(`Homepage: ${issues.length} issues → ${saved}`);
});

// ─── Shop / New (Products listing) ───────────────────────────────────────────
test('audit: Shop New (/shop/new)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await evinced.evStart({ enableScreenshots: false });

  await page.goto('/shop/new');
  await page.waitForSelector('.products-grid', { timeout: 15_000 });

  // Also run targeted component scans
  const pageIssues = await evinced.evAnalyze();

  const comboboxIssues = await evinced.components.analyzeCombobox({
    selector: '.sort-btn',
  }).catch(() => []);

  const navIssues = await evinced.components.analyzeSiteNavigation({
    selector: 'nav[aria-label="Main navigation"]',
  }).catch(() => []);

  const allIssues = await evinced.evMergeIssues(
    pageIssues,
    comboboxIssues as never[],
    navIssues as never[]
  );

  await evinced.evStop().catch(() => null);

  const saved = saveJson('shopnew-issues.json', allIssues);
  console.log(`ShopNew: ${allIssues.length} issues → ${saved}`);
});

// ─── Product Detail ───────────────────────────────────────────────────────────
test('audit: Product Detail (/product/:id)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await evinced.evStart({ enableScreenshots: false });

  await page.goto('/shop/new');
  await page.waitForSelector('.products-grid', { timeout: 15_000 });

  const firstLink = page.locator('.products-grid [role="listitem"] a').first();
  await firstLink.waitFor({ state: 'visible', timeout: 10_000 });
  await firstLink.click();
  await page.waitForURL('**/product/**', { timeout: 10_000 });
  await page.waitForSelector('h3', { timeout: 10_000 });

  const issues = await evinced.evStop();
  const saved = saveJson('product-detail-issues.json', issues);
  console.log(`ProductDetail: ${issues.length} issues → ${saved}`);
});

// ─── Checkout ─────────────────────────────────────────────────────────────────
test('audit: Checkout (/checkout)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await evinced.evStart({ enableScreenshots: false });

  // Seed cart so checkout is reachable
  await page.goto('/shop/new');
  await page.waitForSelector('.products-grid', { timeout: 15_000 });
  const firstLink = page.locator('.products-grid [role="listitem"] a').first();
  await firstLink.waitFor({ state: 'visible' });
  await firstLink.click();
  await page.waitForURL('**/product/**', { timeout: 10_000 });
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
  await page.waitForURL('**/checkout', { timeout: 10_000 });
  await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

  // Basket step
  await page.waitForTimeout(600);

  // Advance to shipping step
  await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
  await page.waitForSelector('.shipping-form', { timeout: 10_000 });

  const issues = await evinced.evStop();
  const saved = saveJson('checkout-issues.json', issues);
  console.log(`Checkout: ${issues.length} issues → ${saved}`);
});

// ─── Order Confirmation ───────────────────────────────────────────────────────
test('audit: Order Confirmation (/order-confirmation)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await evinced.evStart({ enableScreenshots: false });

  // Full journey to reach order-confirmation
  await page.goto('/shop/new');
  await page.waitForSelector('.products-grid', { timeout: 15_000 });
  const firstLink = page.locator('.products-grid [role="listitem"] a').first();
  await firstLink.waitFor({ state: 'visible' });
  await firstLink.click();
  await page.waitForURL('**/product/**', { timeout: 10_000 });
  await page.getByRole('button', { name: 'Add to cart' }).click();
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
  await page.waitForURL('**/order-confirmation', { timeout: 15_000 });
  await page.waitForSelector('.confirm-page', { timeout: 10_000 });

  const issues = await evinced.evStop();
  const saved = saveJson('order-confirmation-issues.json', issues);
  console.log(`OrderConfirmation: ${issues.length} issues → ${saved}`);
});

// ─── Cart Modal (open from any page) ─────────────────────────────────────────
test('audit: Cart Modal (drawer open state)', async ({ page }) => {
  const evinced = new EvincedSDK(page);
  await evinced.evStart({ enableScreenshots: false });

  // Seed cart
  await page.goto('/shop/new');
  await page.waitForSelector('.products-grid', { timeout: 15_000 });
  const firstLink = page.locator('.products-grid [role="listitem"] a').first();
  await firstLink.waitFor({ state: 'visible' });
  await firstLink.click();
  await page.waitForURL('**/product/**', { timeout: 10_000 });
  await page.getByRole('button', { name: 'Add to cart' }).click();
  // Cart modal should now be open
  await page.waitForSelector('.cart-modal, [class*="cartModal"]', { timeout: 10_000 }).catch(() => null);
  await page.waitForTimeout(600);

  const issues = await evinced.evStop();
  const saved = saveJson('cart-modal-issues.json', issues);
  console.log(`CartModal: ${issues.length} issues → ${saved}`);
});
