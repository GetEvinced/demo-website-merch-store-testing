# Accessibility (A11Y) Audit Report

**Repository:** demo-website  
**Audit Tool:** Evinced JS Playwright SDK (v2.43.0)  
**Audit Date:** 2026-03-16  
**Branch:** cursor/repository-accessibility-audit-16a5  
**Auditor:** Automated Cloud Agent  

---

## Executive Summary

A full accessibility audit was performed across all 6 pages/states of the demo e-commerce website using the Evinced SDK via Playwright. The audit identified **170 total issues** — **145 critical** and **25 serious** — spanning 7 distinct issue categories.

| Page | Total | Critical | Serious |
|------|-------|----------|---------|
| Homepage (`/`) | 35 | 32 | 3 |
| Products Page (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/:id`) | 20 | 18 | 2 |
| Checkout – Basket Step (`/checkout`) | 21 | 18 | 3 |
| Checkout – Shipping Step (`/checkout`) | 19 | 18 | 1 |
| Order Confirmation (`/order-confirmation`) | 20 | 18 | 2 |
| **TOTAL** | **170** | **145** | **25** |

### Issue Category Breakdown (All Pages)

| Issue Type | Severity | Count | WCAG Criterion |
|------------|----------|-------|----------------|
| `WRONG_SEMANTIC_ROLE` | Critical | 55 | WCAG 4.1.2 (A) |
| `NOT_FOCUSABLE` | Critical | 55 | WCAG 2.1.1 (A) |
| `NO_DESCRIPTIVE_TEXT` | Critical | 21 | WCAG 4.1.2 (A) |
| `AXE-BUTTON-NAME` | Critical | 9 | WCAG 4.1.2 (A) |
| `AXE-ARIA-VALID-ATTR-VALUE` | Critical | 3 | WCAG 4.1.2 (A) |
| `AXE-IMAGE-ALT` | Critical | 2 | WCAG 1.1.1 (A) |
| `AXE-ARIA-REQUIRED-ATTR` | Critical | 1 | WCAG 4.1.2 (A) |
| `AXE-HTML-HAS-LANG` | Serious | 6 | WCAG 3.1.1 (A) |
| `AXE-COLOR-CONTRAST` | Serious | 18 | WCAG 1.4.3 (AA) |
| `AXE-VALID-LANG` | Serious | 1 | WCAG 3.1.2 (AA) |

---

## Pages & Entry Points

| Page | URL | Source File | Entry Point |
|------|-----|-------------|-------------|
| Homepage | `/` | `src/pages/HomePage.jsx` | React Router `<Route path="/" />` |
| Products Listing | `/shop/new` | `src/pages/NewPage.jsx` | React Router `<Route path="/shop/new" />` |
| Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` | React Router `<Route path="/product/:id" />` |
| Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` | React Router `<Route path="/checkout" />` |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | React Router `<Route path="/order-confirmation" />` |
| (Shared) Header | all pages | `src/components/Header.jsx` | Rendered in `App.jsx` layout |
| (Shared) Footer | all pages | `src/components/Footer.jsx` | Rendered in `App.jsx` layout |

---

## Critical Issues — Detailed Report

The following sections document every distinct critical-severity issue group detected during the audit. Where the same issue appears on multiple pages (e.g. the shared Header component), it is described once and all affected pages are listed.

---

### CI-1 · Header Icon Buttons use `<div>` instead of `<button>`

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | All 6 pages (shared Header component) |
| **Selectors** | `.wishlist-btn`, `.icon-btn:nth-child(2)`, `.icon-btn:nth-child(4)` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Elements:**

```html
<!-- Wishlist button -->
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg ...aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>

<!-- Search button -->
<div class="icon-btn" style="cursor: pointer;">
  <svg ...>...</svg>
</div>

<!-- Cart button -->
<div class="icon-btn" style="cursor: pointer;">
  <svg ...>...</svg>
</div>
```

**Source File:** `src/components/Header.jsx`

**Issue Description:**  
Three interactive controls in the header navigation are implemented as `<div>` elements with inline `style="cursor: pointer;"` instead of semantic `<button>` elements. Screen readers cannot identify these as interactive controls, and keyboard users cannot Tab to them (they have no `tabindex`). Two of the three icons (search, cart) also have no accessible text label (triggering `NO_DESCRIPTIVE_TEXT` — see CI-3).

**Recommended Remediation:**
```jsx
// Replace <div class="icon-btn wishlist-btn" ...> with:
<button className="icon-btn wishlist-btn" aria-label="Wishlist" onClick={handleWishlist}>
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</button>

// Replace <div class="icon-btn" ...> search icon with:
<button className="icon-btn" aria-label="Search" onClick={handleSearch}>
  <svg aria-hidden="true">...</svg>
</button>

// Replace <div class="icon-btn" ...> cart icon with:
<button className="icon-btn" aria-label="Cart" onClick={handleCart}>
  <svg aria-hidden="true">...</svg>
</button>
```

**Remediation Rationale:**  
Using the native `<button>` element is the most robust fix because it automatically provides the correct ARIA `role="button"`, is natively focusable via keyboard Tab, fires on both `click` and `keypress` (Enter/Space), and is understood by all assistive technologies. Adding `aria-label` to icon-only buttons provides the accessible name required by WCAG 4.1.2. Inline CSS cursor styling can be removed since `<button>` elements already have pointer cursor in most browsers (or can be set in CSS).

---

### CI-2 · Language Selector `<div>` not a Button

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | All 6 pages (shared Header component) |
| **Selector** | `.flag-group` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Element:**

```html
<div class="flag-group" style="cursor: pointer;">
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" width="24" height="24">
  <span>EN</span>
</div>
```

**Source File:** `src/components/Header.jsx`

**Issue Description:**  
The language/region selector in the header is a `<div>` with a click handler. It is not keyboard accessible and has no semantic role. Screen reader users would skip this control entirely.

**Recommended Remediation:**
```jsx
<button className="flag-group" aria-label="Select language: English (United States)" onClick={handleLanguage}>
  <img src="/images/icons/united-states-of-america.png" alt="" role="presentation" width="24" height="24" />
  <span aria-hidden="true">EN</span>
</button>
```

**Remediation Rationale:**  
Converting to `<button>` provides correct semantics. The flag image can be marked `role="presentation"` / `alt=""` since it is decorative alongside the text label. The `aria-label` provides a complete, descriptive name for the control.

---

### CI-3 · Icon-Only Header Buttons have No Accessible Name

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Severity** | Critical |
| **Affected Pages** | All 6 pages (shared Header component) |
| **Selectors** | `.icon-btn:nth-child(2)` (Search), `.icon-btn:nth-child(4)` (Cart) |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/accessible-name |

**Affected Elements:**

```html
<!-- Search icon button — no text, SVG has no title -->
<div class="icon-btn" style="cursor: pointer;">
  <svg ...><!-- paths only, no <title> --></svg>
</div>

<!-- Cart icon button — no text, SVG has no title -->
<div class="icon-btn" style="cursor: pointer;">
  <svg ...><!-- paths only, no <title> --></svg>
</div>
```

**Source File:** `src/components/Header.jsx`

**Issue Description:**  
The search and cart icon controls contain only SVG graphics with no visible text, no `aria-label`, and no `<title>` inside the SVG. Screen reader users hear nothing meaningful when these elements are announced.

**Recommended Remediation:**  
See CI-1 — adding `aria-label="Search"` and `aria-label="Cart"` to the converted `<button>` elements resolves this issue. Alternatively, a visually-hidden `<span>` could be used:

```jsx
<button className="icon-btn" onClick={handleSearch}>
  <svg aria-hidden="true">...</svg>
  <span className="sr-only">Search</span>
</button>
```

**Remediation Rationale:**  
WCAG 1.3.1 and 4.1.2 require every interactive control to have an accessible name. `aria-label` is the most concise approach for icon buttons. If visual designers want to keep the icon-only appearance, `aria-label` is preferred over a visually-hidden span.

---

### CI-4 · Footer Navigation uses `<div>` with `aria-hidden` text

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` + `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | All 6 pages (shared Footer component) |
| **Selectors** | `li:nth-child(3) > .footer-nav-item`, `.footer-list:nth-child(2) > li > .footer-nav-item` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Elements:**

```html
<!-- "Sustainability" footer link — div, no semantics -->
<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>

<!-- "FAQs" footer link — div with aria-hidden text (worst case) -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

**Source File:** `src/components/Footer.jsx`

**Issue Description:**  
Footer navigation items are `<div>` elements. One item ("FAQs") additionally wraps its text in `<span aria-hidden="true">`, making the element completely inaccessible to screen readers — it has neither a role nor a label. The "Sustainability" item at least has visible text but still lacks a semantic role and keyboard focus.

**Recommended Remediation:**
```jsx
// Replace all footer-nav-item divs with anchor or button elements
<a href="/sustainability" className="footer-nav-item">Sustainability</a>

// For "FAQs" — remove aria-hidden from the span, use <a>
<a href="/faqs" className="footer-nav-item">FAQs</a>
```

**Remediation Rationale:**  
Footer navigation links should be `<a>` elements since they navigate to new pages. Using `<a>` provides the correct `role="link"` semantics, natural keyboard tab focus, and ensures the text content is the accessible name. The `aria-hidden="true"` on the "FAQs" `<span>` must be removed — wrapping navigable text in `aria-hidden` is an anti-pattern that makes the control completely invisible to screen readers.

---

### CI-5 · Homepage Category "Shop" Links use non-interactive `<div>`

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` + `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Homepage (`/`) |
| **Selectors** | `.product-card:nth-child(1) > .product-card-info > .shop-link`, `.product-card:nth-child(2) > ...`, `.product-card:nth-child(3) > ...` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Elements:**

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

**Source File:** `src/components/PopularSection.jsx`

**Issue Description:**  
The three category "Shop" links on the Homepage are `<div>` elements. Each wraps its visible text inside `<span aria-hidden="true">`, making both the element role and name inaccessible to screen readers.

**Recommended Remediation:**
```jsx
// Replace each shop-link div with a proper anchor
<a href="/shop/new?category=drinkware" className="shop-link">
  Shop Drinkware
</a>
```

**Remediation Rationale:**  
These are navigation links to product category pages, so `<a>` elements are semantically correct. The `aria-hidden="true"` on the text spans must be removed. Using plain text content (instead of wrapping spans) lets the anchor's accessible name derive naturally from its text content.

---

### CI-6 · Filter Option Checkboxes use `<div>` (Products Page)

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Products Page (`/shop/new`) |
| **Selectors** | `.filter-group:nth-child(2..4) > .filter-options > .filter-option:nth-child(1..n)` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Elements (examples):**

```html
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">1.00 - 19.99<span class="filter-count">(8)</span></span>
</div>

<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">XS<span class="filter-count">(14)</span></span>
</div>
```

**Source File:** `src/components/FilterSidebar.jsx`

**Issue Description:**  
All filter sidebar options (price ranges, sizes, brands — 9 individual options detected) are implemented as nested `<div>` elements that visually look like checkboxes. They have no ARIA role, cannot be focused via keyboard, and screen readers cannot identify them as selectable/filterable options.

**Recommended Remediation:**
```jsx
// Option 1: Use native checkbox inputs (most accessible)
<label className="filter-option">
  <input
    type="checkbox"
    checked={isSelected}
    onChange={() => handleFilter(value)}
  />
  <span className="filter-option-label">
    {label}
    <span className="filter-count">({count})</span>
  </span>
</label>

// Option 2: ARIA-based approach
<div
  role="checkbox"
  aria-checked={isSelected}
  tabIndex={0}
  className="filter-option"
  onClick={() => handleFilter(value)}
  onKeyDown={(e) => e.key === ' ' && handleFilter(value)}
>
  <div className="custom-checkbox" aria-hidden="true"></div>
  <span className="filter-option-label">
    {label}<span className="filter-count">({count})</span>
  </span>
</div>
```

**Remediation Rationale:**  
Native `<input type="checkbox">` within a `<label>` is strongly preferred: it is natively keyboard-accessible (Tab to focus, Space to toggle), automatically announces checked/unchecked state to screen readers, and requires no extra ARIA attributes. Custom checkbox divs must manually implement `role="checkbox"`, `aria-checked`, `tabIndex`, and keyboard event handlers — a significantly higher maintenance burden.

---

### CI-7 · Checkout "Continue" Button uses `<div>`

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Checkout – Basket Step (`/checkout`) |
| **Selector** | `.checkout-continue-btn` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Element:**

```html
<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```

**Source File:** `src/pages/CheckoutPage.jsx`

**Issue Description:**  
The primary call-to-action "Continue" button in the basket step of checkout is a `<div>` with an `onClick` handler. Keyboard users cannot Tab to or activate this control, completely blocking the checkout flow for users who cannot use a mouse.

**Recommended Remediation:**
```jsx
<button className="checkout-continue-btn" onClick={handleContinue} type="button">
  Continue
</button>
```

**Remediation Rationale:**  
This is a critical interaction bottleneck — keyboard and screen reader users cannot proceed through checkout at all. The `<button>` element is the only appropriate fix. Note that `type="button"` should be specified to prevent accidental form submission.

---

### CI-8 · Checkout "Back to Cart" Button uses `<div>`

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Checkout – Shipping Step (`/checkout`) |
| **Selector** | `.checkout-back-btn` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Element:**

```html
<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>
```

**Source File:** `src/pages/CheckoutPage.jsx`

**Issue Description:**  
The "Back to Cart" navigation control in the shipping step is a non-semantic `<div>`. Keyboard users cannot Tab to this control and cannot navigate back to the previous step.

**Recommended Remediation:**
```jsx
<button className="checkout-back-btn" onClick={handleBack} type="button">
  ← Back to Cart
</button>
```

**Remediation Rationale:**  
Same as CI-7. As this is a navigation-back action (not true page navigation), `<button>` is more appropriate than `<a>`. The arrow character `←` is fine as visual decoration alongside the text label.

---

### CI-9 · Order Confirmation "Back to Shop" Link uses `<div>`

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Order Confirmation (`/order-confirmation`) |
| **Selector** | `.confirm-home-link` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Element:**

```html
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

**Source File:** `src/pages/OrderConfirmationPage.jsx`

**Issue Description:**  
The "Back to Shop" link on the order confirmation page uses a `<div>` with an `onClick` handler (typically `navigate('/')`). This is a navigation action that should be an anchor element, making it inaccessible to keyboard users.

**Recommended Remediation:**
```jsx
<Link to="/" className="confirm-home-link">← Back to Shop</Link>
// or
<a href="/" className="confirm-home-link">← Back to Shop</a>
```

**Remediation Rationale:**  
Since this navigates to a different page (`/`), `<Link>` (React Router) or `<a href>` is the semantically correct element. It provides natural keyboard accessibility, correct `role="link"` semantics, and allows screen readers to announce the destination.

---

### CI-10 · Cart/Wishlist Modal Close Buttons have No Accessible Name

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-BUTTON-NAME` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Severity** | Critical |
| **Affected Pages** | All pages where cart modal is present (Homepage, Products, Product Detail) |
| **Selectors** | `#cart-modal > div:nth-child(1) > button`, `div[role="dialog"] > div:nth-child(1) > button` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/button-name |

**Affected Elements:**

```html
<!-- Cart modal close button — icon only, no label -->
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg width="20" height="20" viewBox="0 0 24 24" ...><!-- X icon paths --></svg>
</button>

<!-- Wishlist modal close button — icon only, no label -->
<button class="WEtKZofboSdJ1n7KLpwd">
  <svg width="20" height="20" viewBox="0 0 24 24" ...><!-- X icon paths --></svg>
</button>
```

**Source Files:** `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`

**Issue Description:**  
The close ("×") buttons for the cart modal and wishlist modal contain only SVG graphics. While they are proper `<button>` elements (correct semantics), they lack an accessible name. Screen readers announce them as "button" with no indication of purpose.

**Recommended Remediation:**
```jsx
// CartModal.jsx
<button className={styles.closeButton} onClick={onClose} aria-label="Close cart">
  <svg aria-hidden="true" ...>...</svg>
</button>

// WishlistModal.jsx
<button className={styles.closeButton} onClick={onClose} aria-label="Close wishlist">
  <svg aria-hidden="true" ...>...</svg>
</button>
```

**Remediation Rationale:**  
Adding `aria-label` provides a clear, descriptive accessible name without affecting visual appearance. Marking the SVG with `aria-hidden="true"` prevents the SVG path descriptions from being double-announced by screen readers. This is the standard pattern for icon-only buttons per WCAG 4.1.2 and ARIA best practices.

---

### CI-11 · Images Missing Alternative Text (Homepage)

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-IMAGE-ALT` |
| **WCAG** | 1.1.1 Non-text Content (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Homepage (`/`) |
| **Selectors** | `img[src$="New_Tees.png"]`, `img[src$="2bags_charms1.png"]` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/image-alt |

**Affected Elements:**

```html
<!-- HeroBanner — promotional image, no alt -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop section — product drop image, no alt -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**Source Files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`

**Issue Description:**  
Two promotional images on the homepage are missing `alt` attributes entirely. Screen readers will either skip them or read the raw filename (e.g., "New underscore Tees dot P N G"), which is disorienting and meaningless to users.

**Recommended Remediation:**
```jsx
// HeroBanner.jsx
<img src="/images/home/New_Tees.png" alt="New tees collection — shop the latest styles" />

// TheDrop.jsx — if purely decorative:
<img src="/images/home/2bags_charms1.png" alt="" loading="lazy" />
// or if conveying meaning:
<img src="/images/home/2bags_charms1.png" alt="Two bags with Android and Google character charms" loading="lazy" />
```

**Remediation Rationale:**  
WCAG 1.1.1 requires all images to have a text alternative. If an image conveys meaningful content (such as showing which products are featured), a descriptive alt text must be provided. If an image is purely decorative, `alt=""` is the correct approach — it signals to screen readers to skip the image entirely. Omitting the `alt` attribute is never correct.

---

### CI-12 · `<h1>` Elements have Invalid `aria-expanded` Value

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-ARIA-VALID-ATTR-VALUE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Homepage (`/`) |
| **Selectors** | `.featured-card:nth-child(1) > .featured-card-info > h1`, `.featured-card:nth-child(2) > .featured-card-info > h1` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/aria-valid-attr-value |

**Affected Elements:**

```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Source File:** `src/components/FeaturedPair.jsx`

**Issue Description:**  
Two `<h1>` elements have `aria-expanded="yes"`, which is an invalid attribute value. `aria-expanded` only accepts `"true"` or `"false"` (boolean string values). Using `"yes"` is treated as an invalid state and confuses assistive technologies. Additionally, `aria-expanded` is inappropriate for static heading elements — it is only meaningful on controls that expand/collapse content (buttons, disclosure widgets).

**Recommended Remediation:**
```jsx
// If these headings are purely static (most likely):
<h1>Keep on Truckin'</h1>
<h1>Limited edition and traveling fast</h1>

// If they genuinely control expandable content:
<button aria-expanded={isExpanded} aria-controls="content-id">
  Keep on Truckin'
</button>
```

**Remediation Rationale:**  
Removing `aria-expanded` from static headings is the correct fix. Headings describe content structure, they do not expand/collapse. If a disclosure widget is intended, the interactive element (the trigger) must be a `<button>` with `aria-expanded="true"/"false"`, not a heading. The attribute must use the string `"true"` or `"false"` — not `"yes"` or `"no"`.

---

### CI-13 · Product Page `<ul>` has Invalid `aria-relevant` Value

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-ARIA-VALID-ATTR-VALUE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Product Detail Page (`/product/:id`) |
| **Selector** | `ul[aria-relevant="changes"]` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/aria-valid-attr-value |

**Affected Element:**

```html
<ul class="PZdSKB1ULfufQL0NRQ7a" aria-relevant="changes" aria-live="polite">
  <li style="display: none;">
    <span role="meter" aria-label="Stock level"></span>
  </li>
</ul>
```

**Source File:** `src/pages/ProductPage.jsx`

**Issue Description:**  
The live region `<ul>` uses `aria-relevant="changes"`, which is not a valid value for this attribute. The `aria-relevant` attribute accepts a space-separated list of tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not in this set and will be ignored by assistive technologies.

**Recommended Remediation:**
```jsx
// Use valid aria-relevant tokens
<ul
  className={styles.stockList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Remediation Rationale:**  
The intent appears to be notifying users of content changes in a live region. `aria-relevant="additions text"` is the most common valid value for announcing new additions to a live region. If removals should also be announced, `"additions removals text"` is appropriate. The ARIA spec defines exactly which token values are accepted.

---

### CI-14 · Popularity Slider Missing Required ARIA Attributes

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-ARIA-REQUIRED-ATTR` + `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |
| **Severity** | Critical |
| **Affected Pages** | Homepage (`/`) |
| **Selector** | `.drop-popularity-bar` |
| **Knowledge Base** | https://knowledge.evinced.com/system-validations/aria-required-attr |

**Affected Element:**

```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Source File:** `src/components/TheDrop.jsx`

**Issue Description:**  
An element uses `role="slider"` but is missing the three required ARIA attributes for that role: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these attributes, the slider cannot communicate its current value, range, or position to assistive technologies. Additionally, `role="slider"` requires keyboard interaction (`tabIndex` and arrow key handlers) that is absent.

**Recommended Remediation:**
```jsx
// If it is a read-only indicator (not interactive):
// Change role to "meter" or "progressbar"
<div
  role="meter"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>

// If it is genuinely interactive:
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  onKeyDown={handleKeyDown}
  className="drop-popularity-bar"
/>
```

**Remediation Rationale:**  
`role="slider"` is an interactive widget role with mandatory attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) per the WAI-ARIA specification. If the bar is purely a visual indicator (read-only), `role="meter"` or `role="progressbar"` is more semantically accurate and has the same required attributes. In either case, the current value and range must be provided as ARIA attributes so screen readers can announce the current state.

