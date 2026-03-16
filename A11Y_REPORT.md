# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-16  
**Tool:** Evinced Playwright SDK (v2.17+) via automated Playwright tests  
**Engine:** Evinced GEN1/GEN2/GEN3 + axe-core rules  
**Scope:** All application pages and overlays (Homepage, Products Page, Product Detail, Cart Modal, Checkout, Order Confirmation)  
**Base URL:** `http://localhost:3000`  
**WCAG Target:** WCAG 2.1 Level A and AA  

---

## Summary

| Page | Total Issues | Critical | Serious | Other |
|------|-------------|----------|---------|-------|
| Homepage (`/`) | 35 | 32 | 3 | 0 |
| Products Page (`/shop/new`) | 59 | 43 | 14 | 2 |
| Product Detail (`/product/:id`) | 20 | 18 | 2 | 0 |
| Cart Modal (overlay) | 24 | 22 | 2 | 0 |
| Checkout – Basket (`/checkout`) | 21 | 18 | 3 | 0 |
| Checkout – Shipping (`/checkout`) | 23 | 20 | 3 | 0 |
| Order Confirmation (`/order-confirmation`) | 20 | 18 | 2 | 0 |

> **Note:** Issues shared across pages (e.g., Header/Footer components present on all pages) are counted once per page in the per-page totals. The critical issues below are grouped by component/source file to avoid repetition.

---

## Part 1 – Critical Issues

Critical issues represent the most severe accessibility barriers that prevent users with disabilities from accessing or operating key functionality. Each issue below includes the affected element, the page(s) it appears on, the recommended fix, and the rationale for that approach.

---

### Issue Group 1 — Header: Icon-Only `<div>` Buttons (Wishlist, Search, Login, Region Selector)

**Affects:** All pages (component: `src/components/Header.jsx`)  
**Severity:** Critical  
**WCAG:** 1.3.1 (A) — Info and Relationships; 2.1.1 (A) — Keyboard; 4.1.2 (A) — Name, Role, Value  
**Issue Types Detected:** Interactable role, Keyboard accessible, Accessible name  

#### Affected Elements

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor: pointer;">` | `<div>` acting as a button — no `role="button"`, no `tabindex` |
| 2 | `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor: pointer;">` (Search icon) | `<div>` acting as a button — no `role="button"`, no `tabindex`, no accessible name (SVG is `aria-hidden`, visible label is hidden) |
| 3 | `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor: pointer;">` (Login icon) | `<div>` acting as a button — no `role="button"`, no `tabindex`, no accessible name |
| 4 | `.flag-group` | `<div class="flag-group" style="cursor: pointer;">` | `<div>` acting as a region selector — no `role="button"`, no `tabindex` |

#### Recommended Fix

Replace each `<div>` icon button with a native `<button>` element and add an `aria-label` describing the control's purpose:

```jsx
// Before (Header.jsx)
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Wishlist</span>
</button>
```

For search (`.icon-btn:nth-child(2)`): `aria-label="Search"`.  
For login (`.icon-btn:nth-child(4)`): `aria-label="Sign in"`.  
For region selector (`.flag-group`): `aria-label="Select region (United States)"`.

#### Why This Approach

A native `<button>` element inherently provides keyboard focusability (Tab key), activation via Enter/Space, correct `role="button"` semantics, and visual focus indicators — all without additional ARIA. Using `<div>` with `role="button"` and `tabindex="0"` would also work, but the native element is preferred because it reduces the ARIA overhead and guarantees correct AT behavior across all platforms. An explicit `aria-label` is required because the SVG icon alone conveys no text to screen readers.

---

### Issue Group 2 — Header: Cart Button Missing Accessible Name

**Affects:** All pages (component: `src/components/Header.jsx`)  
**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Issue Type:** Button-name  

#### Affected Element

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `button.icon-btn.cart-btn` (Wishlist close) | `<button class="JjN6AKz7a2PRH2gFKW3v">` (Cart modal close) | Icon-only `<button>` — SVG is `aria-hidden`, no `aria-label`; screen readers announce nothing |

#### Recommended Fix

Add `aria-label` to the cart-open button that also conveys the current cart count:

```jsx
// Before
<button className="icon-btn cart-btn" onClick={openCart}>
  <svg aria-hidden="true">...</svg>
  <span className="cart-count" aria-hidden="true">{totalCount}</span>
</button>

// After
<button
  className="icon-btn cart-btn"
  onClick={openCart}
  aria-label={`Shopping cart, ${totalCount} item${totalCount !== 1 ? 's' : ''}`}
>
  <svg aria-hidden="true">...</svg>
  <span className="cart-count" aria-hidden="true">{totalCount}</span>
</button>
```

#### Why This Approach

The `aria-label` overrides the button's computed accessible name (which is empty when only an `aria-hidden` SVG is present). Including the item count directly in the label provides users of screen readers with the same glanceable information that sighted users get from the badge, without requiring them to open the cart first. The visible badge can remain `aria-hidden` to avoid double-reading.

