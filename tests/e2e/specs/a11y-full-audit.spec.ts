import { test } from '@playwright/test';
import { EvincedSDK, setOfflineCredentials } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results', 'a11y-audit');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

test.describe('Full Site A11Y Audit — Evinced SDK', () => {
  test.beforeAll(async () => {
    ensureDir(RESULTS_DIR);
    const serviceId = process.env.EVINCED_SERVICE_ID ?? process.env.EVINCED_SERVICE_ACCOUNT_ID;
    const token = process.env.EVINCED_AUTH_TOKEN ?? process.env.PLAYWRIGHT_SDK_OFFLINE_TOKEN;
    if (!serviceId || !token) {
      throw new Error(`Missing Evinced credentials. serviceId=${!!serviceId} token=${!!token}`);
    }
    await setOfflineCredentials({ serviceId, token });
  });

  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });
    // allow dynamic content to settle
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(issues, 'csv', path.join(RESULTS_DIR, 'homepage.csv'));
    console.log(`\nHomepage: ${issues.length} issues found`);
  });

  test('Products Page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(issues, 'csv', path.join(RESULTS_DIR, 'products.csv'));
    console.log(`\nProducts: ${issues.length} issues found`);
  });

  test('Product Detail Page (/product/:id)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Use the first product from data
    await page.goto('/product/1');
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(issues, 'csv', path.join(RESULTS_DIR, 'product-detail.csv'));
    console.log(`\nProduct Detail: ${issues.length} issues found`);
  });

  test('Checkout Page — Basket Step (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    // Seed the cart so the checkout page has items
    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });
    await page.evaluate(() => {
      const cartItem = [
        {
          id: 1,
          name: 'Sample Product',
          price: 29.99,
          quantity: 1,
          image: '/images/placeholder.jpg',
        },
      ];
      localStorage.setItem('cart-items', JSON.stringify(cartItem));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(issues, 'csv', path.join(RESULTS_DIR, 'checkout-basket.csv'));
    console.log(`\nCheckout Basket: ${issues.length} issues found`);
  });

  test('Checkout Page — Shipping Step', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });
    await page.evaluate(() => {
      const cartItem = [
        {
          id: 1,
          name: 'Sample Product',
          price: 29.99,
          quantity: 1,
          image: '/images/placeholder.jpg',
        },
      ];
      localStorage.setItem('cart-items', JSON.stringify(cartItem));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15_000 });
    await page.waitForTimeout(500);

    // Advance to shipping step
    const continueBtn = page.locator('.checkout-continue-btn');
    await continueBtn.click();
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(issues, 'csv', path.join(RESULTS_DIR, 'checkout-shipping.csv'));
    console.log(`\nCheckout Shipping: ${issues.length} issues found`);
  });

  test('Order Confirmation Page (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });
    await page.evaluate(() => {
      const cartItem = [
        {
          id: 1,
          name: 'Sample Product',
          price: 29.99,
          quantity: 1,
          image: '/images/placeholder.jpg',
        },
      ];
      localStorage.setItem('cart-items', JSON.stringify(cartItem));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page', { timeout: 15_000 });
    await page.waitForTimeout(500);

    // Advance to shipping step
    const continueBtn = page.locator('.checkout-continue-btn');
    await continueBtn.click();
    await page.waitForTimeout(500);

    // Fill required fields
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Doe');
    await page.fill('#address', '123 Main St');
    await page.fill('#cardNumber', '4111111111111111');
    await page.fill('#expirationDate', '12/28');

    // Submit order
    const shipBtn = page.locator('.ship-it-btn');
    await shipBtn.click();
    await page.waitForSelector('.confirm-page', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await evinced.evAnalyze();
    await evinced.evSaveFile(issues, 'csv', path.join(RESULTS_DIR, 'order-confirmation.csv'));
    console.log(`\nOrder Confirmation: ${issues.length} issues found`);
  });
});
