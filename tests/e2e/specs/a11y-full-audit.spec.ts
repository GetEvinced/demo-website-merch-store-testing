import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = '/workspace/tests/e2e/test-results/a11y-audit-6df0';

test.beforeAll(() => {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
});

test.describe('A11Y Audit — Homepage (/)', () => {
  test('homepage accessibility scan', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'homepage.html');
    await evinced.evSaveFile(issues, 'html', reportPath);
    const csvPath = path.join(RESULTS_DIR, 'homepage.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\nHomepage issues: ${issues.length}`);
    console.log(`Report: ${reportPath}`);
  });
});

test.describe('A11Y Audit — Products Page (/shop/new)', () => {
  test('products page accessibility scan', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'products-page.html');
    await evinced.evSaveFile(issues, 'html', reportPath);
    const csvPath = path.join(RESULTS_DIR, 'products-page.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\nProducts page issues: ${issues.length}`);
    console.log(`Report: ${reportPath}`);
  });
});

test.describe('A11Y Audit — Product Detail Page (/product/1)', () => {
  test('product detail page accessibility scan', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('h3, .product-detail', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'product-detail.html');
    await evinced.evSaveFile(issues, 'html', reportPath);
    const csvPath = path.join(RESULTS_DIR, 'product-detail.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\nProduct detail issues: ${issues.length}`);
    console.log(`Report: ${reportPath}`);
  });
});

test.describe('A11Y Audit — Checkout (basket step)', () => {
  test('checkout basket step accessibility scan', async ({ page }) => {
    // Set up cart via localStorage, then navigate to checkout
    await page.goto('/');
    await page.waitForSelector('.header-nav', { timeout: 15_000 });
    await page.evaluate(() => {
      const cartItem = {
        id: 1,
        name: 'Test Product',
        price: 49.99,
        quantity: 1,
        image: '/images/product1.jpg',
      };
      localStorage.setItem('cart-items', JSON.stringify([cartItem]));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-basket', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const evinced = new EvincedSDK(page);
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'checkout-basket.html');
    await evinced.evSaveFile(issues, 'html', reportPath);
    const csvPath = path.join(RESULTS_DIR, 'checkout-basket.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\nCheckout basket issues: ${issues.length}`);
    console.log(`Report: ${reportPath}`);
  });
});

test.describe('A11Y Audit — Checkout (shipping step)', () => {
  test('checkout shipping step accessibility scan', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.header-nav', { timeout: 15_000 });
    await page.evaluate(() => {
      const cartItem = {
        id: 1,
        name: 'Test Product',
        price: 49.99,
        quantity: 1,
        image: '/images/product1.jpg',
      };
      localStorage.setItem('cart-items', JSON.stringify([cartItem]));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-basket', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const evinced = new EvincedSDK(page);
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'checkout-shipping.html');
    await evinced.evSaveFile(issues, 'html', reportPath);
    const csvPath = path.join(RESULTS_DIR, 'checkout-shipping.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\nCheckout shipping issues: ${issues.length}`);
    console.log(`Report: ${reportPath}`);
  });
});

test.describe('A11Y Audit — Order Confirmation', () => {
  test('order confirmation page accessibility scan', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.header-nav', { timeout: 15_000 });
    await page.evaluate(() => {
      const cartItem = {
        id: 1,
        name: 'Test Product',
        price: 49.99,
        quantity: 1,
        image: '/images/product1.jpg',
      };
      localStorage.setItem('cart-items', JSON.stringify([cartItem]));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-basket', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy, Mountain View, CA 94043');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();

    await page.waitForURL('**/order-confirmation', { timeout: 15_000 });
    await page.waitForSelector('.confirm-page', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const evinced = new EvincedSDK(page);
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'order-confirmation.html');
    await evinced.evSaveFile(issues, 'html', reportPath);
    const csvPath = path.join(RESULTS_DIR, 'order-confirmation.csv');
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\nOrder confirmation issues: ${issues.length}`);
    console.log(`Report: ${reportPath}`);
  });
});
