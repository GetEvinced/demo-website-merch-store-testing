# Accessibility (A11Y) Audit Report — Demo Website

**Generated:** 2026-03-22  
**Auditor:** Evinced JS Playwright SDK v2.17.0  
**Tool:** Evinced MCP Server (EVINCED_MCP_SERVER_JFROG)  
**Scope:** Full site — all 5 pages audited via per-page `evAnalyze()` snapshot scans  
**Total Issues Found:** 151 (Critical: 127 · Serious: 24)

---

## Table of Contents

1. [Repository & Page Inventory](#1-repository--page-inventory)
2. [Audit Methodology](#2-audit-methodology)
3. [Issue Summary](#3-issue-summary)
4. [Critical Issues (CI-01 – CI-17)](#4-critical-issues)
5. [Non-Critical Issues (Serious Severity)](#5-non-critical-issues-serious-severity)
6. [Appendix: Raw Issue Counts by Page](#6-appendix-raw-issue-counts-by-page)

---

## 1. Repository & Page Inventory

### Technology Stack
- **Framework:** React 18 with React Router v7 (SPA, browser-side routing)
- **Build:** Webpack 5
- **Entry point:** `src/index.js` → renders `src/components/App.jsx`

### Application Routes (Entry Points)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `src/pages/HomePage.jsx` | Landing page with hero banner, featured pairs, popular products, and "The Drop" section |
| `/shop/new` | `src/pages/NewPage.jsx` | Products listing grid with filter sidebar and sort controls |
| `/product/:id` | `src/pages/ProductPage.jsx` | Individual product detail with quantity selector and add-to-cart |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout: basket review → shipping/payment form |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation screen |

### Shared Components (rendered on all pages)

| Component | File | Notes |
|-----------|------|-------|
| Header | `src/components/Header.jsx` | Navigation, wishlist/search/login/cart icons, flag group |
| Footer | `src/components/Footer.jsx` | Navigation links (Sustainability, FAQs) |
| CartModal | `src/components/CartModal.jsx` | Side drawer (hidden on `/checkout` and `/order-confirmation`) |
| WishlistModal | `src/components/WishlistModal.jsx` | Side drawer (rendered on all pages) |

---

## 2. Audit Methodology

### Scanner
- **Evinced JS Playwright SDK** (`@evinced/js-playwright-sdk@2.17.0`)
- Detection method: `evAnalyze()` — full-page static snapshot scan using Evinced's proprietary EV-CORE engine plus embedded axe-core rules.
- Service authentication: `EVINCED_SERVICE_ID` + `EVINCED_API_KEY` (online mode).

### Test Spec
- Location: `tests/e2e/specs/comprehensive-a11y-audit.spec.ts`
- Each page receives an independent Playwright context and `evAnalyze()` call.
- Pages that require cart state (Checkout, Order Confirmation) go through the full interaction flow before scanning.

### Issue Severity Definition

| Severity | Definition |
|----------|------------|
| **CRITICAL** | Issue directly prevents access or understanding for users of assistive technology (screen readers, keyboard-only navigation). WCAG 2.x Level A violations. |
| **SERIOUS** | Issue significantly degrades the experience but does not completely block access. Typically WCAG 2.x Level AA violations. |

### Issue Types Detected

| Type ID | Description |
|---------|-------------|
| `WRONG_SEMANTIC_ROLE` | Interactive element uses the wrong HTML element or ARIA role |
| `NOT_FOCUSABLE` | Interactive element is not reachable via keyboard focus |
| `NO_DESCRIPTIVE_TEXT` | Interactive element has no accessible name (aria-label / text content) |
| `AXE-BUTTON-NAME` | `<button>` has no accessible name |
| `AXE-ARIA-VALID-ATTR-VALUE` | ARIA attribute has an invalid value |
| `AXE-ARIA-REQUIRED-ATTR` | ARIA role is missing required attributes |
| `AXE-IMAGE-ALT` | `<img>` is missing an `alt` attribute |
| `AXE-COLOR-CONTRAST` | Text/background color contrast ratio below WCAG minimum |
| `AXE-HTML-HAS-LANG` | `<html>` element is missing a `lang` attribute |
| `AXE-VALID-LANG` | An element has an invalid BCP 47 `lang` value |

---

## 3. Issue Summary

### By Severity

| Severity | Count |
|----------|-------|
| CRITICAL | 127 |
| SERIOUS | 24 |
| **Total** | **151** |

### By Page

| Page | Issues |
|------|--------|
| Homepage (/) | 35 |
| Products Listing (/shop/new) | 55 |
| Product Detail (/product/:id) | 20 |
| Checkout (/checkout) | 21 |
| Order Confirmation (/order-confirmation) | 20 |

### Critical Issues by Type

| Type | Count |
|------|-------|
| NOT_FOCUSABLE | 48 |
| WRONG_SEMANTIC_ROLE | 47 |
| NO_DESCRIPTIVE_TEXT | 18 |
| AXE-BUTTON-NAME | 8 |
| AXE-ARIA-VALID-ATTR-VALUE | 3 |
| AXE-ARIA-REQUIRED-ATTR | 1 |
| AXE-IMAGE-ALT | 2 |
| **Total Critical** | **127** |

---

## 4. Critical Issues

Issues are grouped by logical element/component. Each group lists all related raw issue types, the affected pages, the DOM element in question, the recommended fix, and the rationale for that specific approach.

---

### CI-01 — Header: Wishlist Button Uses a `<div>` Instead of `<button>`

| Field | Detail |
|-------|--------|
| **Component** | `src/components/Header.jsx` |
| **Pages Affected** | All 5 (Homepage, Products, Product Detail, Checkout, Order Confirmation) |
| **CSS Selector** | `.wishlist-btn` |
| **Raw Issue Count** | 10 (WRONG_SEMANTIC_ROLE × 5 pages, NOT_FOCUSABLE × 5 pages) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG Criteria** | 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/interactable-role |

**Affected Element (current DOM):**
```html
<div class="icon-btn wishlist-btn" onClick={openWishlist} style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>
```

**Recommended Fix:**
```jsx
<button
  className="icon-btn wishlist-btn"
  onClick={openWishlist}
  aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}
>
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Wishlist</span>
  {wishlistCount > 0 && (
    <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>
  )}
</button>
```

**Rationale:** A `<div>` with an `onClick` handler is not in the natural tab order and has no implicit ARIA role, making it invisible to screen readers and unreachable via keyboard. Replacing it with a `<button>` restores keyboard focus, announces the correct role ("button") to assistive technology, and allows the browser to handle `Enter`/`Space` activation natively — eliminating both the `WRONG_SEMANTIC_ROLE` and `NOT_FOCUSABLE` violations simultaneously. The `aria-label` dynamically incorporates the cart count so screen reader users know the current wishlist state without relying on the visually-hidden badge.

---

### CI-02 — Header: Search Icon Button Uses a `<div>` with Hidden Text

| Field | Detail |
|-------|--------|
| **Component** | `src/components/Header.jsx` |
| **Pages Affected** | All 5 |
| **CSS Selector** | `.icon-btn:nth-child(2)` |
| **Raw Issue Count** | 15 (WRONG_SEMANTIC_ROLE × 5, NOT_FOCUSABLE × 5, NO_DESCRIPTIVE_TEXT × 5) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) · 1.3.1 Info & Relationships (Level A) |

**Affected Element (current DOM):**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>
```

**Recommended Fix:**
```jsx
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

**Rationale:** The visible "Search" label has `aria-hidden="true"`, stripping the only textual name from the element. Combined with using a `<div>`, the control has no semantic identity and no keyboard focus point. Switching to `<button>` and adding an explicit `aria-label="Search"` gives screen readers a meaningful name without changing the visual appearance. All three issue types (role, focusability, descriptive text) are resolved in a single element change.

---

### CI-03 — Header: Login Icon Button Uses a `<div>` with Hidden Text

| Field | Detail |
|-------|--------|
| **Component** | `src/components/Header.jsx` |
| **Pages Affected** | All 5 |
| **CSS Selector** | `.icon-btn:nth-child(4)` |
| **Raw Issue Count** | 15 (WRONG_SEMANTIC_ROLE × 5, NOT_FOCUSABLE × 5, NO_DESCRIPTIVE_TEXT × 5) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM):**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Recommended Fix:**
```jsx
<button className="icon-btn" aria-label="Login">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</button>
```

**Rationale:** Identical pattern to CI-02 (search icon). The visible "Login" text is `aria-hidden`, leaving the interactive `<div>` with no accessible name and no focusability. Converting to `<button aria-label="Login">` resolves all three violations with the minimal invasive change — same visual appearance, correct semantics.

---

### CI-04 — Header: Country/Language Flag Group Uses a `<div>` Without a Role

| Field | Detail |
|-------|--------|
| **Component** | `src/components/Header.jsx` |
| **Pages Affected** | All 5 |
| **CSS Selector** | `.flag-group` |
| **Raw Issue Count** | 10 (WRONG_SEMANTIC_ROLE × 5, NOT_FOCUSABLE × 5) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM):**
```html
<div class="flag-group" onClick={() => {}} style="cursor: pointer;">
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" />
  <img src="/images/icons/canada.png" alt="Canada Flag" />
</div>
```

**Recommended Fix:**
```jsx
<button
  className="flag-group"
  aria-label="Select country or region"
  aria-haspopup="true"
>
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" />
  <img src="/images/icons/canada.png" alt="Canada Flag" />
</button>
```

**Rationale:** This element functions as a region/language selector toggle. As a `<div>`, it cannot receive keyboard focus and exposes no interactive role to assistive technology. Using `<button>` provides the correct implicit `role="button"`, native keyboard support, and a descriptive `aria-label`. The `aria-haspopup="true"` communicates to screen readers that this button controls a popup menu — matching the element's intended behavior.

---

### CI-05 — Footer: "Sustainability" Navigation Item Uses a `<div>`

| Field | Detail |
|-------|--------|
| **Component** | `src/components/Footer.jsx` |
| **Pages Affected** | All 5 |
| **CSS Selector** | `li:nth-child(3) > .footer-nav-item` |
| **Raw Issue Count** | 10 (WRONG_SEMANTIC_ROLE × 5, NOT_FOCUSABLE × 5) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM):**
```html
<li>
  <div class="footer-nav-item" onClick={() => {}} style="cursor: pointer;">Sustainability</div>
</li>
```

**Recommended Fix:**
```jsx
<li>
  <a href="/sustainability" className="footer-nav-item">Sustainability</a>
</li>
```

**Rationale:** The element is positioned inside a `<ul>` alongside genuine `<a>` links ("Returns and Exchanges", "Shipping"), making it visually a navigation link. Using `<a href>` gives it the correct semantic role (`link`), places it in the tab order, and announces it consistently with its sibling links. If the destination is not yet implemented, an `href="#"` with `aria-disabled="true"` is preferable to a `<div>` with a click handler.

---

### CI-06 — Footer: "FAQs" Navigation Item Uses a `<div>` with Hidden Text

| Field | Detail |
|-------|--------|
| **Component** | `src/components/Footer.jsx` |
| **Pages Affected** | All 5 |
| **CSS Selector** | `.footer-list:nth-child(2) > li > .footer-nav-item` |
| **Raw Issue Count** | 15 (WRONG_SEMANTIC_ROLE × 5, NOT_FOCUSABLE × 5, NO_DESCRIPTIVE_TEXT × 5) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM):**
```html
<li>
  <div class="footer-nav-item" onClick={() => {}} style="cursor: pointer;">
    <span aria-hidden="true">FAQs</span>
  </div>
</li>
```

**Recommended Fix:**
```jsx
<li>
  <a href="/faqs" className="footer-nav-item">FAQs</a>
</li>
```

**Rationale:** The "FAQs" text is wrapped in `aria-hidden="true"`, stripping the element of any accessible name in addition to having the wrong role and no focusability. This produces three distinct critical violations per page. Converting to `<a href>` and removing the `aria-hidden` from the text resolves all three: the element gets the `link` role, enters the tab order, and exposes visible text as its accessible name.

---

### CI-07 — Homepage: PopularSection "Shop" Links Use `<div>` with Hidden Text

| Field | Detail |
|-------|--------|
| **Component** | `src/components/PopularSection.jsx` |
| **Pages Affected** | Homepage (/) only |
| **CSS Selectors** | `.product-card:nth-child(1) > .product-card-info > .shop-link`, `:nth-child(2)`, `:nth-child(3)` |
| **Raw Issue Count** | 9 (WRONG_SEMANTIC_ROLE × 3, NOT_FOCUSABLE × 3, NO_DESCRIPTIVE_TEXT × 3) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM, example for first card):**
```html
<div class="shop-link" onClick={() => navigate('/shop/new')} style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
```

