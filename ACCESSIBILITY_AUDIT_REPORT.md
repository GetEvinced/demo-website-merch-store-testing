# Accessibility Audit Report

**Repository:** demo-website  
**Audit Date:** 2026-03-17  
**Audit Engine:** Evinced JS Playwright SDK v2.43.0  
**Branch:** cursor/repository-accessibility-audit-7aca  
**Auditor:** Automated Cloud Agent  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository Overview — Pages and Entry Points](#2-repository-overview--pages-and-entry-points)
3. [Audit Methodology](#3-audit-methodology)
4. [Summary of Findings by Page](#4-summary-of-findings-by-page)
5. [Critical Issues](#5-critical-issues)
   - [CI-1: Header Icon Controls — Non-Semantic Interactive Elements](#ci-1-header-icon-controls--non-semantic-interactive-elements)
   - [CI-2: Footer Nav Items — Non-Semantic Interactive Elements](#ci-2-footer-nav-items--non-semantic-interactive-elements)
   - [CI-3: PopularSection Shop Links — No Role, No Accessible Name, Not Focusable](#ci-3-popularsection-shop-links--no-role-no-accessible-name-not-focusable)
   - [CI-4: FilterSidebar Option Rows — No Semantic Role, Not Keyboard Accessible](#ci-4-filtersidebar-option-rows--no-semantic-role-not-keyboard-accessible)
   - [CI-5: Cart Modal Close Button — No Accessible Name](#ci-5-cart-modal-close-button--no-accessible-name)
   - [CI-6: Checkout "Continue" Button — Non-Semantic Element](#ci-6-checkout-continue-button--non-semantic-element)
   - [CI-7: Checkout "Back" Button — Non-Semantic Element](#ci-7-checkout-back-button--non-semantic-element)
   - [CI-8: Order Confirmation "Back to Shop" Link — Non-Semantic Element](#ci-8-order-confirmation-back-to-shop-link--non-semantic-element)
   - [CI-9: Images Missing Alternative Text](#ci-9-images-missing-alternative-text)
   - [CI-10: Invalid ARIA Attribute Values](#ci-10-invalid-aria-attribute-values)
   - [CI-11: TheDrop Slider — Missing Required ARIA Attributes and Not Keyboard Accessible](#ci-11-thedrop-slider--missing-required-aria-attributes-and-not-keyboard-accessible)
   - [CI-12: Sort Button — Incorrect Role and Missing Contextual Label](#ci-12-sort-button--incorrect-role-and-missing-contextual-label)
6. [Non-Critical Issues (Serious, Needs Review, Best Practice)](#6-non-critical-issues-serious-needs-review-best-practice)

---

## 1. Executive Summary

A full-site automated accessibility audit was performed across all 6 pages (5 distinct routes) of the demo e-commerce React SPA using the **Evinced JS Playwright SDK**. Playwright drove a real Chromium browser through the complete user journey — from homepage to order confirmation — capturing live DOM snapshots at each step.

| Metric | Value |
|--------|-------|
| Pages audited | 6 |
| Total issues detected | **174** |
| **Critical** | **147** |
| Serious | 25 |
| Needs Review | 1 |
| Best Practice | 1 |
| Distinct critical issue groups | **12** |

All 147 critical issues fall into 12 distinct groups (CI-1 through CI-12). The highest-impact groups are:

- **Non-semantic interactive elements** (`<div>` and `<span>` used as buttons/links without `role` or `tabindex`) — appear on every page and block keyboard-only users and screen reader users from reaching key controls.
- **Missing accessible names** on icon-only controls — screen readers cannot announce the purpose of these controls.
- **Missing image `alt` attributes** — screen readers read the raw filename instead of a description.
- **Invalid ARIA attribute values** — browsers and assistive technologies silently ignore or misinterpret the semantics.

No source-code remediations have been applied. All 174 issues remain open. Proposed fixes and their rationale are documented per issue group in Section 5.

---

## 2. Repository Overview — Pages and Entry Points

The application is a **React 18 single-page application** bundled with Webpack 5 and routed with React Router v7. Entry points and their source files are listed below.

| # | Route | Page Name | Entry Source File | Components Included |
|---|-------|-----------|-------------------|---------------------|
| 1 | `/` | Homepage | `src/pages/HomePage.jsx` | `Header`, `HeroBanner`, `FeaturedPair`, `PopularSection`, `TrendingCollections`, `TheDrop`, `Footer`, `CartModal`, `WishlistModal` |
| 2 | `/shop/new` | Products Page | `src/pages/NewPage.jsx` | `Header`, `FilterSidebar`, `ProductCard` (×n), `Footer`, `CartModal`, `WishlistModal` |
| 3 | `/product/:id` | Product Detail | `src/pages/ProductPage.jsx` | `Header`, `Footer`, `CartModal`, `WishlistModal` |
| 4 | `/checkout` (step 1: basket) | Checkout — Shopping Cart | `src/pages/CheckoutPage.jsx` | `Header`, `Footer`, `CartModal` |
| 5 | `/checkout` (step 2: shipping) | Checkout — Shipping & Payment | `src/pages/CheckoutPage.jsx` | `Header`, `Footer`, `CartModal` |
| 6 | `/order-confirmation` | Order Confirmation | `src/pages/OrderConfirmationPage.jsx` | `Header`, `Footer`, `CartModal`, `WishlistModal` |

**Global HTML shell:** `public/index.html` — note: the `<html>` element has no `lang` attribute, which affects all pages.

**React application root:** `src/index.js` → `src/components/App.jsx`

---

## 3. Audit Methodology

### Tool

**Evinced JS Playwright SDK v2.43.0** (`@evinced/js-playwright-sdk`) — Evinced's browser-based accessibility analysis engine, which combines:
- Axe-core rules (AXE-*) for standards-based WCAG rule evaluation
- Evinced's proprietary component-aware rules (GEN1/GEN2/GEN3) for interactive-element semantics, ARIA correctness, and component-level pattern analysis
- Component-specific analyzers: `components.analyzeCombobox()` for the sort widget, `components.analyzeSiteNavigation()` for the navigation menu

### Test Spec

`tests/e2e/specs/a11y-audit-all-pages.spec.ts` — 6 independent Playwright tests, one per page/state:

1. **Homepage test** — navigates to `/`, waits for `.hero-banner`, calls `evAnalyze()`
2. **Products page test** — navigates to `/shop/new`, calls `evAnalyze()` + `components.analyzeCombobox()` on `.sort-btn` + `components.analyzeSiteNavigation()` on the main `<nav>`, then merges results with `evMergeIssues()`
3. **Product detail test** — navigates to `/shop/new`, clicks the first `.product-card-image-link`, waits for `button[aria-label="Add to cart"]`, calls `evAnalyze()`
4. **Checkout basket test** — completes the flow to `/checkout` step 1, calls `evAnalyze()`
5. **Checkout shipping test** — completes the flow to `/checkout` step 2 (after clicking Continue), calls `evAnalyze()`
6. **Order confirmation test** — completes the full purchase journey to `/order-confirmation`, calls `evAnalyze()`

### Credentials

- Authentication mode: **offline JWT** (`PLAYWRIGHT_SDK_OFFLINE_TOKEN`)
- Service Account ID (from JWT): `922eff48-df42-cd03-0d83-8f1b7efc2f5a`
- All 6 tests passed. Raw JSON results saved to `tests/e2e/test-results/*.json`

### Severity Scale

| Severity | Meaning |
|----------|---------|
| **Critical** | Causes complete loss of access or information for one or more user groups (screen reader users, keyboard-only users) |
| **Serious** | Significantly impairs access or usability but does not block it entirely |
| **Needs Review** | May be an issue depending on context; requires human judgment |
| **Best Practice** | Does not violate WCAG but departs from recommended patterns |

---

## 4. Summary of Findings by Page

| Page | Route | Total Issues | Critical | Serious | Needs Review | Best Practice |
|------|-------|-------------|----------|---------|--------------|---------------|
| Homepage | `/` | 35 | **32** | 3 | — | — |
| Products Page | `/shop/new` | 59 | **43** | 14 | 1 | 1 |
| Product Detail | `/product/:id` | 20 | **18** | 2 | — | — |
| Checkout (basket) | `/checkout` step 1 | 21 | **18** | 3 | — | — |
| Checkout (shipping) | `/checkout` step 2 | 19 | **18** | 1 | — | — |
| Order Confirmation | `/order-confirmation` | 20 | **18** | 2 | — | — |
| **TOTAL** | | **174** | **147** | **25** | **1** | **1** |

> **Note on cross-page deduplication:** Many critical issues (e.g., header icon buttons, footer nav items, cart modal close button) appear on every page because they live in shared global components (`Header.jsx`, `Footer.jsx`, `CartModal.jsx`). They are counted once per page in the totals above because each page load is a separate scan. From a remediation standpoint, fixing the shared component fixes the issue on all pages simultaneously.

---

## 5. Critical Issues

### CI-1: Header Icon Controls — Non-Semantic Interactive Elements

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role (`WRONG_SEMANTIC_ROLE`) · Keyboard accessible (`NOT_FOCUSABLE`) · Accessible name (`NO_DESCRIPTIVE_TEXT`)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/interactable-role · https://knowledge.evinced.com/system-validations/keyboard-accessible  
**Pages Affected:** All 6 pages (global `Header` component)  
**Source File:** `src/components/Header.jsx`

#### Affected Elements

| Element Selector | Element Description | Issue Types | Issue Count |
|-----------------|---------------------|-------------|-------------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn">` used as wishlist-open button | Interactable role · Keyboard accessible | 2 |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn">` used as Search button | Interactable role · Accessible name · Keyboard accessible | 3 |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn">` used as Login button | Interactable role · Accessible name · Keyboard accessible | 3 |
| `.flag-group` | `<div class="flag-group">` used as region selector toggle | Interactable role · Keyboard accessible | 2 |

**Total critical issue instances for CI-1:** 10 per page × 6 pages = 60 (shared component)

#### Current Code (problematic)

```jsx
{/* Wishlist – div used as button, no role, no tabindex */}
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>

{/* Search – div used as button, no role, no tabindex, label text is aria-hidden */}
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>

{/* Login – div used as button, no role, no tabindex, label text is aria-hidden */}
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</div>

{/* Flag/Region Selector – div used as toggle, no role, no tabindex */}
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  <img src="..." alt="United States Flag" />
  <img src="..." alt="Canada Flag" />
</div>
```

#### Proposed Fix

Replace each `<div>` with a native `<button>` element and add an `aria-label` to icon-only controls whose text label is `aria-hidden`:

```jsx
{/* Wishlist – native button, text label is visible, no additional aria-label needed */}
<button className="icon-btn wishlist-btn" onClick={openWishlist}>
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</button>

{/* Search – native button, aria-label replaces aria-hidden text */}
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">...</svg>
</button>

{/* Login – native button, aria-label replaces aria-hidden text */}
<button className="icon-btn" aria-label="Login">
  <svg aria-hidden="true">...</svg>
</button>

{/* Flag/Region Selector – native button, descriptive label */}
<button className="flag-group" aria-label="Select region">
  <img src="..." alt="United States Flag" />
  <img src="..." alt="Canada Flag" />
</button>
```

#### Remediation Rationale

Native `<button>` elements are natively focusable (keyboard Tab), fire on both click and Enter/Space key presses without additional `onKeyDown` handlers, carry an implicit `role="button"` that screen readers announce, and participate in the tab sequence without needing an explicit `tabindex`. This is the most robust and maintainable fix. For the Search and Login controls the visible text label was hidden via `aria-hidden="true"`, so an explicit `aria-label` is required to supply the accessible name.

---

### CI-2: Footer Nav Items — Non-Semantic Interactive Elements

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role (`WRONG_SEMANTIC_ROLE`) · Keyboard accessible (`NOT_FOCUSABLE`) · Accessible name (`NO_DESCRIPTIVE_TEXT`)  
**Pages Affected:** All 6 pages (global `Footer` component)  
**Source File:** `src/components/Footer.jsx`

#### Affected Elements

| Element Selector | Element Description | Issue Types | Issue Count |
|-----------------|---------------------|-------------|-------------|
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item">` for "Sustainability" | Interactable role · Keyboard accessible | 2 |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item">` for "FAQs" (text is `aria-hidden`) | Interactable role · Accessible name · Keyboard accessible | 3 |

**Total critical issue instances for CI-2:** 5 per page × 6 pages = 30 (shared component)

#### Current Code (problematic)

```jsx
{/* Sustainability – div used as nav link, no role, no tabindex */}
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div></li>

{/* FAQs – div used as nav link, text is aria-hidden (no accessible name), no role, no tabindex */}
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}><span aria-hidden="true">FAQs</span></div></li>
```

#### Proposed Fix

Replace `<div>` elements with native `<a>` elements (for navigation items that go to another page/anchor) or `<button>` elements (for JavaScript actions). Remove `aria-hidden` from the visible text labels.

```jsx
<li><a href="#sustainability" className="footer-nav-item">Sustainability</a></li>
<li><a href="#faqs" className="footer-nav-item">FAQs</a></li>
```

#### Remediation Rationale

Navigation footer items that link to destinations should use `<a href>`, which is natively focusable, announces "link" role to screen readers, and works with keyboard Enter. If the action is JavaScript-only (no URL), a `<button>` is appropriate. Either way, the text content must not be `aria-hidden`, because that removes the only source of the accessible name. Native semantic elements require no extra ARIA.

---

### CI-3: PopularSection Shop Links — No Role, No Accessible Name, Not Focusable

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role (`WRONG_SEMANTIC_ROLE`) · Keyboard accessible (`NOT_FOCUSABLE`) · Accessible name (`NO_DESCRIPTIVE_TEXT`)  
**Pages Affected:** Homepage (`/`)  
**Source File:** `src/components/PopularSection.jsx`

#### Affected Elements

| Element Selector | Element Description | Issue Types | Issue Count |
|-----------------|---------------------|-------------|-------------|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | "Shop Drinkware" navigation div (text is `aria-hidden`) | Interactable role · Accessible name · Keyboard accessible | 3 |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | "Shop Fun and Games" navigation div (text is `aria-hidden`) | Interactable role · Accessible name · Keyboard accessible | 3 |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | "Shop Stationery" navigation div (text is `aria-hidden`) | Interactable role · Accessible name · Keyboard accessible | 3 |

**Total critical issue instances for CI-3:** 9

#### Current Code (problematic)

```jsx
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>
```

#### Proposed Fix

Replace the `<div>` with a React Router `<Link>` (or native `<a>`) so the element is natively focusable, has `role="link"`, and the label text is available to assistive technology:

```jsx
import { Link } from 'react-router-dom';

<Link className="shop-link" to={product.shopHref}>
  {product.shopLabel}
</Link>
```

#### Remediation Rationale

React Router's `<Link>` renders an `<a>` element, which is semantically correct for navigation actions, natively focusable, activatable with Enter, and announces "link" to screen readers. The `aria-hidden` wrapper must be removed so the text becomes the accessible name. Using a native element instead of programmatic `navigate()` also enables middle-click / Ctrl+click to open in a new tab, improving usability for all users.

---

### CI-4: FilterSidebar Option Rows — No Semantic Role, Not Keyboard Accessible

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role (`WRONG_SEMANTIC_ROLE`) · Keyboard accessible (`NOT_FOCUSABLE`)  
**Pages Affected:** Products Page (`/shop/new`)  
**Source File:** `src/components/FilterSidebar.jsx`

#### Affected Elements

The filter sidebar contains three collapsible sections (Price, Size, Brand). Each section renders individual filter option rows as plain `<div>` elements with click handlers but no `role`, no `tabindex`, and no keyboard event handlers.

| Filter Group | Options | Issues per Option | Total Issues |
|-------------|---------|-----------------|--------------|
| Price (filter-group:nth-child(2)) | 4 ranges | Interactable role + Keyboard accessible | 8 |
| Size (filter-group:nth-child(3)) | 4 sizes + `.filter-option:nth-child(5)` (XL) | Interactable role + Keyboard accessible | 10 |
| Brand (filter-group:nth-child(4)) | 3 brands | Interactable role + Keyboard accessible | 6 |

**Total critical issue instances for CI-4:** 24

#### Proposed Fix

Replace each filter option `<div>` with a native `<label>` + `<input type="checkbox">` pattern, which is the semantically correct markup for a multi-select filter:

```jsx
{PRICE_RANGES.map((range) => (
  <li key={range.label} className="filter-option">
    <label className="filter-option-label">
      <input
        type="checkbox"
        checked={selectedPrices.some(r => r.label === range.label)}
        onChange={() => onPriceChange(range)}
      />
      <span className="filter-option-text">{range.label}</span>
      <span className="filter-count">({priceCount(range)})</span>
    </label>
  </li>
))}
```

#### Remediation Rationale

Native `<input type="checkbox">` is natively focusable, togglable with Space bar, announces "checkbox" role and checked/unchecked state automatically, and is associated with its label through the `<label>` wrapper — addressing the Interactable role, Keyboard accessible, and also the separately-catalogued Evinced GEN2 issues for missing `role="checkbox"`, `aria-checked`, and `tabindex` on these elements. The `<label>` wrapper ensures the accessible name equals the visible text without any ARIA.

---

### CI-5: Cart Modal Close Button — No Accessible Name

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 1.3.1 Info and Relationships (Level A)  
**Evinced / Axe Rule:** Button-name (`AXE-BUTTON-NAME`)  
**Pages Affected:** All 6 pages (global `CartModal` component)  
**Source File:** `src/components/CartModal.jsx`

#### Affected Elements

| Element Selector | Element Description | Issue Count |
|-----------------|---------------------|-------------|
| `#cart-modal > div:nth-child(1) > button` | Cart modal close button (icon-only, `aria-label` removed) | 1 |
| `div[role="dialog"] > div:nth-child(1) > button` | Same button when role="dialog" is present | 1 |

**Total critical issue instances for CI-5:** 1–2 per page × 6 pages = up to 12 (shared component)

#### Current Code (problematic)

```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
>
  <svg width="20" height="20" ... aria-hidden="true">
    <line ... /><line ... />
  </svg>
</button>
```

The SVG is `aria-hidden="true"` and there is no `aria-label`, no visible text, and no `title` on the button. The button is semantically a `<button>` so it is focusable, but screen readers announce it as "button" with no name — users cannot understand its purpose.

#### Proposed Fix

Add an `aria-label` to the close button:

```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>
```

#### Remediation Rationale

For icon-only buttons where the SVG is `aria-hidden`, the `aria-label` attribute is the correct mechanism to supply an accessible name (WCAG 4.1.2). The label "Close shopping cart" is preferred over a generic "Close" because it identifies which dialog is being closed, which is important when multiple overlapping dialogs could be present.

---

### CI-6: Checkout "Continue" Button — Non-Semantic Element

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role (`WRONG_SEMANTIC_ROLE`) · Keyboard accessible (`NOT_FOCUSABLE`)  
**Pages Affected:** Checkout — Basket Step (`/checkout` step 1)  
**Source File:** `src/pages/CheckoutPage.jsx`

#### Affected Element

| Element Selector | Element Description | Issue Types | Issue Count |
|-----------------|---------------------|-------------|-------------|
| `.checkout-continue-btn` | `<div class="checkout-continue-btn">` used as "Continue" button | Interactable role · Keyboard accessible | 2 |

**Total critical issue instances for CI-6:** 2

#### Current Code (problematic)

```jsx
{/* div used as a proceed button — no role="button", no tabindex */}
<div className="checkout-continue-btn" onClick={() => setStep('shipping')}>
  Continue
</div>
```

#### Proposed Fix

Replace with a native `<button>`:

```jsx
<button className="checkout-continue-btn" onClick={() => setStep('shipping')}>
  Continue
</button>
```

#### Remediation Rationale

The Continue action is a critical step in the checkout flow. Making it a native `<button>` ensures keyboard-only users can reach and activate it, and screen reader users hear "Continue, button" when focused. No ARIA is required; the visible text "Continue" becomes the accessible name automatically.

---

### CI-7: Checkout "Back" Button — Non-Semantic Element

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role (`WRONG_SEMANTIC_ROLE`) · Keyboard accessible (`NOT_FOCUSABLE`)  
**Pages Affected:** Checkout — Shipping Step (`/checkout` step 2)  
**Source File:** `src/pages/CheckoutPage.jsx`

#### Affected Element

| Element Selector | Element Description | Issue Types | Issue Count |
|-----------------|---------------------|-------------|-------------|
| `.checkout-back-btn` | `<div class="checkout-back-btn">` used as "Back" navigation button | Interactable role · Keyboard accessible | 2 |

**Total critical issue instances for CI-7:** 2

#### Current Code (problematic)

```jsx
<div className="checkout-back-btn" onClick={() => setStep('basket')}>
  Back
</div>
```

#### Proposed Fix

```jsx
<button className="checkout-back-btn" onClick={() => setStep('basket')}>
  Back
</button>
```

#### Remediation Rationale

Identical rationale to CI-6. The Back button allows a user to correct order details; blocking keyboard access to it traps keyboard-only users in the shipping form with no escape route (other than the browser's own Back button). Native `<button>` resolves the issue with the minimum change.

---

### CI-8: Order Confirmation "Back to Shop" Link — Non-Semantic Element

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role (`WRONG_SEMANTIC_ROLE`) · Keyboard accessible (`NOT_FOCUSABLE`)  
**Pages Affected:** Order Confirmation (`/order-confirmation`)  
**Source File:** `src/pages/OrderConfirmationPage.jsx`

#### Affected Element

| Element Selector | Element Description | Issue Types | Issue Count |
|-----------------|---------------------|-------------|-------------|
| `.confirm-home-link` | `<div class="confirm-home-link">` used as "Back to Shop" navigation action | Interactable role · Keyboard accessible | 2 |

**Total critical issue instances for CI-8:** 2

#### Proposed Fix

Because this control navigates to another route (`/`), it should be a React Router `<Link>`:

```jsx
import { Link } from 'react-router-dom';

<Link className="confirm-home-link" to="/">
  Back to Shop
</Link>
```

#### Remediation Rationale

After order confirmation the only remaining action is returning to the shop. This is a navigation action, so `<Link>` (which renders `<a href>`) is semantically correct — screen readers announce "Back to Shop, link", users can activate with Enter, and browser history works correctly. Using a `<div>` with `navigate()` denies these affordances.

---

### CI-9: Images Missing Alternative Text

**Severity:** Critical  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Axe Rule:** image-alt (`AXE-IMAGE-ALT`)  
**Pages Affected:** Homepage (`/`)  
**Source Files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`

#### Affected Elements

| Element Selector | Image File | Source File | Issue Count |
|-----------------|-----------|-------------|-------------|
| `img[src$="New_Tees.png"]` | `/images/home/New_Tees.png` | `src/components/HeroBanner.jsx` line 18 | 1 |
| `img[src$="2bags_charms1.png"]` | `/images/home/2bags_charms1.png` | `src/components/TheDrop.jsx` line 13 | 1 |

**Total critical issue instances for CI-9:** 2

#### Current Code (problematic)

```jsx
{/* HeroBanner.jsx – no alt attribute */}
<img src={HERO_IMAGE} />

{/* TheDrop.jsx – no alt attribute */}
<img src={DROP_IMAGE} loading="lazy" />
```

When an `<img>` has no `alt` attribute, screen readers fall back to announcing the raw file name (e.g. "New_Tees dot P N G" or "2 bags underscore charms 1 dot P N G"), which conveys no meaningful information.

#### Proposed Fix

Add descriptive `alt` text:

```jsx
{/* HeroBanner.jsx */}
<img src={HERO_IMAGE} alt="Model wearing a winter basics collection t-shirt" />

{/* TheDrop.jsx */}
<img src={DROP_IMAGE} alt="New limited-edition plushie bag charms: Android bot, YouTube icon, and Super G" loading="lazy" />
```

If the image is purely decorative and adds no information beyond adjacent text, use `alt=""` (empty string) to tell screen readers to skip it:

```jsx
<img src={HERO_IMAGE} alt="" role="presentation" />
```

#### Remediation Rationale

WCAG 1.1.1 requires every `<img>` to have an `alt` attribute. A descriptive `alt` allows screen reader users to understand what the image depicts; an empty `alt=""` signals the image is decorative and should be ignored. Both are valid depending on the image's informational role. For a hero banner and a "The Drop" feature section, descriptive text is preferred because the images support the marketing message.

---

### CI-10: Invalid ARIA Attribute Values

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Axe Rule:** aria-valid-attr-value (`AXE-ARIA-VALID-ATTR-VALUE`)  
**Pages Affected:** Homepage (`/`), Product Detail (`/product/:id`)  
**Source Files:** `src/components/FeaturedPair.jsx`, `src/pages/ProductPage.jsx`

#### Affected Elements

| Element Selector | Attribute | Invalid Value | Valid Values | Source File | Issue Count |
|-----------------|-----------|---------------|--------------|-------------|-------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `aria-expanded` | `"yes"` | `"true"` / `"false"` | `FeaturedPair.jsx` line 46 | 1 |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `aria-expanded` | `"yes"` | `"true"` / `"false"` | `FeaturedPair.jsx` line 46 | 1 |
| `ul[aria-relevant="changes"]` | `aria-relevant` | `"changes"` | Space-separated tokens: `additions` · `removals` · `text` · `all` | `ProductPage.jsx` | 1 |

**Total critical issue instances for CI-10:** 3

#### Current Code (problematic)

```jsx
{/* FeaturedPair.jsx – aria-expanded="yes" is not a valid boolean ARIA token */}
<h1 aria-expanded="yes">{item.title}</h1>

{/* ProductPage.jsx – aria-relevant="changes" is not a valid token */}
<ul aria-relevant="changes">...</ul>
```

Browsers and assistive technologies that validate ARIA attribute values will silently discard invalid values, so the intended semantics are never communicated.

#### Proposed Fix

For `aria-expanded`, the correct boolean string literals are `"true"` or `"false"`. Since an `<h1>` is not a disclosure widget, `aria-expanded` is also semantically inappropriate here — it should be removed entirely:

```jsx
{/* Remove aria-expanded from headings (not a disclosure widget) */}
<h1>{item.title}</h1>
```

For `aria-relevant`, use one or more valid space-separated tokens:

```jsx
{/* Valid: announce additions and text changes */}
<ul aria-relevant="additions text">...</ul>

{/* Or remove if live region behavior is not needed */}
<ul>...</ul>
```

#### Remediation Rationale

`aria-expanded` is defined only for widget roles that have an expandable state (button, combobox, tab, etc.). Placing it on an `<h1>` is a role mismatch. The spec requires its value to be the boolean string `"true"` or `"false"` — `"yes"` is not valid. For `aria-relevant`, the WAI-ARIA spec enumerates exactly four valid tokens; `"changes"` is not among them. Both attributes must use the exact values specified in the WAI-ARIA 1.1 specification.

---

### CI-11: TheDrop Slider — Missing Required ARIA Attributes and Not Keyboard Accessible

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Axe Rules:** aria-required-attr (`AXE-ARIA-REQUIRED-ATTR`) · Keyboard accessible (`NOT_FOCUSABLE`)  
**Pages Affected:** Homepage (`/`)  
**Source File:** `src/components/TheDrop.jsx`

#### Affected Element

| Element Selector | Description | Missing Attributes | Issue Count |
|-----------------|-------------|-------------------|-------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator">` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` · no `tabindex` | 2 |

**Total critical issue instances for CI-11:** 2

#### Current Code (problematic)

```jsx
{/* role="slider" requires aria-valuenow, aria-valuemin, aria-valuemax */}
{/* Also missing tabindex=0 so keyboard users cannot reach it */}
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

The WAI-ARIA specification requires all elements with `role="slider"` to have three numeric state attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). Without them, screen readers cannot announce the slider's current state.

#### Proposed Fix

If this element is a static visual indicator (not interactive), `role="slider"` is incorrect. Replace with `role="meter"` and the correct attributes, or remove the role entirely and use a visual `<meter>` element:

```jsx
{/* Option A: native <meter> (recommended for static indicators) */}
<meter
  className="drop-popularity-bar"
  value={85}
  min={0}
  max={100}
  aria-label="Popularity: 85 out of 100"
>
  85%
</meter>

{/* Option B: keep div but fix role and attributes */}
<div
  role="meter"
  aria-valuenow={85}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Popularity indicator"
  className="drop-popularity-bar"
/>
```

If the element truly is an interactive slider (user-adjustable), add `tabindex="0"`, the three required `aria-value*` attributes, and `onKeyDown` handlers for arrow keys.

#### Remediation Rationale

The WAI-ARIA specification's "required properties" for `role="slider"` are `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without them the element is invalid and screen readers cannot compute or announce its state. Since the popularity bar appears static (no user interaction code is attached), `role="meter"` or a native `<meter>` element is semantically more accurate and requires no keyboard interaction support.

---

### CI-12: Sort Button — Incorrect Role and Missing Contextual Label

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 1.3.1 Info and Relationships (Level A)  
**Evinced Rules:** Element has incorrect role (`ELEMENT_HAS_INCORRECT_ROLE`) · Missing contextual labeling (`CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING`)  
**Pages Affected:** Products Page (`/shop/new`)  
**Source File:** `src/pages/NewPage.jsx`

#### Affected Element

| Element Selector | Description | Issue Types | Issue Count |
|-----------------|-------------|-------------|-------------|
| `.sort-btn` | Sort `<button>` that opens the sort dropdown | Element has incorrect role · Missing contextual labeling | 2 |

**Total critical issue instances for CI-12:** 2

#### Description

The sort button is a `<button>` that controls a custom dropdown listbox. The Evinced combobox analyzer (`components.analyzeCombobox()`) detected that:
1. The button does not have `role="combobox"` — assistive technologies cannot identify it as the trigger of a combobox widget.
2. The button has no accessible name (`aria-label` was removed) — screen readers cannot announce its purpose.

Additionally, the combobox analysis could not run fully because the button failed to expose its expanded state (tracked under `COMBOBOX_ANALYSIS_CANNOT_RUN` / Needs Review).

#### Proposed Fix

Add `role="combobox"`, `aria-label`, `aria-expanded`, `aria-haspopup`, and `aria-controls` to the sort button:

```jsx
<button
  className="sort-btn"
  role="combobox"
  aria-label="Sort products"
  aria-expanded={sortOpen}
  aria-haspopup="listbox"
  aria-controls="sort-options-list"
  onClick={() => setSortOpen((o) => !o)}
>
  {SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort'}
</button>
<ul
  id="sort-options-list"
  className="sort-options"
  role="listbox"
  aria-label="Sort options"
>
  {SORT_OPTIONS.map(opt => (
    <li
      key={opt.value}
      role="option"
      aria-selected={sort === opt.value}
      tabIndex={0}
      onClick={() => { setSort(opt.value); setSortOpen(false); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSort(opt.value); setSortOpen(false); }}}
    >
      {opt.label}
    </li>
  ))}
</ul>
```

#### Remediation Rationale

The WAI-ARIA combobox pattern requires the trigger to expose `role="combobox"` and `aria-expanded` so that screen readers understand they are activating a widget that shows a list of choices. The listbox container needs `role="listbox"` and each option needs `role="option"` with `aria-selected`. Without these roles the dropdown is announced as a plain button and an unordered list — the relationship between the two is not discoverable by assistive technology.

---

## 6. Non-Critical Issues (Serious, Needs Review, Best Practice)

These 27 issues were detected but are classified below critical severity. No remediations have been applied. They are documented here for awareness and future prioritisation.

### 6.1 Serious Issues (25 total)

#### S-1: Missing `lang` Attribute on `<html>` Element

**Rule:** `AXE-HTML-HAS-LANG`  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Pages Affected:** All 6 pages  
**Source File:** `public/index.html`  
**Count:** 1 instance (appears on every page)

The `<html>` element has no `lang` attribute. Screen readers and translation tools cannot determine the document's language to select the correct pronunciation rules or translation direction.

**Current code:**
```html
<html>
```

**Proposed fix:**
```html
<html lang="en">
```

---

#### S-2: Insufficient Color Contrast

**Rule:** `AXE-COLOR-CONTRAST`  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA) — requires 4.5:1 for normal text  
**Pages Affected:** Homepage, Products Page, Product Detail, Checkout, Order Confirmation  
**Count:** 18 instances

| # | Page | Selector | Foreground | Background | Ratio | Required |
|---|------|----------|-----------|-----------|-------|----------|
| 1 | Homepage | `.hero-content > p` | `#c8c0b8` | `#e8e0d8` | ~1.37:1 | 4.5:1 |
| 2–14 | Products | `.filter-count` labels (13 filter option count badges) | `#c8c8c8` | `#ffffff` | ~1.4:1 | 4.5:1 |
| 15 | Products | `.products-found` | `#b0b4b8` | `#ffffff` | ~1.9:1 | 4.5:1 |
| 16 | Product Detail | `p:nth-child(4)` (product description) | `#c0c0c0` | `#ffffff` | ~1.6:1 | 4.5:1 |
| 17 | Checkout (basket) | `.checkout-step:nth-child(3) > .step-label` | — | — | below threshold | 4.5:1 |
| 18 | Checkout (basket) | `.summary-tax-note` | — | — | below threshold | 4.5:1 |
| 19 | Order Confirmation | `.confirm-order-id-label` | — | — | below threshold | 4.5:1 |

**Proposed fix:** Darken the foreground color for each of these text elements to achieve at least a 4.5:1 contrast ratio. For example, change `.filter-count` from `#c8c8c8` to `#767676` (exactly 4.5:1 on white) or darker.

---

#### S-3: Invalid `lang` Attribute Value

**Rule:** `AXE-VALID-LANG`  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Page Affected:** Homepage  
**Source File:** `src/components/TheDrop.jsx` line 21  
**Count:** 1

A `<p lang="zz">` element uses `"zz"` which is not a valid BCP 47 language tag. Screen readers relying on this tag to switch pronunciation would fail.

**Current code:** `<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>`

**Proposed fix:** Use the correct language tag. If the text is English, remove the `lang` attribute or set `lang="en"`.

---

### 6.2 Needs Review Issues (1 total)

#### NR-1: Sort Combobox Analysis Skipped

**Rule:** `COMBOBOX_ANALYSIS_CANNOT_RUN`  
**Severity:** Needs Review  
**Page Affected:** Products Page (`/shop/new`)  
**Source File:** `src/pages/NewPage.jsx`  
**Selector:** `.sort-btn`

The Evinced component tester could not execute the combobox analysis because the sort button did not expose `aria-expanded` and the SDK could not determine the open/closed state. This means the combobox-specific checks (focus management inside the dropdown, option announcement, keyboard navigation) were not evaluated. The underlying cause is the same as CI-12.

---

### 6.3 Best Practice Issues (1 total)

#### BP-1: Navigation Submenu Uses `role="menu"` (Forbidden in Navigation Landmark)

**Rule:** `MENU_AS_A_NAV_ELEMENT`  
**Severity:** Best Practice  
**Page Affected:** All pages (Header component)  
**Source File:** `src/components/Header.jsx` line 196  
**Selector:** `.has-submenu:nth-child(2) > .submenu[role="menu"]`

The submenu `<ul>` elements inside the main navigation are assigned `role="menu"`. The `menu` role carries application-widget semantics (arrow key navigation, `role="menuitem"` children) that conflict with normal link navigation. Inside a `<nav>` landmark, `role="menu"` is forbidden; screen readers may treat the entire navigation as an application widget and apply different interaction patterns than expected.

**Proposed fix:** Remove `role="menu"` from submenu `<ul>` elements and remove `role="menuitem"` from child `<Link>` elements. Use plain `<ul>/<li>/<a>` markup; CSS handles the visual dropdown appearance.

---

### 6.4 Summary Table — All Non-Critical Issues

| ID | Severity | Rule | Page(s) | Count |
|----|----------|------|---------|-------|
| S-1 | Serious | AXE-HTML-HAS-LANG | All pages | 1 (shared) |
| S-2 | Serious | AXE-COLOR-CONTRAST | Homepage, Products, Product Detail, Checkout, Order Confirmation | 18 |
| S-3 | Serious | AXE-VALID-LANG | Homepage | 1 |
| NR-1 | Needs Review | COMBOBOX_ANALYSIS_CANNOT_RUN | Products | 1 |
| BP-1 | Best Practice | MENU_AS_A_NAV_ELEMENT | All pages | 1 |
| **Total** | | | | **22** |

> The total non-critical count is 27 (25 serious + 1 needs review + 1 best practice). The 25 serious issues break down as: 6 pages × 1 `AXE-HTML-HAS-LANG` = 6 instances counted per-page, plus 18 `AXE-COLOR-CONTRAST` instances, plus 1 `AXE-VALID-LANG` = 25. The table above deduplicates the `AXE-HTML-HAS-LANG` to its single root cause.

---

*Report generated by automated Playwright + Evinced SDK audit. All raw issue data is available in `tests/e2e/test-results/*.json`.*
