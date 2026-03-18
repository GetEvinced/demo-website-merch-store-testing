import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', '..', '..', 'a11y-results');

function saveJson(filename: string, data: unknown) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(data, null, 2));
}

test.describe('Full-site accessibility audit', () => {

  test('Homepage (/)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJson('homepage.json', issues);
    console.log(`Homepage: ${issues.length} issues`);
  });

  test('New Products (/shop/new)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJson('new-products.json', issues);
    console.log(`New Products: ${issues.length} issues`);
  });

  test('Product Detail (/product/1)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15_000 });
    const issues = await sdk.evAnalyze();
    saveJson('product-detail.json', issues);
    console.log(`Product Detail: ${issues.length} issues`);
  });

  test('Checkout – Basket step', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Must add product to cart first
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    const issues = await sdk.evAnalyze();
    saveJson('checkout-basket.json', issues);
    console.log(`Checkout Basket: ${issues.length} issues`);
  });

  test('Checkout – Shipping step', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Must add product to cart first
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-continue-btn', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn').click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    const issues = await sdk.evAnalyze();
    saveJson('checkout-shipping.json', issues);
    console.log(`Checkout Shipping: ${issues.length} issues`);
  });

  test('Order Confirmation (/order-confirmation)', async ({ page }) => {
    const sdk = new EvincedSDK(page);
    // Navigate through full purchase to reach order confirmation
    await page.goto('/product/1');
    await page.waitForSelector('main', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-continue-btn', { timeout: 10_000 });
    await page.locator('.checkout-continue-btn').click();
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '123 Main Street, Springfield, IL 62701');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();
    await page.waitForURL('**/order-confirmation', { timeout: 10_000 });
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });
    const issues = await sdk.evAnalyze();
    saveJson('order-confirmation.json', issues);
    console.log(`Order Confirmation: ${issues.length} issues`);
  });

});
