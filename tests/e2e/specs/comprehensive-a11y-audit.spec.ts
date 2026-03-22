import { test, expect } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../test-results');

interface IssueRecord {
  id: string;
  type: string;
  severity: string;
  message: string;
  selectors: string[];
  snippet?: string;
  page: string;
  pageUrl: string;
}

const allIssues: IssueRecord[] = [];

function extractIssues(issues: any[], pageName: string, pageUrl: string): IssueRecord[] {
  return (issues || []).map((issue: any, idx: number) => ({
    id: `${pageName}-${idx + 1}`,
    type: issue.type?.id || issue.type || 'UNKNOWN',
    severity: issue.type?.severity || issue.severity || 'UNKNOWN',
    message: issue.type?.message || issue.message || '',
    selectors: (issue.elements || []).map((el: any) => el?.selector?.css || el?.selector || ''),
    snippet: (issue.elements || [])[0]?.snippet || '',
    page: pageName,
    pageUrl,
  }));
}

async function auditPage(
  pageName: string,
  url: string,
  page: any,
  actions?: (page: any) => Promise<void>
): Promise<IssueRecord[]> {
  await page.goto(url, { waitUntil: 'networkidle' });

  if (actions) {
    await actions(page);
  }

  await page.waitForTimeout(1000);

  const sdk = new EvincedSDK(page);
  let issues: any[] = [];
  try {
    const result = await sdk.evAnalyze();
    issues = Array.isArray(result) ? result : (result as any)?.issues || [];
  } catch (e) {
    console.error(`Error during evAnalyze on ${pageName}:`, e);
  }

  const records = extractIssues(issues, pageName, url);
  console.log(`[${pageName}] Found ${records.length} issues`);
  return records;
}

test.describe('Comprehensive Accessibility Audit', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  });

  test('Homepage a11y audit', async ({ page }) => {
    const issues = await auditPage('Homepage', `${BASE_URL}/`, page);
    allIssues.push(...issues);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'page-homepage.json'), JSON.stringify(issues, null, 2));
    expect(issues).toBeDefined();
  });

  test('Products page a11y audit', async ({ page }) => {
    const issues = await auditPage('Products', `${BASE_URL}/shop/new`, page);
    allIssues.push(...issues);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'page-products.json'), JSON.stringify(issues, null, 2));
    expect(issues).toBeDefined();
  });

  test('Product Detail page a11y audit', async ({ page }) => {
    // Navigate to products first to find a valid product link
    await page.goto(`${BASE_URL}/shop/new`, { waitUntil: 'networkidle' });
    let productUrl = `${BASE_URL}/product/1`;
    try {
      const productLink = page.locator('a[href*="/product/"]').first();
      const href = await productLink.getAttribute('href');
      if (href) productUrl = `${BASE_URL}${href}`;
    } catch (e) {
      // use default
    }

    const issues = await auditPage('ProductDetail', productUrl, page);
    allIssues.push(...issues);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'page-product-detail.json'), JSON.stringify(issues, null, 2));
    expect(issues).toBeDefined();
  });

  test('Checkout page a11y audit', async ({ page }) => {
    const issues = await auditPage('Checkout', `${BASE_URL}/checkout`, page);
    allIssues.push(...issues);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'page-checkout.json'), JSON.stringify(issues, null, 2));
    expect(issues).toBeDefined();
  });

  test('Order Confirmation page a11y audit', async ({ page }) => {
    const issues = await auditPage('OrderConfirmation', `${BASE_URL}/order-confirmation`, page);
    allIssues.push(...issues);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'page-order-confirmation.json'), JSON.stringify(issues, null, 2));

    // Write combined JSON
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'all-issues.json'),
      JSON.stringify(allIssues, null, 2)
    );

    expect(issues).toBeDefined();
  });
});