**Recommended Fix:**
```jsx
import { Link } from 'react-router-dom';
// Replace the div with a React Router Link for each card:
<Link to={product.shopHref} className="shop-link">
  {product.shopLabel}
</Link>
```

**Rationale:** Three product cards in the "Popular on the Merch Shop" section each contain a shop call-to-action (`Shop Drinkware`, `Shop Fun and Games`, `Shop Stationery`). These are navigation links rendered as `<div>` elements with the visible text wrapped in `aria-hidden`. Using React Router's `<Link>` renders a native `<a>` element, which: (a) conveys the `link` role, (b) enters the tab order, and (c) exposes the visible label text as the accessible name. Programmatic navigation via `onClick` + `useNavigate` should only be used when a native anchor is not appropriate.

---

### CI-08 — CartModal: Close Button Has No Accessible Name

| Field | Detail |
|-------|--------|
| **Component** | `src/components/CartModal.jsx` |
| **Pages Affected** | Homepage, Products Listing, Product Detail |
| **CSS Selector** | `#cart-modal > div:nth-child(1) > button` |
| **Raw Issue Count** | 3 (AXE-BUTTON-NAME × 3) |
| **Issue Type** | `AXE-BUTTON-NAME` |
| **WCAG Criteria** | 4.1.2 Name, Role, Value (Level A) |

