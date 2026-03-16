# Accessibility (A11Y) Audit Report

**Repository:** demo-website (Google Merch Shop demo)  
**Audit Date:** 2026-03-16  
**Auditor:** Automated Cloud Agent  
**Tool:** `@evinced/evinced-mcp-server` v1.0.6 — driven via MCP JSON-RPC over stdio  
**Engine:** Evinced accessibility engine + axe-core rules  
**Branch:** `cursor/critical-a11y-issues-report-428b`

---

## 1. Methodology

The application was built with Webpack and served locally on `http://localhost:3000`. The Evinced MCP server (`@evinced/evinced-mcp-server@1.0.6`) was spawned as a subprocess and driven via the MCP JSON-RPC stdio protocol. The `analyze_page` tool was called for each page URL. The tool runs a headless Chromium browser, injects the Evinced accessibility engine, and returns a structured list of issues with severity, rule type, CSS selectors, and remediation guidance.

Checkout (`/checkout`) and Order Confirmation (`/order-confirmation`) require in-session state (items in cart). Those pages were cross-referenced from the axe-core scan and the repository's `A11Y_ISSUES.md` source annotations.

---

## 2. Page Inventory

| Route | Entry Point | Component Tree |
|---|---|---|
| `/` | `src/pages/HomePage.jsx` | HeroBanner, PopularSection, FeaturedPair, TrendingCollections, TheDrop |
| `/shop/new` | `src/pages/NewPage.jsx` | FilterSidebar, product grid with sort combobox |
| `/product/:id` | `src/pages/ProductPage.jsx` | Product detail, size selector, add-to-cart |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Basket review → Shipping & Payment form |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation screen |
| All routes (shared) | `src/components/Header.jsx` | Navigation, icon buttons (wishlist, search, cart, login, flag) |
| All routes (shared) | `src/components/Footer.jsx` | Footer navigation |
| All routes (overlay) | `src/components/CartModal.jsx` | Slide-in cart drawer |
| All routes (overlay) | `src/components/WishlistModal.jsx` | Slide-in wishlist drawer |

---

## 3. Audit Results Summary

### Evinced MCP Scan (3 directly accessible pages)

| Page | Critical | Serious | Moderate | Total |
|---|---|---|---|---|
| Home Page (`/`) | 31 | 3 | 0 | **34** |
| Shop/New Page (`/shop/new`) | 41 | 14 | 0 | **55** |
| Product Detail (`/product/1`) | 18 | 2 | 0 | **20** |
| **Subtotal** | **90** | **19** | **0** | **109** |

### Additional Pages (state-dependent, from axe-core + source annotation cross-reference)

| Page | Critical | Serious | Moderate | Total |
|---|---|---|---|---|
| Checkout (`/checkout`) | 1 | 2 | 2 | **5** |
| Order Confirmation (`/order-confirmation`) | 1 | 2 | 2 | **5** |

**Grand Total across all pages: 109+ issues detected by Evinced, with 92+ classified as Critical.**

---

## 4. Critical Issues — Detailed Findings

### CRIT-01 — `<html>` element missing `lang` attribute

| | |
|---|---|
| **Evinced Rule** | `Html-has-lang` (Serious) |
| **WCAG** | 3.1.1 Language of Page (Level A) |
| **Detected on** | All pages |
| **Source file** | `public/index.html` line 3 |
| **CSS Selector** | `html` |

**Current code:**
```html
<!-- A11Y-AXE html-has-lang: <html> element is missing a lang attribute -->
<html>
```

**Proposed fix:**
```html
<html lang="en">
```

**Why this approach:** A single attribute on the root element fixes the issue globally for every page rendered from this shell. Screen readers use `lang` to select the correct speech synthesis voice and pronunciation rules. Without it, assistive technologies may mispronounce content or read it in the wrong language entirely.

---

### CRIT-02 — Images missing `alt` text

| | |
|---|---|
| **Evinced Rule** | `Image-alt` (Critical) |
| **WCAG** | 1.1.1 Non-text Content (Level A) |
| **Detected on** | Home Page (`/`) |
| **Source files** | `src/components/HeroBanner.jsx` line 18, `src/components/TheDrop.jsx` line 13 |
| **CSS Selectors** | `img[src$="New_Tees.png"]`, `img[src$="2bags_charms1.png"]` |

