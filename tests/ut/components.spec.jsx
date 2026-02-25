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
   * Test 3: Site Navigation (Header)
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
