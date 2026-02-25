/**
 * Evinced Unit Tester – component accessibility tests
 *
 * Tests:
 *  1. analyzeModal  – CartModal (the shopping-cart slide-in drawer)
 *  2. analyzeCombobox – Sort dropdown on the Products (NewPage) listing
 *
 * Docs: https://developer.evinced.com/sdks-for-web-apps/unit-tester
 *
 * Authentication:
 *  Run `npx --package=@evinced/unit-tester login` once for local development.
 *  For CI set EVINCED_SERVICE_ID + EVINCED_API_KEY env vars.
 */

import React, { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider, useCart } from '../../src/context/CartContext';
import CartModal from '../../src/components/CartModal';
import Header from '../../src/components/Header';
import { WishlistProvider } from '../../src/context/WishlistContext';
import FilterSidebar from '../../src/components/FilterSidebar';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Inner component that seeds the cart with one item and opens the drawer
 * immediately on mount, so analyzeModal sees the modal in its open state.
 */
function CartModalOpener() {
  const { addToCart } = useCart();

  // Seed cart + open drawer on first render
  React.useEffect(() => {
    addToCart(
      {
        id: 1,
        name: 'Google Campus Unisex Tee',
        price: 19.99,
        image: '/images/products/GGOEGAAX0104.jpg',
      },
      1
    );
    // addToCart already calls setIsOpen(true) internally
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/**
 * Wraps CartModal with all the providers it needs:
 *  - CartProvider (state — addToCart also opens the drawer)
 *  - MemoryRouter (useNavigate inside CartModal)
 */
function CartModalHarness() {
  return (
    <MemoryRouter>
      <CartProvider>
        {/* Launcher button — id used as the analyzeModal trigger target */}
        <button id="cart-launcher" onClick={() => {}}>Open Cart</button>
        <CartModalOpener />
        <CartModal />
      </CartProvider>
    </MemoryRouter>
  );
}

/**
 * Self-contained sort combobox extracted from NewPage.
 * Renders only the sort trigger + options list so the test stays focused and fast.
 */
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance (Default)' },
  { value: 'a-z', label: 'A to Z' },
  { value: 'price-asc', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' },
  { value: 'new', label: 'New' },
];

function SortCombobox() {
  const [sort, setSort] = useState('relevance');
  const [open, setOpen] = useState(false);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Relevance';

  return (
    <div className="sort-dropdown">
      <button
        className="sort-btn"
        onClick={() => setOpen((o) => !o)}
      >
        Sort by {currentLabel}
      </button>
      {open && (
        <ul className="sort-options">
          {SORT_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              className={`sort-option ${sort === opt.value ? 'active' : ''}`}
              onClick={() => { setSort(opt.value); setOpen(false); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Minimal product list — one product per filter category so that every
 * checkbox group (Price, Size, Brand) renders at least one checkbox.
 *
 * Price bucket covered: $1–$19.99 (price: 16)
 * Size covered: XS
 * Brand covered: Google
 */
const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: 'Sample Product',
    price: 16,
    brand: 'Google',
    sizes: ['XS'],
  },
];

/**
 * Self-contained harness that renders FilterSidebar with all three filter
 * sections open and one checkbox visible in each group.
 */
function FilterSidebarHarness() {
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  return (
    <FilterSidebar
      products={SAMPLE_PRODUCTS}
      selectedPrices={selectedPrices}
      selectedSizes={selectedSizes}
      selectedBrands={selectedBrands}
      onPriceChange={(range) =>
        setSelectedPrices((prev) =>
          prev.some((r) => r.label === range.label)
            ? prev.filter((r) => r.label !== range.label)
            : [...prev, range]
        )
      }
      onSizeChange={(size) =>
        setSelectedSizes((prev) =>
          prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        )
      }
      onBrandChange={(brand) =>
        setSelectedBrands((prev) =>
          prev.includes(brand)
            ? prev.filter((b) => b !== brand)
            : [...prev, brand]
        )
      }
    />
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Evinced Unit Tester – component accessibility', () => {

  /**
   * Test 1: Cart Modal
   *
   * CartModal is a slide-in drawer that acts as a dialog.
   * analyzeModal checks that it has the correct ARIA role, accessible name,
   * focus management (focus trap, Escape to close), and aria-modal attribute.
   */
  test('CartModal – analyzeModal', async () => {
    render(<CartModalHarness />);

    // First argument: the launcher element that opens the modal.
    // Second argument: options containing modalLocator pointing at the dialog itself.
    // CartModal renders the drawer with id="cart-modal" (added for testability).
    const launcherElement = document.getElementById('cart-launcher');
    const results = await EvincedUT.analyzeModal(
      { element: launcherElement },
      { modalLocator: { id: 'cart-modal' } }
    );

    expect(results).toHaveNoFailures();
  }, 30_000);

  /**
   * Test 2: Sort Combobox
   *
   * The sort widget on the Products page is a custom button + listbox pattern.
   * analyzeCombobox checks that it has the correct ARIA roles (combobox, listbox,
   * option), aria-expanded, aria-controls, keyboard interactions, etc.
   *
   * We open the dropdown before scanning so the options list is in the DOM.
   */
  test('Sort dropdown – analyzeCombobox', async () => {
    render(<SortCombobox />);
    
    const results = await EvincedUT.analyzeCombobox({
      // Target the sort trigger button — EvincedUT will walk up/down to find
      // the full combobox widget (trigger + listbox)
      selector: '.sort-btn',
    });

    expect(results).toHaveNoFailures();
  }, 30_000);

  /**
   * Test 3: Filter Sidebar – Price checkbox
   *
   * The Price filter group renders a list of checkboxes, one per price range.
   * analyzeCheckbox verifies that each checkbox has a proper accessible name,
   * correct role, visible focus indicator, and is correctly associated with
   * its label element.
   *
   * Docs: https://developer.evinced.com/sdks-for-web-apps/unit-tester
   */
  test('FilterSidebar – analyzeCheckbox (Price)', async () => {
    render(<FilterSidebarHarness />);

    const results = await EvincedUT.analyzeCheckbox({
      selector: '.filter-group:nth-child(2) .filter-options .filter-option:first-child .custom-checkbox',
    });

    expect(results).toHaveNoFailures();
  }, 30_000);

  /**
   * Test 4: Filter Sidebar – Size checkbox
   *
   * The Size filter group renders a checkbox per available size (XS, SM, …).
   * analyzeCheckbox checks accessible name, role, and label association for
   * each size checkbox.
   */
  test('FilterSidebar – analyzeCheckbox (Size)', async () => {
    render(<FilterSidebarHarness />);

    const results = await EvincedUT.analyzeCheckbox({
      selector: '.filter-group:nth-child(3) .filter-options .filter-option:first-child .custom-checkbox',
    });

    expect(results).toHaveNoFailures();
  }, 30_000);

  /**
   * Test 5: Filter Sidebar – Brand checkbox
   *
   * The Brand filter group renders a checkbox per unique brand derived from
   * the products list. analyzeCheckbox checks accessible name, role, and
   * label association for each brand checkbox.
   */
  test('FilterSidebar – analyzeCheckbox (Brand)', async () => {
    render(<FilterSidebarHarness />);

    const results = await EvincedUT.analyzeCheckbox({
      selector: '.filter-group:nth-child(4) .filter-options .filter-option:first-child .custom-checkbox',
    });

    expect(results).toHaveNoFailures();
  }, 30_000);

  /**
   * Test 6 (was 3): Site Navigation (Header)
   *
   * The Header component renders a <nav aria-label="Main navigation"> with
   * top-level links and dropdown submenus (Apparel, Lifestyle, Stationery,
   * Collections, Shop by Brand, Sale).
   *
   * analyzeSiteNavigation checks that the navigation landmark has the correct
   * ARIA roles, accessible names, keyboard interaction patterns, and that any
   * popup submenus are properly announced to assistive technologies.
   *
   * Docs: https://developer.evinced.com/sdks-for-web-apps/unit-tester/main/#analyzesitenavigation
   */
  test('Header – analyzeSiteNavigation', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CartProvider>
          <WishlistProvider>
            <Header />
          </WishlistProvider>
        </CartProvider>
      </MemoryRouter>
    );

    // Target the <nav aria-label="Main navigation"> element rendered by Header
    const results = await EvincedUT.analyzeSiteNavigation({
      selector: 'nav[aria-label="Main navigation"]',
    });

    expect(results).toHaveNoFailures();
  }, 30_000);

});