---

### Issue Group 3 — Footer: `<div>` Navigation Items (Sustainability, FAQs)

**Affects:** All pages (component: `src/components/Footer.jsx`)  
**Severity:** Critical  
**WCAG:** 1.3.1 (A); 2.1.1 (A); 4.1.2 (A)  
**Issue Types:** Interactable role, Keyboard accessible, Accessible name  

#### Affected Elements

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>` | `<div>` as navigation item — no `role`, no `tabindex` |
| 2 | `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item"><span aria-hidden="true">FAQs</span></div>` | `<div>` as navigation item — no `role`, no `tabindex`; visible label is `aria-hidden` so no accessible name |

#### Recommended Fix

Replace each `<div>` with a semantic `<a>` element (or `<button>` if it triggers an action rather than navigating):

```jsx
// Before
<div className="footer-nav-item" onClick={...} style={{cursor:'pointer'}}>
  <span aria-hidden="true">FAQs</span>
</div>

// After — if it navigates to another page
<a href="/faq" className="footer-nav-item">FAQs</a>
```

For the FAQs element specifically, also remove `aria-hidden` from the visible text span.

#### Why This Approach

A native `<a>` element provides the correct `role="link"` semantics, keyboard focusability, and visible/accessible name from its text content — no extra ARIA needed. The `aria-hidden` on the visible label was the primary cause of the "no accessible name" violation; removing it restores the natural text-based accessible name.

---

### Issue Group 4 — Homepage Popular Section: `<div>` Shop Links

**Affects:** Homepage (`/`) — component: `src/components/PopularSection.jsx`  
**Severity:** Critical  
**WCAG:** 1.3.1 (A); 2.1.1 (A); 4.1.2 (A)  
**Issue Types:** Interactable role, Keyboard accessible, Accessible name  

#### Affected Elements

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link"><span aria-hidden="true">Shop Drinkware</span></div>` | `<div>` as nav link — no role, no `tabindex`; label is `aria-hidden` |
| 2 | `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link"><span aria-hidden="true">Shop Fun and Games</span></div>` | Same issue |
| 3 | `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link"><span aria-hidden="true">Shop Stationery</span></div>` | Same issue |

#### Recommended Fix

Replace the `<div>` shop links with `<a>` elements and remove `aria-hidden` from their text:

```jsx
// Before
<div className="shop-link" onClick={() => navigate('/shop/new')}>
  <span aria-hidden="true">Shop Drinkware</span>
</div>

// After
<a href="/shop/new" className="shop-link">Shop Drinkware</a>
```

#### Why This Approach

Same rationale as Issue Group 3. A native anchor gives keyboard access, correct link semantics, and a natural accessible name from its text content. The `aria-hidden` attribute on the label text was the sole reason the accessible name was missing — removing it is simpler and more maintainable than adding a redundant `aria-label`.

---

### Issue Group 5 — Homepage FeaturedPair: Invalid `aria-expanded="yes"` on `<h1>` Elements

**Affects:** Homepage (`/`) — component: `src/components/FeaturedPair.jsx`  
**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Issue Type:** Aria-valid-attr-value  

#### Affected Elements

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `aria-expanded` value `"yes"` is invalid — only `"true"` or `"false"` are permitted |
| 2 | `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | Same issue |

#### Recommended Fix

Remove `aria-expanded` from the heading elements entirely (headings do not need an expand/collapse state), or if the heading genuinely controls a disclosure widget, use a valid value:

```jsx
// Before
<h1 aria-expanded="yes">{card.title}</h1>

// After — simply remove it
<h1>{card.title}</h1>
```

If the intent was to mark an expanded state (e.g., a disclosure), move `aria-expanded` to the triggering control element and use `"true"` / `"false"`:

```jsx
<button aria-expanded={isOpen ? "true" : "false"} aria-controls="panel-id">
  {card.title}
</button>
```

#### Why This Approach

The `aria-expanded` attribute is only meaningful on disclosure widgets (buttons, details, comboboxes). Applying it to a `<h1>` heading is semantically invalid, and using `"yes"` as a value instead of `"true"` violates the ARIA specification. Assistive technologies may ignore or misinterpret the attribute. The cleanest fix is removal.

---

### Issue Group 6 — Homepage TheDrop: `role="slider"` Missing Required ARIA Attributes + Not Keyboard-Focusable

**Affects:** Homepage (`/`) — component: `src/components/TheDrop.jsx`  
**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Issue Types:** Aria-required-attr, Keyboard accessible  

#### Affected Element

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` | Missing required attributes `aria-valuenow`, `aria-valuemin`, `aria-valuemax`; no `tabindex` |

#### Recommended Fix

If this is purely a decorative display element (not an interactive slider), remove `role="slider"` entirely and use a more appropriate pattern:

```jsx
// Before
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// After — use a meter or progressbar for display-only
<div
  role="meter"
  aria-label="Popularity"
  aria-valuenow={80}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
></div>
```