---

## Remediation Not Performed (Per Instructions)

As per task instructions, **no source code changes were made**. The fixes described above are recommendations only. The report documents what should be changed and why.

---

## Non-Critical Issues (Serious Severity) — Full List

The following issues are classified as **Serious** severity by Evinced but are not Critical. They are documented here for completeness.

### S-1 · `<html>` Element Missing `lang` Attribute

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-HTML-HAS-LANG` |
| **WCAG** | 3.1.1 Language of Page (Level A) |
| **Severity** | Serious |
| **Affected Pages** | All 6 pages |
| **Selector** | `html` |

**Issue:** The `<html>` element has no `lang` attribute. Screen readers use `lang` to select the correct pronunciation engine and language rules. Without it, text may be mispronounced.

**Affected Element:**
```html
<html style="scroll-behavior: unset;">
```

**Recommended Fix:** `<html lang="en">` in `public/index.html`.

---

### S-2 · Invalid `lang` Attribute Value on Paragraph

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-VALID-LANG` |
| **WCAG** | 3.1.2 Language of Parts (Level AA) |
| **Severity** | Serious |
| **Affected Pages** | Homepage (`/`) |
| **Selector** | `p[lang="zz"]` |

**Issue:** A paragraph element has `lang="zz"` which is not a valid BCP 47 language subtag. The intent was presumably to mark a specific language, but `"zz"` is not recognized.