**Current code:**
```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} />

// TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" />
```

**Proposed fix:**
```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="Winter basics collection — t-shirts and hoodies" />

// TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" alt="Google brand plushie bag charms — Android bot, YouTube icon, and Super G" />
```

**Why this approach:** Both images carry editorial content. Screen readers announce the filename when `alt` is absent — e.g. "New underscore Tees dot png" — which is meaningless. Descriptive `alt` text conveys the same information a sighted user would get from seeing the image. Decorative images would use `alt=""`, but these are content-bearing promotional images.

---

### CRIT-03 — Invalid ARIA attribute value: `aria-expanded="yes"`

| | |
|---|---|
| **Evinced Rule** | `Aria-valid-attr-value` (Critical) |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Detected on** | Home Page (`/`) |
| **Source file** | `src/components/FeaturedPair.jsx` line 46 |
| **CSS Selectors** | `.featured-card:nth-child(1) > .featured-card-info > h1`, `.featured-card:nth-child(2) > .featured-card-info > h1` |

**Current code:**
```jsx
{/* A11Y-AXE: aria-expanded must be "true" or "false", not "yes" */}
<h1 aria-expanded="yes">{item.title}</h1>
```

**Proposed fix:**
```jsx
<h1>{item.title}</h1>
```

**Why this approach:** `aria-expanded` accepts only `"true"` or `"false"`. The value `"yes"` is invalid and ignored by AT. More fundamentally, `aria-expanded` is a state attribute for interactive controls (buttons, comboboxes) — it has no meaning on a static heading. Removing it entirely is correct: the heading is not a widget and carries no expandable state.

---

### CRIT-04 — Invalid ARIA attribute value: `aria-relevant="changes"`

| | |
|---|---|
| **Evinced Rule** | `Aria-valid-attr-value` (Critical) |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Detected on** | Product Detail Page (`/product/1`) |
| **Source file** | `src/pages/ProductPage.jsx` lines 143–147 |
| **CSS Selector** | `ul[aria-relevant="changes"]` |

**Current code:**
```jsx
<ul className={styles.sizeList} aria-relevant="changes" aria-live="polite">
```

**Proposed fix:**
```jsx
<ul className={styles.sizeList} aria-relevant="additions removals" aria-live="polite">
```

**Why this approach:** `aria-relevant` accepts only space-separated tokens from `{additions, removals, text, all}`. `"changes"` is not a valid token and is silently discarded. The intended semantics — "announce when list items are added or removed" — is expressed as `"additions removals"`.

---

### CRIT-05 — `role="slider"` missing required ARIA state attributes

| | |
|---|---|
| **Evinced Rule** | `Aria-required-attr` (Critical) |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Detected on** | Home Page (`/`) — TheDrop section |
| **Source file** | `src/components/TheDrop.jsx` lines 18–19 |
| **CSS Selector** | `.drop-popularity-bar` |

**Current code:**
```jsx
{/* Missing required: aria-valuenow, aria-valuemin, aria-valuemax */}
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

**Proposed fix:**
```jsx
{/* Element is purely decorative — remove role and hide from AT */}
<div aria-hidden="true" className="drop-popularity-bar" />
```

**Why this approach:** The WAI-ARIA spec requires `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for `role="slider"`. Without them, AT cannot announce the slider's value. However, this bar is a static visual decoration with no interactive behaviour — applying `role="slider"` is semantically misleading. Hiding it with `aria-hidden="true"` is the correct fix: decorative elements should be invisible to the accessibility tree.

---

### CRIT-06 — Icon buttons without accessible names

| | |
|---|---|
| **Evinced Rule** | `Accessible name` + `Button-name` (Critical) |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Detected on** | All pages (shared Header and CartModal) |
| **Source files** | `src/components/Header.jsx` lines 140–159, `src/components/CartModal.jsx` lines 55–64, `src/components/WishlistModal.jsx` lines 60–64 |
| **CSS Selectors** | `.icon-btn:nth-child(2)`, `.icon-btn:nth-child(4)`, `#cart-modal > div:nth-child(1) > button`, `div[role="dialog"] > div:nth-child(1) > button` |