If it is interactive, add the complete required ARIA contract and keyboard handlers:

```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  onKeyDown={handleKeyDown}
  className="drop-popularity-bar"
></div>
```

#### Why This Approach

The ARIA `slider` role mandates three attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) — they define the widget's current state. Omitting them leaves screen readers unable to announce the control's value. If the element is purely visual, `role="meter"` or `role="progressbar"` is semantically correct and less burdensome, as those roles only require `aria-valuenow` minimum. Adding `tabIndex={0}` is required to place any interactive ARIA widget into the tab order.

---

### Issue Group 7 — Products Page: Filter Option `<div>`s (13 items, Price / Size / Brand filters)

**Affects:** Products Page (`/shop/new`) — component: `src/components/FilterSidebar.jsx`  
**Severity:** Critical  
**WCAG:** 1.3.1 (A); 2.1.1 (A); 4.1.2 (A)  
**Issue Types:** Interactable role, Keyboard accessible  

#### Affected Elements

| # | Selector | DOM Snippet | Filter Group |
|---|----------|-------------|-------------|
| 1 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option">` (1.00 - 19.99) | Price |
| 2 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | `<div class="filter-option">` (20.00 - 39.99) | Price |
| 3 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | `<div class="filter-option">` (40.00 - 89.99) | Price |
| 4 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | `<div class="filter-option">` (100.00 - 149.99) | Price |
| 5 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option">` (XS) | Size |
| 6 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2)` | `<div class="filter-option">` (SM) | Size |
| 7 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3)` | `<div class="filter-option">` (MD) | Size |
| 8 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4)` | `<div class="filter-option">` (LG) | Size |
| 9 | `.filter-option:nth-child(5)` | `<div class="filter-option">` (XL) | Size |
| 10 | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option">` (Android) | Brand |
| 11 | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2)` | `<div class="filter-option">` (Google) | Brand |
| 12 | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3)` | `<div class="filter-option">` (YouTube) | Brand |
| 13 | (Additional brand filter items) | `<div class="filter-option">` | Brand |

#### Recommended Fix

Add `role="checkbox"`, `aria-checked`, `tabIndex={0}`, and a keyboard handler to each filter option `<div>`. Better yet, replace the custom `<div>` with a native `<label>`/`<input type="checkbox">` pair which handles all semantics natively:

```jsx
// Before
<div className="filter-option" onClick={() => toggleFilter(value)}>
  <div className="custom-checkbox"></div>
  <span className="filter-option-label">{label}</span>
</div>

// After — native checkbox approach
<label className="filter-option">
  <input
    type="checkbox"
    className="custom-checkbox"
    checked={isActive}
    onChange={() => toggleFilter(value)}
  />
  <span className="filter-option-label">{label}</span>
</label>
```

If keeping the custom pattern, at minimum:
```jsx
<div
  className="filter-option"
  role="checkbox"
  aria-checked={isActive}
  tabIndex={0}
  onClick={() => toggleFilter(value)}
  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') toggleFilter(value); }}
>
  ...
</div>
```

#### Why This Approach

Thirteen filter items are currently invisible to assistive technology as interactive controls because they are plain `<div>` elements. Native `<input type="checkbox">` elements are strongly preferred over ARIA roles because they provide built-in keyboard support (Space to toggle), native AT announcements for the check/unchecked state, automatic focus management, and compatibility with form-associated patterns. The ARIA approach (manual `role`, `aria-checked`, `tabindex`, `onKeyDown`) achieves equivalent accessibility but requires maintaining those attributes in sync with component state.

---

### Issue Group 8 — Products Page: Sort Button Incorrect Role

**Affects:** Products Page (`/shop/new`) — component: `src/pages/NewPage.jsx`  
**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Issue Type:** Element has incorrect role  

#### Affected Element

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `.sort-btn` | `<button class="sort-btn">Sort by Relevance (Default)...</button>` | The sort trigger is a `<button>` but is expected to expose `role="combobox"` semantics for the listbox pattern |

#### Recommended Fix

Update the sort widget so the trigger button correctly conveys combobox/listbox semantics:

```jsx
// Before
<button className="sort-btn" onClick={toggleSort}>
  Sort by Relevance (Default)
</button>

// After
<button
  className="sort-btn"
  role="combobox"
  aria-label="Sort products"
  aria-expanded={isSortOpen}
  aria-haspopup="listbox"
  aria-controls="sort-options-list"
  onClick={toggleSort}
>
  {currentSort}
</button>

<ul
  id="sort-options-list"
  role="listbox"
  aria-label="Sort options"
  hidden={!isSortOpen}
>
  {sortOptions.map(opt => (
    <li
      key={opt.value}
      role="option"
      aria-selected={opt.value === currentSort}
      tabIndex={0}
      onClick={() => selectSort(opt)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectSort(opt); }}
    >
      {opt.label}
    </li>
  ))}
</ul>
```

#### Why This Approach

