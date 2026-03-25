import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

test.describe('Demo website – per-page accessibility audit', () => {

  test('Homepage (/)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'page-homepage.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`Homepage issues: ${issues.length}`);
  });

  test('Shop New (/shop/new)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'page-shop-new.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`Shop New issues: ${issues.length}`);
  });

  test('Product Detail (/product/1)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForLoadState('networkidle');
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'page-product-detail.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`Product Detail issues: ${issues.length}`);
  });

  test('Checkout (/checkout via add-to-cart flow)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add to Cart")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForLoadState('networkidle');
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'page-checkout.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`Checkout issues: ${issues.length}`);
  });

  test('Order Confirmation (via checkout submit)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add to Cart")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForLoadState('networkidle');
    // Fill checkout form
    const continueBtn = page.locator('.checkout-continue-btn');
    if (await continueBtn.isVisible()) await continueBtn.click();
    await page.waitForTimeout(500);
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#address', '123 Test St');
    await page.fill('#cardNumber', '4111111111111111');
    await page.fill('#expirationDate', '12/28');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/order-confirmation', { timeout: 15_000 });
    await page.waitForLoadState('networkidle');
    const issues = await evinced.evAnalyze();
    const reportPath = path.join(RESULTS_DIR, 'page-order-confirmation.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`Order Confirmation issues: ${issues.length}`);
  });

});