**Affected Element (current DOM):**
```html
<button class="closeBtn">
  <svg width="20" height="20" aria-hidden="true">...</svg>
</button>
```

**Recommended Fix:**
```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg aria-hidden="true">...</svg>
</button>
```

**Rationale:** Icon-only buttons must have an explicit accessible name because the SVG is marked `aria-hidden="true"` (correct practice for decorative icons). Without an `aria-label`, screen readers announce this button as "button" with no description, giving no indication of its purpose. `aria-label="Close shopping cart"` is specific enough to distinguish it from the wishlist close button and conveys the exact action. The CartModal is only rendered on pages where the cart drawer is accessible (not on `/checkout` or `/order-confirmation`), which is why this violation appears on only 3 pages.

---

### CI-09 — WishlistModal: Close Button Has No Accessible Name

| Field | Detail |
|-------|--------|
| **Component** | `src/components/WishlistModal.jsx` |
| **Pages Affected** | All 5 pages |
| **CSS Selectors** | `div[role="dialog"] > div:nth-child(1) > button` (Homepage, Products, Product Detail) · `div:nth-child(1) > button` (Checkout, Order Confirmation — CartModal absent so selector simplifies) |
| **Raw Issue Count** | 5 (AXE-BUTTON-NAME × 5) |
| **Issue Type** | `AXE-BUTTON-NAME` |
| **WCAG Criteria** | 4.1.2 (Level A) |

