import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const PAGES = [
  { name: 'HomePage', path: '/' },
  { name: 'ProductsPage', path: '/shop/new' },
  { name: 'ProductPage', path: '/product/GGOEGCBB258899' },
  { name: 'CheckoutPage', path: '/checkout' },
];

const RESULTS_DIR = path.join(__dirname, '..', 'test-results', 'evinced-audit');

test.beforeAll(() => {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
});

for (const pageInfo of PAGES) {
  test(`a11y audit: ${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
    const evinced = new EvincedSDK(page);

    await page.goto(pageInfo.path);
    await page.waitForLoadState('networkidle');

    const issues = await evinced.evAnalyze();

    const reportPath = path.join(RESULTS_DIR, `${pageInfo.name.toLowerCase()}-issues.json`);
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));

    const csvPath = path.join(RESULTS_DIR, `${pageInfo.name.toLowerCase()}-issues.csv`);
    await evinced.evSaveFile(issues, 'csv', csvPath);

    console.log(`\n[${pageInfo.name}] Total issues: ${issues.length}`);
    const bySeverity: Record<string, number> = {};
    for (const issue of issues) {
      const sev = (issue as any).severity ?? (issue as any).impact ?? 'unknown';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
    }
    for (const [sev, count] of Object.entries(bySeverity)) {
      console.log(`  ${sev}: ${count}`);
    }
  });
}

test('a11y audit: ProductsPage navigation component', async ({ page }) => {
  const evinced = new EvincedSDK(page);

  await page.goto('/shop/new');
  await page.waitForLoadState('networkidle');

  const navIssues = await evinced.components.analyzeSiteNavigation({
    selector: 'nav[aria-label="Main navigation"]',
  });

  const comboboxIssues = await evinced.components.analyzeCombobox({
    selector: '.sort-btn',
  });

  const reportPath = path.join(RESULTS_DIR, 'productspage-components-issues.json');
  fs.writeFileSync(reportPath, JSON.stringify({ navIssues, comboboxIssues }, null, 2));

  const navCsvPath = path.join(RESULTS_DIR, 'productspage-nav-issues.csv');
  await evinced.evSaveFile(navIssues, 'csv', navCsvPath);

  const comboboxCsvPath = path.join(RESULTS_DIR, 'productspage-combobox-issues.csv');
  await evinced.evSaveFile(comboboxIssues, 'csv', comboboxCsvPath);

  console.log(`\n[ProductsPage Components] Nav issues: ${navIssues.length}, Combobox issues: ${comboboxIssues.length}`);
});
