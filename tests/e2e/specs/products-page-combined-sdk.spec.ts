import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';

/**
 * Products page combined accessibility test.
 *
 * Flow:
 *  1. Navigate to the products listing page (/shop/new)
 *  2. evAnalyze() – full-page accessibility scan
 *  3. evAnalyzeCombobox() – targeted scan of the sort combobox widget
 *  4. evAnalyzeSiteNavigation() – targeted scan of the main navigation menu
 *  5. evMergeIssues() – merge & deduplicate all three issue lists
 *  6. Save the combined results to a CSV report
 *
 * Prerequisites:
 *  - demo-website dev server running at http://localhost:8080 (or BASE_URL env var)
 *  - EVINCED_SERVICE_ID + EVINCED_API_KEY (or EVINCED_AUTH_TOKEN) set
 */
test.describe('Demo website – products page combined SDK scan', () => {
  test('a11y scan: full page + sort combobox + navigation', async ({ page }) => {
    // ── 1. Initialise Evinced SDK ──────────────────────────────────────────────
    const evinced = new EvincedSDK(page);

    // ── 2. Navigate to the products listing page ───────────────────────────────
    await page.goto('/shop/new');
    await page.waitForSelector('.products-grid', { timeout: 15_000 });

    // ── 3. evAnalyze() – full-page scan ───────────────────────────────────────
    const pageIssues = await evinced.evAnalyze();

    // ── 4. Open the sort dropdown so the options list is in the DOM ────────────
    // The sort trigger button has class "sort-btn" on the products page   
    // evAnalyzeCombobox() – targeted scan of the sort combobox widget
    const comboboxIssues = await evinced.components.analyzeCombobox({
      selector: '.sort-btn',
    });

    // ── 5. evAnalyzeSiteNavigation() – targeted scan of the main nav ──────────
    const navIssues = await evinced.components.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });

    // ── 6. Merge & deduplicate all issue lists ─────────────────────────────────
    const allIssues = await evinced.evMergeIssues(pageIssues, comboboxIssues, navIssues);

    // ── 7. Save the combined results to a CSV report ───────────────────────────
    const reportPath = path.join(
      __dirname,
      '..',
      'test-results',
      'evinced-products-page-combined-report.csv'
    );
    await evinced.evSaveFile(allIssues, 'csv', reportPath);

    console.log(`\n✅ Evinced CSV report saved to: ${reportPath}`);
    console.log(`   Total issues found: ${allIssues.length}`);
    console.log(`   Breakdown – page: ${pageIssues.length}, combobox: ${comboboxIssues.length}, nav: ${navIssues.length}`);
  });
});