**Affected Element (current DOM):**
```html
<div role="dialog" aria-modal="true" aria-label="Wishlist">
  <div class="drawerHeader">
    <button class="closeBtn">
      <svg width="20" height="20" aria-hidden="true">...</svg>
    </button>
  </div>
</div>
```

**Recommended Fix:**
```jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true">...</svg>
</button>
```

**Rationale:** The WishlistModal is rendered on all 5 pages and its close button suffers the same icon-only naming problem as the CartModal (CI-08). Even though the parent `div[role="dialog"]` has `aria-label="Wishlist"`, that name applies to the dialog container — the close button still needs its own accessible name. `aria-label="Close wishlist"` matches the modal's purpose and is consistent with the naming pattern for the cart modal fix.

---

### CI-10 — FeaturedPair: `<h1>` Elements Have `aria-expanded="yes"` (Invalid Value)

| Field | Detail |
|-------|--------|
| **Component** | `src/components/FeaturedPair.jsx` |
| **Pages Affected** | Homepage (/) only |
| **CSS Selectors** | `.featured-card:nth-child(1) > .featured-card-info > h1` · `.featured-card:nth-child(2) > .featured-card-info > h1` |
| **Raw Issue Count** | 2 (AXE-ARIA-VALID-ATTR-VALUE × 2) |
| **Issue Type** | `AXE-ARIA-VALID-ATTR-VALUE` |
| **WCAG Criteria** | 4.1.2 Name, Role, Value (Level A) |