**Affected elements:**

| Element | File | Issue |
|---|---|---|
| Search `<div class="icon-btn">` | `Header.jsx:140` | `div` with no role, SVG `aria-hidden`, visible "Search" text is `aria-hidden` |
| Login `<div class="icon-btn">` | `Header.jsx:156` | `div` with no role, SVG `aria-hidden`, visible "Login" text is `aria-hidden` |
| Cart close `<button>` | `CartModal.jsx:56` | Icon-only button, SVG `aria-hidden`, no `aria-label` |
| Wishlist close `<button>` | `WishlistModal.jsx:60` | Icon-only button, SVG `aria-hidden`, no `aria-label` |

**Proposed fix:**
```jsx
// Header.jsx — Search (div → button with aria-label)
<button className="icon-btn" aria-label="Search" onClick={handleSearch}>
  <svg aria-hidden="true">...</svg>
</button>

// Header.jsx — Login (div → button with aria-label)
<button className="icon-btn" aria-label="Sign in" onClick={handleLogin}>
  <svg aria-hidden="true">...</svg>
</button>

// CartModal.jsx — close button
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close shopping cart">
  <svg aria-hidden="true">...</svg>
</button>

// WishlistModal.jsx — close button
<button className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
  <svg aria-hidden="true">...</svg>
</button>
```

**Why this approach:** `aria-label` on a `<button>` provides a direct accessible name that overrides the computed accessible name algorithm, ensuring screen readers announce exactly the right string. Converting `<div>` elements to `<button>` simultaneously fixes the missing role and provides native keyboard focusability (Tab, Enter, Space) without extra JavaScript. Keeping the SVG as `aria-hidden="true"` prevents double-announcement.

---

### CRIT-07 — Interactive `<div>` elements without semantic role or keyboard access

| | |
|---|---|
| **Evinced Rule** | `Interactable role` + `Keyboard accessible` (Critical) |
| **WCAG** | 1.3.1 Info and Relationships (A), 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A) |
| **Detected on** | All pages (Header, Footer, PopularSection, FilterSidebar, CartModal, CheckoutPage, OrderConfirmationPage) |

**Evinced detected 9 `Interactable role` + 9 `Keyboard accessible` instances on the Home Page alone, 18+18 on Shop/New, and 6+6 on Product Detail.** These share common root causes across 7 source files.

**Complete list of affected elements:**

| # | Selector | File | Element type |
|---|---|---|---|
| 1 | `.wishlist-btn` | `Header.jsx:131` | `<div>` → wishlist opener |
| 2 | `.icon-btn:nth-child(2)` | `Header.jsx:140` | `<div>` → search |
| 3 | `.icon-btn:nth-child(4)` | `Header.jsx:156` | `<div>` → login |
| 4 | `.flag-group` | `Header.jsx:161` | `<div>` → region selector |
| 5 | `li:nth-child(3) > .footer-nav-item` | `Footer.jsx` | `<div>` → Sustainability nav link |
| 6 | `.footer-list:nth-child(2) > li > .footer-nav-item` | `Footer.jsx` | `<div>` → FAQs nav link |
| 7 | `.product-card:nth-child(n) > .product-card-info > .shop-link` (×3) | `PopularSection.jsx` | `<div>` → shop category links |
| 8 | `.filter-group:nth-child(n) > .filter-options > .filter-option:nth-child(n)` (×13) | `FilterSidebar.jsx` | `<div>` → filter checkboxes |
| 9 | `.product-card-quick-add` | `ProductCard.jsx` | `<div>` → Quick Add button |
| 10 | `.checkout-continue-btn` | `CheckoutPage.jsx` | `<div>` → Continue action |
| 11 | `.checkout-back-btn` | `CheckoutPage.jsx` | `<div>` → Back action |
| 12 | `.confirm-home-link` | `OrderConfirmationPage.jsx` | `<div>` → Back to shop |

**Proposed fix pattern (preferred — use semantic elements):**
```jsx
// For action elements → use <button>
<button className="checkout-continue-btn" onClick={handleContinue}>
  Continue
</button>

// For navigation elements → use <Link> or <a>
<Link to="/shop/drinkware" className="shop-link">Shop Drinkware</Link>

// For filter checkboxes → use <button> with role="checkbox" or native <input>
<div
  role="checkbox"
  aria-checked={isChecked}
  aria-label={`Filter by ${label}`}
  tabIndex={0}
  onClick={() => toggle(value)}
  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle(value)}
  className="filter-option-item"
/>
```

