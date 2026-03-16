import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

interface PageResult {
  page: string;
  url: string;
  violations: AxeViolation[];
}

interface AxeViolation {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

interface AxeNode {
  html: string;
  target: string[];
  failureSummary: string;
}

const pages = [
  { name: 'HomePage', path: '/' },
  { name: 'NewPage (Products)', path: '/shop/new' },
  { name: 'ProductPage (Detail)', path: '/product/1' },
  { name: 'CheckoutPage', path: '/checkout' },
  { name: 'OrderConfirmationPage', path: '/order-confirmation' },
];

const results: PageResult[] = [];

for (const pageConfig of pages) {
  test(`a11y audit: ${pageConfig.name}`, async ({ page }) => {
    await page.goto(pageConfig.path);

    // Wait for the main content to be rendered
    await page.waitForSelector('#main-content', { timeout: 15000 });
    // Extra wait to let dynamic content settle
    await page.waitForTimeout(1000);

    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const violations = axeResults.violations as AxeViolation[];

    results.push({
      page: pageConfig.name,
      url: pageConfig.path,
      violations,
    });

    console.log(`\n=== ${pageConfig.name} (${pageConfig.path}) ===`);
    console.log(`Violations found: ${violations.length}`);
    violations.forEach((v) => {
      console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} element(s))`);
    });
  });
}

test.afterAll(async () => {
  const outputDir = path.join(__dirname, '..', 'test-results');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'a11y-audit-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Full audit results saved to: ${outputPath}`);
});