**Affected Element (current DOM):**
```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Recommended Fix:**
```jsx
<h1>{item.title}</h1>
```

**Rationale:** The `aria-expanded` attribute is valid only on elements that control a collapsible region (e.g., `<button>`, `<a>`) and must take a boolean string: `"true"` or `"false"`. The value `"yes"` is not valid and causes assistive technologies to either ignore the attribute or report a parsing error. Heading elements should never carry `aria-expanded` — headings are not interactive controllers. The correct fix is to remove the attribute entirely from the `<h1>` elements, which have no collapsible region to describe.

---

### CI-11 — Homepage: TheDrop Slider `<div>` Missing Required ARIA Attributes and Not Focusable

| Field | Detail |
|-------|--------|
| **Component** | `src/components/TheDrop.jsx` |
| **Pages Affected** | Homepage (/) only |
| **CSS Selector** | `.drop-popularity-bar` |
| **Raw Issue Count** | 2 (AXE-ARIA-REQUIRED-ATTR × 1, NOT_FOCUSABLE × 1) |
| **Issue Types** | `AXE-ARIA-REQUIRED-ATTR`, `NOT_FOCUSABLE` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM):**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Recommended Fix (option A — use native `<input type="range">`):**
```jsx
<input
  type="range"
  className="drop-popularity-bar"
  aria-label="Popularity indicator"
  min={0}
  max={100}
  value={75}
  readOnly
  tabIndex={0}
/>
```

**Recommended Fix (option B — if custom rendering is required):**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Rationale:** The ARIA `slider` role mandates three attributes: `aria-valuenow` (current value), `aria-valuemin` (lower bound), and `aria-valuemax` (upper bound). Without them, the element fails ARIA validity checks and communicates no meaningful information to assistive technology. Additionally, the element has no `tabIndex`, so keyboard users cannot reach it at all. Option A (native `<input type="range">`) is preferred because the browser handles all ARIA semantics, keyboard interaction (`←`/`→` arrow keys), and focusability automatically. Option B is appropriate only if the visual design cannot use a native input.

---

### CI-12 — Product Detail: `<ul>` Has Invalid `aria-relevant="changes"` Value

| Field | Detail |
|-------|--------|
| **Component** | `src/pages/ProductPage.jsx` |
| **Pages Affected** | Product Detail (/product/:id) |
| **CSS Selector** | `ul[aria-relevant="changes"]` |
| **Raw Issue Count** | 1 (AXE-ARIA-VALID-ATTR-VALUE × 1) |
| **Issue Type** | `AXE-ARIA-VALID-ATTR-VALUE` |
| **WCAG Criteria** | 4.1.2 (Level A) |

**Affected Element (current DOM):**
```html
<ul class="detailsList" aria-relevant="changes" aria-live="polite">
  ...
</ul>
```

**Recommended Fix:**
```jsx
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Rationale:** The `aria-relevant` attribute accepts a space-separated list of tokens drawn exclusively from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not in this set and is therefore invalid per the ARIA specification. For a product details list where items may be added and text may update, the appropriate value is `"additions text"` — announcing when new list items appear and when existing text is modified. If the list never changes dynamically, `aria-relevant` and `aria-live` can be removed entirely, which is often the cleaner approach.

---

### CI-13 — Homepage: HeroBanner Hero Image Missing `alt` Attribute

| Field | Detail |
|-------|--------|
| **Component** | `src/components/HeroBanner.jsx` |
| **Pages Affected** | Homepage (/) only |
| **CSS Selector** | `img[src$="New_Tees.png"]` |
| **Raw Issue Count** | 1 (AXE-IMAGE-ALT × 1) |
| **Issue Type** | `AXE-IMAGE-ALT` |
| **WCAG Criteria** | 1.1.1 Non-text Content (Level A) |

**Affected Element (current DOM):**
```html
<img src="/images/home/New_Tees.png" />
```

**Recommended Fix:**
```jsx
<img src={HERO_IMAGE} alt="Winter Basics — a collection of warm-toned tees" />
```

**Rationale:** Every `<img>` element must have an `alt` attribute. Without it, screen readers fall back to announcing the raw file path (`New_Tees.png`), which is meaningless to users. The hero image illustrates the "Winter Basics" promotion described in the adjacent heading, so a brief descriptive alt text connecting the image to the campaign is ideal. If the image were purely decorative, `alt=""` would silence screen readers — but as a prominent marketing image, meaningful alternative text serves users better.

---

### CI-14 — Homepage: TheDrop Image Missing `alt` Attribute

| Field | Detail |
|-------|--------|
| **Component** | `src/components/TheDrop.jsx` |
| **Pages Affected** | Homepage (/) only |
| **CSS Selector** | `img[src$="2bags_charms1.png"]` |
| **Raw Issue Count** | 1 (AXE-IMAGE-ALT × 1) |
| **Issue Type** | `AXE-IMAGE-ALT` |
| **WCAG Criteria** | 1.1.1 Non-text Content (Level A) |

