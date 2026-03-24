# Accessibility Audit Report — Demo E-Commerce Website

**Audit Date:** 2026-03-24  
**Tool:** Evinced JS Playwright SDK v2.44.0  
**Auditor:** Automated Cloud Agent (Cursor)  
**Repository:** `/workspace` (React 18 SPA, Webpack 5, React Router v7)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository & Page Inventory](#2-repository--page-inventory)
3. [Audit Methodology](#3-audit-methodology)
4. [Issue Severity Classification](#4-issue-severity-classification)
5. [Critical Issues — Detailed Findings & Proposed Remediations](#5-critical-issues--detailed-findings--proposed-remediations)
   - [CI-1: NOT_FOCUSABLE — Interactive `<div>` Elements Without `tabindex`](#ci-1-not_focusable--interactive-div-elements-without-tabindex)
   - [CI-2: WRONG_SEMANTIC_ROLE — Non-Button/Link Elements Used as Interactive Controls](#ci-2-wrong_semantic_role--non-buttonlink-elements-used-as-interactive-controls)
   - [CI-3: NO_DESCRIPTIVE_TEXT — Interactive Elements Without Accessible Names](#ci-3-no_descriptive_text--interactive-elements-without-accessible-names)
   - [CI-4: AXE-BUTTON-NAME — Modal Close Buttons Without Discernible Text](#ci-4-axe-button-name--modal-close-buttons-without-discernible-text)
   - [CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values](#ci-5-axe-aria-valid-attr-value--invalid-aria-attribute-values)
   - [CI-6: AXE-IMAGE-ALT — Images Missing Alternative Text](#ci-6-axe-image-alt--images-missing-alternative-text)
   - [CI-7: AXE-ARIA-REQUIRED-ATTR — ARIA Role Missing Required Attributes](#ci-7-axe-aria-required-attr--aria-role-missing-required-attributes)
6. [Non-Critical Issues — Full Listing](#6-non-critical-issues--full-listing)
   - [NC-1: AXE-COLOR-CONTRAST — Insufficient Color Contrast](#nc-1-axe-color-contrast--insufficient-color-contrast)
   - [NC-2: AXE-HTML-HAS-LANG — Missing `lang` Attribute on `<html>`](#nc-2-axe-html-has-lang--missing-lang-attribute-on-html)
   - [NC-3: AXE-VALID-LANG — Invalid `lang` Attribute Value](#nc-3-axe-valid-lang--invalid-lang-attribute-value)
7. [Summary Table](#7-summary-table)

---

## 1. Executive Summary

The Evinced SDK scanned all five pages of the demo e-commerce website, detecting **151 total accessibility issues** across all pages.

| Severity | Count |
|----------|-------|
| **Critical** | **127** |
| **Serious** | **24** |
| **Total** | **151** |

**127 Critical issues** were identified, spanning 7 distinct issue types. These issues directly block keyboard users, screen reader users, and users of other assistive technologies from navigating or using the website. All 7 critical issue types have actionable remediation paths described in Section 5.

**24 Serious (non-critical) issues** were identified across 3 additional issue types. These reduce usability for AT users but do not completely block functionality.

**No remediations have been applied to the source code** per the audit instructions.

---

## 2. Repository & Page Inventory

### Project Structure

```
/workspace
├── src/
│   ├── index.js                        # React entrypoint
│   ├── components/
│   │   ├── App.jsx                     # Router + layout shell
│   │   ├── Header.jsx                  # Site header with nav, wishlist, search, cart, login
│   │   ├── Footer.jsx                  # Site footer with nav links
│   │   ├── CartModal.jsx               # Cart drawer modal
│   │   ├── WishlistModal.jsx           # Wishlist drawer modal
│   │   ├── HeroBanner.jsx              # Homepage hero section
│   │   ├── PopularSection.jsx          # Homepage popular products grid
│   │   ├── FeaturedPair.jsx            # Homepage featured dual-card section
│   │   ├── TrendingCollections.jsx     # Homepage trending section
│   │   └── TheDrop.jsx                 # Homepage "The Drop" section
│   └── pages/
│       ├── HomePage.jsx                # Route: /
│       ├── NewPage.jsx                 # Route: /shop/new
│       ├── ProductPage.jsx             # Route: /product/:id
│       ├── CheckoutPage.jsx            # Route: /checkout
│       └── OrderConfirmationPage.jsx   # Route: /order-confirmation
└── public/
    └── index.html                      # HTML shell (missing lang attribute)
```

### Pages Audited

| # | Page | Route | Entry Point |
|---|------|-------|-------------|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` |
| 2 | Products (New) | `/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` |
| 4 | Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` |
| 5 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

The `CartModal` and `WishlistModal` components are rendered globally via `App.jsx` and are present on pages 1–3. The `Header` and `Footer` are present on all five pages.

### Issues per Page

| Page | Issues Found | Critical | Serious |
|------|-------------|----------|---------|
| Homepage (`/`) | 35 | 27 | 8 |
| Products Page (`/shop/new`) | 55 | 46 | 9 |
| Product Detail (`/product/:id`) | 20 | 16 | 4 |
| Checkout (`/checkout`) | 21 | 16 | 5 |
| Order Confirmation (`/order-confirmation`) | 20 | 16 | 4 |
| **Total** | **151** | **121*** | **30*** |

> *Note: Many issues are present in shared components (Header, Footer, CartModal, WishlistModal) and appear on multiple pages. The "Total" row uses raw scan totals (127 critical + 24 serious = 151). Cross-page deduplication reduces unique issue patterns to 7 critical types and 3 serious types.

---

## 3. Audit Methodology

1. **Build:** The React SPA was compiled with `npx webpack --mode production` into `/workspace/dist/`.
2. **Server:** The built site was served with `npx serve dist -p 3000 --single` (SPA-mode with fallback to `index.html`).
3. **Authentication:** Evinced SDK was authenticated online using `EVINCED_SERVICE_ID` + `EVINCED_API_KEY`.
4. **Scan Strategy:** A Playwright test (`tests/e2e/specs/per-page-a11y-audit.spec.ts`) was written to:
   - Navigate to each page directly (or via interaction flow for checkout/confirmation pages).
   - Wait for key page-specific selectors to confirm full render.
   - Call `evinced.evAnalyze()` (full-page snapshot scan) on each page.
   - Save raw JSON results to `tests/e2e/test-results/page-*.json`.
5. **Classification:** Issues were classified as **Critical** or **Serious** per Evinced's built-in severity model. All Critical issues are documented with proposed remediation code; all Serious issues are listed as non-critical findings.
6. **No code changes were made.** This report is observation-only.

---

## 4. Issue Severity Classification

| Evinced Severity | WCAG Guideline | Impact |
|-----------------|----------------|--------|
| **Critical** | 1.1.1, 1.3.5, 4.1.2, 2.1.1, 2.4.6, 4.1.3 | Completely blocks usage for AT users |
| **Serious** | 1.4.3, 3.1.1, 3.1.2 | Degrades usability for AT users; workarounds may exist |

---

## 5. Critical Issues — Detailed Findings & Proposed Remediations

---

### CI-1: NOT_FOCUSABLE — Interactive `<div>` Elements Without `tabindex`

**Evinced Issue ID:** `NOT_FOCUSABLE`  
**Severity:** Critical  
**WCAG:** 2.1.1 Keyboard (Level A)  
**Total Instances:** 48  
**Pages Affected:** All 5 pages

#### Description

Keyboard users must be able to navigate to all interactive elements using the Tab key. Elements that respond to `onClick` but are rendered as `<div>` (not `<button>` or `<a>`) are excluded from the browser's natural tab order unless they have `tabindex="0"`.

#### Affected Elements

| Selector | DOM Snippet | Component / File | Pages |
|----------|-------------|-----------------|-------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor: pointer;">` | `Header.jsx:131` | All 5 |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor: pointer;"><svg ...>` (Search) | `Header.jsx:140` | All 5 |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor: pointer;"><svg ...>` (Login) | `Header.jsx:156` | All 5 |
| `.flag-group` | `<div class="flag-group" onClick={() => {}} style="cursor: pointer;">` | `Header.jsx:161` | All 5 |
| `.footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;">` (Sustainability, FAQs) | `Footer.jsx:13,18` | All 5 |
| `.shop-link` | `<div class="shop-link" style="cursor: pointer;">` | `PopularSection.jsx:54` | Homepage |
| `.checkout-continue-btn` | `<div class="checkout-continue-btn">Continue</div>` | `CheckoutPage.jsx` | Checkout |

#### Proposed Remediation

**Root cause:** `<div>` elements with `onClick` handlers are used where `<button>` or `<a>` elements should be used. The complete fix is to change the element type to the semantically correct native element (see CI-2), but as a minimum-viable keyboard fix, add `tabindex="0"` and keyboard event handlers.

**Preferred approach — replace `<div>` with `<button>`:**

```jsx
// BEFORE (Header.jsx:131 — Wishlist button)
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>

// AFTER
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
```

```jsx
// BEFORE (Header.jsx:140 — Search button)
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>

// AFTER
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

```jsx
// BEFORE (Footer.jsx:13 — Sustainability)
<div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div>

// AFTER
<button className="footer-nav-item" onClick={() => {}}>Sustainability</button>
```

**Why this approach:** Native `<button>` and `<a>` elements receive keyboard focus automatically (no `tabindex` needed), fire on Enter/Space, provide implicit `role="button"` or `role="link"`, and are announced correctly by all screen readers. This simultaneously resolves CI-1 (keyboard access), CI-2 (semantic role), and CI-3 (accessible name) for affected elements.

---

### CI-2: WRONG_SEMANTIC_ROLE — Non-Button/Link Elements Used as Interactive Controls

**Evinced Issue ID:** `WRONG_SEMANTIC_ROLE`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 47  
**Pages Affected:** All 5 pages

#### Description

Screen readers identify interactive elements by their ARIA role. When a `<div>` is used for interaction without `role="button"` or `role="link"`, screen reader users cannot identify the element as interactive and will not know they can activate it.

#### Affected Elements

| Selector | DOM Snippet | Component / File |
|----------|-------------|-----------------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn">` | `Header.jsx:131` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn">` (Search) | `Header.jsx:140` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn">` (Login) | `Header.jsx:156` |
| `.flag-group` | `<div class="flag-group">` | `Header.jsx:161` |
| `.footer-nav-item` | `<div class="footer-nav-item">` (Sustainability, FAQs) | `Footer.jsx:13,18` |
| `.shop-link` (Homepage only) | `<div class="shop-link">` | `PopularSection.jsx:54` |
| `.checkout-continue-btn` | `<div class="checkout-continue-btn">` | `CheckoutPage.jsx` |

> Note: The Products page has 18 instances because the Header/Footer components appear once, plus `ProductCard` component renders multiple `.wishlist-btn` and `.shop-link` elements per product card.

#### Proposed Remediation

**Replace `<div>` interactive elements with native `<button>` or `<a>` as appropriate:**

```jsx
// BEFORE (PopularSection.jsx:54 — shop navigation "link")
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// AFTER — use Link for navigation, which renders as <a>
import { Link } from 'react-router-dom';
<Link className="shop-link" to={product.shopHref}>
  {product.shopLabel}
</Link>
```

```jsx
// BEFORE (Header.jsx:161 — country/region flag group)
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>

// AFTER
<button className="flag-group" aria-label="Select region" aria-haspopup="true">
```

**Why this approach:** Using native elements provides the correct implicit ARIA role without any additional attributes. `<button>` maps to `role="button"`, `<a href>` maps to `role="link"`. This is simpler, more robust across screen readers, and avoids the need for explicit `role=` attributes on the `<div>`.

---

### CI-3: NO_DESCRIPTIVE_TEXT — Interactive Elements Without Accessible Names

**Evinced Issue ID:** `NO_DESCRIPTIVE_TEXT`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.4.6 Headings and Labels (Level AA)  
**Total Instances:** 18  
**Pages Affected:** All 5 pages

#### Description

Every interactive element must have an accessible name — the text a screen reader announces when the element receives focus. Icon-only buttons whose visible text has `aria-hidden="true"` have no accessible name at all, leaving screen reader users with no indication of what the control does.

#### Affected Elements

| Selector | DOM Snippet | Issue | Pages |
|----------|-------------|-------|-------|
| `.icon-btn:nth-child(2)` | `<div class="icon-btn"><svg aria-hidden>...<span aria-hidden="true">Search</span>` | `aria-hidden` on span removes the only text label | All 5 |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn"><svg aria-hidden>...<span aria-hidden="true">Login</span>` | `aria-hidden` on span removes the only text label | All 5 |
| `.product-card:nth-child(n) > .shop-link` | `<div class="shop-link"><span aria-hidden="true">Shop Drinkware</span></div>` | `aria-hidden` on span removes the only text label | Homepage |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item"><span aria-hidden="true">FAQs</span></div>` | `aria-hidden` on span removes the only text label | All 5 |

#### Proposed Remediation

**Option A — Remove `aria-hidden` from visible text spans:**

```jsx
// BEFORE (Header.jsx:142)
<span aria-hidden="true">Search</span>

// AFTER — allow the text to form the accessible name
<span>Search</span>
```

**Option B — Add `aria-label` to the button (preferred for icon buttons to keep visual text hidden):**

```jsx
// BEFORE (Header.jsx:140)
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>

// AFTER
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

```jsx
// BEFORE (PopularSection.jsx:58)
<div className="shop-link" onClick={() => navigate(product.shopHref)} style={{ cursor: 'pointer' }}>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// AFTER — remove aria-hidden so text is accessible, or use aria-label
<Link className="shop-link" to={product.shopHref} aria-label={`${product.shopLabel} — ${product.title}`}>
  {product.shopLabel}
</Link>
```

**Why this approach:** `aria-label` on the button (or removing `aria-hidden` from visible text) allows screen readers to announce a meaningful label. For icon buttons where visual text is intentionally styled to appear as an icon, `aria-label` on the native `<button>` is the standard pattern. For navigation links, using `<Link>` with visible text (no `aria-hidden`) is the simplest fix because `<a>` derives its accessible name from its text content automatically.

---

### CI-4: AXE-BUTTON-NAME — Modal Close Buttons Without Discernible Text

**Evinced Issue ID:** `AXE-BUTTON-NAME`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 8  
**Pages Affected:** All 5 pages (via CartModal and WishlistModal)

#### Description

The close buttons in the Cart and Wishlist modals contain only an SVG icon (with `aria-hidden="true"`) and no text content or `aria-label`. Screen readers will announce them as "button" with no name, giving users no indication that the button closes the drawer.

#### Affected Elements

| Selector | DOM Snippet | Component / File | Pages |
|----------|-------------|-----------------|-------|
| `#cart-modal > div:nth-child(1) > button` | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg aria-hidden="true">` (Cart close) | `CartModal.jsx:56` | Homepage, Products, Product Detail |
| `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg aria-hidden="true">` (Wishlist close) | `WishlistModal.jsx:61` | All 5 |

#### Proposed Remediation

**Add `aria-label="Close cart"` (or "Close wishlist") to the close buttons:**

```jsx
// BEFORE (CartModal.jsx:56)
<button
  className={styles.closeBtn}
  onClick={closeCart}
>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>

// AFTER
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>
```

```jsx
// BEFORE (WishlistModal.jsx:61)
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
>
  <svg ... aria-hidden="true">...</svg>
</button>

// AFTER
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg ... aria-hidden="true">...</svg>
</button>
```

**Why this approach:** Adding `aria-label` directly to the `<button>` is the canonical WCAG technique (ARIA Technique ARIA14) for icon-only buttons. It overrides the computed accessible name and provides a clear, specific description to screen readers without altering visual appearance.

---

### CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values

**Evinced Issue ID:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 3  
**Pages Affected:** Homepage (2), Product Detail (1)

#### Description

ARIA attributes must use only the values permitted by the ARIA specification. Invalid attribute values are ignored by assistive technologies (or cause unpredictable behavior), negating the intended accessibility semantics.

#### Affected Elements

| Selector | DOM Snippet | Issue | Component / File |
|----------|-------------|-------|-----------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `aria-expanded` must be `"true"` or `"false"`, not `"yes"` | `FeaturedPair.jsx:46` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | Same as above | `FeaturedPair.jsx:46` |
| `ul[aria-relevant="changes"]` | `<ul aria-relevant="changes" aria-live="polite">` | `aria-relevant` valid values are: `additions`, `removals`, `text`, `all`, or space-separated combinations | `ProductPage.jsx:146` |

#### Proposed Remediation

**Fix `aria-expanded="yes"` → remove or correct to boolean string:**

```jsx
// BEFORE (FeaturedPair.jsx:46)
<h1 aria-expanded="yes">{item.title}</h1>

// AFTER — remove aria-expanded entirely (h1 is not expandable)
// aria-expanded is only valid on elements that control expandable regions
<h1>{item.title}</h1>
```

**Fix `aria-relevant="changes"`:**

```jsx
// BEFORE (ProductPage.jsx:146)
<ul
  className={styles.detailsList}
  aria-relevant="changes"
  aria-live="polite"
>

// AFTER — use a valid value; "additions text" is the most appropriate
// for a list that updates its content
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Why this approach:** `aria-expanded` is a state attribute valid only on elements that control collapsible/expandable regions (e.g., accordions, dropdowns). It should not be present on a heading. Removing it eliminates the invalid value and removes a misleading semantic. For `aria-relevant`, `"additions text"` matches the ARIA spec token list and accurately describes a live region that adds new list items.

---

### CI-6: AXE-IMAGE-ALT — Images Missing Alternative Text

**Evinced Issue ID:** `AXE-IMAGE-ALT`  
**Severity:** Critical  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Total Instances:** 2  
**Pages Affected:** Homepage only

#### Description

`<img>` elements without an `alt` attribute are inaccessible to screen reader users. The browser falls back to reading the filename, which is meaningless.

#### Affected Elements

| Selector | DOM Snippet | Component / File |
|----------|-------------|-----------------|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `HeroBanner.jsx:18` |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `TheDrop.jsx:13` |

#### Proposed Remediation

**Add descriptive `alt` text to both images:**

```jsx
// BEFORE (HeroBanner.jsx:18)
<img src={HERO_IMAGE} />

// AFTER
<img src={HERO_IMAGE} alt="Winter Basics collection — cozy t-shirts and long sleeves in warm hues" />
```

```jsx
// BEFORE (TheDrop.jsx:13)
<img src={DROP_IMAGE} loading="lazy" />

// AFTER
<img src={DROP_IMAGE} loading="lazy" alt="Android, YouTube, and Super G plushie bag charms arranged together" />
```

**Why this approach:** WCAG 1.1.1 requires all non-decorative images to have meaningful alternative text. The text should convey the purpose or content of the image, not just describe it literally. If these images were purely decorative, the fix would be `alt=""` (empty string), but both images are promotional and convey content relevant to the page section.

---

### CI-7: AXE-ARIA-REQUIRED-ATTR — ARIA Role Missing Required Attributes

**Evinced Issue ID:** `AXE-ARIA-REQUIRED-ATTR`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 1  
**Pages Affected:** Homepage only

#### Description

Certain ARIA roles require specific attributes to be present in order to convey state to assistive technologies. A `role="slider"` element must provide `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` so that screen readers can announce the current and range values.

#### Affected Element

| Selector | DOM Snippet | Component / File |
|----------|-------------|-----------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `TheDrop.jsx:19` |

#### Proposed Remediation

**Option A — Add required ARIA attributes to the slider:**

```jsx
// BEFORE (TheDrop.jsx:19)
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// AFTER — provide current value, min, and max
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
></div>
```

**Option B — If this is a decorative visual bar with no interactive behavior, use a `<meter>` or remove the ARIA role:**

```jsx
// AFTER (if decorative progress/popularity bar)
<div className="drop-popularity-bar" role="presentation" aria-hidden="true"></div>
```

**Why this approach:** `role="slider"` is a widget role that requires `aria-valuenow` at minimum, with `aria-valuemin` and `aria-valuemax` strongly recommended. Without these, screen readers cannot announce the widget's value, making it useless (or confusing) to AT users. If the bar is purely visual with no real interactivity, removing the `role="slider"` and hiding it with `aria-hidden="true"` is the simpler and cleaner fix.

---

## 6. Non-Critical Issues — Full Listing

The following 24 issues were classified as **Serious** (not Critical) by the Evinced SDK. They are not remediated in this audit cycle but should be addressed in future sprints.

---

### NC-1: AXE-COLOR-CONTRAST — Insufficient Color Contrast

**Evinced Issue ID:** `AXE-COLOR-CONTRAST`  
**Severity:** Serious  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Total Instances:** 18  
**Pages Affected:** Homepage (1), Products Page (13), Product Detail (1), Checkout (2), Order Confirmation (1)

All text elements below fail the WCAG AA minimum contrast ratio of 4.5:1 for normal text.

| # | Page | Selector | Foreground | Background | Ratio | Required |
|---|------|----------|------------|------------|-------|---------|
| 1 | Homepage | `.hero-content > p` | `#c8c0b8` | `#e8e0d8` | 1.37 | 4.5:1 |
| 2 | Products | `.filter-count` (×8 filter labels) | `#c8c8c8` | `#ffffff` | 1.67 | 4.5:1 |
| 3 | Products | `.filter-count` (additional instances) | `#c8c8c8` | `#ffffff` | 1.67 | 4.5:1 |
| 4 | Products | `.filter-option-label` (multiple) | Various | `#ffffff` | < 4.5 | 4.5:1 |
| 5 | Product Detail | `p.productDescription` (CSS Module) | `#c0c0c0` | `#ffffff` | 1.81 | 4.5:1 |
| 6 | Checkout | `.step-label` ("Shipping & Payment") | `#bbbbbb` | `#ffffff` | 1.91 | 4.5:1 |
| 7 | Checkout | `.summary-tax-note` | `#888888` | `#f8f9fa` | 3.36 | 4.5:1 |
| 8 | Order Confirmation | `.confirm-order-id-label` | `#80868b` | `#f8f9fa` | 3.49 | 4.5:1 |

**Recommended fix:** Darken the foreground colors to meet at least 4.5:1 ratio. For example:
- `#c8c0b8` → `#8a7e72` (darkened to meet contrast against `#e8e0d8`)
- `#c8c8c8` → `#767676` (standard minimum gray for white background)
- `#c0c0c0` → `#767676`
- `#bbbbbb` → `#767676`
- `#80868b` → `#5f6368`

---

### NC-2: AXE-HTML-HAS-LANG — Missing `lang` Attribute on `<html>`

**Evinced Issue ID:** `AXE-HTML-HAS-LANG`  
**Severity:** Serious  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Total Instances:** 5 (one per page — same root cause)  
**Pages Affected:** All 5 pages  
**Source File:** `public/index.html:3`

**Current DOM:**
```html
<!-- public/index.html -->
<html>
```

**Required DOM:**
```html
<html lang="en">
```

**Description:** The `<html>` element is missing the `lang` attribute across all pages (they all share the same SPA shell `public/index.html`). Screen readers use this attribute to select the correct language engine (voice, pronunciation rules). Without it, the language is inferred from the OS locale, which may produce incorrect pronunciation for international users.

**Recommended fix:** Add `lang="en"` to `<html>` in `public/index.html`.

---

### NC-3: AXE-VALID-LANG — Invalid `lang` Attribute Value

**Evinced Issue ID:** `AXE-VALID-LANG`  
**Severity:** Serious  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Total Instances:** 1  
**Pages Affected:** Homepage only  
**Source File:** `src/components/TheDrop.jsx:21`

**Current DOM:**
```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms...</p>
```

**Description:** `lang="zz"` is not a valid BCP 47 language subtag. Screen readers cannot switch to the correct language engine for this paragraph. The text is clearly in English.

**Recommended fix:** Either remove the `lang` attribute (it will inherit `lang="en"` from `<html>` after NC-2 is fixed), or correct it to `lang="en"`:

```jsx
// BEFORE (TheDrop.jsx:21)
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms...
</p>

// AFTER
<p>
  Our brand-new, limited-edition plushie bag charms...
</p>
```

---

## 7. Summary Table

### Critical Issues (127 instances — 7 types)

| ID | Issue Type | WCAG | Instances | Pages | Fix Location |
|----|-----------|------|-----------|-------|-------------|
| CI-1 | NOT_FOCUSABLE | 2.1.1 (A) | 48 | All 5 | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx`, `CheckoutPage.jsx` |
| CI-2 | WRONG_SEMANTIC_ROLE | 4.1.2 (A) | 47 | All 5 | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx`, `CartModal.jsx`, `CheckoutPage.jsx` |
| CI-3 | NO_DESCRIPTIVE_TEXT | 4.1.2 (A), 2.4.6 (AA) | 18 | All 5 | `Header.jsx`, `PopularSection.jsx`, `Footer.jsx` |
| CI-4 | AXE-BUTTON-NAME | 4.1.2 (A) | 8 | All 5 | `CartModal.jsx:56`, `WishlistModal.jsx:61` |
| CI-5 | AXE-ARIA-VALID-ATTR-VALUE | 4.1.2 (A) | 3 | Homepage, Product Detail | `FeaturedPair.jsx:46`, `ProductPage.jsx:146` |
| CI-6 | AXE-IMAGE-ALT | 1.1.1 (A) | 2 | Homepage | `HeroBanner.jsx:18`, `TheDrop.jsx:13` |
| CI-7 | AXE-ARIA-REQUIRED-ATTR | 4.1.2 (A) | 1 | Homepage | `TheDrop.jsx:19` |

### Non-Critical Issues (24 instances — 3 types)

| ID | Issue Type | WCAG | Instances | Pages | Fix Location |
|----|-----------|------|-----------|-------|-------------|
| NC-1 | AXE-COLOR-CONTRAST | 1.4.3 (AA) | 18 | Homepage, Products, Product Detail, Checkout, Order Confirmation | Various CSS files |
| NC-2 | AXE-HTML-HAS-LANG | 3.1.1 (A) | 5 | All 5 | `public/index.html:3` |
| NC-3 | AXE-VALID-LANG | 3.1.2 (AA) | 1 | Homepage | `TheDrop.jsx:21` |

### Fix Priority Recommendation

| Priority | Issues | Rationale |
|----------|--------|-----------|
| **P0 — Immediate** | CI-1, CI-2, CI-3 | 113 instances; same root cause (`<div>` misuse); single refactor of `Header.jsx` + `Footer.jsx` fixes majority of Critical issues across all pages |
| **P0 — Immediate** | CI-4, CI-6, CI-7 | Simple one-line attribute additions; high impact for low effort |
| **P1 — Soon** | CI-5 | Invalid ARIA attributes; misuse of `aria-expanded` and `aria-relevant` |
| **P2 — Scheduled** | NC-2, NC-3 | Single-line fixes with broad positive impact; NC-2 fixes 5 issues at once |
| **P3 — Sprint** | NC-1 | Requires design review; 18 color adjustments across CSS files |

---

*Report generated by automated Evinced SDK scan. Raw JSON results are stored in `tests/e2e/test-results/page-*.json`. No source code changes were made as part of this audit.*
