import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

test.describe('Per-page accessibility audit', () => {
  test('Homepage (/)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const jsonPath = path.join(RESULTS_DIR, 'page-homepage.json');
    fs.writeFileSync(jsonPath, JSON.stringify(issues, null, 2));
    console.log(`Homepage issues: ${issues.length}`);
    const bySeverity: Record<string, number> = {};
    for (const issue of issues) {
      const sev = (issue as any).severity?.id ?? 'unknown';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
    }
    console.log('Severity breakdown:', JSON.stringify(bySeverity));
  });

  test('Products page (/shop/new)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const jsonPath = path.join(RESULTS_DIR, 'page-products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(issues, null, 2));
    console.log(`Products issues: ${issues.length}`);
    const bySeverity: Record<string, number> = {};
    for (const issue of issues) {
      const sev = (issue as any).severity?.id ?? 'unknown';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
    }
    console.log('Severity breakdown:', JSON.stringify(bySeverity));
  });

  test('Product detail (/product/1)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    const issues = await evinced.evAnalyze();
    const jsonPath = path.join(RESULTS_DIR, 'page-product-detail.json');
    fs.writeFileSync(jsonPath, JSON.stringify(issues, null, 2));
    console.log(`Product detail issues: ${issues.length}`);
    const bySeverity: Record<string, number> = {};
    for (const issue of issues) {
      const sev = (issue as any).severity?.id ?? 'unknown';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
    }
    console.log('Severity breakdown:', JSON.stringify(bySeverity));
  });

  test('Checkout page (/checkout)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    // Navigate to a product and add to cart first
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const jsonPath = path.join(RESULTS_DIR, 'page-checkout.json');
    fs.writeFileSync(jsonPath, JSON.stringify(issues, null, 2));
    console.log(`Checkout issues: ${issues.length}`);
    const bySeverity: Record<string, number> = {};
    for (const issue of issues) {
      const sev = (issue as any).severity?.id ?? 'unknown';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
    }
    console.log('Severity breakdown:', JSON.stringify(bySeverity));
  });

  test('Order confirmation (/order-confirmation)', async ({ page }) => {
    ensureDir(RESULTS_DIR);
    const evinced = new EvincedSDK(page);
    // Full checkout flow to reach order-confirmation
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
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
    await page.waitForURL('**/order-confirmation', { timeout: 10_000 });
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });
    const issues = await evinced.evAnalyze();
    const jsonPath = path.join(RESULTS_DIR, 'page-order-confirmation.json');
    fs.writeFileSync(jsonPath, JSON.stringify(issues, null, 2));
    console.log(`Order confirmation issues: ${issues.length}`);
    const bySeverity: Record<string, number> = {};
    for (const issue of issues) {
      const sev = (issue as any).severity?.id ?? 'unknown';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
    }
    console.log('Severity breakdown:', JSON.stringify(bySeverity));
  });
});