**Affected Element (current DOM):**
```html
<img src="/images/home/2bags_charms1.png" loading="lazy" />
```

**Recommended Fix:**
```jsx
<img
  src={DROP_IMAGE}
  loading="lazy"
  alt="Limited-edition plushie bag charms: Android bot, YouTube icon, and Super G"
/>
```

**Rationale:** The "Drop" section image depicts the limited-edition plushie bag charms described in the surrounding paragraph text. Without an `alt` attribute, screen readers read the file name. The recommended alt text summarises the three products visible in the image, giving screen reader users equivalent informational content. Like CI-13, this is a content image rather than a decorative one, so an empty `alt=""` would be incorrect here.

---

### CI-15 — Products Page: FilterSidebar Filter Options Use `<div>` as Checkboxes

| Field | Detail |
|-------|--------|
| **Component** | `src/components/FilterSidebar.jsx` |
| **Pages Affected** | Products Listing (/shop/new) only |
| **CSS Selectors** | `.filter-group:nth-child(2..4) > .filter-options > .filter-option:nth-child(n)` (12 elements total across Price, Size, and Brand filter groups) |
| **Raw Issue Count** | 24 (WRONG_SEMANTIC_ROLE × 12, NOT_FOCUSABLE × 12) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM, one example):**
```html
<div class="filter-option" onClick={() => onPriceChange(range)}>
  <div class="custom-checkbox custom-checkbox--checked">
    <div class="custom-checkbox-checkmark"></div>
  </div>
  <span class="filter-option-label">
    1.00 - 19.99
    <span class="filter-count">(8)</span>
  </span>
</div>
```

**Recommended Fix:**
```jsx
<label className="filter-option" key={range.label}>
  <input
    type="checkbox"
    className="filter-option-checkbox"
    checked={checked}
    onChange={() => onPriceChange(range)}
  />
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

*Apply the same `<label>/<input type="checkbox">` pattern to Size and Brand filter groups.*

**Rationale:** Filter options function as checkboxes — they toggle on/off to refine the product list. Using `<div>` elements with a custom painted checkbox `<div>` and an `onClick` handler produces elements that are invisible to the AT role model and unreachable by keyboard. The correct HTML pattern is `<input type="checkbox">` wrapped in (or associated with) a `<label>`. This provides: the `checkbox` ARIA role, native keyboard support (`Space` to toggle), and a checked state that is automatically announced by screen readers. The CSS custom checkbox styling can still be applied by visually hiding the native input and styling the label, while the input remains accessible to AT. This fix resolves 24 raw violations with a consistent pattern change across all three filter groups.

---

### CI-16 — Checkout: "Continue" Button Uses a `<div>`

| Field | Detail |
|-------|--------|
| **Component** | `src/pages/CheckoutPage.jsx` |
| **Pages Affected** | Checkout (/checkout) |
| **CSS Selector** | `.checkout-continue-btn` |
| **Raw Issue Count** | 2 (WRONG_SEMANTIC_ROLE × 1, NOT_FOCUSABLE × 1) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM):**
```html
<div class="checkout-continue-btn" onClick={() => setStep('shipping')} style="cursor: pointer;">
  Continue
</div>
```

**Recommended Fix:**
```jsx
<button
  type="button"
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
>
  Continue
</button>
```

**Rationale:** The "Continue" button advances the checkout flow from the basket step to the shipping/payment step — it is the primary call-to-action on that step. Implementing it as a `<div>` means keyboard-only users cannot tab to it or activate it with `Enter`/`Space`, effectively locking them out of completing a purchase. Replacing it with `<button type="button">` restores full keyboard accessibility. The `type="button"` attribute prevents accidental form submission if the containing markup changes in the future.

---

### CI-17 — Order Confirmation: "Back to Shop" Link Uses a `<div>`

| Field | Detail |
|-------|--------|
| **Component** | `src/pages/OrderConfirmationPage.jsx` |
| **Pages Affected** | Order Confirmation (/order-confirmation) |
| **CSS Selector** | `.confirm-home-link` |
| **Raw Issue Count** | 2 (WRONG_SEMANTIC_ROLE × 1, NOT_FOCUSABLE × 1) |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG Criteria** | 4.1.2 (Level A) · 2.1.1 (Level A) |

**Affected Element (current DOM):**
```html
<div class="confirm-home-link" onClick={() => {}} style="cursor: pointer;">
  ← Back to Shop