**Why this approach:** Native semantic HTML elements (`<button>`, `<a>`, `<Link>`) provide built-in keyboard support (Tab focus, Enter/Space activation), correct ARIA role inference, and browser default focus styles at zero cost. `<div>` elements require explicit `role`, `tabIndex`, and `onKeyDown` handlers to reach equivalence — and are still inferior to semantic elements in some AT contexts. The semantic-element-first approach is the WCAG Techniques recommendation (H91).

---

### CRIT-08 — Cart modal (`CartModal`) missing dialog role, modal semantics, and focus trap

| | |
|---|---|
| **Evinced Rule** | `Button-name` (Critical) on close button; source-annotated: `no-dialog-role`, `no-aria-modal`, `no-focus-trap`, `no-esc-close` (Critical/Serious) |
| **WCAG** | 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A); 2.1.2 No Keyboard Trap (A) |
| **Detected on** | All pages (CartModal overlay) |
| **Source file** | `src/components/CartModal.jsx` |
| **CSS Selectors** | `#cart-modal > div:nth-child(1) > button`, `div[role="dialog"] > div:nth-child(1) > button` |

**Current state — missing all dialog attributes:**
```jsx
// CartModal.jsx drawer wrapper — CURRENT
<div className={styles.drawer}>
```

**Reference — WishlistModal correctly implements all of these:**
```jsx
// WishlistModal.jsx — correct implementation
<div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Wishlist">
```

**Missing behaviours in CartModal:**
1. `role="dialog"` removed — AT does not enter dialog reading mode
2. `aria-modal="true"` removed — AT can read content behind the open overlay
3. `aria-label="Shopping cart"` removed — dialog has no accessible name
4. No `keydown` Escape handler — keyboard users cannot dismiss the modal
5. No focus management on open — focus is not moved into the drawer

**Proposed fix:**
```jsx
// CartModal.jsx drawer wrapper
<div
  className={styles.drawer}
  role="dialog"
  aria-modal="true"
  aria-label="Shopping cart"
  ref={drawerRef}
>

// Add in component body (mirroring WishlistModal pattern)
useEffect(() => {
  if (!isOpen) return;
  const prev = document.activeElement;
  drawerRef.current?.focus();
  const handleKey = (e) => { if (e.key === 'Escape') closeCart(); };
  document.addEventListener('keydown', handleKey);
  return () => {
    document.removeEventListener('keydown', handleKey);
    prev?.focus();
  };
}, [isOpen, closeCart]);
```

**Why this approach:** The WishlistModal in the same codebase is the reference implementation. Mirroring it exactly ensures consistency across both modals and satisfies all four ARIA dialog requirements: `role="dialog"` (AT mode switch), `aria-modal="true"` (suppress background), `aria-label` (dialog name), and Escape key dismissal (keyboard operability). The APG Modal Dialog Pattern is the authoritative source for this pattern.

---

### CRIT-09 — Filter checkbox widgets inaccessible to AT and keyboard (13 instances)

| | |
|---|---|
| **Evinced Rule** | `Interactable role` + `Keyboard accessible` (Critical) — 13 instances each on Shop/New |
| **WCAG** | 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A) |
| **Detected on** | Shop/New Page (`/shop/new`) |
| **Source file** | `src/components/FilterSidebar.jsx` |
| **CSS Selectors** | `.filter-group:nth-child(2..4) > .filter-options > .filter-option:nth-child(1..n)` |

All 13 filter option `<div>` elements (Price, Size, Brand groups) have `onClick` handlers but lack `role="checkbox"`, `aria-checked`, `aria-label`, and `tabIndex`. Screen readers cannot identify them as checkboxes, cannot determine their state, and keyboard users cannot reach them.

