import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveJson(filename: string, data: unknown) {
  ensureDir(RESULTS_DIR);
  fs.writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('Per-page a11y audit', () => {

  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evStop();
    saveJson('page-homepage.json', issues);
    console.log(`Homepage issues: ${issues.length}`);
  });

  test('Products page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evStop();
    saveJson('page-products.json', issues);
    console.log(`Products page issues: ${issues.length}`);
  });

  test('Product detail page (/product/1)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evStop();
    saveJson('page-product-detail.json', issues);
    console.log(`Product detail page issues: ${issues.length}`);
  });

  test('Checkout page (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });
    // Navigate to product, add to cart, then proceed to checkout
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evStop();
    saveJson('page-checkout.json', issues);
    console.log(`Checkout page issues: ${issues.length}`);
  });

  test('Order confirmation page (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });
    // Full flow to order confirmation
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 10000 });
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy, Mountain View, CA 94043');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10000 });
    await page.waitForSelector('.confirm-page', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const issues = await evinced.evStop();
    saveJson('page-order-confirmation.json', issues);
    console.log(`Order confirmation page issues: ${issues.length}`);
  });

});
