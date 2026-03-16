import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

interface AxeResult {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
    impact: string | null;
  }>;
}

interface PageAuditResult {
  page: string;
  url: string;
  violations: AxeResult[];
  incomplete: AxeResult[];
  timestamp: string;
}

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

async function auditPage(page: any, url: string, pageName: string, setup?: () => Promise<void>): Promise<PageAuditResult> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  if (setup) {
    await setup();
  }
  await page.waitForTimeout(1000);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();

  return {
    page: pageName,
    url,
    violations: results.violations as AxeResult[],
    incomplete: results.incomplete as AxeResult[],
    timestamp: new Date().toISOString(),
  };
}

test.describe('Full Accessibility Audit - All Pages', () => {
  const allResults: PageAuditResult[] = [];

  test('Audit: Homepage (/)', async ({ page }) => {
    const result = await auditPage(page, `${BASE_URL}/`, 'HomePage');
    allResults.push(result);

    const outputPath = path.join(__dirname, '..', 'test-results', 'audit-homepage.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n=== Homepage: ${result.violations.length} violations, ${result.incomplete.length} incomplete ===`);
    result.violations.forEach(v => {
      console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.help}`);
      v.nodes.slice(0, 2).forEach(n => console.log(`    Element: ${n.html.substring(0, 100)}`));
    });
  });

  test('Audit: New Products Page (/shop/new)', async ({ page }) => {
    const result = await auditPage(page, `${BASE_URL}/shop/new`, 'NewPage', async () => {
      await page.waitForSelector('.products-grid', { timeout: 15000 }).catch(() => {});
    });
    allResults.push(result);

    const outputPath = path.join(__dirname, '..', 'test-results', 'audit-new-page.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n=== New Page: ${result.violations.length} violations, ${result.incomplete.length} incomplete ===`);
    result.violations.forEach(v => {
      console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.help}`);
      v.nodes.slice(0, 2).forEach(n => console.log(`    Element: ${n.html.substring(0, 100)}`));
    });
  });

  test('Audit: Product Detail Page (/product/:id)', async ({ page }) => {
    // Navigate directly to product 1 (known to exist in products.json)
    const productUrl = `${BASE_URL}/product/1`;

    const result = await auditPage(page, productUrl, 'ProductPage', async () => {
      await page.waitForSelector('h3', { timeout: 10000 }).catch(() => {});
    });
    allResults.push(result);

    const outputPath = path.join(__dirname, '..', 'test-results', 'audit-product-page.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n=== Product Page (${productUrl}): ${result.violations.length} violations, ${result.incomplete.length} incomplete ===`);
    result.violations.forEach(v => {
      console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.help}`);
      v.nodes.slice(0, 2).forEach(n => console.log(`    Element: ${n.html.substring(0, 100)}`));
    });
  });

  test('Audit: Checkout Page (/checkout)', async ({ page }) => {
    // Set up cart state via localStorage before navigating to checkout
    await page.goto(`${BASE_URL}/product/1`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /add to cart/i }).click().catch(() => {});
    await page.waitForTimeout(500);

    // Close any modal and navigate directly to checkout
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const result: PageAuditResult = {
      page: 'CheckoutPage',
      url: `${BASE_URL}/checkout`,
      violations: results.violations as AxeResult[],
      incomplete: results.incomplete as AxeResult[],
      timestamp: new Date().toISOString(),
    };
    allResults.push(result);

    const outputPath = path.join(__dirname, '..', 'test-results', 'audit-checkout-page.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n=== Checkout Page: ${result.violations.length} violations, ${result.incomplete.length} incomplete ===`);
    result.violations.forEach(v => {
      console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.help}`);
      v.nodes.slice(0, 2).forEach(n => console.log(`    Element: ${n.html.substring(0, 100)}`));
    });
  });

  test('Audit: Checkout Page - Shipping Step', async ({ page }) => {
    // Add item to cart and navigate to checkout
    await page.goto(`${BASE_URL}/product/1`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /add to cart/i }).click().catch(() => {});
    await page.waitForTimeout(500);

    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Click Continue to advance to shipping step
    await page.locator('.checkout-continue-btn').click().catch(() => {});
    await page.waitForSelector('.shipping-form', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const result: PageAuditResult = {
      page: 'CheckoutPage (Shipping Step)',
      url: `${BASE_URL}/checkout#shipping`,
      violations: results.violations as AxeResult[],
      incomplete: results.incomplete as AxeResult[],
      timestamp: new Date().toISOString(),
    };
    allResults.push(result);

    const outputPath = path.join(__dirname, '..', 'test-results', 'audit-checkout-shipping.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n=== Checkout Shipping Step: ${result.violations.length} violations, ${result.incomplete.length} incomplete ===`);
    result.violations.forEach(v => {
      console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.help}`);
      v.nodes.slice(0, 2).forEach(n => console.log(`    Element: ${n.html.substring(0, 100)}`));
    });
  });

  test('Audit: Cart Modal Open State', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Open the cart modal
    const cartBtn = page.locator('[aria-label="Cart"], .cart-icon, [class*="cart"]').first();
    await cartBtn.click().catch(async () => {
      // try clicking any cart-related element
      await page.locator('header').locator('div').nth(2).click().catch(() => {});
    });
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const result: PageAuditResult = {
      page: 'HomePage (Cart Modal Open)',
      url: `${BASE_URL}/#cart-open`,
      violations: results.violations as AxeResult[],
      incomplete: results.incomplete as AxeResult[],
      timestamp: new Date().toISOString(),
    };
    allResults.push(result);

    const outputPath = path.join(__dirname, '..', 'test-results', 'audit-cart-modal.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n=== Cart Modal: ${result.violations.length} violations, ${result.incomplete.length} incomplete ===`);
    result.violations.forEach(v => {
      console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.help}`);
      v.nodes.slice(0, 2).forEach(n => console.log(`    Element: ${n.html.substring(0, 100)}`));
    });
  });

  test('Consolidate all audit results', async ({ page }) => {
    // Read all partial audit files and write consolidated output
    const testResultsDir = path.join(__dirname, '..', 'test-results');
    const auditFiles = [
      'audit-homepage.json',
      'audit-new-page.json',
      'audit-product-page.json',
      'audit-checkout-page.json',
      'audit-checkout-shipping.json',
      'audit-cart-modal.json',
    ];

    const consolidated: PageAuditResult[] = [];
    for (const f of auditFiles) {
      const fp = path.join(testResultsDir, f);
      if (fs.existsSync(fp)) {
        consolidated.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
      }
    }

    const consolidatedPath = path.join(testResultsDir, 'audit-all-pages.json');
    fs.writeFileSync(consolidatedPath, JSON.stringify(consolidated, null, 2));
    console.log(`\n✅ Consolidated audit results saved to: ${consolidatedPath}`);

    // Print summary
    let totalViolations = 0;
    consolidated.forEach(r => {
      totalViolations += r.violations.length;
      console.log(`  ${r.page}: ${r.violations.length} violations`);
    });
    console.log(`  TOTAL: ${totalViolations} violations across ${consolidated.length} pages/states`);
  });
});