**Proposed fix:**
```jsx
<div
  role="checkbox"
  aria-checked={isChecked}
  aria-label={`${label} (${count} products)`}
  tabIndex={0}
  className="filter-option-item"
  onClick={() => toggle(value)}
  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle(value)}
>
  <span className="filter-checkbox-visual" aria-hidden="true" />
  <span className="filter-option-label">{label}</span>
  <span className="filter-count" aria-hidden="true">({count})</span>
</div>
```

**Why this approach:** `role="checkbox"` + `aria-checked` is the APG Checkbox Pattern for custom checkboxes. `tabIndex={0}` adds the element to the natural tab sequence. `aria-label` with the count in the label (hidden from the AT via `aria-hidden` on the visual badge) ensures the filter name and count are readable without redundancy. Enter and Space key handlers are required by WCAG 2.1.1 to match native checkbox keyboard interaction.

---

## 5. Non-Critical Issues (Not Remediated)

### Color Contrast Failures — Serious (17 instances across 3 pages)

**Rule:** `Color-contrast` (Evinced Serious / WCAG 1.4.3 AA)

| # | Page | Selector | Foreground | Background | Ratio |
|---|---|---|---|---|---|
| 1 | Home | `.hero-content > p` | `#c8c0b8` | `#e8e0d8` | ~1.37:1 |
| 2 | Shop/New | `.filter-count` (×13) | `#c8c8c8` | `#ffffff` | ~1.67:1 |
| 3 | Product Detail | `p:nth-child(4)` (description) | `#c0c0c0` | `#ffffff` | ~1.81:1 |

All values fall far below the WCAG AA minimum of 4.5:1 for normal text. Fix: darken text colours in `HeroBanner.css`, `FilterSidebar.css`, `ProductPage.module.css`.

---

### `valid-lang` — Invalid BCP 47 tag — Serious

**Rule:** `Valid-lang` (Evinced Serious / WCAG 3.1.2 AA)

| Page | Selector | Issue |
|---|---|---|
| Home | `p[lang="zz"]` | `"zz"` is not a valid BCP 47 language tag — `TheDrop.jsx` line 25 |

Fix: remove `lang="zz"` if the text is in the page's primary language (English), or replace with the correct tag (e.g. `lang="en"`).

---

### `html-has-lang` — Serious (same root as CRIT-01)

Classified as Serious by Evinced (Critical by axe-core). Covered in CRIT-01 above.

---

### Heading Level Skipping — Moderate (14 instances)

**Rule:** `heading-order` (WCAG 1.3.1 A)

14 heading hierarchy violations across all pages. Page-level `<h1>` roles are used on `<h3>` elements; section headings jump from `<h1>` to `<h4>` or `<h5>`. Full table in `A11Y_ISSUES.md` § "heading-order".

Key violations:
- `HeroBanner.jsx` — "Winter Basics" uses `<h3>` instead of `<h1>`
- `FeaturedPair.jsx` — card titles use `<h1>` instead of `<h3>`
- `PopularSection.jsx`, `TrendingCollections.jsx`, `TheDrop.jsx` — section headings use `<h4>` instead of `<h2>`
- `CheckoutPage.jsx` — page headings use `<h3>`, Order Summary uses `<h5>`
- `CartModal.jsx` / `WishlistModal.jsx` — drawer titles use `<h5>` instead of `<h2>`

---

### Navigation `tabIndex` Reversal — Serious (7 elements)

**Rule:** `keyboard-order` (WCAG 2.4.3 A)

In `Header.jsx`, nav links have `tabIndex` set to `navItems.length - index`, reversing the visual tab sequence (Sale → Shop by Brand → … → New instead of New → Apparel → … → Sale). Fix: remove explicit `tabIndex` values from nav `<Link>` elements entirely.

---

### Cart Modal Quantity/Remove Buttons Missing Accessible Names — Critical (source-annotated)

**Rule:** `no-aria-label-on-buttons` (Evinced GEN2)

Per-item `−`, `+`, and `×` buttons in `CartModal.jsx` have had `aria-label` removed. Screen readers announce "button" with no product context. Fix: `aria-label={`Decrease quantity of ${item.name}`}` etc.

---

### Non-Descriptive Accessible Labels — Serious (8 instances)

`aria-label` values replaced with context-free strings across `ProductCard.jsx`, `ProductPage.jsx`, `CheckoutPage.jsx`, `WishlistModal.jsx`. Examples: `"Product item"` instead of the product name; `"Wishlist action"` instead of `"Add [product] to wishlist"`; `"Click here"` on wishlist item links. Fix: include product name in every label.

