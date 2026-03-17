import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = '/workspace/tests/e2e/test-results/a11y-audit-e3f2';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveCsv(filename: string, issues: any[]) {
  ensureDir(RESULTS_DIR);
  const headers = ['id', 'type', 'severity', 'message', 'selector', 'pageUrl', 'help'];
  const rows = issues.map((issue: any) => {
    const cols = [
      issue.id ?? '',
      issue.type ?? '',
      issue.severity ?? '',
      (issue.message ?? '').replace(/,/g, ';').replace(/\n/g, ' '),
      (issue.elements?.[0]?.selector ?? issue.selector ?? '').replace(/,/g, ';'),
      issue.pageUrl ?? '',
      (issue.help ?? '').replace(/,/g, ';'),
    ];
    return cols.map(c => `"${String(c).replace(/"/g, "''")}"`).join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(path.join(RESULTS_DIR, filename), csv, 'utf8');
}

function logIssues(label: string, issues: any[]) {
  console.log(`\n[${label}] Issues found: ${issues.length}`);
  const bySeverity: Record<string, number> = {};
  for (const issue of issues) {
    const sev = issue.severity ?? 'unknown';
    bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
  }
  for (const [sev, count] of Object.entries(bySeverity)) {
    console.log(`  ${sev}: ${count}`);
  }
}

test.describe('A11Y Full Audit – e3f2', () => {

  test('01 – Homepage (/)', async ({ page }) => {
    const ev = new EvincedSDK(page);
    await page.goto('/');
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await ev.evAnalyze();
    logIssues('Homepage', issues);
    saveCsv('01-homepage.csv', issues);

    await ev.evSaveFile(issues, 'html', path.join(RESULTS_DIR, '01-homepage.html'));
    console.log(`Homepage issues: ${issues.length}`);
    // Do not assert — we're collecting, not gating
  });

  test('02 – Products page (/shop/new)', async ({ page }) => {
    const ev = new EvincedSDK(page);
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await ev.evAnalyze();
    logIssues('Products', issues);
    saveCsv('02-products.csv', issues);

    await ev.evSaveFile(issues, 'html', path.join(RESULTS_DIR, '02-products.html'));
    console.log(`Products issues: ${issues.length}`);
  });

  test('03 – Product Detail page (/product/1)', async ({ page }) => {
    const ev = new EvincedSDK(page);
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const issues = await ev.evAnalyze();
    logIssues('Product Detail', issues);
    saveCsv('03-product-detail.csv', issues);

    await ev.evSaveFile(issues, 'html', path.join(RESULTS_DIR, '03-product-detail.html'));
    console.log(`Product Detail issues: ${issues.length}`);
  });

  test('04 – Checkout Basket step (/checkout)', async ({ page }) => {
    // Add item to cart via localStorage then navigate to checkout
    await page.goto('/');
    await page.waitForSelector('.hero-banner', { timeout: 15_000 });

    // Add a product to cart by going to product page and clicking Add to Cart
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.waitForTimeout(500);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForSelector('.checkout-basket', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const ev = new EvincedSDK(page);
    const issues = await ev.evAnalyze();
    logIssues('Checkout Basket', issues);
    saveCsv('04-checkout-basket.csv', issues);

    await ev.evSaveFile(issues, 'html', path.join(RESULTS_DIR, '04-checkout-basket.html'));
    console.log(`Checkout Basket issues: ${issues.length}`);
  });

  test('05 – Checkout Shipping step', async ({ page }) => {
    // Go through basket step first
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.waitForTimeout(500);

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-basket', { timeout: 15_000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const ev = new EvincedSDK(page);
    const issues = await ev.evAnalyze();
    logIssues('Checkout Shipping', issues);
    saveCsv('05-checkout-shipping.csv', issues);

    await ev.evSaveFile(issues, 'html', path.join(RESULTS_DIR, '05-checkout-shipping.html'));
    console.log(`Checkout Shipping issues: ${issues.length}`);
  });

  test('06 – Order Confirmation page', async ({ page }) => {
    // Must complete full checkout flow to reach order confirmation
    await page.goto('/product/1');
    await page.waitForSelector('h3', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.waitForTimeout(500);

    await page.goto('/checkout');
    await page.waitForSelector('.checkout-basket', { timeout: 15_000 });
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    await page.waitForSelector('.shipping-form', { timeout: 15_000 });

    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');
    await page.getByRole('button', { name: 'Ship It!' }).click();

    await page.waitForURL('**/order-confirmation', { timeout: 15_000 });
    await page.waitForSelector('.confirm-page', { timeout: 15_000 });
    await page.waitForTimeout(1000);

    const ev = new EvincedSDK(page);
    const issues = await ev.evAnalyze();
    logIssues('Order Confirmation', issues);
    saveCsv('06-order-confirmation.csv', issues);

    await ev.evSaveFile(issues, 'html', path.join(RESULTS_DIR, '06-order-confirmation.html'));
    console.log(`Order Confirmation issues: ${issues.length}`);
  });

});