The ARIA Authoring Practices Guide defines the combobox/listbox pattern specifically for custom select/sort widgets. `role="combobox"` on the trigger, `role="listbox"` on the container, and `role="option"` on each item create the correct semantic relationship so screen readers announce the widget correctly: "Sort products, Sort by Relevance (Default), collapsed, combobox." Without these roles, screen readers see a generic button that opens an unmarked list.

---

### Issue Group 9 — Cart Modal: Missing Dialog Role, Accessible Name, Close Button Name, and Interactive Div

**Affects:** All pages (component: `src/components/CartModal.jsx`)  
**Severity:** Critical  
**WCAG:** 4.1.2 (A); 1.3.1 (A); 2.1.1 (A)  
**Issue Types:** Button-name, Accessible name, Interactable role, Keyboard accessible  

#### Affected Elements

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `#cart-modal > div:nth-child(1) > button` (close button) | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg ...></button>` | Icon-only close button — no `aria-label`, SVG is `aria-hidden`; no accessible name |
| 2 | `div:nth-child(3) > div:nth-child(4)` | `<div class="LyRwH_O98exnbxqcHBsD"><span aria-hidden="true">Continue Shopping</span></div>` | `<div>` as "Continue Shopping" button — no `role`, no `tabindex`, visible label is `aria-hidden` |
| 3 | `li > button` (remove item button) | `<button class="cxg80OkqBVvKnUqn73Qw"><svg ...></button>` | Icon-only remove button per cart item — no `aria-label` |

#### Recommended Fix

**Close button:** Add `aria-label="Close cart"`.

**Continue Shopping div:** Replace with a `<button>` and restore the visible label:

```jsx
// Before
<div className="continueBtn" onClick={closeCart} style={{cursor:'pointer'}}>
  <span aria-hidden="true">Continue Shopping</span>
</div>

// After
<button className="continueBtn" onClick={closeCart}>Continue Shopping</button>
```

**Remove item button:** Add a dynamic `aria-label` incorporating the item name:

```jsx
// Before
<button className="removeBtn" onClick={() => removeItem(item.id)}>
  <svg aria-hidden="true">...</svg>
</button>

// After
<button
  className="removeBtn"
  aria-label={`Remove ${item.name} from cart`}
  onClick={() => removeItem(item.id)}
>
  <svg aria-hidden="true">...</svg>
</button>
```

Note: The cart modal container also needs `role="dialog"`, `aria-modal="true"`, and `aria-label="Shopping cart"` to complete the dialog pattern (see also the `no-dialog-role` issue catalogued in Part 2).

#### Why This Approach

Icon-only interactive controls require an `aria-label` because screen readers fall back to announcing SVG titles or (worse) nothing. The dynamic label on the remove button is critical because generic "Remove" labels with no item context leave keyboard users unable to determine which item they are about to remove — a form of ambiguity that breaks WCAG 2.4.6 and 4.1.2. Replacing the `<div>` with a `<button>` removes the need for ARIA shims and is keyboard-accessible by default.

---

### Issue Group 10 — Product Detail: Invalid `aria-relevant="changes"` on `<ul>`

**Affects:** Product Detail page (`/product/:id`) — component: `src/pages/ProductPage.jsx`  
**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Issue Type:** Aria-valid-attr-value  

#### Affected Element

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `ul[aria-relevant="changes"]` | `<ul aria-relevant="changes" aria-live="polite">` | `aria-relevant="changes"` is not a valid ARIA value; valid tokens are `additions`, `removals`, `text`, `all` |

#### Recommended Fix

Replace `"changes"` with a valid space-separated combination of tokens:

```jsx
// Before
<ul aria-relevant="changes" aria-live="polite">

// After — announce text additions only
<ul aria-relevant="additions text" aria-live="polite">

// Or, to announce all changes
<ul aria-relevant="all" aria-live="polite">
```

#### Why This Approach

The `aria-relevant` attribute controls which mutations to the live region trigger an AT announcement. An unrecognised token like `"changes"` will be ignored by all browsers, meaning the live region may behave as though `aria-relevant` is absent. The correct token `"text"` (announce when text nodes are added/changed) or `"additions text"` is most appropriate for a stock-level indicator list.

---

### Issue Group 11 — Checkout: `<div>` Continue and Back Buttons

**Affects:** Checkout page (`/checkout`) — component: `src/pages/CheckoutPage.jsx`  
**Severity:** Critical  
**WCAG:** 1.3.1 (A); 2.1.1 (A); 4.1.2 (A)  
**Issue Types:** Interactable role, Keyboard accessible  

#### Affected Elements

| # | Selector | DOM Snippet | Step |
|---|----------|-------------|------|
| 1 | `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>` | Basket step |
| 2 | `form > div > div` (`.checkout-back-btn`) | `<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>` | Shipping step |

#### Recommended Fix

Replace both `<div>` action controls with native `<button>` elements:

```jsx
// Before
<div className="checkout-continue-btn" onClick={proceedToShipping}>Continue</div>