**Affected Element:**
```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms have officially dropped...</p>
```

**Recommended Fix:** Change to a valid BCP 47 language tag (e.g., `lang="en"`) or remove the attribute if the language matches the page language.

---

### S-3 · Insufficient Color Contrast — Hero Banner Subtitle

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-COLOR-CONTRAST` |
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Affected Pages** | Homepage (`/`) |
| **Selector** | `.hero-content > p` |

**Issue:** The hero subtitle text "Warm hues for cooler days" (`#c8c0b8` on `#e8e0d8`) has approximately 1.3:1 contrast ratio, well below the WCAG AA minimum of 4.5:1 for normal text.

**Affected Element:** `<p>Warm hues for cooler days</p>` in `src/components/HeroBanner.css`

**Recommended Fix:** Darken the text color to achieve at least 4.5:1 ratio, e.g., change `.hero-content p { color: #c8c0b8; }` to `color: #5a5450;` or similar dark value.

---

### S-4 · Insufficient Color Contrast — Filter Count Text (Products Page)

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-COLOR-CONTRAST` |
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Affected Pages** | Products Page (`/shop/new`) |
| **Selector** | `.filter-count` (multiple instances) |

**Issue:** The product count labels inside filter options (e.g., `(8)`, `(14)`, `(15)`) use `#c8c8c8` text on `#ffffff` background, giving approximately 1.4:1 contrast ratio.