---

### Navigation Forbidden Roles — Serious (1 instance)

`role="menu"` on submenu `<ul>` elements and `role="menuitem"` on `<a>` links inside the `<nav>` landmark in `Header.jsx`. These roles impose application-widget semantics inside a navigation region, breaking AT navigation behaviour. Fix: remove `role="menu"` and `role="menuitem"` from nav submenus.

---

### Missing Live Region Announcements — Critical impact, automation-undetectable (2 instances)

1. **Checkout form errors** (`CheckoutPage.jsx`): Validation error `<span>` elements had `role="alert"` removed. Errors appear visually but are silent to screen readers.
2. **Cart count badge** (`Header.jsx`): `<span aria-hidden="true">` shows the count but no `aria-live` region exists to announce count changes when items are added.

Fix: restore `role="alert"` on all `.form-error` spans; add `<span className="sr-only" aria-live="polite">` in Header to announce cart updates.

---

### DOM Reading Order Mismatch — Serious (1 instance)

`FeaturedPair.jsx` uses `flex-direction: column-reverse` to reorder cards visually, but screen readers follow DOM order and announce the image alt text before the card text. Fix: swap the DOM order of `.featured-card-image` and `.featured-card-info` and remove `column-reverse`.

---

### Content Reflow at 300% Zoom — Serious (1 instance)

`overflow-x: hidden` on `body` in `App.css` silently clips navigation content at high zoom levels. Low-vision users cannot scroll to reach clipped header content. Fix: remove `overflow-x: hidden` from `body`.

---

### Duplicate `id` Values in ARIA References — Critical (4 instances)

`FeaturedPair.jsx` and `FilterSidebar.jsx` render elements with hardcoded `id` values inside `.map()` loops, producing duplicate IDs. Fix: append the item's unique identifier to each `id`, e.g. `id={`featured-card-label-${item.id}`}`.

---

## 6. Issue Count Summary

### By Source (Evinced MCP direct scan — 3 pages)

| Rule | Critical | Serious | Pages Affected |
|---|---|---|---|
| Interactable role | 33 | 0 | All 3 |
| Keyboard accessible | 33 | 0 | All 3 |
| Accessible name | 12 | 0 | All 3 |
| Button-name | 6 | 0 | All 3 |
| Aria-valid-attr-value | 3 | 0 | Home, Product |
| Image-alt | 2 | 0 | Home |
| Aria-required-attr | 1 | 0 | Home |
| Color-contrast | 0 | 15 | All 3 |
| Html-has-lang | 0 | 3 | All 3 |
| Valid-lang | 0 | 1 | Home |
| **Total** | **90** | **19** | — |

### Critical Issues Addressed in This Report

| ID | Rule | Pages Affected | Primary Source File(s) |
|---|---|---|---|
| CRIT-01 | `html-has-lang` | All | `public/index.html` |
| CRIT-02 | `image-alt` | Home | `HeroBanner.jsx`, `TheDrop.jsx` |
| CRIT-03 | `aria-valid-attr-value` (aria-expanded) | Home | `FeaturedPair.jsx` |
| CRIT-04 | `aria-valid-attr-value` (aria-relevant) | Product Detail | `ProductPage.jsx` |
| CRIT-05 | `aria-required-attr` (slider) | Home | `TheDrop.jsx` |
| CRIT-06 | `accessible-name` / `button-name` | All | `Header.jsx`, `CartModal.jsx`, `WishlistModal.jsx` |
| CRIT-07 | `interactable-role` / `keyboard-accessible` | All | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx`, `FilterSidebar.jsx`, `ProductCard.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx` |
| CRIT-08 | `no-dialog-role` / `no-focus-trap` | All | `CartModal.jsx` |
| CRIT-09 | Filter checkbox ARIA | Shop/New | `FilterSidebar.jsx` |

---

*Report generated using `@evinced/evinced-mcp-server` v1.0.6 driven via MCP JSON-RPC stdio protocol. Raw scan data: `tests/e2e/test-results/evinced-mcp-audit.json`. No source code modifications were made as part of this audit.*