// After
<button className="checkout-continue-btn" onClick={proceedToShipping} type="button">
  Continue
</button>
```

```jsx
// Before
<div className="checkout-back-btn" onClick={backToBasket}>← Back to Cart</div>

// After
<button className="checkout-back-btn" onClick={backToBasket} type="button">
  ← Back to Cart
</button>
```

#### Why This Approach

These are the primary action controls in the checkout flow. Keyboard users following the tab order cannot reach or activate `<div>` elements — the checkout is effectively inaccessible by keyboard. Replacing with `<button type="button">` is the minimal change that resolves both the "interactable role" and "keyboard accessible" violations without any ARIA. The `type="button"` attribute prevents accidental form submission.

---

### Issue Group 12 — Order Confirmation: `<div>` "Back to Shop" Link

**Affects:** Order Confirmation page (`/order-confirmation`) — component: `src/pages/OrderConfirmationPage.jsx`  
**Severity:** Critical  
**WCAG:** 1.3.1 (A); 2.1.1 (A); 4.1.2 (A)  
**Issue Types:** Interactable role, Keyboard accessible  

#### Affected Element

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `.confirm-home-link` | `<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>` | `<div>` acting as navigation link — no `role`, no `tabindex` |

#### Recommended Fix

Replace the `<div>` with a navigation `<Link>` (or `<a>`) to the homepage:

```jsx
// Before
<div className="confirm-home-link" onClick={() => navigate('/')}>← Back to Shop</div>

// After
<Link to="/" className="confirm-home-link">← Back to Shop</Link>
```

#### Why This Approach

The element navigates to the homepage on click, making it semantically a link rather than a button. Using React Router `<Link>` (or `<a href="/">`) exposes `role="link"`, is natively keyboard-accessible, and renders correct browser affordances (e.g., right-click "Open in new tab"). A plain `<button>` with `onClick` and `navigate` is also acceptable but the link semantic is more appropriate for navigation actions.

---

### Issue Group 13 — Homepage: Missing `alt` Text on Images

**Affects:** Homepage (`/`) — components: `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`  
**Severity:** Critical  
**WCAG:** 1.1.1 (A) — Non-text Content  
**Issue Type:** Image-alt  

#### Affected Elements

| # | Selector | DOM Snippet | Page | Issue |
|---|----------|-------------|------|-------|
| 1 | `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | Homepage (HeroBanner) | Missing `alt` attribute — screen readers read the file path |
| 2 | `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | Homepage (TheDrop) | Missing `alt` attribute |

#### Recommended Fix

Add descriptive `alt` text (or `alt=""` if purely decorative):

```jsx
// HeroBanner.jsx — Before
<img src="/images/home/New_Tees.png" />

// After — descriptive
<img src="/images/home/New_Tees.png" alt="New tee shirts collection for winter" />

// TheDrop.jsx — Before
<img src="/images/home/2bags_charms1.png" loading="lazy" />

// After — descriptive
<img src="/images/home/2bags_charms1.png" loading="lazy" alt="Limited edition plushie bag charms" />
```

#### Why This Approach

WCAG 1.1.1 requires all non-decorative images to carry descriptive `alt` text. Without it, screen readers fall back to reading the filename (`New_Tees.png`, `2bags_charms1.png`), which is meaningless to a user. Images that are purely decorative should receive `alt=""` to suppress AT announcement entirely. These images appear to be meaningful content (product imagery / promotional) and require descriptive text. The alt text should describe what the image depicts, not just label it (e.g., "New tee shirts collection" rather than "Image 1").

---

### Issue Group 14 — Wishlist Modal Close Button: Missing Accessible Name

**Affects:** All pages (component: `src/components/WishlistModal.jsx`)  
**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Issue Type:** Button-name  

#### Affected Element

| # | Selector | DOM Snippet | Issue |
|---|----------|-------------|-------|
| 1 | `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg ...></button>` | Icon-only close button — `aria-label` removed, SVG is `aria-hidden`; no accessible name |

#### Recommended Fix

Add `aria-label="Close wishlist"` to the close button:

```jsx
// Before
<button className={styles.closeBtn} onClick={closeWishlist}>
  <svg aria-hidden="true">...</svg>
</button>

// After
<button className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
  <svg aria-hidden="true">...</svg>