**Count of instances:** 9 individual filter count elements detected.

**Affected File:** `src/components/FilterSidebar.css`

**Recommended Fix:** Change `.filter-count { color: #c8c8c8; }` to a darker color such as `#767676` which achieves the minimum 4.5:1 contrast on white.

---

### S-5 · Insufficient Color Contrast — "Products Found" Text (Products Page)

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-COLOR-CONTRAST` |
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Affected Pages** | Products Page (`/shop/new`) |
| **Selector** | `.products-found` |

**Issue:** The "16 Products Found" results counter text uses `#b0b4b8` on `#ffffff` background (~1.9:1 contrast ratio).

**Affected File:** `src/pages/NewPage.css`

**Recommended Fix:** Change `.products-found { color: #b0b4b8; }` to a value ≥ 4.5:1 on white, such as `#595e63`.

---

### S-6 · Insufficient Color Contrast — Product Description Text (Product Detail)

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-COLOR-CONTRAST` |
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Affected Pages** | Product Detail Page (`/product/:id`) |
| **Selector** | `p:nth-child(4)` (CSS-modules hashed class) |

**Issue:** The product description paragraph text uses `#c0c0c0` on `#ffffff` background (~1.6:1 contrast ratio).

**Affected File:** `src/pages/ProductPage.module.css` (`.productDescription`)

