import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', 'test-results');

function saveJson(filename: string, data: unknown) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(data, null, 2));
}

// ─── Homepage ────────────────────────────────────────────────────────────────
test.describe('A11Y audit – Homepage (/)', () => {
  test('scan homepage', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, #main-content', { timeout: 15_000 });

    const issues = await sdk.evAnalyze();
    saveJson('audit-homepage.json', issues);

    console.log(`\nHomepage issues: ${issues.length}`);
    issues.forEach((i: Record<string, unknown>) =>
      console.log(`  [${i['type']}] ${i['summary']} — ${(i['elements'] as Array<{selector?: string}>)?.[0]?.selector ?? ''}`)
    );
  });
});

// ─── Products page (/shop/new) ────────────────────────────────────────────────
test.describe('A11Y audit – Products Page (/shop/new)', () => {
  test('scan products page', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    const issues = await sdk.evAnalyze();
    saveJson('audit-shop-new.json', issues);

    console.log(`\nProducts page issues: ${issues.length}`);
    issues.forEach((i: Record<string, unknown>) =>
      console.log(`  [${i['type']}] ${i['summary']} — ${(i['elements'] as Array<{selector?: string}>)?.[0]?.selector ?? ''}`)
    );
  });
});

// ─── Product Detail (/product/:id) ────────────────────────────────────────────
test.describe('A11Y audit – Product Detail Page', () => {
  test('scan product detail page', async ({ page }) => {
    const sdk = new EvincedSDK(page);

    // Navigate to shop first to get a real product id
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductHref = await page
      .locator('.products-grid [role="listitem"] a')
      .first()
      .getAttribute('href');

    await page.goto(firstProductHref ?? '/product/1');
    await page.waitForSelector('h3, h2', { timeout: 10_000 });

    const issues = await sdk.evAnalyze();
    saveJson('audit-product-detail.json', issues);

    console.log(`\nProduct detail issues: ${issues.length}`);
    issues.forEach((i: Record<string, unknown>) =>
      console.log(`  [${i['type']}] ${i['summary']} — ${(i['elements'] as Array<{selector?: string}>)?.[0]?.selector ?? ''}`)
    );
  });
});

// ─── Cart Modal (opened from product page) ────────────────────────────────────
test.describe('A11Y audit – Cart Modal', () => {
  test('scan cart modal', async ({ page }) => {
    const sdk = new EvincedSDK(page);

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductHref = await page
      .locator('.products-grid [role="listitem"] a')
      .first()
      .getAttribute('href');

    await page.goto(firstProductHref ?? '/product/1');
    await page.waitForSelector('button', { timeout: 10_000 });
    await page.getByRole('button', { name: /add to cart/i }).click();
    // Cart modal uses id="cart-modal" and a CSS module class for open state
    await page.waitForSelector('#cart-modal', { timeout: 10_000 });
    // Wait for the close button to confirm the cart is open and rendered
    await page.waitForTimeout(500);

    const issues = await sdk.evAnalyze();
    saveJson('audit-cart-modal.json', issues);

    console.log(`\nCart modal issues: ${issues.length}`);
    issues.forEach((i: Record<string, unknown>) =>
      console.log(`  [${i['type']}] ${i['summary']} — ${(i['elements'] as Array<{selector?: string}>)?.[0]?.selector ?? ''}`)
    );
  });
});

// ─── Checkout Page (/checkout) ───────────────────────────────────────────────
test.describe('A11Y audit – Checkout Page', () => {
  test('scan checkout page', async ({ page }) => {
    const sdk = new EvincedSDK(page);

    // Get a product, add to cart, proceed to checkout
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductHref = await page
      .locator('.products-grid [role="listitem"] a')
      .first()
      .getAttribute('href');

    await page.goto(firstProductHref ?? '/product/1');
    await page.waitForSelector('button', { timeout: 10_000 });
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.getByRole('button', { name: /proceed to checkout/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    const issues = await sdk.evAnalyze();
    saveJson('audit-checkout.json', issues);

    console.log(`\nCheckout page issues: ${issues.length}`);
    issues.forEach((i: Record<string, unknown>) =>
      console.log(`  [${i['type']}] ${i['summary']} — ${(i['elements'] as Array<{selector?: string}>)?.[0]?.selector ?? ''}`)
    );
  });
});

// ─── Order Confirmation (/order-confirmation) ─────────────────────────────────
test.describe('A11Y audit – Order Confirmation Page', () => {
  test('scan order confirmation page', async ({ page }) => {
    const sdk = new EvincedSDK(page);

    // Full journey to reach order confirmation
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid [role="listitem"] a', { timeout: 15_000 });
    const firstProductHref = await page
      .locator('.products-grid [role="listitem"] a')
      .first()
      .getAttribute('href');

    await page.goto(firstProductHref ?? '/product/1');
    await page.waitForSelector('button', { timeout: 10_000 });
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.getByRole('button', { name: /proceed to checkout/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });

    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#address', '123 Test St, City, CA 90210');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');

    await page.getByRole('button', { name: /ship it/i }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10_000 });
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });

    const issues = await sdk.evAnalyze();
    saveJson('audit-order-confirmation.json', issues);

    console.log(`\nOrder confirmation issues: ${issues.length}`);
    issues.forEach((i: Record<string, unknown>) =>
      console.log(`  [${i['type']}] ${i['summary']} — ${(i['elements'] as Array<{selector?: string}>)?.[0]?.selector ?? ''}`)
    );
  });
});
