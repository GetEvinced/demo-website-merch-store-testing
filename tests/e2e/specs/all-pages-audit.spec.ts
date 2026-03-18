import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.resolve(__dirname, '../../../a11y-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveJson(filename: string, data: unknown) {
  ensureDir(OUTPUT_DIR);
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('All pages accessibility audit', () => {

  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });

    await page.goto('/');
    await page.waitForSelector('.hero-banner, #root', { timeout: 20_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evStop();
    saveJson('homepage.json', issues);
    console.log(`Homepage: ${issues.length} issues`);
  });

  test('New Products Page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });

    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid, #root', { timeout: 20_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evStop();
    saveJson('new-products.json', issues);
    console.log(`New Products: ${issues.length} issues`);
  });

  test('Product Detail Page (/product/1)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });

    await page.goto('/product/1');
    await page.waitForSelector('main, #root', { timeout: 20_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evStop();
    saveJson('product-detail.json', issues);
    console.log(`Product Detail: ${issues.length} issues`);
  });

  test('Checkout Page - Basket Step (/checkout)', async ({ page }) => {
    // Add a product to cart first via localStorage
    await page.goto('/');
    await page.waitForSelector('#root', { timeout: 20_000 });
    await page.evaluate(() => {
      const cart = [{ id: '1', name: 'Test Product', price: 29.99, quantity: 1, image: '/images/products/1.jpg' }];
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page, #root', { timeout: 20_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evStop();
    saveJson('checkout-basket.json', issues);
    console.log(`Checkout Basket: ${issues.length} issues`);
  });

  test('Checkout Page - Shipping Step (/checkout)', async ({ page }) => {
    // Add a product to cart first via localStorage
    await page.goto('/');
    await page.waitForSelector('#root', { timeout: 20_000 });
    await page.evaluate(() => {
      const cart = [{ id: '1', name: 'Test Product', price: 29.99, quantity: 1, image: '/images/products/1.jpg' }];
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-page, .checkout-basket', { timeout: 20_000 });
    await page.waitForTimeout(1000);

    // Click Continue to go to shipping step
    const continueBtn = page.locator('.checkout-continue-btn');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    }

    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });
    await page.waitForTimeout(2000);

    const issues = await evinced.evStop();
    saveJson('checkout-shipping.json', issues);
    console.log(`Checkout Shipping: ${issues.length} issues`);
  });

  test('Order Confirmation Page (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await evinced.evStart({ enableScreenshots: false });

    await page.goto('/order-confirmation');
    await page.waitForSelector('.confirm-page, #root', { timeout: 20_000 });
    await page.waitForTimeout(2000);

    const issues = await evinced.evStop();
    saveJson('order-confirmation.json', issues);
    console.log(`Order Confirmation: ${issues.length} issues`);
  });

});
