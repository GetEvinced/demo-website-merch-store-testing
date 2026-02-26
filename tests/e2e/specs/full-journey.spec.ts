import { test } from '@playwright/test';
import { EvincedSDK } from '@evinced/js-playwright-sdk';
import path from 'path';

/**
 * Full user journey accessibility test for the demo e-commerce website.
 *
 * Flow:
 *  1. evStart() – begin continuous Evinced accessibility monitoring (with screenshots)
 *  2. Navigate to the homepage  (/)
 *  3. Click "New" nav link      → /shop/new  (products listing)
 *  4. Click the first product card → /product/:id
 *  5. Click "ADD TO CART"
 *  6. Click "Proceed to Checkout" inside the cart modal → /checkout (basket step)
 *  7. Click "Continue" (basket → shipping step)
 *  8. Fill in the shipping & payment form and click "Ship It!"
 *  9. evStop() – stop monitoring and collect all issues
 * 10. Save the Evinced HTML report to test-results/
 *
 * Prerequisites:
 *  - demo-website dev server running at http://localhost:8080 (or BASE_URL env var)
 *  - EVINCED_SERVICE_ID + EVINCED_API_KEY (or EVINCED_AUTH_TOKEN) set
 */
test.describe('Demo website – full purchase journey', () => {
  test('a11y scan: homepage → shop → product → cart → checkout', async ({ page }) => {
    // ── 1. Initialise Evinced SDK ──────────────────────────────────────────────
    const evinced = new EvincedSDK(page);

    // Start continuous monitoring.
    // `screenshots: true` tells the SDK to capture a screenshot for every issue
    // it finds, which makes the HTML report much more actionable.
    await evinced.evStart({
      enableScreenshots: true,
    });

    // ── 2. Navigate to the homepage ────────────────────────────────────────────
    await page.goto('/');
    // Wait for the hero banner to confirm the page has loaded
    await page.waitForSelector('.hero-banner, .header-nav', { timeout: 15_000 });

    // ── 3. Click the "New" nav link → /shop/new ────────────────────────────────
    // The nav renders: <Link to="/shop/new">New</Link>
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'New' }).click();
    await page.waitForURL('**/shop/new', { timeout: 10_000 });
    // Wait for the product grid to appear
    await page.waitForSelector('.products-grid', { timeout: 10_000 });

    // ── 4. Click the first product card → /product/:id ─────────────────────────
    // Each ProductCard renders an <a> inside a role="listitem" wrapper.
    // We grab the very first product link in the grid.
    const firstProductLink = page
      .locator('.products-grid [role="listitem"] a')
      .first();
    await firstProductLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstProductLink.click();
    await page.waitForURL('**/product/**', { timeout: 10_000 });
    // Wait for the product name heading to confirm the page rendered
    // Note: ProductPage uses <h3> for the product name (intentional a11y issue in this demo)
    await page.waitForSelector('h3', { timeout: 10_000 });

    // ── 5. Click "ADD TO CART" ─────────────────────────────────────────────────
    // ProductPage renders: <button aria-label="Add to cart">ADD TO CART</button>
    // Note: aria-label is the generic "Add to cart" (intentional a11y issue in this demo)
    await page.getByRole('button', { name: 'Add to cart' }).click();

    // ── 6. Click "Proceed to Checkout" inside the cart modal ───────────────────
    // CartModal uses CSS Modules (hashed class names) so we wait directly for the
    // "Proceed to Checkout" button, which is only rendered when the drawer is open
    // and the cart has items — no need for a separate drawer-open check.
    await page.getByRole('button', { name: 'Proceed to Checkout' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.waitForURL('**/checkout', { timeout: 10_000 });
    // Confirm the basket step is shown
    await page.waitForSelector('.checkout-basket', { timeout: 10_000 });

    // ── 7. Click "Continue" (basket → shipping step) ───────────────────────────
    // CheckoutPage basket step renders a div (not a button) with text "Continue"
    // It has class "checkout-continue-btn" and an onClick handler.
    await page.locator('.checkout-continue-btn', { hasText: 'Continue' }).click();
    // Wait for the shipping form to appear
    await page.waitForSelector('.shipping-form', { timeout: 10_000 });

    // ── 8. Fill in the checkout form and submit ────────────────────────────────
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#address', '1600 Amphitheatre Pkwy, Mountain View, CA 94043');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expirationDate', '12 / 28');

    // Click the "Ship It!" submit button
    await page.getByRole('button', { name: 'Ship It!' }).click();

    // Wait for the order confirmation page to load
    await page.waitForURL('**/order-confirmation', { timeout: 10_000 });
    // Note: page uses .confirm-page wrapper and <h3> heading (intentional a11y issues in this demo)
    await page.waitForSelector('.confirm-page', { timeout: 10_000 });

    // ── 9. Stop Evinced monitoring and collect issues ──────────────────────────
    const issues = await evinced.evStop();

    // ── 10. Save the HTML report ───────────────────────────────────────────────
    const reportPath = path.join(
      __dirname,
      '..',
      'test-results',
      'evinced-full-journey-report.html'
    );
    await evinced.evSaveFile(issues, 'html', reportPath);

    console.log(`\n✅ Evinced report saved to: ${reportPath}`);
    console.log(`   Total issues found: ${issues.length}`);
  });
});
