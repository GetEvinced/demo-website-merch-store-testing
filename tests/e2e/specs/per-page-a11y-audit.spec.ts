import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';
import fs from 'fs';

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

interface PageConfig {
  name: string;
  slug: string;
  setup?: (page: import('@playwright/test').Page) => Promise<void>;
}

const PAGES: PageConfig[] = [
  { name: 'homepage', slug: 'page-homepage' },
  { name: 'products', slug: 'page-products', setup: async (page) => { await page.goto('/shop/new'); await page.waitForSelector('.products-grid', { timeout: 15000 }); } },
  {
    name: 'product-detail',
    slug: 'page-product-detail',
    setup: async (page) => {
      await page.goto('/product/1');
      await page.waitForSelector('h3', { timeout: 15000 });
    }
  },
  {
    name: 'checkout',
    slug: 'page-checkout',
    setup: async (page) => {
      // Navigate through the flow to reach checkout with items in cart
      await page.goto('/product/1');
      await page.waitForSelector('h3', { timeout: 15000 });
      await page.getByRole('button', { name: 'Add to cart' }).click();
      await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
      await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
      await page.waitForURL('**/checkout', { timeout: 10000 });
      await page.waitForSelector('.checkout-basket', { timeout: 10000 });
    }
  },
  {
    name: 'order-confirmation',
    slug: 'page-order-confirmation',
    setup: async (page) => {
      // Navigate through full flow to reach order confirmation
      await page.goto('/product/1');
      await page.waitForSelector('h3', { timeout: 15000 });
      await page.getByRole('button', { name: 'Add to cart' }).click();
      await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10000 });
      await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
      await page.waitForURL('**/checkout', { timeout: 10000 });
      await page.waitForSelector('.checkout-basket', { timeout: 10000 });
      await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
      await page.waitForSelector('.shipping-form', { timeout: 10000 });
      await page.fill('#firstName', 'Jane');
      await page.fill('#lastName', 'Smith');
      await page.fill('#address', '1600 Amphitheatre Pkwy, Mountain View, CA 94043');
      await page.fill('#cardNumber', '4111 1111 1111 1111');
      await page.fill('#expirationDate', '12 / 28');
      await page.getByRole('button', { name: 'Ship It!' }).click();
      await page.waitForURL('**/order-confirmation', { timeout: 10000 });
      await page.waitForSelector('.confirm-page', { timeout: 10000 });
    }
  },
];

test.describe('Per-page accessibility audit', () => {
  test.beforeAll(() => {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  });

  for (const pageConfig of PAGES) {
    test(`a11y scan: ${pageConfig.name}`, async ({ page }) => {
      const evinced = new EvincedSDK(page);

      if (pageConfig.setup) {
        await pageConfig.setup(page);
      } else {
        await page.goto('/');
        await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15000 });
      }

      const issues = await evinced.evAnalyze();

      const jsonPath = path.join(RESULTS_DIR, `${pageConfig.slug}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(issues, null, 2));

      const htmlPath = path.join(RESULTS_DIR, `${pageConfig.slug}.html`);
      await evinced.evSaveFile(issues, 'html', htmlPath);

      console.log(`\n[${pageConfig.name}] Issues: ${issues.length} — JSON: ${jsonPath}`);
    });
  }
});