**Recommended Fix:** Change the description text color to at least `#767676` to achieve 4.5:1 contrast.

---

### S-7 · Insufficient Color Contrast — Checkout Step Labels

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-COLOR-CONTRAST` |
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Affected Pages** | Checkout – Basket Step (`/checkout`) |
| **Selectors** | `.checkout-step:nth-child(3) > .step-label`, `.summary-tax-note` |

**Issue:** Two text elements on the basket step have insufficient contrast:
- "Shipping & Payment" step label — inactive/muted color on white
- "Taxes calculated at next step" notice — small muted text on white

**Affected File:** `src/pages/CheckoutPage.css`

**Recommended Fix:** Increase the color values for `.step-label` (inactive state) and `.summary-tax-note` to meet 4.5:1 minimum contrast.

---

### S-8 · Insufficient Color Contrast — Order ID Label (Order Confirmation)

| Attribute | Value |
|-----------|-------|
| **Evinced Type** | `AXE-COLOR-CONTRAST` |
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Affected Pages** | Order Confirmation (`/order-confirmation`) |
| **Selector** | `.confirm-order-id-label` |

**Issue:** The "Order ID" label text has insufficient contrast against its background color.

**Affected File:** `src/pages/OrderConfirmationPage.css`

**Recommended Fix:** Increase `.confirm-order-id-label` color to meet 4.5:1 minimum contrast on its background.

---

## Summary Table of Critical Issues

| ID | Issue | Type(s) | Pages Affected | Source File(s) | WCAG |
|----|-------|---------|----------------|----------------|------|
| CI-1 | Header icon buttons are `<div>` not `<button>` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | All 6 | `Header.jsx` | 4.1.2, 2.1.1 |
| CI-2 | Language selector `<div>` not a button | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | All 6 | `Header.jsx` | 4.1.2, 2.1.1 |
| CI-3 | Icon-only header buttons have no accessible name | NO_DESCRIPTIVE_TEXT | All 6 | `Header.jsx` | 4.1.2 |
| CI-4 | Footer nav items use `<div>` with `aria-hidden` text | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | All 6 | `Footer.jsx` | 4.1.2, 2.1.1 |
| CI-5 | Homepage category "Shop" links use `<div>` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | Homepage | `PopularSection.jsx` | 4.1.2, 2.1.1 |
| CI-6 | Filter option checkboxes are `<div>` elements | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | Products | `FilterSidebar.jsx` | 4.1.2, 2.1.1 |
| CI-7 | Checkout "Continue" button is a `<div>` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | Checkout (Basket) | `CheckoutPage.jsx` | 4.1.2, 2.1.1 |
| CI-8 | Checkout "Back to Cart" is a `<div>` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | Checkout (Shipping) | `CheckoutPage.jsx` | 4.1.2, 2.1.1 |
| CI-9 | Order confirmation "Back to Shop" is a `<div>` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | Order Confirmation | `OrderConfirmationPage.jsx` | 4.1.2, 2.1.1 |
| CI-10 | Modal close buttons have no accessible name | AXE-BUTTON-NAME | All pages (modals) | `CartModal.jsx`, `WishlistModal.jsx` | 4.1.2 |
| CI-11 | Images missing `alt` attribute | AXE-IMAGE-ALT | Homepage | `HeroBanner.jsx`, `TheDrop.jsx` | 1.1.1 |
| CI-12 | `<h1>` elements have invalid `aria-expanded="yes"` | AXE-ARIA-VALID-ATTR-VALUE | Homepage | `FeaturedPair.jsx` | 4.1.2 |
| CI-13 | Live region `<ul>` has invalid `aria-relevant="changes"` | AXE-ARIA-VALID-ATTR-VALUE | Product Detail | `ProductPage.jsx` | 4.1.2 |
| CI-14 | Popularity slider missing required ARIA attributes | AXE-ARIA-REQUIRED-ATTR, NOT_FOCUSABLE | Homepage | `TheDrop.jsx` | 4.1.2, 2.1.1 |

---

## Appendix — Audit Methodology

### Tool
- **Evinced JS Playwright SDK** v2.43.0
- Authentication: Online mode (Service Account + API Key)
- Scan method: `evAnalyze()` on each fully-rendered page state

### Test Specification
- File: `tests/e2e/specs/a11y-full-audit.spec.ts`
- Config: `tests/e2e/playwright.config.ts`
- Browser: Chromium (Desktop Chrome, 1280×800)
- 6 tests covering all page states including authenticated flows

### Raw Results
JSON issue files saved per page in `tests/e2e/test-results/`:
- `homepage-issues.json` (35 issues)
- `products-issues.json` (55 issues)
- `product-detail-issues.json` (20 issues)
- `checkout-basket-issues.json` (21 issues)
- `checkout-shipping-issues.json` (19 issues)
- `order-confirmation-issues.json` (20 issues)

### Severity Classification (Evinced)
| Severity | Description |
|----------|-------------|
| **Critical** | Barriers that prevent users with disabilities from accessing or using content |
| **Serious** | Issues that significantly impact usability but may have partial workarounds |
| **Moderate** | Issues that affect some users but have reasonable workarounds |
| **Minor** | Minor inconveniences that have easy workarounds |

No Moderate or Minor issues were detected in this audit.