</button>
```

#### Why This Approach

An icon-only `<button>` with an `aria-hidden` icon and no text has an empty accessible name, causing screen readers to announce it as "button" with no context. The `aria-label` attribute provides an accessible name that is announced in place of the empty content. "Close wishlist" is preferred over generic "Close" because it identifies which modal is being closed, which is important when multiple modals can be present.

---

## Part 2 — Remaining Non-Critical Issues (Not Remediated)

The following issues are classified as Serious, Moderate, or Best Practice. They were identified by the Evinced SDK audit but are **not remediated** in this run. They are documented here for completeness and prioritisation in a future sprint.

---

### Serious: `<html>` Missing `lang` Attribute (`html-has-lang`)

| Pages | File | Element | Issue |
|-------|------|---------|-------|
| All pages | `public/index.html` | `<html>` | The `<html>` element has no `lang` attribute. Screen readers cannot determine the page language and default to the user's OS language, which may cause incorrect pronunciation. |

**Recommended Fix:** `<html lang="en">`  
**WCAG:** 3.1.1 (A) — Language of Page

---

### Serious: Invalid Language Tag `lang="zz"` (`valid-lang`)

| Pages | File | Element | Issue |
|-------|------|---------|-------|
| Homepage | `src/components/TheDrop.jsx` | `<p lang="zz">` | `"zz"` is not a valid BCP 47 language tag. Screen readers will apply incorrect pronunciation rules to this paragraph. |

**Recommended Fix:** Change to a valid BCP 47 tag (e.g., `lang="en"`) or remove the attribute if the language is the same as the page language.  
**WCAG:** 3.1.2 (AA) — Language of Parts

---

### Serious: Insufficient Color Contrast (`color-contrast`)

| # | Pages | File | Element | Contrast Ratio | Required |
|---|-------|------|---------|---------------|---------|
| 1 | Homepage | `src/components/HeroBanner.css` | `.hero-content > p` (hero subtitle) | ~1.3:1 | 4.5:1 |
| 2 | Products Page | `src/pages/NewPage.css` | `.products-found` ("X Products Found") | ~1.9:1 | 4.5:1 |
| 3 | Products Page | `src/components/FilterSidebar.css` | `.filter-count` (count badges in filter options, 13 instances) | ~1.4:1 | 4.5:1 |
| 4 | Product Detail | `src/pages/ProductPage.module.css` | `.productDescription` (body text) | ~1.6:1 | 4.5:1 |
| 5 | Checkout | `src/pages/CheckoutPage.css` | `.step-label` (inactive step label) | Below 4.5:1 | 4.5:1 |
| 6 | Checkout | `src/pages/CheckoutPage.css` | `.summary-tax-note` | Below 4.5:1 | 4.5:1 |
| 7 | Order Confirmation | `src/pages/OrderConfirmationPage.css` | `.confirm-order-id-label` | Below 4.5:1 | 4.5:1 |

**WCAG:** 1.4.3 (AA) — Minimum Contrast

---

### Serious: Navigation Uses Forbidden `role="menu"` (`navigation-forbidden-roles` / `Menu as a nav element`)

| Pages | File | Element | Issue |
|-------|------|---------|-------|
| All pages | `src/components/Header.jsx` | Submenu `<ul role="menu">` containers inside `<nav>` | `role="menu"` on nav submenus causes screen readers to treat the navigation as an application widget, not a navigation landmark |

**WCAG:** 1.3.1 (A); 4.1.2 (A)

---

### Serious: Filter Disclosure Buttons Missing `aria-expanded` (`filter-disclosure-no-aria-expanded`)

| # | Pages | File | Element | Issue |
|---|-------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price `<button class="filter-group-header">` | `aria-expanded` missing — AT cannot announce collapsed/expanded state |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size `<button class="filter-group-header">` | Same |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand `<button class="filter-group-header">` | Same |

**WCAG:** 4.1.2 (A) — Name, Role, Value

---

### Serious: Reflow — `overflow-x: hidden` on `<body>` (`reflow`)

| Pages | File | Element | Issue |
|-------|------|---------|-------|
| All pages | `src/components/App.css` | `body { overflow-x: hidden }` | At 300% zoom content is clipped and cannot be scrolled to; violates WCAG 1.4.10 Reflow |

**WCAG:** 1.4.10 (AA) — Reflow

---

### Serious: Screen Reader Reading Order Mismatch (`sr-order`)

| Pages | File | Element | Issue |
|-------|------|---------|-------|
| Homepage | `src/components/FeaturedPair.jsx` | `.featured-card` (both cards) | `flex-direction: column-reverse` visually reorders content (text above image) but DOM order is image-first; screen readers announce image before text heading |

**WCAG:** 1.3.2 (A) — Meaningful Sequence

---

### Serious: Keyboard Focus Order Reversed in Navigation (`keyboard-order`)

| Pages | File | Element | Issue |
|-------|------|---------|-------|
| All pages | `src/components/Header.jsx` | Main navigation `<nav>` links | `tabIndex` values set in descending order — keyboard tab order is reversed compared to visual left-to-right sequence |

**WCAG:** 2.4.3 (A) — Focus Order

---

### Moderate: Sort Dropdown Missing `aria-haspopup` and `aria-controls`

| # | Pages | File | Element | Issue |
|---|-------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | `.sort-btn` | `aria-haspopup="listbox"` missing — AT not informed a popup opens |
| 2 | Products Page | `src/pages/NewPage.jsx` | `.sort-btn` | `aria-controls` missing — no programmatic link to options list |

**WCAG:** 4.1.2 (A)

---

### Moderate: Filter Disclosure `aria-controls` / `aria-owns` Missing

| # | Pages | File | Element | Issue |
|---|-------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price filter toggle button | `aria-controls="filter-price"` removed; panel `id="filter-price"` removed |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size filter toggle button | `aria-controls="filter-size"` removed; panel `id="filter-size"` removed |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand filter toggle button | `aria-controls="filter-brand"` removed; panel `id="filter-brand"` removed |

**WCAG:** 4.1.2 (A)

---

### Moderate: Sort Dropdown `aria-expanded` Missing on Disclosure Button

| Pages | File | Element | Issue |
|-------|------|---------|-------|
| Products Page | `src/pages/NewPage.jsx` | `.sort-btn` | `aria-expanded` removed — AT cannot determine open/closed state |

**WCAG:** 4.1.2 (A)

---

### Serious: Cart Modal Missing `aria-modal`, `role="dialog"`, and Escape Handler

| # | File | Element | Issue |
|---|------|---------|-------|
| 1 | `src/components/CartModal.jsx` | Cart drawer `<div>` | `role="dialog"` removed — screen readers do not enter dialog reading mode |
| 2 | `src/components/CartModal.jsx` | Cart drawer `<div>` | `aria-modal="true"` removed — background content not hidden from AT |
| 3 | `src/components/CartModal.jsx` | Cart drawer | Escape key handler removed — keyboard users cannot close modal with Escape |
| 4 | `src/components/CartModal.jsx` | Cart drawer | Focus not trapped inside open modal — Tab key escapes to background content |

**WCAG:** 4.1.2 (A); 2.1.1 (A) — Keyboard; 2.1.2 (A) — No Keyboard Trap

---

### Serious: Cart Modal `aria-label` on Container and Items List Missing (`no-dialog-accessible-name`, `no-quantity-value-label`)

| # | File | Element | Issue |
|---|------|---------|-------|
| 1 | `src/components/CartModal.jsx` | Cart drawer container | `aria-label="Shopping cart"` removed — dialog has no accessible name |
| 2 | `src/components/CartModal.jsx` | Cart items `<ul>` | `aria-label="Cart items"` removed — list has no accessible label |
| 3 | `src/components/CartModal.jsx` | Quantity `<span>` per item | `aria-label="Quantity: N"` removed — screen readers announce bare number without context |

**WCAG:** 4.1.2 (A); 1.1.1 (A)

---

### Moderate: Heading Hierarchy Violations (`heading-order`) — 14 Issues

| # | Page | File | Element | Wrong Level | Correct Level |
|---|------|------|---------|-------------|---------------|
| 1 | Homepage | `HeroBanner.jsx` | "Winter Basics" | `<h3>` | `<h1>` |
| 2 | Homepage | `FeaturedPair.jsx` | Card titles | `<h1>` | `<h3>` |
| 3 | Homepage | `PopularSection.jsx` | "Popular on the Merch Shop" | `<h4>` | `<h2>` |
| 4 | Homepage | `PopularSection.jsx` | Product card titles | `<h1>` | `<h3>` |
| 5 | Homepage | `TrendingCollections.jsx` | "Shop Trending Collections" | `<h4>` | `<h2>` |
| 6 | Homepage | `TrendingCollections.jsx` | Collection card titles | `<h1>` | `<h3>` |
| 7 | Homepage | `TheDrop.jsx` | "The Drop" | `<h4>` | `<h2>` |
| 8 | Products Page | `NewPage.jsx` | Page title | `<h3>` | `<h1>` |
| 9 | Product Detail | `ProductPage.jsx` | Product name | `<h3>` | `<h1>` |
| 10 | Checkout | `CheckoutPage.jsx` | "Shopping Cart" / "Shipping & Payment" | `<h3>` | `<h1>` |
| 11 | Checkout | `CheckoutPage.jsx` | "Order Summary" (×2) | `<h5>` | `<h2>` |
| 12 | Order Confirmation | `OrderConfirmationPage.jsx` | "Thank you!" | `<h3>` | `<h1>` |
| 13 | All pages (Cart drawer) | `CartModal.jsx` | "Shopping Cart" | `<h5>` | `<h2>` |
| 14 | All pages (Wishlist drawer) | `WishlistModal.jsx` | "Wishlist" | `<h5>` | `<h2>` |

**WCAG:** 1.3.1 (A) — Info and Relationships

---

### Serious: Non-Meaningful Accessible Labels (`non-meaningful-label`) — 9 Issues

| # | Page | File | Element | Bad Label | Should Be |
|---|------|------|---------|-----------|-----------|
| 1 | Products Page | `ProductCard.jsx` | `<article>` wrapper | `"Product item"` | Product name |
| 2 | Product Detail | `ProductPage.jsx` | "ADD TO CART" `<button>` | `"Add to cart"` | `"Add [product name] to cart"` |
| 3 | Product Detail | `ProductPage.jsx` | Wishlist `<button>` | `"Wishlist action"` | `"Add/Remove [product name] to/from wishlist"` |
| 4 | Checkout | `CheckoutPage.jsx` | Decrease quantity `<button>` | `"Minus"` | `"Decrease quantity of [item name]"` |
| 5 | Checkout | `CheckoutPage.jsx` | Quantity `<span>` | `"Number"` | `"Quantity: N"` |
| 6 | Checkout | `CheckoutPage.jsx` | Increase quantity `<button>` | `"Plus"` | `"Increase quantity of [item name]"` |
| 7 | Checkout | `CheckoutPage.jsx` | Remove item `<button>` | `"Delete"` | `"Remove [item name] from cart"` |
| 8 | All pages (Wishlist) | `WishlistModal.jsx` | Product image `<a>` link | `"Click here"` | `"View [item name]"` |
| 9 | Products Page | `ProductCard.jsx` | Image link | Insufficient name | Product name |

**WCAG:** 2.4.6 (AA); 2.4.9 (AAA); 4.1.2 (A)

---

### Critical (ARIA): `duplicate-id-aria` — 4 Issues

| # | Page | File | Duplicate ID | Elements |
|---|------|------|-------------|---------|
| 1 | Homepage | `FeaturedPair.jsx` | `featured-card-label` | Two `.featured-eyebrow` elements |
| 2 | Homepage | `FeaturedPair.jsx` | `featured-card-img` | Two `<img>` elements |
| 3 | Products Page | `FilterSidebar.jsx` | `filter-section-title` | `<span>Price</span>` and `<span>Size</span>` |
| 4 | Products Page | `FilterSidebar.jsx` | `filter-section-title` | Second occurrence — same ID on two elements |

**WCAG:** 4.1.1 (A) — Parsing

---

### Critical (ARIA): `aria-required-attr` — 5 Issues (Missing Required ARIA Attributes)

| # | Page | File | Element | Role | Missing Attributes |
|---|------|------|---------|------|--------------------|
| 1 | Homepage | `FeaturedPair.jsx` | `<span role="checkbox">` | `checkbox` | `aria-checked` |
| 2 | Homepage | `TheDrop.jsx` | `<div role="slider">` | `slider` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| 3 | Products Page | `NewPage.jsx` | `<div role="spinbutton">` | `spinbutton` | `aria-valuenow` |
| 4 | Products Page | `NewPage.jsx` | `<div role="combobox">` | `combobox` | `aria-controls`, `aria-expanded` |
| 5 | Product Detail | `ProductPage.jsx` | `<span role="meter">` | `meter` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

**WCAG:** 4.1.2 (A) — Name, Role, Value

---

### Undetectable (Not Found by Automated Scanners) — 2 Issue Groups

These issues were identified through code review (marked `A11Y-UNDETECTABLE` in source). Automated tools cannot detect them because the DOM structure is valid — the problem is a missing dynamic announcement pattern.

**1. Checkout form validation error `<span>` elements missing `role="alert"` (5 instances)**

When the shipping form is submitted with missing fields, up to five error `<span>` elements are injected into the DOM. Without `role="alert"` (which implies `aria-live="assertive"`), the errors appear visually but are completely silent to screen reader users. Files: `src/pages/CheckoutPage.jsx` — error spans `#firstName-error`, `#lastName-error`, `#address-error`, `#cardNumber-error`, `#expirationDate-error`.

