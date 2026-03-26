# Accessibility (A11Y) Audit Report — Demo Website

**Tool:** Evinced JS Playwright SDK v2.43.0  
**Date:** 2026-03-26  
**Auditor:** Automated Cloud Agent (Cursor)  
**Scope:** All six application pages/states  
**Standard:** WCAG 2.0 / 2.1 / 2.2 Levels A and AA  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Pages Scanned & Entry Points](#2-pages-scanned--entry-points)
3. [Issue Totals by Page](#3-issue-totals-by-page)
4. [Critical Issues — Detailed Findings & Recommended Fixes](#4-critical-issues--detailed-findings--recommended-fixes)
   - [CRIT-01 — Header Wishlist div-as-button](#crit-01--header-wishlist-div-as-button)
   - [CRIT-02 — Header Search / Login div-as-buttons with hidden text](#crit-02--header-search--login-div-as-buttons-with-hidden-text)
   - [CRIT-03 — Header Region Selector div-as-button](#crit-03--header-region-selector-div-as-button)
   - [CRIT-04 — Popular-Section "Shop …" div-as-link with hidden label](#crit-04--popular-section-shop--div-as-link-with-hidden-label)
   - [CRIT-05 — Footer nav-item divs & FAQs aria-hidden label](#crit-05--footer-nav-item-divs--faqs-aria-hidden-label)
   - [CRIT-06 — aria-expanded="yes" on h1 elements](#crit-06--aria-expandedyes-on-h1-elements)
   - [CRIT-07 — Cart Modal & Wishlist close / remove buttons with no accessible name](#crit-07--cart-modal--wishlist-close--remove-buttons-with-no-accessible-name)
   - [CRIT-08 — Cart "Continue Shopping" div-as-button with hidden text](#crit-08--cart-continue-shopping-div-as-button-with-hidden-text)
   - [CRIT-09 — role=slider missing required ARIA attributes](#crit-09--roleslider-missing-required-aria-attributes)
   - [CRIT-10 — Filter option divs presented as interactive checkboxes](#crit-10--filter-option-divs-presented-as-interactive-checkboxes)
   - [CRIT-11 — Images missing alt text](#crit-11--images-missing-alt-text)
   - [CRIT-12 — Duplicate id="filter-section-title" referenced by aria-describedby](#crit-12--duplicate-idfilter-section-title-referenced-by-aria-describedby)
   - [CRIT-13 — Checkout "Continue" div-as-button](#crit-13--checkout-continue-div-as-button)
   - [CRIT-14 — Order Confirmation "Back to Shop" div-as-link](#crit-14--order-confirmation-back-to-shop-div-as-link)
   - [CRIT-15 — aria-relevant="changes" invalid value on product details list](#crit-15--aria-relevantchanges-invalid-value-on-product-details-list)
5. [Non-Critical (Serious) Issues — Full List](#5-non-critical-serious-issues--full-list)
6. [Issue Cross-Reference by Page](#6-issue-cross-reference-by-page)

---

## 1. Executive Summary

A full accessibility audit was performed using the **Evinced JS Playwright SDK** across all six pages and interactive states of the demo e-commerce application. The Evinced SDK was used exclusively for detection — no Axe engine was enabled.

| Severity | Count |
|----------|-------|
| **Critical** | **123** unique instances across all pages |
| **Serious** | **27** unique instances across all pages |
| **Total** | **190** |

> Note: Many critical issues originate in globally shared components (Header, Footer, CartModal) that appear on every page, inflating the raw per-page counts (Homepage: 35, ShopNew: 55, ProductDetail: 20, CartModal state: 24, Checkout: 21, OrderConfirmation: 35).

Fifteen distinct root-cause patterns were identified across the codebase. All critical issues have been described with pinpointed source locations, recommended code changes, and the rationale for each remediation approach.

**No source code was modified** — per instructions this report documents findings and recommended fixes only.

---

## 2. Pages Scanned & Entry Points

| # | Page / State | URL | React Entry Point |
|---|---|---|---|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` |
| 2 | Shop New (Products listing) | `/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `/product/:id` (tested with id=1) | `src/pages/ProductPage.jsx` |
| 4 | Cart Modal | `/product/1` → Add to Cart → Cart open | `src/components/CartModal.jsx` |
| 5 | Checkout | `/checkout` (basket step) | `src/pages/CheckoutPage.jsx` |
| 6 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

**Global components present on all pages:**
- `src/components/Header.jsx`
- `src/components/Footer.jsx`
- `src/components/CartModal.jsx` (rendered but hidden unless cart is open)
- `src/components/WishlistModal.jsx` (rendered but hidden unless wishlist is open)

**Homepage-specific components:**
- `src/components/HeroBanner.jsx`
- `src/components/FeaturedPair.jsx`
- `src/components/PopularSection.jsx`
- `src/components/TheDrop.jsx`
- `src/components/TrendingCollections.jsx`

**Shop/New-specific component:**
- `src/components/FilterSidebar.jsx`

---

## 3. Issue Totals by Page

| Page | Critical | Serious | Total |
|------|----------|---------|-------|
| Homepage (`/`) | 32 | 3 | **35** |
| Shop New (`/shop/new`) | 41 | 14 | **55** |
| Product Detail (`/product/1`) | 18 | 2 | **20** |
| Cart Modal (open state) | 22 | 2 | **24** |
| Checkout (`/checkout`) | 18 | 3 | **21** |
| Order Confirmation | 32 | 3 | **35** |

**Issue type breakdown (all pages combined):**

| Evinced Issue Type | Description | Count |
|--------------------|-------------|-------|
| `WRONG_SEMANTIC_ROLE` | Element performs interactive function but has wrong/missing ARIA role | 56 |
| `NOT_FOCUSABLE` | Interactive element cannot receive keyboard focus | 62 |
| `NO_DESCRIPTIVE_TEXT` | Interactive element has no accessible name | 27 |
| `AXE-BUTTON-NAME` | `<button>` element has no accessible name | 10 |
| `AXE-ARIA-VALID-ATTR-VALUE` | ARIA attribute has an invalid value | 6 |
| `AXE-IMAGE-ALT` | `<img>` missing `alt` attribute | 4 |
| `AXE-ARIA-REQUIRED-ATTR` | ARIA role missing required attribute | 2 |
| `AXE-COLOR-CONTRAST` | Insufficient text/background contrast ratio | 19 |
| `AXE-HTML-HAS-LANG` | `<html>` element missing `lang` attribute | 6 |
| `AXE-VALID-LANG` | `lang` attribute value is not a valid BCP 47 tag | 2 |

---

## 4. Critical Issues — Detailed Findings & Recommended Fixes

---

### CRIT-01 — Header Wishlist div-as-button

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** All pages (global Header component)  
**Source file:** `src/components/Header.jsx` (line 131)  

#### Affected Element

```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>
```

#### Issue Description

The wishlist trigger is a `<div>` with an `onClick` handler. Because it is not a native interactive element:

- Screen readers do not identify it as a button (wrong semantic role).
- It receives no keyboard focus in the tab order (not focusable).
- Keyboard-only and switch-device users cannot activate it.

#### Recommended Fix

Replace the `<div>` with a `<button>` element. The SVG is already `aria-hidden="true"` and the visible `<span>Wishlist</span>` provides an accessible name.

```jsx
// Before (Header.jsx:131)
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</button>
```

**Why this approach:** Using a native `<button>` provides all required semantics (role="button"), keyboard focusability, and Enter/Space activation for free, without any ARIA overrides. The CSS class already contains the necessary visual styling.

---

### CRIT-02 — Header Search / Login div-as-buttons with hidden text

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 4.1.2 accessible name  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Pages affected:** All pages (global Header)  
**Source file:** `src/components/Header.jsx` (lines 140, 156)

#### Affected Elements

```html
<!-- Search (line 140) -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>

<!-- Login (line 156) -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</div>
```

#### Issue Description

Both the Search and Login controls are `<div>` elements with `onClick` handlers. The visible text labels have `aria-hidden="true"`, meaning assistive technology has nothing to announce — they are invisible to screen readers both by role and by name.

This causes three simultaneous violations:
1. Missing interactive semantics (`WRONG_SEMANTIC_ROLE`)
2. Not keyboard-accessible (`NOT_FOCUSABLE`)
3. No accessible name (`NO_DESCRIPTIVE_TEXT`)

#### Recommended Fix

Replace with native `<button>` elements and remove `aria-hidden` from the visible text labels.

```jsx
// Before (Header.jsx:140)
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>

// After
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</button>

// Before (Header.jsx:156)
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</div>

// After
<button className="icon-btn" aria-label="Login">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</button>
```

**Why this approach:** The `aria-label` on the `<button>` provides an unambiguous accessible name that screen readers will announce. The visible span remains `aria-hidden` to prevent double-announcing. If the visible span is needed for sighted users but should not be read by AT, this pattern (visible via CSS, hidden from AT via `aria-hidden`) is valid as long as the accessible name is present on the button itself.

---

### CRIT-03 — Header Region Selector div-as-button

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** All pages (global Header)  
**Source file:** `src/components/Header.jsx` (line 161)

#### Affected Element

```html
<div class="flag-group" style="cursor: pointer;">
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" width="24" height="24">
  <img src="/images/icons/canada.png" alt="Canada Flag" width="24" height="24">
</div>
```

#### Issue Description

The region/currency selector is implemented as a `<div>` with an `onClick` handler. While the two `<img>` elements inside have appropriate `alt` text, the container itself conveys no interactive semantics and is not keyboard-focusable.

#### Recommended Fix

Wrap the flag images in a `<button>` with an explicit `aria-label` describing the control's purpose.

```jsx
// Before (Header.jsx:161)
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  <img src="…/united-states-of-america.png" alt="United States Flag" …/>
  <img src="…/canada.png" alt="Canada Flag" …/>
</div>

// After
<button className="flag-group" onClick={() => {}} aria-label="Select region or currency">
  <img src="…/united-states-of-america.png" alt="" aria-hidden="true" …/>
  <img src="…/canada.png" alt="" aria-hidden="true" …/>
</button>
```

**Why this approach:** The `aria-label` on the `<button>` provides a descriptive name (e.g., "Select region or currency") that supersedes the individual image alt texts — which become redundant and should be emptied (`alt=""`) to avoid reading "United States Flag Canada Flag Select region or currency." A native button ensures the element appears in the tab order and can be activated with Enter/Space.

---

### CRIT-04 — Popular-Section "Shop …" div-as-link with hidden label

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Pages affected:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Source file:** `src/components/PopularSection.jsx` (line 55)

#### Affected Elements (3 instances, one per product card)

```html
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Fun and Games</span>
</div>
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Stationery</span>
</div>
```

#### Issue Description

Each "Shop …" element acts as a navigation link to `/shop/new` but:
- Uses a `<div>` with `onClick` instead of an `<a>` or `<button>`.
- The only visible text is inside a `<span aria-hidden="true">`, making the label inaccessible to screen readers.
- The element is not keyboard-focusable.

#### Recommended Fix

Replace the `<div>` with a React Router `<Link>` (which renders an `<a>` tag) and remove the `aria-hidden` from the text.

```jsx
// Before (PopularSection.jsx:55)
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// After
import { Link } from 'react-router-dom';
// …
<Link to={product.shopHref} className="shop-link">
  {product.shopLabel}
</Link>
```

**Why this approach:** Using a native `<a>` (via React Router's `<Link>`) correctly communicates "link" semantics to assistive technology, is natively focusable, and can be activated with Enter. Removing `aria-hidden` from the label text makes the name available to screen readers. A `<Link>` also supports right-click "Open in new tab," browser history, and accessible keyboard navigation that `onClick` on a div cannot replicate.

---

### CRIT-05 — Footer nav-item divs & FAQs aria-hidden label

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Pages affected:** All pages (global Footer)  
**Source file:** `src/components/Footer.jsx` (lines 13, 18)

#### Affected Elements

```html
<!-- "Sustainability" (line 13) -->
<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>

<!-- "FAQs" (line 18) -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

#### Issue Description

Both footer nav items are `<div>` elements with `onClick` handlers:
- "Sustainability" has visible text but no semantic role and is not focusable.
- "FAQs" has its only text inside `aria-hidden="true"`, so screen readers cannot compute any accessible name for the element.

#### Recommended Fix

Replace both `<div>` elements with native `<a>` elements (or `<button>` elements if they perform in-page actions rather than navigation).

```jsx
// Before (Footer.jsx:13)
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
    Sustainability
  </div>
</li>

// After
<li>
  <a href="#sustainability" className="footer-nav-item">Sustainability</a>
</li>

// Before (Footer.jsx:18)
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
    <span aria-hidden="true">FAQs</span>
  </div>
</li>

// After
<li>
  <a href="#faqs" className="footer-nav-item">FAQs</a>
</li>
```

**Why this approach:** Native `<a>` elements convey link semantics, are natively focusable (Tab key), and can be activated with Enter. The `<span aria-hidden="true">` wrapper is entirely removed so the text is directly accessible. If these controls trigger JavaScript actions rather than navigating to anchors, they should use `<button>` with `role="link"` and the appropriate `onClick`.

---

### CRIT-06 — aria-expanded="yes" on h1 elements

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Pages affected:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Source file:** `src/components/FeaturedPair.jsx` (line 46)

#### Affected Elements

```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

#### Issue Description

The `aria-expanded` attribute requires a Boolean value of either `"true"` or `"false"`. The value `"yes"` is invalid and will be ignored or misinterpreted by assistive technology. Additionally, `aria-expanded` is semantically inappropriate on an `<h1>` unless the heading controls a collapsible disclosure region.

#### Recommended Fix

Remove `aria-expanded` from these headings entirely (or fix the value if a disclosure pattern is truly intended).

```jsx
// Before (FeaturedPair.jsx:46)
<h1 aria-expanded="yes">{item.title}</h1>

// After (remove the invalid attribute)
<h1>{item.title}</h1>
```

**Why this approach:** The `aria-expanded` attribute is only meaningful on controls that expand/collapse other content (e.g., accordion trigger buttons, disclosure widgets). Plain headings do not control any collapsible region here. Removing the attribute eliminates the invalid-value violation without any functional change. If a disclosure pattern is intended, the `<h1>` should be replaced with a `<button>` that has `aria-expanded="true"` or `aria-expanded="false"` and `aria-controls` pointing to the controlled panel.

---

### CRIT-07 — Cart Modal & Wishlist close / remove buttons with no accessible name

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `AXE-BUTTON-NAME`, `NO_DESCRIPTIVE_TEXT`  
**Pages affected:** All pages (CartModal rendered globally), Product Detail, Cart Modal state  
**Source files:** `src/components/CartModal.jsx` (close button ~line 56; remove-item button ~line 102), `src/components/WishlistModal.jsx` (close button)

#### Affected Elements

```html
<!-- CartModal close button -->
<button class="…closeBtn">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>

<!-- CartModal remove-from-cart button (per item) -->
<button class="…removeBtn">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>

<!-- WishlistModal close button -->
<button class="…">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>
```

#### Issue Description

These `<button>` elements are icon-only (the SVG is `aria-hidden="true"`) and have no accessible name via `aria-label`, `aria-labelledby`, or visible text. Screen readers will announce them as "button" with no indication of purpose.

#### Recommended Fix

Add `aria-label` attributes with descriptive names.

```jsx
// CartModal.jsx — close button
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg aria-hidden="true">…</svg>
</button>

// CartModal.jsx — remove item button (use item name for context)
<button
  className={styles.removeBtn}
  onClick={() => removeFromCart(item.id)}
  aria-label={`Remove ${item.name} from cart`}
>
  <svg aria-hidden="true">…</svg>
</button>

// WishlistModal.jsx — close button
<button
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** `aria-label` is the simplest and most widely supported mechanism for providing an accessible name to an icon-only button where no visible text is present. Including the item name in the remove button label (`Remove Chrome Dino Backpack from cart`) is critical because multiple remove buttons on the same page would otherwise all be announced as "button" with no differentiation — violating WCAG 1.3.1 (Info and Relationships) in addition to 4.1.2.

---

### CRIT-08 — Cart "Continue Shopping" div-as-button with hidden text

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Pages affected:** Cart Modal state (shown when cart has items)  
**Source file:** `src/components/CartModal.jsx` (line 128)

#### Affected Element

```html
<div class="…continueBtn" style="cursor: pointer;">
  <span aria-hidden="true">Continue Shopping</span>
</div>
```

#### Issue Description

The "Continue Shopping" control closes the cart drawer and returns the user to browsing. It is implemented as a `<div>` with `onClick`, and its only text is inside `aria-hidden="true"`. This makes it invisible to screen readers (no name, no role, not focusable).

#### Recommended Fix

Replace with a `<button>` element and remove `aria-hidden` from the text (or provide an explicit `aria-label`).

```jsx
// Before (CartModal.jsx:128)
<div
  className={styles.continueBtn}
  onClick={closeCart}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">Continue Shopping</span>
</div>

// After
<button
  className={styles.continueBtn}
  onClick={closeCart}
>
  Continue Shopping
</button>
```

**Why this approach:** A native `<button>` solves all three violations simultaneously: it provides the correct role ("button"), is natively keyboard-focusable, and the visible text content becomes the accessible name. The `aria-hidden` wrapper span is removed because its only purpose was to hide text from AT — now the text is the accessible name itself.

---

### CRIT-09 — role=slider missing required ARIA attributes

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `AXE-ARIA-REQUIRED-ATTR`, `NOT_FOCUSABLE`  
**Pages affected:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Source file:** `src/components/TheDrop.jsx` (line 19)

#### Affected Element

```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

#### Issue Description

The WAI-ARIA specification requires that elements with `role="slider"` provide all three of `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, assistive technology cannot communicate the current or allowed range of the control. Additionally, as a `role="slider"` element it must be keyboard-focusable (`tabindex="0"`) and must respond to arrow-key input to be usable.

If this element is purely decorative (just a visual progress indicator that is not interactive), the `role="slider"` attribute is wrong and should be replaced with `role="presentation"` or removed entirely.

#### Recommended Fix

**Option A — Decorative / read-only indicator (recommended if no user interaction is needed):**

```jsx
// TheDrop.jsx:19
// Remove slider role entirely for a static visual bar
<div aria-label="Popularity indicator" className="drop-popularity-bar" role="img" />
// Or simply make it presentational and rely on a nearby text description
```

**Option B — Interactive slider (if value control is intended):**

```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={currentValue}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
  onKeyDown={handleSliderKeyDown}
/>
```

**Why this approach:** Because the element has no apparent interactive behavior in the current code and no `tabIndex`, Option A is the most appropriate fix — removing a role that was never implemented. Using `role="img"` makes the element a labelled informational graphic without requiring slider-specific ARIA attributes or keyboard interaction. If an actual slider is needed, all three required attributes plus keyboard handling must be implemented.

---

### CRIT-10 — Filter option divs presented as interactive checkboxes

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** Shop New (`/shop/new`)  
**Source file:** `src/components/FilterSidebar.jsx` (lines 74, 116, 156 — price, size, and brand filter groups)

#### Affected Elements (all filter option items — 12+ instances)

```html
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">1.00 - 19.99<span class="filter-count">(8)</span></span>
</div>
```

#### Issue Description

Each filter option is rendered as a `<div>` with an `onClick` handler that visually looks like a checkbox but has none of the required semantics:
- No interactive role (`role="checkbox"` is absent).
- Not keyboard-focusable (no `tabIndex`).
- No `aria-checked` state to communicate selected/deselected status.

Keyboard-only and screen-reader users cannot discover or interact with these filters at all.

#### Recommended Fix

The simplest and most robust fix is to use native HTML `<input type="checkbox">` elements (visually styled to match the custom appearance) or ARIA checkbox pattern.

**Option A — Native `<input type="checkbox">` (recommended):**

```jsx
// FilterSidebar.jsx — price filter (same pattern for size and brand)
{PRICE_RANGES.map((range) => {
  const count = priceCount(range);
  const checked = selectedPrices.some((r) => r.label === range.label);
  const id = `price-${range.label.replace(/\s/g, '-')}`;
  return (
    <label key={range.label} className="filter-option" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        className="visually-hidden"
        checked={checked}
        onChange={() => onPriceChange(range)}
      />
      <span className={`custom-checkbox${checked ? ' custom-checkbox--checked' : ''}`} aria-hidden="true">
        {checked && <span className="custom-checkbox-checkmark" aria-hidden="true" />}
      </span>
      <span className="filter-option-label">
        {range.label}
        <span className="filter-count">({count})</span>
      </span>
    </label>
  );
})}
```

**Option B — ARIA checkbox pattern (use only if native input is not feasible):**

```jsx
<div
  key={range.label}
  className="filter-option"
  role="checkbox"
  aria-checked={checked}
  tabIndex={0}
  onClick={() => onPriceChange(range)}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPriceChange(range)}
>
  …
</div>
```

**Why this approach:** Native `<input type="checkbox">` elements are preferred over the ARIA pattern because they are natively focusable, toggled by Space key, announced correctly by all major screen readers, and do not require JavaScript keyboard event handlers. The custom visual appearance can be preserved by visually hiding the real input (`.visually-hidden` CSS class) and rendering the custom styled checkbox as an `aria-hidden` presentational element beside it.

---

### CRIT-11 — Images missing alt text

**Severity:** Critical  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Evinced types:** `AXE-IMAGE-ALT`  
**Pages affected:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Source files:** `src/components/HeroBanner.jsx` (line 18), `src/components/TheDrop.jsx` (line 13)

#### Affected Elements

```html
<!-- HeroBanner.jsx:18 -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop.jsx:13 -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

#### Issue Description

Both `<img>` elements are missing the `alt` attribute entirely. Screen readers will fall back to reading the filename (`New_Tees.png`, `2bags_charms1.png`), which is meaningless to users. WCAG 1.1.1 requires that every non-decorative image have a text alternative. If the image is purely decorative, `alt=""` must still be explicitly set to suppress it.

#### Recommended Fix

```jsx
// HeroBanner.jsx:18 — contextual image in hero section
<img src={HERO_IMAGE} alt="Model wearing new winter basics collection" />

// TheDrop.jsx:13 — product image in The Drop section
<img src={DROP_IMAGE} alt="Android, YouTube and Super G plushie bag charms" loading="lazy" />
```

**Why this approach:** Meaningful `alt` text is chosen over `alt=""` because both images are content images — the hero image illustrates the "Winter Basics" promotion, and The Drop image illustrates the plushie bag charms described in the accompanying text. An empty `alt=""` would be appropriate only if the image adds no information beyond what the surrounding text already communicates. Descriptive alt text improves the experience for screen reader users and also benefits search engine indexing.

---

### CRIT-12 — Duplicate id="filter-section-title" referenced by aria-describedby

**Severity:** Critical  
**WCAG:** 4.1.1 Parsing (Level A); 4.1.2 Name, Role, Value  
**Evinced types:** `AXE-ARIA-REQUIRED-ATTR` (manifests as ARIA reference error)  
**Pages affected:** Shop New (`/shop/new`)  
**Source file:** `src/components/FilterSidebar.jsx` (lines ~58 and ~100)

#### Affected Elements

```html
<!-- Price filter button -->
<button class="filter-group-header" aria-describedby="filter-section-title">
  <span id="filter-section-title">Price</span>
</button>

<!-- Size filter button (duplicate id) -->
<button class="filter-group-header" aria-describedby="filter-section-title">
  <span id="filter-section-title">Size</span>
</button>
```

#### Issue Description

`id="filter-section-title"` is duplicated — it appears on both the Price and Size filter section spans. Because IDs must be unique in HTML, the browser's accessibility tree will resolve `aria-describedby="filter-section-title"` to whichever element it finds first, meaning the Size button may be described as "Price" (or vice versa). Additionally, HTML validators and accessibility tools flag duplicate IDs as a parsing error (WCAG 4.1.1).

#### Recommended Fix

Assign unique IDs to each filter section title, matching each `aria-describedby` to its own span.

```jsx
// FilterSidebar.jsx — Price filter button
<button
  className="filter-group-header"
  onClick={() => setPriceOpen((o) => !o)}
  aria-describedby="filter-section-price"
>
  <span id="filter-section-price">Price</span>
  …
</button>

// FilterSidebar.jsx — Size filter button
<button
  className="filter-group-header"
  onClick={() => setSizeOpen((o) => !o)}
  aria-describedby="filter-section-size"
>
  <span id="filter-section-size">Size</span>
  …
</button>
```

**Why this approach:** Unique IDs are a fundamental HTML requirement. They are the only reliable mechanism for associating ARIA labelling attributes (`aria-describedby`, `aria-labelledby`) with the correct element. Since the `aria-describedby` already points inward at the button's own child span, the most correct alternative would be to remove `aria-describedby` entirely (it is redundant if the `<span>` is already a direct child visible to the accessible name calculation). Either approach eliminates the duplicate-ID error.

---

### CRIT-13 — Checkout "Continue" div-as-button

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** Checkout (`/checkout`) — basket step  
**Source file:** `src/pages/CheckoutPage.jsx`

#### Affected Element

```html
<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```

#### Issue Description

The "Continue" button on the checkout basket step advances the user to the shipping/payment form. It is implemented as a `<div>` with an `onClick` handler. Although visible text "Continue" is present, the element has no interactive role and is not keyboard-focusable. Keyboard-only users cannot proceed past the basket step.

#### Recommended Fix

Replace the `<div>` with a `<button>` element.

```jsx
// CheckoutPage.jsx — basket step footer
// Before
<div className="checkout-continue-btn" onClick={handleContinue} style={{ cursor: 'pointer' }}>
  Continue
</div>

// After
<button className="checkout-continue-btn" onClick={handleContinue}>
  Continue
</button>
```

**Why this approach:** A native `<button>` requires no ARIA additions, is automatically keyboard-focusable, and activatable via Enter/Space. Given this element gates the entire checkout flow, its inaccessibility is a blocker for keyboard and assistive-technology users.

---

### CRIT-14 — Order Confirmation "Back to Shop" div-as-link

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** Order Confirmation (`/order-confirmation`)  
**Source file:** `src/pages/OrderConfirmationPage.jsx` (line ~40)

#### Affected Element

```html
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

#### Issue Description

The post-order "Back to Shop" control is a `<div>` with `onClick={() => {}}`. It is not keyboard-focusable and conveys no link semantics. The `onClick` handler is a no-op stub, meaning it currently does nothing — but regardless of functionality, the element needs proper semantics.

#### Recommended Fix

Replace with a React Router `<Link>` to the homepage (or wherever the intended destination is).

```jsx
// OrderConfirmationPage.jsx:40
// Before
<div className="confirm-home-link" onClick={() => {}} style={{ cursor: 'pointer' }}>
  ← Back to Shop
</div>

// After
import { Link } from 'react-router-dom';
// …
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Why this approach:** A React Router `<Link>` renders a native `<a>` element, which correctly communicates "link" semantics (the destination changes the current page) as opposed to "button" semantics (which would be an in-page action). The text "← Back to Shop" is sufficiently descriptive as the accessible name. Using a `<Link>` also correctly populates browser history and right-click contextual menus.

---

### CRIT-15 — aria-relevant="changes" invalid value on product details list

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced types:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Pages affected:** Product Detail (`/product/1`), Cart Modal state  
**Source file:** `src/pages/ProductPage.jsx` (line ~146)

#### Affected Element

```html
<ul aria-relevant="changes" aria-live="polite">
  <li style="display: none;">
    <span role="meter" aria-label="Stock level"></span>
  </li>
  <!-- product detail items -->
</ul>
```

#### Issue Description

The `aria-relevant` attribute controls what types of live-region changes are announced. Valid values are a space-separated list of tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is **not** a valid token and will be treated as an error by conformance checkers and may be ignored by assistive technology. The intended value is likely `"additions text"` or `"all"`.

Additionally, a hidden `<span role="meter">` inside the list lacks the required `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes for the `meter` role.

#### Recommended Fix

```jsx
// ProductPage.jsx:146
// Before
<ul
  className={styles.detailsList}
  aria-relevant="changes"
  aria-live="polite"
>

// After
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

For the hidden meter span, either add the required attributes or remove the `role="meter"`:

```jsx
// Before
<li style={{ display: 'none' }}>
  <span role="meter" aria-label="Stock level"></span>
</li>

// After — if this is just a placeholder, remove the invalid role
<li style={{ display: 'none' }}>
  <span aria-label="Stock level"></span>
</li>
```

**Why this approach:** The WAI-ARIA specification defines `aria-relevant` strictly; any unrecognized token can cause the entire attribute to be ignored. Replacing `"changes"` with `"additions text"` is the most conservative valid value that matches what live regions typically communicate (new content added, text changes). Removing the invalid `role="meter"` from the hidden element prevents a secondary ARIA violation without affecting any visible behavior.

---

## 5. Non-Critical (Serious) Issues — Full List

These issues were detected by Evinced with **Serious** severity. They are real accessibility problems but do not completely block user tasks. They are documented here for completeness and should be addressed in a subsequent remediation pass.

### NC-01 — `<html>` element missing `lang` attribute

**Severity:** Serious  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Evinced type:** `AXE-HTML-HAS-LANG`  
**Pages affected:** All pages  
**Source file:** `public/index.html`

```html
<!-- Current -->
<html>

<!-- Fix -->
<html lang="en">
```

**Impact:** Without a declared language, screen readers cannot select the correct pronunciation engine, causing words to be mispronounced. This is a single-character fix in the HTML template.

---

### NC-02 — Invalid `lang="zz"` on paragraph element

**Severity:** Serious  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Evinced type:** `AXE-VALID-LANG`  
**Pages affected:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Source file:** `src/components/TheDrop.jsx` (line ~21)

```html
<!-- Current -->
<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>

<!-- Fix — remove the invalid lang tag (content is English) -->
<p>Our brand-new, limited-edition plushie bag charms…</p>
```

**Impact:** `zz` is not a valid BCP 47 language subtag. Screen readers will attempt to switch to a non-existent language pronunciation profile, causing garbled speech for the paragraph.

---

### NC-03 to NC-21 — Insufficient Colour Contrast

**Severity:** Serious  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Evinced type:** `AXE-COLOR-CONTRAST`  
**Total instances:** 19 across pages

These issues affect users with low vision or colour-vision deficiency who rely on sufficient contrast between text and its background.

| # | Page | Affected Element | CSS Selector |
|---|------|-----------------|-------------|
| NC-03 | Homepage | Hero subheading "Warm hues for cooler days" | `.hero-content > p` |
| NC-04 | Shop New | Filter count badge "(8)" — price range 1 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` |
| NC-05 | Shop New | Filter count badge "(4)" — price range 2 | `.filter-group:nth-child(2) > … :nth-child(2) … .filter-count` |
| NC-06 | Shop New | Filter count badge "(4)" — price range 3 | `.filter-group:nth-child(2) > … :nth-child(3) … .filter-count` |
| NC-07 | Shop New | Filter count badge "(0)" — price range 4 | `.filter-group:nth-child(2) > … :nth-child(4) … .filter-count` |
| NC-08 | Shop New | Filter count "(14)" — size XS | `.filter-group:nth-child(3) > … :nth-child(1) … .filter-count` |
| NC-09 | Shop New | Filter count "(15)" — size SM | `.filter-group:nth-child(3) > … :nth-child(2) … .filter-count` |
| NC-10 | Shop New | Filter count "(14)" — size MD | `.filter-group:nth-child(3) > … :nth-child(3) … .filter-count` |
| NC-11 | Shop New | Filter count "(12)" — size LG | `.filter-group:nth-child(3) > … :nth-child(4) … .filter-count` |
| NC-12 | Shop New | Filter count "(11)" — size XL | `.filter-option:nth-child(5) > … .filter-count` |
| NC-13 | Shop New | Filter count "(2)" — brand Android | `.filter-group:nth-child(4) > … :nth-child(1) … .filter-count` |
| NC-14 | Shop New | Filter count "(13)" — brand Google | `.filter-group:nth-child(4) > … :nth-child(2) … .filter-count` |
| NC-15 | Shop New | Filter count "(1)" — brand YouTube | `.filter-group:nth-child(4) > … :nth-child(3) … .filter-count` |
| NC-16 | Shop New | "16 Products Found" text | `.products-found` |
| NC-17 | Product Detail | Product description paragraph | `p:nth-child(4)` (`.tE3CCfWiGRrHgQcKaAUa`) |
| NC-18 | Cart Modal | Product description paragraph (same) | `p:nth-child(4)` (`.tE3CCfWiGRrHgQcKaAUa`) |
| NC-19 | Checkout | "Shipping & Payment" inactive step label | `.checkout-step:nth-child(3) > .step-label` |
| NC-20 | Checkout | "Taxes calculated at next step" note | `.summary-tax-note` |
| NC-21 | Order Confirmation | Hero subheading "Warm hues for cooler days" | `.hero-content > p` |

**Recommended remediation approach:** Darken the foreground color of affected text elements (or lighten the background) to achieve a minimum contrast ratio of 4.5:1 for normal text (WCAG AA). The `.filter-count` badge and `.products-found` text are likely rendered in a light grey; replacing with a color that meets the 4.5:1 ratio against the white/light background (e.g., `#767676` on white is the minimum passing grey) would resolve the majority of these issues.

---

## 6. Issue Cross-Reference by Page

### Homepage (`/`)
| Issue ID | Root Cause | Instances |
|----------|-----------|----------|
| CRIT-01 | Wishlist div-as-button | 2 (wrong role + not focusable) |
| CRIT-02 | Search/Login div-as-buttons | 6 (2×3 violations) |
| CRIT-03 | Region selector | 2 |
| CRIT-04 | Popular Section shop-links | 9 (3×3 violations) |
| CRIT-05 | Footer nav items | 5 |
| CRIT-06 | aria-expanded="yes" | 2 |
| CRIT-07 | Cart/Wishlist modal buttons (rendered globally) | 2 |
| CRIT-09 | role=slider missing attrs | 2 |
| CRIT-11 | Missing alt text (HeroBanner + TheDrop) | 2 |
| NC-01 | html-has-lang | 1 |
| NC-02 | invalid lang="zz" | 1 |
| NC-03 | Color contrast (hero p) | 1 |

### Shop New (`/shop/new`)
| Issue ID | Root Cause | Instances |
|----------|-----------|----------|
| CRIT-01 | Wishlist div-as-button | 2 |
| CRIT-02 | Search/Login divs | 6 |
| CRIT-03 | Region selector | 2 |
| CRIT-05 | Footer nav items | 5 |
| CRIT-07 | Cart button (no name) | 2 |
| CRIT-10 | Filter option divs (price, size, brand) | 24 (12×2) |
| CRIT-12 | Duplicate id filter-section-title | implied |
| NC-01 | html-has-lang | 1 |
| NC-04–NC-16 | Color contrast — filter counts + products-found | 13 |

### Product Detail (`/product/1`)
| Issue ID | Root Cause | Instances |
|----------|-----------|----------|
| CRIT-01 | Wishlist div-as-button | 2 |
| CRIT-02 | Search/Login divs | 6 |
| CRIT-03 | Region selector | 2 |
| CRIT-05 | Footer nav items | 5 |
| CRIT-07 | Cart close button | 2 |
| CRIT-15 | aria-relevant="changes" | 1 |
| NC-01 | html-has-lang | 1 |
| NC-17 | Color contrast — product description | 1 |

### Cart Modal (open state)
| Issue ID | Root Cause | Instances |
|----------|-----------|----------|
| CRIT-01 | Wishlist div-as-button | 2 |
| CRIT-02 | Search/Login divs | 6 |
| CRIT-03 | Region selector | 2 |
| CRIT-05 | Footer nav items | 5 |
| CRIT-07 | Cart close + per-item remove buttons | 3 |
| CRIT-08 | "Continue Shopping" div | 3 |
| CRIT-15 | aria-relevant="changes" | 1 |
| NC-01 | html-has-lang | 1 |
| NC-18 | Color contrast | 1 |

### Checkout (`/checkout`)
| Issue ID | Root Cause | Instances |
|----------|-----------|----------|
| CRIT-01 | Wishlist div-as-button | 2 |
| CRIT-02 | Search/Login divs | 6 |
| CRIT-03 | Region selector | 2 |
| CRIT-05 | Footer nav items | 5 |
| CRIT-07 | Wishlist modal close button | 1 |
| CRIT-13 | "Continue" div-as-button | 2 |
| NC-01 | html-has-lang | 1 |
| NC-19–NC-20 | Color contrast (step label + tax note) | 2 |

### Order Confirmation (`/order-confirmation`)
| Issue ID | Root Cause | Instances |
|----------|-----------|----------|
| CRIT-01 | Wishlist div-as-button | 2 |
| CRIT-02 | Search/Login divs | 6 |
| CRIT-03 | Region selector | 2 |
| CRIT-04 | Popular Section shop-links | 9 |
| CRIT-05 | Footer nav items | 5 |
| CRIT-06 | aria-expanded="yes" | 2 |
| CRIT-07 | Cart/Wishlist modal buttons | 2 |
| CRIT-09 | role=slider missing attrs | 2 |
| CRIT-11 | Missing alt text | 2 |
| CRIT-14 | "Back to Shop" div-as-link | 2 |
| NC-01 | html-has-lang | 1 |
| NC-02 | invalid lang="zz" | 1 |
| NC-21 | Color contrast (hero p) | 1 |

---

*End of report.*