</div>
```

**Recommended Fix:**
```jsx
import { Link } from 'react-router-dom';

<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Rationale:** The "← Back to Shop" element is a navigation link that should return the user to the homepage. Its `onClick` handler is currently empty (`() => {}`), meaning it does nothing even for mouse users. Converting it to a React Router `<Link to="/">` corrects three problems at once: it gives it the correct `link` semantic role, places it in the keyboard tab order, and actually navigates back to `/` as the label implies.

---

## 5. Non-Critical Issues (Serious Severity)

The following 24 issues were classified as **Serious** severity. They significantly degrade the experience for affected users but do not completely block interaction. They are documented here but were not remediated in this report cycle.

---

### NC-01 — Insufficient Color Contrast (18 instances across 4 pages)

| Field | Detail |
|-------|--------|
| **Issue Type** | `AXE-COLOR-CONTRAST` |
| **WCAG Criteria** | 1.4.3 Contrast (Minimum) — Level AA |
| **Minimum Required Ratio** | 4.5:1 for normal text |

**Affected Elements:**

| Page | CSS Selector | Element Content | Source File |
|------|-------------|-----------------|-------------|
| Homepage | `.hero-content > p` | "Warm hues for cooler days" (hero subtitle) | `src/components/HeroBanner.css` |
| Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | `(8)` — Price filter count | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | `(4)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | `(4)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4) > .filter-option-label > .filter-count` | `(0)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | `(14)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | `(15)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | `(14)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4) > .filter-option-label > .filter-count` | `(12)` | `src/components/FilterSidebar.css` |
| Products | `.filter-option:nth-child(5) > .filter-option-label > .filter-count` | `(11)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | `(2)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | `(13)` | `src/components/FilterSidebar.css` |
| Products | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | `(1)` | `src/components/FilterSidebar.css` |
| Products | `.products-found` | "16 Products Found" | `src/pages/NewPage.css` |
| Product Detail | `p:nth-child(4)` | Product description paragraph | `src/pages/ProductPage.module.css` |
| Checkout | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" step label | `src/pages/CheckoutPage.css` |
| Checkout | `.summary-tax-note` | "Taxes calculated at next step" | `src/pages/CheckoutPage.css` |
| Order Confirmation | `.confirm-order-id-label` | "Order ID" label | `src/pages/OrderConfirmationPage.css` |

**Summary:** The `.filter-count` spans in `FilterSidebar.css` use `color: #c8c8c8` on a `#ffffff` background (~1.4:1 ratio). The hero subtitle in `HeroBanner.css` uses `color: #c8c0b8` on `#e8e0d8` (~1.3:1). These all fall well below the WCAG AA minimum of 4.5:1. CSS color values must be darkened to achieve compliant contrast.

---

### NC-02 — `<html>` Element Missing `lang` Attribute (5 instances)

| Field | Detail |
|-------|--------|
| **Issue Type** | `AXE-HTML-HAS-LANG` |
| **WCAG Criteria** | 3.1.1 Language of Page — Level A |
| **Pages Affected** | All 5 pages |
| **CSS Selector** | `html` |

**Affected Element (current DOM):**
```html
<html style="scroll-behavior: unset;">
  ...
</html>
```

**Description:** The `<html>` element does not declare a `lang` attribute on any page. Screen readers depend on this attribute to select the correct text-to-speech voice and pronunciation rules. Without it, assistive technologies may apply incorrect language processing to the entire page content. The fix is to add `lang="en"` (or the appropriate BCP 47 tag) to the `<html>` element in `public/index.html`:

```html
<html lang="en">
```

This is a one-line fix in the HTML template that eliminates the violation on all 5 pages simultaneously. Despite being classified as Level A by WCAG, Evinced scored this as Serious rather than Critical because the page is still fully navigable — it just may mispronounce content for screen reader users in certain configurations.

---

### NC-03 — Invalid `lang` Attribute Value on a Paragraph (1 instance)

| Field | Detail |
|-------|--------|
| **Issue Type** | `AXE-VALID-LANG` |
| **WCAG Criteria** | 3.1.2 Language of Parts — Level AA |
| **Pages Affected** | Homepage (/) |
| **CSS Selector** | `p[lang="zz"]` |
| **Source File** | `src/components/TheDrop.jsx` |