**2. Cart count badge update — no `aria-live` region**

When an item is added to the cart, the badge count in the Header updates silently. The badge carries `aria-hidden="true"` (to avoid redundant reading), but there is no `aria-live` region anywhere to announce "Item added to cart" to screen reader users. File: `src/components/Header.jsx` and `src/context/CartContext.jsx`.

---

## Appendix: Pages and Entry Points Scanned

| Route | Component | Entry Point | Notes |
|-------|-----------|-------------|-------|
| `/` | `HomePage` | `src/pages/HomePage.jsx` | Hero, Popular, Featured, Trending, TheDrop sections |
| `/shop/new` | `NewPage` | `src/pages/NewPage.jsx` | Product grid + FilterSidebar + sort |
| `/product/:id` | `ProductPage` | `src/pages/ProductPage.jsx` | Product detail + quantity stepper + wishlist |
| `/checkout` | `CheckoutPage` | `src/pages/CheckoutPage.jsx` | Basket step + Shipping/Payment step |
| `/order-confirmation` | `OrderConfirmationPage` | `src/pages/OrderConfirmationPage.jsx` | Post-order success |
| Cart overlay | `CartModal` | `src/components/CartModal.jsx` | Present on all pages except checkout/order-confirmation |
| Wishlist overlay | `WishlistModal` | `src/components/WishlistModal.jsx` | Present on all pages except checkout/order-confirmation |

**JavaScript Entry:** `src/index.js`  
**HTML Template:** `public/index.html`  
**Router:** `src/components/App.jsx` (`<BrowserRouter>` + `<Routes>`)  

---

*Report generated by Evinced Playwright SDK (automated) + manual code review. All issue descriptions reference the Evinced knowledge base and WCAG 2.1 criterion references.*
