# Accessibility Audit Report — Demo Website

**Generated:** 2026-03-23  
**Tool:** Evinced JS Playwright SDK (`@evinced/js-playwright-sdk`)  
**Auditor:** Automated Cloud Agent (Cursor)  
**Scope:** All 5 application routes, audited individually via headless Chromium  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository & Page Inventory](#2-repository--page-inventory)
3. [Audit Methodology](#3-audit-methodology)
4. [Critical Issues — Detailed Findings](#4-critical-issues--detailed-findings)
   - [CI-1: NOT_FOCUSABLE — Non-interactive elements acting as controls](#ci-1-not_focusable--non-interactive-elements-acting-as-controls)
   - [CI-2: WRONG_SEMANTIC_ROLE — Div-based interactive elements with wrong or missing role](#ci-2-wrong_semantic_role--div-based-interactive-elements-with-wrong-or-missing-role)
   - [CI-3: NO_DESCRIPTIVE_TEXT — Interactive elements with no accessible name](#ci-3-no_descriptive_text--interactive-elements-with-no-accessible-name)
   - [CI-4: AXE-BUTTON-NAME — Buttons missing an accessible name](#ci-4-axe-button-name--buttons-missing-an-accessible-name)
   - [CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA attribute values](#ci-5-axe-aria-valid-attr-value--invalid-aria-attribute-values)
   - [CI-6: AXE-IMAGE-ALT — Images missing alt text](#ci-6-axe-image-alt--images-missing-alt-text)
   - [CI-7: AXE-ARIA-REQUIRED-ATTR — ARIA role missing required attributes](#ci-7-axe-aria-required-attr--aria-role-missing-required-attributes)
5. [Non-Critical Issues (Serious Severity)](#5-non-critical-issues-serious-severity)
   - [NC-1: AXE-COLOR-CONTRAST — Insufficient color contrast](#nc-1-axe-color-contrast--insufficient-color-contrast)
   - [NC-2: AXE-HTML-HAS-LANG — Missing language attribute on html element](#nc-2-axe-html-has-lang--missing-language-attribute-on-html-element)
   - [NC-3: AXE-VALID-LANG — Invalid BCP 47 language tag](#nc-3-axe-valid-lang--invalid-bcp-47-language-tag)
6. [Issue Count Summary by Page](#6-issue-count-summary-by-page)
7. [WCAG Reference Cross-index](#7-wcag-reference-cross-index)

---

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| Pages audited | 5 |
| Total issues detected | 164 |
| **Critical severity** | **139** |
| Serious severity | 25 |
| Distinct critical issue types | 7 |
| Distinct serious issue types | 3 |

The repository contains a React single-page application (SPA) with five distinct routes. The audit uncovered **139 critical-severity accessibility violations** spanning all five pages. The predominant patterns — `<div>` elements acting as interactive controls without keyboard focus support, semantic role declarations, or accessible names — indicate a systemic architectural problem that affects the Header, Footer, FilterSidebar, CartModal, PopularSection, and multiple other components simultaneously.

**Key risk areas:**

- Screen reader users cannot interact with the wishlist button, search icon, language selector, or filter checkboxes because these are rendered as `<div>` elements with no `role`, `tabindex`, or accessible label.
- Keyboard-only users cannot reach or activate any of those same controls.
- Both modal close buttons (Cart and Wishlist) have no accessible name, rendering them opaque to assistive technology.
- Two images rendered on the homepage and order-confirmation page are missing `alt` attributes entirely, meaning screen readers will announce the raw filename.
- An ARIA slider widget (`role="slider"`) rendered on two pages is missing all three required ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`), making it non-functional for AT users.

---

## 2. Repository & Page Inventory

### Technology Stack

| Item | Detail |
|------|--------|
| Framework | React 18 (JSX) |
| Router | React Router v7 (`BrowserRouter`) |
| Build tool | Webpack 5 |
| Styling | CSS Modules + global CSS |
| Entry point | `src/index.js` → `src/components/App.jsx` |
| HTML shell | `public/index.html` |

### Application Routes

| Page Name | Route | Entry Component | Source File |
|-----------|-------|-----------------|-------------|
| Homepage | `/` | `<HomePage>` | `src/pages/HomePage.jsx` |
| Products — New | `/shop/new` | `<NewPage>` | `src/pages/NewPage.jsx` |
| Product Detail | `/product/:id` | `<ProductPage>` | `src/pages/ProductPage.jsx` |
| Checkout | `/checkout` | `<CheckoutPage>` | `src/pages/CheckoutPage.jsx` |
| Order Confirmation | `/order-confirmation` | `<OrderConfirmationPage>` | `src/pages/OrderConfirmationPage.jsx` |

### Shared Components (present on every page)

| Component | File | Relevant Findings |
|-----------|------|-------------------|
| `<Header>` | `src/components/Header.jsx` | Wishlist div, search icon div, login icon div, language flag div — all non-focusable |
| `<Footer>` | `src/components/Footer.jsx` | Sustainability & FAQs nav items implemented as `<div>` |
| `<CartModal>` | `src/components/CartModal.jsx` | Close button with no accessible name |
| `<WishlistModal>` | `src/components/WishlistModal.jsx` | Close button with no accessible name |

### Page-specific Components

| Component | Pages Rendered | Relevant Findings |
|-----------|---------------|-------------------|
| `<HeroBanner>` | Homepage, Order Confirmation | Hero image missing `alt` |
| `<TheDrop>` | Homepage, Order Confirmation | Drop image missing `alt`; slider missing required ARIA attrs; invalid `lang="zz"` |
| `<FeaturedPair>` | Homepage, Order Confirmation | `aria-expanded="yes"` on `<h1>` elements |
| `<PopularSection>` | Homepage, Order Confirmation | `<div class="shop-link">` — no role, no tabindex, text aria-hidden |
| `<FilterSidebar>` | Products (New) | Filter option `<div>` — no role, no tabindex (×12 options) |
| `<ProductPage>` | Product Detail | `aria-relevant="changes"` is invalid |

---

## 3. Audit Methodology

### Tool

Evinced JS Playwright SDK v2.44.0 (`@evinced/js-playwright-sdk`), authenticated via Evinced Service Account (Service ID: `922eff48-df42-cd03-0d83-8f1b7efc2f5a`). The Evinced SDK provides both its proprietary pattern-detection engine (NOT_FOCUSABLE, WRONG_SEMANTIC_ROLE, NO_DESCRIPTIVE_TEXT) and axe-core rule integration (AXE-* prefixed rules).

### Process

1. Production build of the React SPA created (`npx webpack --mode production`).
2. Static server started on `http://localhost:3000` (`npx serve dist --single`).
3. Playwright test spec (`tests/e2e/specs/per-page-a11y-audit.spec.ts`) navigated to each of the five routes in headless Chromium at 1280×800.
4. `evAnalyze()` called on each page after waiting for the primary content selector.
5. Raw JSON results written to `tests/e2e/test-results/page-<name>.json`.
6. Issues grouped by `severity.id` and `type.id` for classification.

### Severity Classification

| Severity | Definition |
|----------|------------|
| **CRITICAL** | Barrier that completely blocks access for assistive technology or keyboard users. Violates WCAG 2.1 Level A. |
| **SERIOUS** | Significant difficulty for AT/keyboard users; degrades experience substantially. Typically WCAG 2.1 Level AA. |

---

## 4. Critical Issues — Detailed Findings

---

### CI-1: NOT_FOCUSABLE — Non-interactive elements acting as controls

**Evinced Rule ID:** `NOT_FOCUSABLE`  
**WCAG:** 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A)  
**Total instances:** 50  
**Affected pages:** All 5 pages  

#### Description

Interactive controls — elements that respond to `onClick` and behave as buttons or links — are implemented as `<div>` elements. Because a `<div>` is not in the browser's tab order by default, keyboard users cannot reach these elements using Tab navigation. Screen reader users in "browse mode" also cannot activate them, and virtual cursor interaction is unreliable without a proper ARIA role.

#### Affected Elements by Page

**Homepage & Order Confirmation** (10 instances each):

| Selector | Component | Element description |
|----------|-----------|---------------------|
| `.wishlist-btn` | `Header.jsx` line 131 | Wishlist icon button (opens wishlist drawer) |
| `.icon-btn:nth-child(2)` | `Header.jsx` line 140 | Search icon control |
| `.icon-btn:nth-child(4)` | `Header.jsx` line 156 | Login/account icon control |
| `.flag-group` | `Header.jsx` line 161 | Language/currency selector |
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `PopularSection.jsx` | "Shop Now" link for product card 1 |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `PopularSection.jsx` | "Shop Now" link for product card 2 |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `PopularSection.jsx` | "Shop Now" link for product card 3 |
| `li:nth-child(3) > .footer-nav-item` | `Footer.jsx` | "Sustainability" footer link |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `Footer.jsx` | "FAQs" footer link |
| `.drop-popularity-bar` | `TheDrop.jsx` | Popularity slider widget |

**Products (New)** (18 instances):

| Selector | Component | Element description |
|----------|-----------|---------------------|
| `.wishlist-btn` | `Header.jsx` | Wishlist icon button |
| `.icon-btn:nth-child(2)` | `Header.jsx` | Search icon control |
| `.icon-btn:nth-child(4)` | `Header.jsx` | Login/account icon control |
| `.flag-group` | `Header.jsx` | Language/currency selector |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1–4)` | `FilterSidebar.jsx` | Price filter checkboxes (4 options) |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1–4)` | `FilterSidebar.jsx` | Size filter checkboxes (4 options) |
| `.filter-option:nth-child(5)` | `FilterSidebar.jsx` | Size filter 5th option |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1–3)` | `FilterSidebar.jsx` | Brand filter checkboxes (3 options) |
| `li:nth-child(3) > .footer-nav-item` | `Footer.jsx` | "Sustainability" footer link |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `Footer.jsx` | "FAQs" footer link |

**Product Detail & Checkout** (6 instances each):

| Selector | Component | Element description |
|----------|-----------|---------------------|
| `.wishlist-btn` | `Header.jsx` | Wishlist icon button |
| `.icon-btn:nth-child(2)` | `Header.jsx` | Search icon control |
| `.icon-btn:nth-child(4)` | `Header.jsx` | Login/account icon control |
| `.flag-group` | `Header.jsx` | Language/currency selector |
| `li:nth-child(3) > .footer-nav-item` | `Footer.jsx` | "Sustainability" footer link |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `Footer.jsx` | "FAQs" footer link |

#### Recommended Fix

**Header icon buttons (`Header.jsx` lines 131, 140, 156):** Convert all `<div className="icon-btn ...">` and `<div className="wishlist-btn">` to `<button>` elements. Native `<button>` elements are natively focusable, receive keyboard events automatically, and convey the correct interactive role to screen readers with zero additional ARIA.

```jsx
// Before
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
```

**Language/currency selector (`.flag-group`, `Header.jsx` line 161):** Convert to `<button>` and add an `aria-label` describing the action (e.g., `"Select language or currency"`).

**`PopularSection.jsx` shop-link divs:** Replace `<div className="shop-link" onClick={...}>` with `<Link to={product.shopHref}>` (React Router). This gives keyboard access and the correct `link` semantics without needing any ARIA.

**`FilterSidebar.jsx` filter option divs:** Convert each `<div className="filter-option">` to a `<label>` wrapping a real `<input type="checkbox">`. This provides native keyboard interaction, focus management, and screen reader announcement of checked state — all without custom ARIA.

**`Footer.jsx` footer nav items:** Replace `<div className="footer-nav-item">` with `<a href="...">` or `<button>` as appropriate. For navigational links use `<a>`; for in-page actions use `<button>`.

**`TheDrop.jsx` `.drop-popularity-bar`:** See also CI-7. If this element is truly a non-interactive display widget, remove `role="slider"` entirely and the focusability violation will also be resolved. If interactivity is intended, convert to a proper `<input type="range">`.

#### Why this remediation approach

The WCAG keyboard access requirement (SC 2.1.1) mandates that all functionality is operable without a mouse. The most reliable way to satisfy this is to use native HTML interactive elements (`<button>`, `<a>`, `<input>`) rather than adding `tabindex` and ARIA to `<div>` elements. Native elements receive browser-managed focus, fire keyboard events (`Enter`, `Space`) automatically, and are correctly announced by all major screen readers without additional ARIA configuration. The MDN "First Rule of ARIA Use" states: use native HTML elements whenever possible.

---

### CI-2: WRONG_SEMANTIC_ROLE — Div-based interactive elements with wrong or missing role

**Evinced Rule ID:** `WRONG_SEMANTIC_ROLE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total instances:** 48  
**Affected pages:** All 5 pages  

#### Description

The same `<div>` elements that cannot receive focus (CI-1) also carry no ARIA `role` attribute. Screen readers identify element type by its implicit or explicit ARIA role. A `<div>` has the implicit role of `generic` — it conveys no interactive semantics. Users exploring with a screen reader will not be told that these elements are buttons or links, and many screen reader modes (forms mode, application mode) will skip them entirely.

#### Affected Elements

The set of elements is identical to CI-1 above. Both CI-1 and CI-2 are raised for each `<div>`-as-interactive-control instance because they represent two distinct barriers: missing focus and missing role.

**Breakdown by page:**

| Page | Instances |
|------|-----------|
| Homepage | 9 |
| Products (New) | 18 |
| Product Detail | 6 |
| Checkout | 6 |
| Order Confirmation | 9 |
| **Total** | **48** |

**Elements in scope (all pages):**

| Element | Implicit role | Required role |
|---------|--------------|---------------|
| `.wishlist-btn` (`<div>`) | generic | button |
| `.icon-btn:nth-child(2)` (`<div>`) | generic | button |
| `.icon-btn:nth-child(4)` (`<div>`) | generic | button |
| `.flag-group` (`<div>`) | generic | button |
| `.shop-link` (`<div>`) | generic | link |
| `.filter-option` (`<div>`) | generic | checkbox (or use native `<input type="checkbox">`) |
| `.footer-nav-item` (`<div>`) | generic | link or button |

#### Recommended Fix

The recommended fix is identical to CI-1: replace `<div>` elements with the corresponding native HTML interactive elements. This resolves both CI-1 and CI-2 simultaneously.

- Controls that trigger an action with no navigation → `<button>`
- Controls that navigate to a new URL → `<a href>` or React Router `<Link>`
- Controls that toggle a binary state (filter checkboxes) → `<input type="checkbox">` inside `<label>`

Only in cases where converting to native HTML is genuinely impractical should `role="button"` / `role="link"` / `role="checkbox"` plus `tabindex="0"` be used as a fallback, combined with explicit keyboard event handlers for `Enter` and `Space`.

#### Why this remediation approach

WCAG 4.1.2 requires that the role of every UI component be programmatically determinable. The ARIA specification's "First Rule" discourages adding ARIA roles to non-semantic elements when an equivalent native element exists. Native elements carry built-in roles that are reliably communicated across all browser/AT combinations, whereas ARIA-decorated `<div>` elements depend on correct implementation of keyboard handlers, focus management, and role semantics that are easy to get wrong or incomplete.

---

### CI-3: NO_DESCRIPTIVE_TEXT — Interactive elements with no accessible name

**Evinced Rule ID:** `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total instances:** 21  
**Affected pages:** All 5 pages  

#### Description

Several interactive elements have no accessible name at all. Without an accessible name, screen readers will announce the element's role with no label (e.g., "button"), leaving users unable to identify the element's purpose. This affects icon-only controls whose visible label text has been hidden from assistive technology via `aria-hidden="true"`, and navigation items whose text is similarly hidden.

#### Affected Elements by Page

**All pages — Header icon buttons** (2 instances per page, 10 total):

| Selector | Component | Line | Problem |
|----------|-----------|------|---------|
| `.icon-btn:nth-child(2)` | `Header.jsx` | 140 | Search icon `<div>`. Its inner SVG has no `aria-label`; there is no visible text label. |
| `.icon-btn:nth-child(4)` | `Header.jsx` | 156 | Login/account icon `<div>`. Same pattern — SVG icon only, no accessible name. |

**Homepage & Order Confirmation — shop-link elements** (3 instances per page, 6 total):

| Selector | Component | Problem |
|----------|-----------|---------|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `PopularSection.jsx` | Text "Shop Now" wrapped in `<span aria-hidden="true">` — hidden from AT |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `PopularSection.jsx` | Same pattern |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `PopularSection.jsx` | Same pattern |

**All pages — Footer FAQs link** (1 instance per page, 5 total):

| Selector | Component | Problem |
|----------|-----------|---------|
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `Footer.jsx` | Text "FAQs" wrapped in `<span aria-hidden="true">` — hidden from AT; `<div>` has no aria-label |

#### Recommended Fix

**Header icon buttons:** Add `aria-label` describing the action on the converted `<button>` elements:
```jsx
// Search
<button className="icon-btn" aria-label="Search" onClick={openSearch}>
  <svg aria-hidden="true">...</svg>
</button>

// Login/account
<button className="icon-btn" aria-label="My account" onClick={openAccount}>
  <svg aria-hidden="true">...</svg>
</button>
```

**PopularSection shop-links:** Replace the `<div>` with a `<Link>` that carries meaningful text visible to all users (or at minimum visible to AT):
```jsx
// Before
<div className="shop-link" onClick={() => navigate(product.shopHref)}>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// After
<Link to={product.shopHref} className="shop-link">
  {product.shopLabel}
</Link>
```

**Footer FAQs:** Remove `aria-hidden` from the text span (or provide an `aria-label` on the converted `<a>` or `<button>` element):
```jsx
// Before
<div className="footer-nav-item" onClick={() => {}}><span aria-hidden="true">FAQs</span></div>

// After
<a href="#faqs" className="footer-nav-item">FAQs</a>
```

#### Why this remediation approach

WCAG 4.1.2 requires that the accessible name of every interactive component be programmatically determinable. The recommended approach (descriptive visible text for most controls; `aria-label` for icon-only controls where adding visible text would compromise the visual design) follows the WCAG accessible name calculation algorithm. Using visible text wherever possible is preferred because it benefits all users — sighted, screen reader, voice control (Dragon NaturallySpeaking), and switch access users alike. The `aria-hidden="true"` pattern on text content is a direct WCAG failure unless the element carrying it is truly decorative.

---

### CI-4: AXE-BUTTON-NAME — Buttons missing an accessible name

**Evinced Rule ID:** `AXE-BUTTON-NAME` (axe-core rule: `button-name`)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total instances:** 9  
**Affected pages:** All 5 pages (CartModal close button appears on 4 pages; Checkout has 1 separate instance; WishlistModal close button appears on all 5)  

#### Description

These are native `<button>` elements (correct HTML), but they have no accessible name. The buttons render only an SVG icon with `aria-hidden="true"`. Without `aria-label`, `aria-labelledby`, or visible text content, screen readers announce them as simply "button" with no context.

#### Affected Elements by Page

**CartModal close button** (`CartModal.jsx` line ~55):

| Selector | Pages affected | Description |
|----------|---------------|-------------|
| `#cart-modal > div:nth-child(1) > button` | Homepage, Products (New), Product Detail, Order Confirmation | Close (×) button in the Cart drawer header. Icon-only `<button>` with `aria-hidden` SVG. No `aria-label`. |

**WishlistModal close button** (`WishlistModal.jsx`):

| Selector | Pages affected | Description |
|----------|---------------|-------------|
| `div[role="dialog"] > div:nth-child(1) > button` | All 5 pages | Close (×) button in the Wishlist drawer header. Same pattern — icon-only with no accessible name. |

**Checkout page extra instance:**

| Selector | Pages affected | Description |
|----------|---------------|-------------|
| `div:nth-child(1) > button` | Checkout only | An additional close button (possibly a section or panel close button) rendered on the checkout page without an accessible name. |

#### Recommended Fix

Add `aria-label="Close cart"` / `aria-label="Close wishlist"` to each close button:

```jsx
// CartModal.jsx — close button
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg aria-hidden="true">...</svg>
</button>

// WishlistModal.jsx — close button
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true">...</svg>
</button>
```

#### Why this remediation approach

`aria-label` is the standard mechanism for providing an accessible name to an icon-only button when adding visible text would break the visual design. The value should describe the action performed (e.g., "Close cart" rather than just "Close") so that users who have multiple dialogs open can distinguish between them. This approach is endorsed by WAI-ARIA Authoring Practices Guide (APG) for dialog close buttons.

---

### CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA attribute values

**Evinced Rule ID:** `AXE-ARIA-VALID-ATTR-VALUE` (axe-core rule: `aria-valid-attr-value`)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total instances:** 5  
**Affected pages:** Homepage (2), Order Confirmation (2), Product Detail (1)  

#### Description

Three distinct ARIA attribute values violate the ARIA specification:

1. `aria-expanded="yes"` — The `aria-expanded` attribute is a boolean property. Valid values are `"true"` and `"false"` only. The string `"yes"` is not a valid boolean ARIA value; browsers and screen readers will ignore or misinterpret this attribute.

2. `aria-relevant="changes"` — The `aria-relevant` attribute accepts a space-separated list of tokens from the set `{ additions, removals, text, all }`. The token `"changes"` is not in this set and is therefore invalid. Screen readers will either ignore it or raise an error.

#### Affected Elements

**`aria-expanded="yes"` — FeaturedPair component (`FeaturedPair.jsx` line ~45):**

| Selector | Pages | Source |
|----------|-------|--------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | Homepage, Order Confirmation | `<h1 aria-expanded="yes">` — ARIA boolean must be `"true"` or `"false"` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | Homepage, Order Confirmation | Same element in second featured card |

**`aria-relevant="changes"` — ProductPage component (`ProductPage.jsx` line ~143–146):**

| Selector | Pages | Source |
|----------|-------|--------|
| `ul[aria-relevant="changes"]` | Product Detail | `aria-relevant="changes"` — `"changes"` is not a valid token |

#### Recommended Fix

**`aria-expanded="yes"` on `<h1>` elements (`FeaturedPair.jsx`):**

`aria-expanded` is semantically incorrect on a heading (`<h1>`) unless the heading is acting as a disclosure toggle button. Given the context (a static card heading), the attribute should be removed entirely:

```jsx
// Before
<h1 aria-expanded="yes">{item.title}</h1>

// After — use appropriate heading level; aria-expanded removed
<h3>{item.title}</h3>
```

Note: Heading level `<h1>` is also inappropriate inside a section card (heading hierarchy violation), but that is a separate issue.

**`aria-relevant="changes"` on `<ul>` (`ProductPage.jsx`):**

Replace with a valid token or remove the attribute if it is not needed for a live region:

```jsx
// Before
<ul aria-relevant="changes" ...>

// After — use valid token; typical live-region relevant value is "additions text"
<ul aria-live="polite" aria-relevant="additions text" ...>
// or simply remove aria-relevant if the list is not a live region:
<ul ...>
```

#### Why this remediation approach

The ARIA specification defines strict enumerated value sets for state and property attributes. Screen readers and browsers perform attribute validation; invalid values produce unpredictable behavior that varies across AT/browser combinations. For `aria-expanded`, the correct value must be the literal string `"true"` or `"false"` (matching the JavaScript boolean converted to a string). For `aria-relevant`, only the ARIA-defined token set is valid. Removing the attribute when it serves no functional purpose is the safest approach because it eliminates the invalid value without introducing a new dependency.

---

### CI-6: AXE-IMAGE-ALT — Images missing alt text

**Evinced Rule ID:** `AXE-IMAGE-ALT` (axe-core rule: `image-alt`)  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Total instances:** 4  
**Affected pages:** Homepage (2), Order Confirmation (2)  

#### Description

Two `<img>` elements across two components are missing the `alt` attribute entirely. When `alt` is absent, screen readers typically announce the image's `src` URL or filename instead, which is meaningless to users. For informative images, this means the content conveyed by the image is completely inaccessible.

#### Affected Elements

**HeroBanner.jsx — hero image:**

| Selector | Pages | File | Line |
|----------|-------|------|------|
| `img[src$="New_Tees.png"]` | Homepage, Order Confirmation | `src/components/HeroBanner.jsx` | 18 | 

The source code comment confirms this was intentionally removed: `{/* A11Y-AXE image-alt: <img> is missing an alt attribute */}`. The image is the primary visual for the hero banner section (`aria-label="Featured promotion"`), making it informative content.

**TheDrop.jsx — drop promotion image:**

| Selector | Pages | File | Line |
|----------|-------|------|------|
| `img[src$="2bags_charms1.png"]` | Homepage, Order Confirmation | `src/components/TheDrop.jsx` | 10 |

The source code comment also flags this as intentional. The image illustrates the "Plushie bag charms" promotion described in the surrounding text.

#### Recommended Fix

**`HeroBanner.jsx`:**

```jsx
// Before
<img src={HERO_IMAGE} />

// After
<img src={HERO_IMAGE} alt="New tees collection — featured promotion" />
```

**`TheDrop.jsx`:**

```jsx
// Before
<img src={DROP_IMAGE} loading="lazy" />

// After
<img src={DROP_IMAGE} loading="lazy" alt="Limited edition plushie bag charms: Android bot, YouTube icon, and Super G" />
```

If either image is purely decorative (i.e., its content is fully conveyed by surrounding text), use an explicit empty `alt=""` to signal this to screen readers:

```jsx
<img src={DROP_IMAGE} loading="lazy" alt="" role="presentation" />
```

#### Why this remediation approach

WCAG 1.1.1 mandates that all non-text content has a text alternative. The `alt` attribute is the standard mechanism for this on `<img>` elements. An empty `alt=""` tells screen readers to skip the image (appropriate for decorative images); a descriptive string conveys the image's information to users who cannot see it. The recommended alt text descriptions are based on the visual content of the images and the surrounding section context (`aria-labelledby="drop-heading"` in TheDrop). For the hero banner, where the image is the primary visual of a promotional section, a descriptive alt is mandatory.

---

### CI-7: AXE-ARIA-REQUIRED-ATTR — ARIA role missing required attributes

**Evinced Rule ID:** `AXE-ARIA-REQUIRED-ATTR` (axe-core rule: `aria-required-attr`)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total instances:** 2  
**Affected pages:** Homepage (1), Order Confirmation (1)  

#### Description

The `<div role="slider">` element in `TheDrop.jsx` declares the ARIA `slider` role but omits all three attributes that are required for that role: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these attributes, the slider widget is completely non-functional for screen reader users — they cannot determine the current value, the minimum, or the maximum of the control.

#### Affected Elements

| Selector | Pages | File | Line |
|----------|-------|------|------|
| `.drop-popularity-bar` | Homepage, Order Confirmation | `src/components/TheDrop.jsx` | 14 |

Source code: `<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>`

The element has neither interactive behavior (no event handlers) nor the required ARIA state attributes.

#### Recommended Fix

**If the bar is a static visual indicator (not interactive):** Remove `role="slider"` entirely. A static popularity bar has no user-manipulable value, so `role="slider"` is semantically wrong. Use `role="img"` with a descriptive `aria-label`, or `role="meter"` with the required `aria-valuenow`, `aria-valuemin`, `aria-valuemax`:

```jsx
// Static display — use role="meter" or role="img"
<div
  role="meter"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

**If the bar should be an interactive slider:** Add all required attributes and keyboard event handlers:

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

#### Why this remediation approach

The ARIA specification mandates that when a role is declared, all required state and property attributes for that role must also be present. For `role="slider"`, the three numeric attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) are required because they are the only way a screen reader can communicate the current and valid range of the control to users. Given the absence of any interactive behavior in the current implementation, replacing `role="slider"` with `role="meter"` is the most semantically accurate choice for a read-only progress/popularity indicator.

---

## 5. Non-Critical Issues (Serious Severity)

The following 25 issues were classified as **Serious** severity. They do not completely block AT access but significantly degrade the experience for users with disabilities. No remediations were applied; they are documented here for future prioritization.

---

### NC-1: AXE-COLOR-CONTRAST — Insufficient color contrast

**Evinced Rule ID:** `AXE-COLOR-CONTRAST` (axe-core rule: `color-contrast`)  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Total instances:** 18  
**Affected pages:** Products (New): 13, Checkout: 2, Homepage: 1, Order Confirmation: 1, Product Detail: 1  

#### Description

Text elements fail the WCAG 1.4.3 minimum contrast ratio requirements (4.5:1 for normal text, 3:1 for large text). Users with low vision, color vision deficiency, or who view the site in challenging lighting conditions will have difficulty reading this text.

#### Affected Elements

**Products (New) page — Filter count spans and products-found text** (13 instances):

| Selector | Description |
|----------|-------------|
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | Price filter count badge (4 instances) |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | Size filter count badge (4 instances) |
| `.filter-option:nth-child(5) > .filter-option-label > .filter-count` | Size 5th option count badge |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | Brand filter count badge (3 instances) |
| `.products-found` | "X products found" text above the grid |

**Checkout page** (2 instances):

| Selector | Description |
|----------|-------------|
| `.checkout-step:nth-child(3) > .step-label` | Step 3 label text in the checkout progress bar |
| `.checkout-empty > p` | Empty checkout message paragraph |

**Homepage & Order Confirmation** (1 instance each):

| Selector | Description |
|----------|-------------|
| `.hero-content > p` | Hero banner subtitle paragraph |

**Product Detail** (1 instance):

| Selector | Description |
|----------|-------------|
| `p:nth-child(4)` | Product description paragraph |

#### Recommended Remediation (not applied)

Increase the contrast of affected text/background color combinations to meet WCAG 1.4.3 (minimum 4.5:1 for body text, 3:1 for large text ≥ 18pt or ≥ 14pt bold). Use a tool such as the WebAIM Contrast Checker or browser DevTools to identify the specific color values and select compliant replacements. For filter count badges (`.filter-count`), increase the text color darkness or use a higher-contrast background.

---

### NC-2: AXE-HTML-HAS-LANG — Missing language attribute on html element

**Evinced Rule ID:** `AXE-HTML-HAS-LANG` (axe-core rule: `html-has-lang`)  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Total instances:** 5 (one per page — same root `public/index.html` renders all routes)  
**Affected pages:** All 5 pages  

#### Description

The `<html>` element in `public/index.html` has no `lang` attribute. Screen readers use the `lang` attribute to select the appropriate text-to-speech voice and pronunciation rules. Without it, users who speak languages other than the browser's default may experience garbled pronunciation, and voice control users may experience reduced accuracy.

#### Source

`public/index.html` — `<html>` (line 1):
```html
<!-- Before -->
<html>

<!-- After -->
<html lang="en">
```

#### Recommended Remediation (not applied)

Add `lang="en"` (or the appropriate BCP 47 language tag) to the `<html>` element in `public/index.html`. This single change resolves all 5 page instances simultaneously.

---

### NC-3: AXE-VALID-LANG — Invalid BCP 47 language tag

**Evinced Rule ID:** `AXE-VALID-LANG` (axe-core rule: `valid-lang`)  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Total instances:** 2  
**Affected pages:** Homepage (1), Order Confirmation (1)  

#### Description

The `<p lang="zz">` element in `TheDrop.jsx` uses the language code `"zz"`, which is not a valid BCP 47 language tag. Screen readers rely on the `lang` attribute to switch pronunciation engines; an invalid code means they cannot correctly apply the intended language rules. In this case, the paragraph appears to contain English text (the promotional product description), so `lang="zz"` is both invalid and semantically wrong.

#### Affected Element

| Selector | Pages | File | Line |
|----------|-------|------|------|
| `p[lang="zz"]` | Homepage, Order Confirmation | `src/components/TheDrop.jsx` | 18 |

Source code: `<p lang="zz">Our brand-new, limited-edition plushie bag charms...</p>`

#### Recommended Remediation (not applied)

Remove the `lang="zz"` attribute from the paragraph, or replace it with the correct tag:

```jsx
// If the text is English (as it appears)
<p>Our brand-new, limited-edition plushie bag charms...</p>

// If the text is intentionally in a specific language, use the correct BCP 47 tag
<p lang="fr">...</p>
```

---

## 6. Issue Count Summary by Page

### Per-page breakdown

| Page | Route | Critical | Serious | Total |
|------|-------|----------|---------|-------|
| Homepage | `/` | 32 | 3 | **35** |
| Products (New) | `/shop/new` | 41 | 14 | **55** |
| Product Detail | `/product/1` | 18 | 2 | **20** |
| Checkout | `/checkout` | 16 | 3 | **19** |
| Order Confirmation | `/order-confirmation` | 32 | 3 | **35** |
| **Total** | | **139** | **25** | **164** |

### Critical issues by type and page

| Issue Type | Homepage | Products | Product Detail | Checkout | Order Confirmation | **Total** |
|------------|----------|----------|---------------|----------|--------------------|-----------|
| NOT_FOCUSABLE | 10 | 18 | 6 | 6 | 10 | **50** |
| WRONG_SEMANTIC_ROLE | 9 | 18 | 6 | 6 | 9 | **48** |
| NO_DESCRIPTIVE_TEXT | 6 | 3 | 3 | 3 | 6 | **21** |
| AXE-BUTTON-NAME | 2 | 2 | 2 | 1 | 2 | **9** |
| AXE-ARIA-VALID-ATTR-VALUE | 2 | 0 | 1 | 0 | 2 | **5** |
| AXE-IMAGE-ALT | 2 | 0 | 0 | 0 | 2 | **4** |
| AXE-ARIA-REQUIRED-ATTR | 1 | 0 | 0 | 0 | 1 | **2** |
| **Total** | **32** | **41** | **18** | **16** | **32** | **139** |

### Serious issues by type and page

| Issue Type | Homepage | Products | Product Detail | Checkout | Order Confirmation | **Total** |
|------------|----------|----------|---------------|----------|--------------------|-----------|
| AXE-COLOR-CONTRAST | 1 | 13 | 1 | 2 | 1 | **18** |
| AXE-HTML-HAS-LANG | 1 | 1 | 1 | 1 | 1 | **5** |
| AXE-VALID-LANG | 1 | 0 | 0 | 0 | 1 | **2** |
| **Total** | **3** | **14** | **2** | **3** | **3** | **25** |

---

## 7. WCAG Reference Cross-index

| WCAG Success Criterion | Level | Issue IDs |
|------------------------|-------|-----------|
| 1.1.1 Non-text Content | A | CI-6 |
| 1.4.3 Contrast (Minimum) | AA | NC-1 |
| 2.1.1 Keyboard | A | CI-1, CI-2 |
| 3.1.1 Language of Page | A | NC-2 |
| 3.1.2 Language of Parts | AA | NC-3 |
| 4.1.2 Name, Role, Value | A | CI-1, CI-2, CI-3, CI-4, CI-5, CI-7 |

### Source files requiring changes (for future remediation reference)

| Source File | Critical Issues Triggered | Serious Issues Triggered |
|-------------|--------------------------|--------------------------|
| `src/components/Header.jsx` | CI-1, CI-2, CI-3 (wishlist-btn, icon-btns, flag-group) | — |
| `src/components/Footer.jsx` | CI-1, CI-2, CI-3 (footer-nav-items) | — |
| `src/components/CartModal.jsx` | CI-4 (close button) | — |
| `src/components/WishlistModal.jsx` | CI-4 (close button) | — |
| `src/components/FeaturedPair.jsx` | CI-5 (aria-expanded="yes") | — |
| `src/components/TheDrop.jsx` | CI-6 (image alt), CI-7 (slider required attrs) | NC-3 (lang="zz") |
| `src/components/HeroBanner.jsx` | CI-6 (image alt) | — |
| `src/components/PopularSection.jsx` | CI-1, CI-2, CI-3 (shop-link divs) | — |
| `src/components/FilterSidebar.jsx` | CI-1, CI-2 (filter-option divs) | NC-1 (filter-count contrast) |
| `src/pages/ProductPage.jsx` | CI-5 (aria-relevant="changes") | NC-1 (productDescription contrast) |
| `src/pages/CheckoutPage.jsx` | — | NC-1 (step-label, checkout-empty contrast) |
| `public/index.html` | — | NC-2 (html lang attribute) |

---

*End of Report*