**Affected Element (current DOM):**
```html
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms have officially dropped...
</p>
```

**Description:** The `lang="zz"` attribute uses an invalid BCP 47 language tag (`zz` is not a registered language subtag). Screen readers use per-element `lang` attributes to switch pronunciation engines mid-page. An invalid tag causes undefined behavior — the screen reader may either ignore it, apply the page's default language, or attempt to render speech in an unknown locale. Since the paragraph is written in English, the correct fix is to either remove the `lang="zz"` attribute (inheriting the page's `lang="en"` from NC-02's fix) or change it to `lang="en"` explicitly.

---

## 6. Appendix: Raw Issue Counts by Page

### Homepage (/) — 35 total issues

| Issue Type | Severity | Count |
|------------|----------|-------|
| WRONG_SEMANTIC_ROLE | CRITICAL | 8 |
| NOT_FOCUSABLE | CRITICAL | 9 |
| NO_DESCRIPTIVE_TEXT | CRITICAL | 6 |
| AXE-ARIA-REQUIRED-ATTR | CRITICAL | 1 |
| AXE-ARIA-VALID-ATTR-VALUE | CRITICAL | 2 |
| AXE-BUTTON-NAME | CRITICAL | 2 |
| AXE-IMAGE-ALT | CRITICAL | 2 |
| AXE-COLOR-CONTRAST | SERIOUS | 1 |
| AXE-HTML-HAS-LANG | SERIOUS | 1 |
| AXE-VALID-LANG | SERIOUS | 1 |
| **Subtotal Critical** | | **30** |
| **Subtotal Serious** | | **5** |

### Products Listing (/shop/new) — 55 total issues

| Issue Type | Severity | Count |
|------------|----------|-------|
| WRONG_SEMANTIC_ROLE | CRITICAL | 16 |
| NOT_FOCUSABLE | CRITICAL | 16 |
| NO_DESCRIPTIVE_TEXT | CRITICAL | 5 |
| AXE-BUTTON-NAME | CRITICAL | 2 |
| AXE-COLOR-CONTRAST | SERIOUS | 14 |
| AXE-HTML-HAS-LANG | SERIOUS | 1 |
| **Subtotal Critical** | | **39** |
| **Subtotal Serious** | | **16** |

### Product Detail (/product/:id) — 20 total issues

| Issue Type | Severity | Count |
|------------|----------|-------|
| WRONG_SEMANTIC_ROLE | CRITICAL | 5 |
| NOT_FOCUSABLE | CRITICAL | 5 |
| NO_DESCRIPTIVE_TEXT | CRITICAL | 5 |
| AXE-ARIA-VALID-ATTR-VALUE | CRITICAL | 1 |
| AXE-BUTTON-NAME | CRITICAL | 2 |
| AXE-COLOR-CONTRAST | SERIOUS | 1 |
| AXE-HTML-HAS-LANG | SERIOUS | 1 |
| **Subtotal Critical** | | **18** |
| **Subtotal Serious** | | **2** |

### Checkout (/checkout) — 21 total issues

| Issue Type | Severity | Count |
|------------|----------|-------|
| WRONG_SEMANTIC_ROLE | CRITICAL | 6 |
| NOT_FOCUSABLE | CRITICAL | 6 |
| NO_DESCRIPTIVE_TEXT | CRITICAL | 1 |
| AXE-BUTTON-NAME | CRITICAL | 1 |
| AXE-COLOR-CONTRAST | SERIOUS | 2 |
| AXE-HTML-HAS-LANG | SERIOUS | 1 |
| **Subtotal Critical** | | **18** |
| **Subtotal Serious** | | **3** |

### Order Confirmation (/order-confirmation) — 20 total issues

| Issue Type | Severity | Count |
|------------|----------|-------|
| WRONG_SEMANTIC_ROLE | CRITICAL | 7 |
| NOT_FOCUSABLE | CRITICAL | 7 |
| NO_DESCRIPTIVE_TEXT | CRITICAL | 1 |
| AXE-BUTTON-NAME | CRITICAL | 1 |
| AXE-COLOR-CONTRAST | SERIOUS | 1 |
| AXE-HTML-HAS-LANG | SERIOUS | 1 |
| **Subtotal Critical** | | **18** |
| **Subtotal Serious** | | **2** |

---

*Report generated by Evinced JS Playwright SDK via comprehensive-a11y-audit.spec.ts · 2026-03-22*
