# Accessibility (A11Y) Audit Report

**Repository:** demo-website (React SPA — Google Merchandise Store Demo)  
**Audit Date:** 2026-03-18  
**Tool:** Evinced JS Playwright SDK v2.17.0 (`@evinced/js-playwright-sdk`)  
**Scanner Engine:** EV-CORE (Evinced proprietary engine) + AXE (integrated)  
**Auditor:** Automated cloud agent (cursor/repository-accessibility-audit-3170)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Pages Scanned](#2-pages-scanned)
3. [Methodology](#3-methodology)
4. [Issue Summary by Severity](#4-issue-summary-by-severity)
5. [Critical Issues — Detailed Findings](#5-critical-issues--detailed-findings)
   - [CI-1: NOT_FOCUSABLE — Interactive `<div>` elements not keyboard-focusable](#ci-1-not_focusable)
   - [CI-2: WRONG_SEMANTIC_ROLE — Missing or incorrect ARIA role on interactive elements](#ci-2-wrong_semantic_role)
   - [CI-3: NO_DESCRIPTIVE_TEXT — Interactive elements lack accessible names](#ci-3-no_descriptive_text)
   - [CI-4: AXE-BUTTON-NAME — Icon-only `<button>` elements with no accessible name](#ci-4-axe-button-name)
   - [CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA attribute values](#ci-5-axe-aria-valid-attr-value)
   - [CI-6: AXE-IMAGE-ALT — Images missing `alt` attributes](#ci-6-axe-image-alt)
   - [CI-7: AXE-ARIA-REQUIRED-ATTR — ARIA role missing required attributes](#ci-7-axe-aria-required-attr)
6. [Remaining Non-Critical Issues (Serious)](#6-remaining-non-critical-issues-serious)
   - [SI-1: AXE-COLOR-CONTRAST — Insufficient text contrast](#si-1-axe-color-contrast)
   - [SI-2: AXE-HTML-HAS-LANG — Missing `lang` attribute on `<html>`](#si-2-axe-html-has-lang)
   - [SI-3: AXE-VALID-LANG — Invalid `lang` attribute value](#si-3-axe-valid-lang)

---

## 1. Executive Summary

A full accessibility audit was conducted across all 6 pages (including both checkout states) of this React single-page application using the Evinced Playwright SDK in online mode. The scanner detected **185 total issues**.

| Severity | Count |
|----------|-------|
| **Critical** | **159** |
| **Serious** | **26** |
| **Total** | **185** |

**159 critical issues** were found spanning 7 distinct rule violations. The overwhelming majority stem from a single architectural pattern: interactive UI elements implemented as `<div>` elements instead of native HTML interactive elements (`<button>`, `<a>`, `<input>`). This pattern simultaneously triggers three Evinced rules — `NOT_FOCUSABLE`, `WRONG_SEMANTIC_ROLE`, and `NO_DESCRIPTIVE_TEXT` — on the same elements, amplifying the issue count. The pattern is present in shared components (Header, Footer, CartModal, WishlistModal) that render on every page, which is why counts are high.

**No remediations have been applied.** This report documents findings and prescribes remediation approaches.

---

## 2. Pages Scanned

| # | Page | Route | Total Issues | Critical | Serious |
|---|------|-------|-------------|----------|---------|
| 1 | Homepage | `/` | 35 | 32 | 3 |
| 2 | New Products | `/shop/new` | 55 | 41 | 14 |
| 3 | Product Detail | `/product/1` | 20 | 18 | 2 |
| 4 | Checkout (Basket step) | `/checkout` | 21 | 18 | 3 |
| 5 | Checkout (Shipping step) | `/checkout` | 19 | 18 | 1 |
| 6 | Order Confirmation | `/order-confirmation` | 35 | 32 | 3 |
| | **Total** | | **185** | **159** | **26** |

The New Products page has the highest count (55) because it uniquely includes the `FilterSidebar` component, which contributes 12 additional `NOT_FOCUSABLE` + `WRONG_SEMANTIC_ROLE` pairs (one per filter option checkbox).

---

## 3. Methodology

1. **Build:** The React application was built with Webpack 5 (`npm run build`) into the `dist/` folder.
2. **Serve:** The production build was served locally on `http://localhost:3000` using `npx serve dist --single` (SPA mode).
3. **Playwright test spec:** A custom spec (`tests/e2e/specs/all-pages-audit.spec.ts`) navigated to each route, waited for the page to fully render, and called `sdk.evAnalyze()` to run the full accessibility scan.
4. **Checkout — Basket:** A product was first added to the cart (`/product/1` → "Add to Cart") before navigating to `/checkout` to ensure the basket state was populated.
5. **Checkout — Shipping:** After the basket step loaded, the "Continue" button was clicked to transition to the shipping/payment step before scanning.
6. **Results:** Raw scan results were written to JSON files in `/workspace/a11y-results/`. The Evinced SDK was authenticated in online mode using `EVINCED_SERVICE_ID` and `EVINCED_API_KEY` credentials from `.cursor/mcp.json`.

---

## 4. Issue Summary by Severity

### Critical Issues by Rule

| ID | Rule | Description | Pages Affected | Occurrences |
|----|------|-------------|---------------|-------------|
| CI-1 | `NOT_FOCUSABLE` | Interactive `<div>` not reachable by keyboard | All 6 | 58 |
| CI-2 | `WRONG_SEMANTIC_ROLE` | `<div>` used as button/link without ARIA role | All 6 | 56 |
| CI-3 | `NO_DESCRIPTIVE_TEXT` | Interactive element has no accessible name | All 6 | 24 |
| CI-4 | `AXE-BUTTON-NAME` | `<button>` contains only an icon with no label | All 6 | 10 |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` | ARIA attribute has an invalid value | Homepage, Product Detail, Order Confirmation | 5 |
| CI-6 | `AXE-IMAGE-ALT` | `<img>` missing `alt` attribute | Homepage, Order Confirmation | 4 |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` | ARIA role missing a required attribute | Homepage, Order Confirmation | 2 |
| | **Total** | | | **159** |

### Serious Issues by Rule (not remediated)

| ID | Rule | Description | Pages Affected | Occurrences |
|----|------|-------------|---------------|-------------|
| SI-1 | `AXE-COLOR-CONTRAST` | Text does not meet 4.5:1 contrast ratio | Homepage, New Products, Product Detail, Checkout, Order Confirmation | 18 |
| SI-2 | `AXE-HTML-HAS-LANG` | `<html>` element missing `lang` attribute | All 6 | 6 |
| SI-3 | `AXE-VALID-LANG` | `lang` attribute contains invalid BCP 47 tag | Homepage, Order Confirmation | 2 |
| | **Total** | | | **26** |

---

## 5. Critical Issues — Detailed Findings

### CI-1: NOT_FOCUSABLE

**Rule ID:** `NOT_FOCUSABLE`  
**Engine:** EV-CORE  
**WCAG:** 2.1.1 Keyboard (Level A), 2.4.7 Focus Visible (Level AA)  
**Severity:** Critical  
**Total occurrences:** 58  

**Description:**  
Interactive elements styled and wired with `onClick` handlers are `<div>` elements with no `tabIndex` attribute and no native focusability. Keyboard-only users cannot reach these elements via the Tab key. Screen reader users in browse mode also cannot activate them.

**Affected elements per page:**

#### Homepage (`/`)
| Selector | DOM Snippet | Component |
|----------|-------------|-----------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor:pointer">` | `Header.jsx` — Wishlist icon button |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor:pointer">` (Search icon) | `Header.jsx` — Search icon button |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor:pointer">` (Login icon) | `Header.jsx` — Login icon button |
| `.flag-group` | `<div class="flag-group" style="cursor:pointer">` | `Header.jsx` — Country/region selector |
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer">` | `PopularSection.jsx` / `TrendingCollections.jsx` — Shop Drinkware link |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer">` | Same — Shop Fun and Games |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer">` | Same — Shop Stationery |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer">Sustainability</div>` | `Footer.jsx` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer">` | `Footer.jsx` — FAQs |
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator">` | `TheDrop.jsx` — Popularity bar (has `role="slider"` but no `tabIndex`) |

#### New Products (`/shop/new`)
| Selector | DOM Snippet | Component |
|----------|-------------|-----------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor:pointer">` | `Header.jsx` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor:pointer">` (Search) | `Header.jsx` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor:pointer">` (Login) | `Header.jsx` |
| `.flag-group` | `<div class="flag-group" style="cursor:pointer">` | `Header.jsx` |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option">` (Price: 1.00–19.99) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | `<div class="filter-option">` (Price: 20.00–39.99) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | `<div class="filter-option">` (Price: 40.00–89.99) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | `<div class="filter-option">` (Price: 100.00–149.99) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option">` (Size: XS) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2)` | `<div class="filter-option">` (Size: SM) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3)` | `<div class="filter-option">` (Size: MD) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4)` | `<div class="filter-option">` (Size: LG) | `FilterSidebar.jsx` |
| `.filter-option:nth-child(5)` | `<div class="filter-option">` (Size: XL) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option">` (Brand: Android) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2)` | `<div class="filter-option">` (Brand: Google) | `FilterSidebar.jsx` |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3)` | `<div class="filter-option">` (Brand: YouTube) | `FilterSidebar.jsx` |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item">Sustainability</div>` | `Footer.jsx` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item">` (FAQs) | `Footer.jsx` |

#### Product Detail (`/product/1`)
| Selector | DOM Snippet | Component |
|----------|-------------|-----------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor:pointer">` | `Header.jsx` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn">` (Search) | `Header.jsx` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn">` (Login) | `Header.jsx` |
| `.flag-group` | `<div class="flag-group">` | `Header.jsx` |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item">Sustainability</div>` | `Footer.jsx` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item">` (FAQs) | `Footer.jsx` |

#### Checkout — Basket (`/checkout`, step 1)
| Selector | DOM Snippet | Component |
|----------|-------------|-----------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn">` | `Header.jsx` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn">` (Search) | `Header.jsx` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn">` (Login) | `Header.jsx` |
| `.flag-group` | `<div class="flag-group">` | `Header.jsx` |
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor:pointer">Continue</div>` | `CheckoutPage.jsx` |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item">Sustainability</div>` | `Footer.jsx` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item">` (FAQs) | `Footer.jsx` |

#### Checkout — Shipping (`/checkout`, step 2)
| Selector | DOM Snippet | Component |
|----------|-------------|-----------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn">` | `Header.jsx` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn">` (Search) | `Header.jsx` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn">` (Login) | `Header.jsx` |
| `.flag-group` | `<div class="flag-group">` | `Header.jsx` |
| `.checkout-back-btn` | `<div class="checkout-back-btn" style="cursor:pointer">← Back to Cart</div>` | `CheckoutPage.jsx` |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item">Sustainability</div>` | `Footer.jsx` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item">` (FAQs) | `Footer.jsx` |

#### Order Confirmation (`/order-confirmation`)
Same elements as Homepage (shares Header, Footer, and `TheDrop` + `FeaturedPair` sections rendered as part of the page layout): `.wishlist-btn`, `.icon-btn:nth-child(2)`, `.icon-btn:nth-child(4)`, `.flag-group`, three `.shop-link` divs, two `.footer-nav-item` divs, `.drop-popularity-bar`.

---

**Recommended Fix (CI-1):**

Replace every `<div onClick={...}>` that acts as a button with a `<button>` element, and every `<div onClick={...}>` that acts as a navigation link with an `<a href="...">` or React Router `<Link to="...">`. For `FilterSidebar`, replace `<div className="filter-option">` wrappers with `<label htmlFor="...">` / `<input type="checkbox">` pairs.

For the `TheDrop` popularity bar (`<div role="slider">`): either remove `role="slider"` if it is purely decorative, or add `tabIndex={0}` along with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` (also required by CI-7).

**Rationale:**  
Native interactive elements receive keyboard focus automatically and communicate their semantics to assistive technology without additional ARIA. This single-file change (replacing `<div>` with `<button>` or `<a>`) simultaneously resolves CI-1, CI-2, and for elements that also have `aria-hidden` text, CI-3 — eliminating ~138 of the 159 critical issues in one pass.

---

### CI-2: WRONG_SEMANTIC_ROLE

**Rule ID:** `WRONG_SEMANTIC_ROLE`  
**Engine:** EV-CORE  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical  
**Total occurrences:** 56  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/interactable-role  

**Description:**  
Screen readers identify the type of a control (button, link, checkbox, etc.) through its implicit or explicit ARIA role. `<div>` elements have role `generic`, which does not convey interactivity. Users of screen readers in application mode (or Forms mode) will not find these elements at all; users in document/browse mode who do encounter them cannot tell they are activatable.

**Affected elements per page:**

The affected elements are identical to those listed in CI-1 (each `NOT_FOCUSABLE` `<div>` is also `WRONG_SEMANTIC_ROLE`). Below is the consolidated list, annotated with the expected semantic role:

| Element | Expected Role | Source Component |
|---------|---------------|-----------------|
| `.wishlist-btn` — Wishlist icon div | `button` | `Header.jsx` |
| `.icon-btn:nth-child(2)` — Search div | `button` | `Header.jsx` |
| `.icon-btn:nth-child(4)` — Login div | `button` | `Header.jsx` |
| `.flag-group` — Country selector div | `button` | `Header.jsx` |
| `.shop-link` — Shop category divs (×3) | `link` | `PopularSection.jsx` / `TrendingCollections.jsx` |
| `li:nth-child(3) > .footer-nav-item` — Sustainability | `link` | `Footer.jsx` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` — FAQs | `link` | `Footer.jsx` |
| `.filter-option` — Filter checkbox divs (×12 on New Products) | `checkbox` | `FilterSidebar.jsx` |
| `.checkout-continue-btn` — Continue button | `button` | `CheckoutPage.jsx` |
| `.checkout-back-btn` — Back to Cart button | `button` | `CheckoutPage.jsx` |

These appear on all pages where the component renders (Header and Footer appear on every page; FilterSidebar only on New Products; checkout buttons only in the checkout flow).

**Recommended Fix (CI-2):**

Same as CI-1 — replace `<div onClick>` elements with their semantically correct native HTML counterparts. If replacing `<div>` with `<button>` is not feasible for layout reasons, add `role="button"` and `tabIndex={0}` as a minimum fallback, and also add `onKeyDown` to handle Enter/Space activation. For filter checkboxes, the idiomatic fix is `<input type="checkbox" id="..." />` + `<label htmlFor="...">` which eliminates all three CI-1/CI-2/CI-3 violations at once.

**Rationale:**  
WCAG 4.1.2 requires that the name, role, and value of all user interface components be programmatically determinable. A `<div>` with `onClick` has role `generic` — this does not satisfy the requirement. Using native elements is the most robust approach because it requires no additional ARIA, handles keyboard interaction natively, and is forward-compatible with assistive technology updates.

---

### CI-3: NO_DESCRIPTIVE_TEXT

**Rule ID:** `NO_DESCRIPTIVE_TEXT`  
**Engine:** EV-CORE  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.4.6 Headings and Labels (Level AA)  
**Severity:** Critical  
**Total occurrences:** 24  

**Description:**  
An interactive element has no accessible name that a screen reader can announce. This occurs in two patterns in this codebase:

1. **Icon-only `<div>` buttons** where the visible label `<span>` is wrapped in `aria-hidden="true"`, making the text invisible to AT (e.g., Search, Login buttons in `Header.jsx`).
2. **Shop link `<div>` elements** where the visible text `<span aria-hidden="true">Shop Drinkware</span>` is hidden from AT, leaving the element nameless.
3. **Footer nav items** where `<span aria-hidden="true">FAQs</span>` hides the only label.

**Affected elements per page:**

| Page | Selector | DOM Snippet | Component |
|------|----------|-------------|-----------|
| All pages | `.icon-btn:nth-child(2)` | `<div class="icon-btn">…<span aria-hidden="true">Search</span>` | `Header.jsx` |
| All pages | `.icon-btn:nth-child(4)` | `<div class="icon-btn">…<span aria-hidden="true">Login</span>` | `Header.jsx` |
| All pages | `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item">…<span aria-hidden="true">FAQs</span>` | `Footer.jsx` |
| Homepage, Order Confirmation | `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link">…<span aria-hidden="true">Shop Drinkware</span>` | `PopularSection.jsx` / `TrendingCollections.jsx` |
| Homepage, Order Confirmation | `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link">…<span aria-hidden="true">Shop Fun and Games</span>` | Same |
| Homepage, Order Confirmation | `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link">…<span aria-hidden="true">Shop Stationery</span>` | Same |

**Recommended Fix (CI-3):**

Remove `aria-hidden="true"` from the visible text spans. Alternatively, convert the elements to native `<button>` or `<a>` elements (which resolves CI-1 and CI-2 simultaneously) and keep the text visible to AT. If the text must remain visually hidden for any reason, add `aria-label` to the interactive element itself.

**Rationale:**  
`aria-hidden="true"` removes content from the accessibility tree. When the only text inside an interactive element is marked `aria-hidden`, the element has no accessible name. Removing the attribute costs nothing visually and immediately surfaces the label to screen reader users. This is the minimum-viable fix; the full fix is to replace the `<div>` as described in CI-1.

---

### CI-4: AXE-BUTTON-NAME

**Rule ID:** `AXE-BUTTON-NAME`  
**Engine:** AXE  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical  
**Total occurrences:** 10  
**AXE Rule:** `button-name`  

**Description:**  
`<button>` elements contain only an icon SVG (with `aria-hidden="true"`) and have no `aria-label`, `aria-labelledby`, or visible text. Screen readers announce these as "button" or "unlabeled button" with no indication of their purpose.

**Affected elements per page:**

| Page | Selector | DOM Snippet | Component |
|------|----------|-------------|-----------|
| Homepage, New Products, Product Detail, Order Confirmation | `#cart-modal > div:nth-child(1) > button` | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg … aria-hidden="true">×</svg></button>` | `CartModal.jsx` — Close Cart button |
| All 6 pages | `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg … aria-hidden="true">×</svg></button>` | `WishlistModal.jsx` — Close Wishlist button |
| Checkout (Basket), Checkout (Shipping) | `div:nth-child(1) > button` | Same pattern — close button of WishlistModal only | `WishlistModal.jsx` |

**Recommended Fix (CI-4):**

Add `aria-label="Close cart"` to the CartModal close button and `aria-label="Close wishlist"` to the WishlistModal close button:

```jsx
// CartModal.jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg aria-hidden="true">…</svg>
</button>

// WishlistModal.jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true">…</svg>
</button>
```

**Rationale:**  
Icon-only buttons must have an accessible name to communicate their purpose to screen reader users. `aria-label` is the correct mechanism for this — it overrides the text content (which here is empty) and provides a direct, concise description. The fix is a one-attribute change per button with no visual impact. `aria-label` is preferred over `aria-labelledby` here because there is no visible text element that already describes the button.

---

### CI-5: AXE-ARIA-VALID-ATTR-VALUE

**Rule ID:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Engine:** AXE  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical  
**Total occurrences:** 5  
**AXE Rule:** `aria-valid-attr-value`  

**Description:**  
ARIA attributes have values that are not valid per the WAI-ARIA specification. Two distinct violations exist:

**Violation A — `aria-expanded="yes"` on `<h1>` elements (`FeaturedPair.jsx`)**  
`aria-expanded` is a state attribute that must be the string `"true"` or `"false"`. The value `"yes"` is not a valid boolean string and will be ignored or misinterpreted by assistive technology. Additionally, `aria-expanded` is semantically meaningless on a heading (`<h1>`) — it is intended for disclosure widgets (buttons, comboboxes, tree nodes).

**Violation B — `aria-relevant="changes"` on a `<ul>` (`ProductPage.jsx`)**  
`aria-relevant` (used on live regions) accepts only a space-separated list of the tokens: `additions`, `removals`, `text`, and `all`. The value `"changes"` is not a valid token.

**Affected elements:**

| Page | Selector | DOM Snippet | Rule Violation |
|------|----------|-------------|---------------|
| Homepage | `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `aria-expanded` must be `"true"` or `"false"` |
| Homepage | `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | Same |
| Order Confirmation | `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | Same (FeaturedPair also renders on Order Confirmation page) |
| Order Confirmation | `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | Same |
| Product Detail | `ul[aria-relevant="changes"]` | `<ul aria-relevant="changes" aria-live="polite">` | `aria-relevant` value `"changes"` is invalid |

**Recommended Fix (CI-5):**

For `FeaturedPair.jsx`:  
Remove `aria-expanded` from the `<h1>` elements entirely — it conveys no meaningful state for a static heading. If collapse/expand behavior is ever added, move `aria-expanded` to the toggle button, not the heading.

```jsx
// Before
<h1 aria-expanded="yes">{item.title}</h1>

// After
<h3>{item.title}</h3>
```
(Note: changing `<h1>` to `<h3>` also corrects the non-critical heading-order issue; see Section 6.)

For `ProductPage.jsx`:  
Change `aria-relevant="changes"` to `aria-relevant="additions text"` (or remove it; the default behavior of `aria-live="polite"` is sufficient for most use cases):

```jsx
// Before
<ul aria-relevant="changes" aria-live="polite">

// After
<ul aria-live="polite">
```

**Rationale:**  
Invalid ARIA attribute values cause browsers and screen readers to silently ignore those attributes, defeating their purpose. `aria-expanded` on a heading is semantically incorrect regardless of its value. Removing it is safer than fixing the value to `"false"` because `aria-expanded="false"` would imply a collapsible widget — which this heading is not. For `aria-relevant`, `"changes"` is not in the spec; removing the attribute entirely allows the browser default live-region behavior, which is correct here.

---

### CI-6: AXE-IMAGE-ALT

**Rule ID:** `AXE-IMAGE-ALT`  
**Engine:** AXE  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Severity:** Critical  
**Total occurrences:** 4  
**AXE Rule:** `image-alt`  

**Description:**  
`<img>` elements with no `alt` attribute. Screen readers will announce the image filename (e.g., "New_Tees.png") as the image's text alternative, which conveys no meaningful information. The images are content images (not decorative), so an empty `alt=""` is also insufficient — they require descriptive alternative text.

**Affected elements:**

| Page | Selector | DOM Snippet | Source File |
|------|----------|-------------|-------------|
| Homepage | `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `HeroBanner.jsx` line 18 |
| Homepage | `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `TheDrop.jsx` line 13 |
| Order Confirmation | `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `HeroBanner.jsx` (same component, rendered on Order Confirmation page via layout) |
| Order Confirmation | `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `TheDrop.jsx` (same) |

**Recommended Fix (CI-6):**

Add descriptive `alt` attributes to the two images:

```jsx
// HeroBanner.jsx — before
<img src={HERO_IMAGE} />

// HeroBanner.jsx — after
<img src={HERO_IMAGE} alt="Model wearing a Winter Basics hoodie in warm autumn tones" />

// TheDrop.jsx — before
<img src={DROP_IMAGE} loading="lazy" />

// TheDrop.jsx — after
<img src={DROP_IMAGE} loading="lazy" alt="Plushie bag charms: Android bot, YouTube icon, and Super G figurines" />
```

**Rationale:**  
WCAG 1.1.1 requires a text alternative for all non-text content. The `alt` attribute is the correct mechanism for `<img>` elements. Descriptive alt text is preferred over an empty string (`alt=""`) for content images because these images communicate product information (the hero banner promotes "Winter Basics", the TheDrop image depicts the product being sold). Empty alt would mark them as decorative, which would skip them entirely for screen reader users and deprive them of product context.

---

### CI-7: AXE-ARIA-REQUIRED-ATTR

**Rule ID:** `AXE-ARIA-REQUIRED-ATTR`  
**Engine:** AXE  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical  
**Total occurrences:** 2  
**AXE Rule:** `aria-required-attr`  

**Description:**  
An element has `role="slider"` but is missing the attributes that the WAI-ARIA spec requires for that role: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. A `slider` without these attributes is non-functional from an assistive technology perspective — screen readers cannot announce the current position, range, or value.

**Affected elements:**

| Page | Selector | DOM Snippet | Source File |
|------|----------|-------------|-------------|
| Homepage | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `TheDrop.jsx` line 19 |
| Order Confirmation | `.drop-popularity-bar` | Same element (TheDrop renders on both pages) | `TheDrop.jsx` line 19 |

**Recommended Fix (CI-7):**

**Option A (preferred if the bar is purely decorative):** Remove `role="slider"` entirely and add `aria-hidden="true"`:
```jsx
// TheDrop.jsx
<div aria-hidden="true" className="drop-popularity-bar"></div>
```

**Option B (if the bar conveys meaningful information):** Add the required ARIA attributes with appropriate static values to describe the popularity level:
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={85}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext="Very popular"
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Rationale:**  
Option A is recommended because the element appears to be a visual progress bar decoration with no interactive functionality (no keyboard event handlers). Assigning `role="slider"` to a non-interactive decorative element is incorrect usage of ARIA. The correct approach for a read-only progress indicator would be `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, or simply `aria-hidden="true"` if it is decorative. Option B is provided for completeness but introduces false interactivity semantics unless actual keyboard controls are also added.

---

## 6. Remaining Non-Critical Issues (Serious)

These 26 issues were detected and classified as **Serious** by the scanner. They are not remediated in this cycle but must be addressed to achieve full WCAG 2.1 AA compliance.

---

### SI-1: AXE-COLOR-CONTRAST

**Rule ID:** `AXE-COLOR-CONTRAST`  
**Engine:** AXE  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Severity:** Serious  
**Total occurrences:** 18  
**AXE Rule:** `color-contrast`  

**Description:**  
Text elements do not meet the minimum contrast ratio of 4.5:1 for normal text (or 3:1 for large text, ≥18pt or ≥14pt bold) against their background. Affects users with low vision and color blindness.

**Affected elements by page:**

| Page | Selector | DOM Snippet | Notes |
|------|----------|-------------|-------|
| **Homepage** | `.hero-content > p` | `<p>Warm hues for cooler days</p>` | Light text on light hero background |
| **New Products** (×13) | `.filter-count` spans | `<span class="filter-count">(8)</span>`, `(4)`, `(12)`, etc. | Filter option counts rendered in low-contrast grey |
| **Product Detail** | `p:nth-child(4)` | Product description paragraph | Low-contrast description text |
| **Checkout (Basket)** | `.checkout-step:nth-child(3) > .step-label` | `<span class="step-label">Shipping & Payment</span>` | Step label in inactive state (greyed out) |
| **Checkout (Basket)** | `.summary-tax-note` | `<p class="summary-tax-note">Taxes calculated at next step</p>` | Light grey note text |
| **Order Confirmation** | `.hero-content > p` | `<p>Warm hues for cooler days</p>` | Same hero subtext as Homepage |

**Recommended Fix:**  
Increase the color value of low-contrast text in the respective CSS files to achieve at least 4.5:1 contrast ratio against the background. Tools such as the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) can verify specific color pairs. The filter count spans (`.filter-count`) and checkout step labels are the highest-priority sub-items because they affect the core product browsing and purchase flows.

---

### SI-2: AXE-HTML-HAS-LANG

**Rule ID:** `AXE-HTML-HAS-LANG`  
**Engine:** AXE  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Severity:** Serious  
**Total occurrences:** 6 (one per page — same root HTML file)  
**AXE Rule:** `html-has-lang`  

**Description:**  
The `<html>` element in `public/index.html` is missing the `lang` attribute. Without it, screen readers cannot determine the language of the page and will use their default language setting, leading to incorrect pronunciation of content for users whose screen reader language differs from the page language.

**Affected element (all pages share the same HTML shell):**

| Page | Selector | DOM Snippet | Source File |
|------|----------|-------------|-------------|
| All pages | `html` | `<html style="scroll-behavior: unset;">` (no `lang` attribute) | `public/index.html` line 3 |

**Recommended Fix:**  
Add `lang="en"` to the `<html>` element in `public/index.html`:
```html
<html lang="en">
```

---

### SI-3: AXE-VALID-LANG

**Rule ID:** `AXE-VALID-LANG`  
**Engine:** AXE  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Severity:** Serious  
**Total occurrences:** 2 (Homepage and Order Confirmation — same component)  
**AXE Rule:** `valid-lang`  

**Description:**  
A `<p>` element in `TheDrop.jsx` has `lang="zz"`. The BCP 47 language tag `"zz"` is not a recognized language code and is therefore invalid. Screen readers use the `lang` attribute to switch their language engine for the affected content; an invalid tag defeats this.

**Affected element:**

| Page | Selector | DOM Snippet | Source File |
|------|----------|-------------|-------------|
| Homepage | `p[lang="zz"]` | `<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>` | `TheDrop.jsx` line 21 |
| Order Confirmation | `p[lang="zz"]` | Same element (TheDrop renders on both pages) | `TheDrop.jsx` line 21 |

**Recommended Fix:**  
Change `lang="zz"` to a valid BCP 47 language tag. Since the text is in English, remove the attribute entirely or change it to `lang="en"`:
```jsx
// Before
<p lang="zz">Our brand-new…</p>

// After
<p>Our brand-new…</p>
```

---

## Appendix A — Issues per Source Component

The table below maps each source component to the critical issues it introduces, to help prioritise remediation effort:

| Source Component | Critical Issues Introduced | Rule(s) |
|-----------------|---------------------------|---------|
| `src/components/Header.jsx` | ~48 (8 per page × 6 pages) | NOT_FOCUSABLE, WRONG_SEMANTIC_ROLE, NO_DESCRIPTIVE_TEXT |
| `src/components/Footer.jsx` | ~24 (4 per page × 6 pages) | NOT_FOCUSABLE, WRONG_SEMANTIC_ROLE, NO_DESCRIPTIVE_TEXT |
| `src/components/CartModal.jsx` | ~6 (1 close btn × 5 pages it appears) | AXE-BUTTON-NAME |
| `src/components/WishlistModal.jsx` | ~6 (1 close btn × 6 pages) | AXE-BUTTON-NAME |
| `src/components/FilterSidebar.jsx` | ~24 (12 filter options × 2 rules) | NOT_FOCUSABLE, WRONG_SEMANTIC_ROLE |
| `src/pages/CheckoutPage.jsx` | ~4 (Continue + Back to Cart buttons) | NOT_FOCUSABLE, WRONG_SEMANTIC_ROLE |
| `src/components/FeaturedPair.jsx` | ~4 (2 h1 elements × 2 pages) | AXE-ARIA-VALID-ATTR-VALUE |
| `src/components/TheDrop.jsx` | ~4 (popularity bar × 2 pages) | NOT_FOCUSABLE, AXE-ARIA-REQUIRED-ATTR |
| `src/components/HeroBanner.jsx` | ~2 (1 img × 2 pages) | AXE-IMAGE-ALT |
| `src/components/TheDrop.jsx` | ~2 (1 img × 2 pages) | AXE-IMAGE-ALT |
| `src/pages/ProductPage.jsx` | 1 (ul aria-relevant) | AXE-ARIA-VALID-ATTR-VALUE |
| `public/index.html` | N/A (serious only) | AXE-HTML-HAS-LANG |

**Recommended remediation priority:**  
1. `Header.jsx` — highest impact per fix, resolves ~48 critical issues  
2. `Footer.jsx` — resolves ~24 critical issues  
3. `FilterSidebar.jsx` — resolves ~24 critical issues (New Products page only)  
4. `CartModal.jsx` / `WishlistModal.jsx` — resolves ~12 critical issues (add `aria-label`)  
5. `HeroBanner.jsx` / `TheDrop.jsx` — resolves 4 critical issues (add `alt` attributes)  
6. `FeaturedPair.jsx` / `ProductPage.jsx` — resolves 5 critical issues (fix ARIA values)  
7. `CheckoutPage.jsx` — resolves 4 critical issues (replace `<div>` buttons)  
8. `public/index.html` — resolves 6 serious issues (add `lang="en"`)

---

*Report generated by automated accessibility audit on 2026-03-18. Raw scan results available in `/workspace/a11y-results/` (JSON format).*
