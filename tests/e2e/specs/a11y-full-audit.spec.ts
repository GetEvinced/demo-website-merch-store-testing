import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = path.join(__dirname, '..', 'test-results', 'a11y-audit-bdbf');

async function saveResults(
  issues: any[],
  pageName: string,
  evinced: EvincedSDK
): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const csvPath = path.join(OUTPUT_DIR, `${pageName}.csv`);
  await evinced.evSaveFile(issues, 'csv', csvPath);
  console.log(`\n[${pageName}] Issues: ${issues.length} → ${csvPath}`);
}

// Pre-seed cart in localStorage before loading checkout
async function seedCart(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    const cartItem = JSON.stringify([{
      id: 1,
      name: 'Chrome Dino Maps Tourist Accessory Pack',
      price: 15.99,
      image: '/images/products/1.png',
      quantity: 1,
      available: 10
    }]);
    window.localStorage.setItem('cart-items', cartItem);
  });
}

test.describe('Full Site Accessibility Audit', () => {

  test('Homepage (/)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const issues = await evinced.evAnalyze();
    await saveResults(issues, 'homepage', evinced);
    console.log(`Homepage total issues: ${issues.length}`);
  });

  test('Products Page (/shop/new)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    await saveResults(issues, 'products-page', evinced);
    console.log(`Products page total issues: ${issues.length}`);
  });

  test('Product Detail Page (/product/1)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForLoadState('networkidle');
    console.log(`Product detail URL: ${page.url()}`);
    const issues = await evinced.evAnalyze();
    await saveResults(issues, 'product-detail', evinced);
    console.log(`Product detail total issues: ${issues.length}`);
  });

  test('Checkout Basket Step (/checkout)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await seedCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log(`Checkout basket URL: ${page.url()}`);
    const issues = await evinced.evAnalyze();
    await saveResults(issues, 'checkout-basket', evinced);
    console.log(`Checkout basket total issues: ${issues.length}`);
  });

  test('Checkout Shipping Step', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    await seedCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Click the "Continue" div to advance to shipping step
    const continueBtn = page.locator('.checkout-continue-btn');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }
    console.log(`Checkout shipping URL: ${page.url()}`);
    const issues = await evinced.evAnalyze();
    await saveResults(issues, 'checkout-shipping', evinced);
    console.log(`Checkout shipping total issues: ${issues.length}`);
  });

  test('Order Confirmation Page (/order-confirmation)', async ({ page }) => {
    const evinced = new EvincedSDK(page);
    // Navigate directly with React Router state simulation
    await seedCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Go to shipping step
    const continueBtn = page.locator('.checkout-continue-btn');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(500);
    }
    // Fill in the shipping form
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#address', '123 Test Street');
    await page.fill('#cardNumber', '4111111111111111');
    await page.fill('#expirationDate', '12/26');
    // Submit the order
    const shipItBtn = page.locator('button[type="submit"]').first();
    if (await shipItBtn.isVisible()) {
      await shipItBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    console.log(`Order confirmation URL: ${page.url()}`);
    const issues = await evinced.evAnalyze();
    await saveResults(issues, 'order-confirmation', evinced);
    console.log(`Order confirmation total issues: ${issues.length}`);
  });
});
