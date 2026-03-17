# Accessibility Audit Report

**Repository:** Demo Website (Google Merchandise Store — React SPA)  
**Audit Date:** 2026-03-17  
**Tool:** Evinced SDK (`@evinced/js-playwright-sdk`) via Playwright  
**Branch:** `cursor/accessibility-audit-report-4d13`  
**Auditor:** Automated Cloud Agent (Cursor)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Audit Methodology](#2-audit-methodology)
3. [Pages Audited](#3-pages-audited)
4. [Issue Statistics](#4-issue-statistics)
5. [Critical Issues — Detailed Findings and Proposed Remediations](#5-critical-issues--detailed-findings-and-proposed-remediations)
   - [CI-1 — Header Icon Buttons: Wrong Semantic Role and Not Keyboard Accessible](#ci-1--header-icon-buttons-wrong-semantic-role-and-not-keyboard-accessible)
   - [CI-2 — Footer Navigation Divs: Wrong Semantic Role and Not Keyboard Accessible](#ci-2--footer-navigation-divs-wrong-semantic-role-and-not-keyboard-accessible)
   - [CI-3 — Popular Section Shop Links: Wrong Semantic Role, Missing Accessible Name, Not Keyboard Accessible](#ci-3--popular-section-shop-links-wrong-semantic-role-missing-accessible-name-not-keyboard-accessible)
   - [CI-4 — Filter Sidebar Options: Wrong Semantic Role and Not Keyboard Accessible](#ci-4--filter-sidebar-options-wrong-semantic-role-and-not-keyboard-accessible)
   - [CI-5 — Cart Modal Close Button: Missing Accessible Name (Button-name)](#ci-5--cart-modal-close-button-missing-accessible-name-button-name)
   - [CI-6 — Checkout Continue Button: Wrong Semantic Role and Not Keyboard Accessible](#ci-6--checkout-continue-button-wrong-semantic-role-and-not-keyboard-accessible)
   - [CI-7 — Checkout Back Button: Wrong Semantic Role and Not Keyboard Accessible](#ci-7--checkout-back-button-wrong-semantic-role-and-not-keyboard-accessible)
   - [CI-8 — Order Confirmation Home Link: Wrong Semantic Role and Not Keyboard Accessible](#ci-8--order-confirmation-home-link-wrong-semantic-role-and-not-keyboard-accessible)
   - [CI-9 — Images Missing Alternative Text](#ci-9--images-missing-alternative-text)
   - [CI-10 — Invalid ARIA Attribute Values](#ci-10--invalid-aria-attribute-values)
   - [CI-11 — Slider Element Missing Required ARIA Attributes](#ci-11--slider-element-missing-required-aria-attributes)
6. [Non-Critical Issues (Serious Severity) — Not Remediated](#6-non-critical-issues-serious-severity--not-remediated)
7. [Cross-Reference: Source Files and Affected Components](#7-cross-reference-source-files-and-affected-components)

---

## 1. Executive Summary

An automated accessibility audit was performed on all 6 page states of the demo e-commerce website using the **Evinced SDK** with Playwright. The audit detected a total of **170 accessibility issues** across all pages.

| Severity | Issue Count |
|----------|-------------|
| **Critical** | **145** |
| **Serious** | **25** |
| **Total** | **170** |

**145 critical issues** were detected. These have been grouped into **11 logical issue categories (CI-1 through CI-11)** based on root cause and affected component. Each group is described in detail in Section 5 with the specific elements affected, proposed remediation code, and the rationale for the chosen approach.

**25 serious issues** remain — these are documented in Section 6 without remediation.

---

## 2. Audit Methodology

### Tools
- **Evinced SDK** (`@evinced/js-playwright-sdk` v2.43.0) — Evinced's proprietary accessibility analysis engine, which detects semantic role errors, keyboard accessibility failures, accessible name violations, ARIA attribute issues, and more.
- **Playwright** (`@playwright/test` v1.44.1) — browser automation to navigate to each page and trigger the Evinced `evAnalyze()` scan.
- **Browser:** Chromium (headless)

### Approach
For each page, a dedicated Playwright test:
1. Navigates to the page (performing any prerequisite steps such as adding items to cart or completing multi-step flows).
2. Waits for the page to fully render.
3. Calls `evinced.evAnalyze()` to perform a full static accessibility scan of the current DOM.
4. Saves the raw results as JSON (`tests/e2e/test-results/<page>.json`).

The Evinced SDK authentication uses offline mode: `EVINCED_SERVICE_ID` + `EVINCED_AUTH_TOKEN` (offline JWT).

### Scope
- All interactive states are covered: homepage, product listing, product detail, cart drawer (visible when active), checkout basket step, checkout shipping step, and order confirmation.
- The audit does not cover dynamic state transitions between scans; each scan is a point-in-time snapshot of the rendered DOM at the target state.

---

## 3. Pages Audited

| # | Page | URL | Entry Point |
|---|------|-----|-------------|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` |
| 2 | Products Page | `/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` |
| 4 | Checkout – Basket Step | `/checkout` (step 1) | `src/pages/CheckoutPage.jsx` |
| 5 | Checkout – Shipping Step | `/checkout` (step 2) | `src/pages/CheckoutPage.jsx` |
| 6 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

The app is a React 18 SPA using React Router v7, bundled with Webpack 5, served on `http://localhost:3000`. Routes are defined in `src/components/App.jsx`.

---

## 4. Issue Statistics

### Issues per Page

| Page | Total | Critical | Serious |
|------|-------|----------|---------|
| Homepage (/) | 35 | 32 | 3 |
| Products Page (/shop/new) | 55 | 41 | 14 |
| Product Detail (/product/:id) | 20 | 18 | 2 |
| Checkout – Basket Step | 21 | 18 | 3 |
| Checkout – Shipping Step | 19 | 18 | 1 |
| Order Confirmation | 20 | 18 | 2 |
| **Total** | **170** | **145** | **25** |

### Issues by Type

| Issue Type | Severity | Count | WCAG Criterion |
|------------|----------|-------|----------------|
| Keyboard accessible | Critical | 55 | 2.1.1 Keyboard (Level A) |
| Interactable role | Critical | 54 | 4.1.2 Name, Role, Value (Level A) |
| Accessible name | Critical | 21 | 4.1.2 Name, Role, Value (Level A) |
| Button-name | Critical | 9 | 4.1.2 Name, Role, Value (Level A) |
| Aria-valid-attr-value | Critical | 3 | 4.1.2 Name, Role, Value (Level A) |
| Image-alt | Critical | 2 | 1.1.1 Non-text Content (Level A) |
| Aria-required-attr | Critical | 1 | 4.1.2 Name, Role, Value (Level A) |
| **Critical subtotal** | | **145** | |
| Color-contrast | Serious | 18 | 1.4.3 Contrast Minimum (Level AA) |
| Html-has-lang | Serious | 6 | 3.1.1 Language of Page (Level A) |
| Valid-lang | Serious | 1 | 3.1.2 Language of Parts (Level AA) |
| **Serious subtotal** | | **25** | |

---

## 5. Critical Issues — Detailed Findings and Proposed Remediations

---

### CI-1 — Header Icon Buttons: Wrong Semantic Role and Not Keyboard Accessible

**Severity:** Critical  
**Pages Affected:** All pages (Header is a global component)  
**File:** `src/components/Header.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role, Keyboard accessible, Accessible name  
**Evinced Knowledge Base:**
- https://knowledge.evinced.com/system-validations/interactable-role
- https://knowledge.evinced.com/system-validations/keyboard-accessible
- https://knowledge.evinced.com/system-validations/accessible-name

#### Affected Elements

| Element Selector | Control | Issues Detected |
|-----------------|---------|-----------------|
| `.wishlist-btn` | Wishlist open button | Interactable role, Keyboard accessible |
| `.icon-btn:nth-child(2)` | Search button | Interactable role, Keyboard accessible, Accessible name |
| `.icon-btn:nth-child(4)` | Login button | Interactable role, Keyboard accessible, Accessible name |
| `.flag-group` | Region/language selector | Interactable role, Keyboard accessible |

#### Root Cause

All four header utility controls are implemented as `<div>` elements. A `<div>` has no implicit ARIA role and is not included in the keyboard tab sequence by default. Screen readers cannot identify these as interactive controls, and keyboard users cannot reach or activate them.

Additionally, the Search and Login buttons have their visible text and icons wrapped with `aria-hidden="true"`, completely stripping any accessible name from the element.

```jsx
// Problematic code in src/components/Header.jsx
<div className="icon-btn" onClick={openSearch}>
  <span aria-hidden="true"><SearchIcon /></span>
  <span aria-hidden="true">Search</span>
</div>
```

#### Proposed Remediation

Replace all four interactive `<div>` elements with semantic `<button>` elements. Remove `aria-hidden` from text spans or add an `aria-label` directly on the button. The `<button>` element carries implicit `role="button"`, is natively keyboard-focusable (Tab), and is activated with Enter/Space.

```jsx
// Proposed fix for Header.jsx — Search button
<button
  className="icon-btn"
  aria-label="Search"
  onClick={openSearch}
>
  <SearchIcon aria-hidden="true" />
</button>

// Proposed fix — Wishlist button (already has a visible label; aria-label not required)
<button
  className="icon-btn wishlist-btn"
  onClick={openWishlist}
>
  <WishlistIcon aria-hidden="true" />
  <span>Wishlist</span>
</button>

// Proposed fix — Login button
<button
  className="icon-btn"
  aria-label="Login"
  onClick={openLogin}
>
  <LoginIcon aria-hidden="true" />
</button>

// Proposed fix — Region selector
<button
  className="flag-group"
  aria-label="Select region"
  onClick={toggleRegion}
>
  <FlagIcon aria-hidden="true" />
  <span aria-hidden="true">US</span>
</button>
```

#### Why This Approach

Using a native `<button>` element is the most robust solution because:
1. It automatically receives keyboard focus in the tab sequence without requiring `tabindex`.
2. It natively responds to Enter and Space key activation.
3. It exposes `role="button"` to assistive technologies without any additional ARIA attributes.
4. An explicit `aria-label` on icon-only buttons gives screen readers a clear, context-free label that does not depend on fragile DOM children or CSS visibility states.

---

### CI-2 — Footer Navigation Divs: Wrong Semantic Role and Not Keyboard Accessible

**Severity:** Critical  
**Pages Affected:** All pages (Footer is a global component)  
**File:** `src/components/Footer.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role, Keyboard accessible, Accessible name

#### Affected Elements

| Element Selector | Content | Issues Detected |
|-----------------|---------|-----------------|
| `li:nth-child(3) > .footer-nav-item` | "Sustainability" | Interactable role, Keyboard accessible |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | "FAQs" | Interactable role, Keyboard accessible, Accessible name |

#### Root Cause

Footer navigation items are `<div class="footer-nav-item">` elements inside `<li>` tags. The `<div>` has no interactive role and receives no tab focus. The "FAQs" item additionally has its visible text wrapped in `aria-hidden="true"`, making it invisible to screen readers.

```jsx
// Problematic code in src/components/Footer.jsx
<li>
  <div className="footer-nav-item" onClick={() => navigate('/faqs')}>
    <span aria-hidden="true">FAQs</span>
  </div>
</li>
```

#### Proposed Remediation

Replace each `<div class="footer-nav-item">` with a native `<a>` anchor element. Navigation links to other pages are semantically links (not buttons), which conveys destination intent.

```jsx
// Proposed fix for Footer.jsx
<li>
  <a className="footer-nav-item" href="/sustainability">Sustainability</a>
</li>
<li>
  <a className="footer-nav-item" href="/faqs">FAQs</a>
</li>
```

#### Why This Approach

Using `<a href="...">` provides:
1. Implicit `role="link"` — screen readers announce these as navigation links with destination context.
2. Native keyboard focusability (Tab) and activation (Enter).
3. Contextual meaning: the `href` value gives assistive technologies, search engines, and the browser address bar the correct destination — something `onClick` handlers on `<div>` elements do not.

---

### CI-3 — Popular Section Shop Links: Wrong Semantic Role, Missing Accessible Name, Not Keyboard Accessible

**Severity:** Critical  
**Pages Affected:** Homepage (/)  
**File:** `src/components/PopularSection.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role, Keyboard accessible, Accessible name

#### Affected Elements

| Element Selector | Content | Issues Detected |
|-----------------|---------|-----------------|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | "Shop Drinkware" | Interactable role, Keyboard accessible, Accessible name |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | "Shop Fun and Games" | Interactable role, Keyboard accessible, Accessible name |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | "Shop Stationery" | Interactable role, Keyboard accessible, Accessible name |

#### Root Cause

Each "Shop X" link in the Popular section is rendered as `<div class="shop-link">`. The visible label text is wrapped in `aria-hidden="true"`, so the accessible name is empty. The `<div>` is not in the tab sequence.

```jsx
// Problematic code in src/components/PopularSection.jsx
<div className="shop-link" onClick={() => navigate('/shop/new')}>
  <span aria-hidden="true">Shop Drinkware</span>
  <ArrowIcon aria-hidden="true" />
</div>
```

#### Proposed Remediation

Replace with `<a>` elements. Remove `aria-hidden` from the label text so the visible label becomes the accessible name.

```jsx
// Proposed fix for PopularSection.jsx
<a className="shop-link" href="/shop/new?category=drinkware">
  Shop Drinkware
  <ArrowIcon aria-hidden="true" />
</a>
```

#### Why This Approach

An `<a>` element is the correct semantic choice for navigation from content sections to filtered product listings. The visible label text serves as the accessible name directly — no `aria-label` is needed, keeping the visible and accessible names in sync. Removing `aria-hidden` from the label span exposes the text to the accessibility tree.

---

### CI-4 — Filter Sidebar Options: Wrong Semantic Role and Not Keyboard Accessible

**Severity:** Critical  
**Pages Affected:** Products Page (/shop/new)  
**File:** `src/components/FilterSidebar.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role, Keyboard accessible

#### Affected Elements

13 filter option `<div class="filter-option">` elements across three filter groups (Price: 4 options, Size: 4 options, Brand: 5 options):

| Element Selector Pattern | Count | Issues Detected |
|--------------------------|-------|-----------------|
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(n)` | 4 (Price) | Interactable role, Keyboard accessible |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(n)` | 4 (Size) | Interactable role, Keyboard accessible |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(n)` + `.filter-option:nth-child(5)` | 5 (Brand) | Interactable role, Keyboard accessible |

#### Root Cause

Each filter option is a `<div class="filter-option">` acting as a custom checkbox. The `<div>` lacks `role="checkbox"`, `aria-checked`, and `tabindex`. Keyboard users cannot reach or toggle any filter.

```jsx
// Problematic code in src/components/FilterSidebar.jsx
<div className="filter-option" onClick={() => toggleFilter(option)}>
  <div className="custom-checkbox" />
  <span className="filter-option-label">{option.label}</span>
</div>
```

#### Proposed Remediation

Replace the `<div>` wrapper with a native `<label>` + `<input type="checkbox">` pattern, or add the required ARIA attributes to the custom checkbox:

**Option A — Native checkbox (recommended):**
```jsx
// Proposed fix for FilterSidebar.jsx
<label className="filter-option">
  <input
    type="checkbox"
    className="filter-checkbox-input"
    checked={isSelected(option)}
    onChange={() => toggleFilter(option)}
  />
  <span className="filter-option-label">{option.label}</span>
  <span className="filter-count">({option.count})</span>
</label>
```

**Option B — ARIA-enhanced custom checkbox:**
```jsx
<div
  className="filter-option"
  role="checkbox"
  aria-checked={isSelected(option)}
  aria-label={option.label}
  tabIndex={0}
  onClick={() => toggleFilter(option)}
  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') toggleFilter(option); }}
>
  <div className="custom-checkbox" aria-hidden="true" />
  <span className="filter-option-label">{option.label}</span>
</div>
```

#### Why This Approach

Option A (native `<input type="checkbox">`) is preferred because:
1. It provides all required semantics (`role="checkbox"`, `aria-checked` state) without any JavaScript.
2. It handles keyboard interaction (Space to toggle) natively.
3. The `<label>` wrapper makes the entire row a click target for the checkbox without JavaScript.
4. It degrades gracefully when JavaScript is disabled.

Option B is listed as an alternative for cases where the visual design requires a fully custom control and the native `<input>` cannot be styled appropriately — but it requires explicit `onKeyDown` handling and `aria-checked` state management.

---

### CI-5 — Cart Modal Close Button: Missing Accessible Name (Button-name)

**Severity:** Critical  
**Pages Affected:** All pages (CartModal is visible when cart is open; the button exists in the DOM even when the drawer is closed)  
**File:** `src/components/CartModal.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced Rules:** Button-name  
**Evinced Knowledge Base:** https://knowledge.evinced.com/system-validations/button-name

#### Affected Elements

| Element Selector | Context | Issues Detected |
|-----------------|---------|-----------------|
| `#cart-modal > div:nth-child(1) > button` | Cart modal close (×) button | Button-name (no accessible name) |
| `div[role="dialog"] > div:nth-child(1) > button` | Same button (matched via dialog role selector) | Button-name (no accessible name) |

*Note: The two selectors match the same physical button — the first matches via the `id="cart-modal"` on the outer `<div>`, the second via `role="dialog"` on the inner `<div>`. Evinced reports both as separate findings.*

#### Root Cause

The cart modal close button renders only an SVG `×` icon with `aria-hidden="true"`. The `aria-label` attribute was removed, leaving the button with no accessible name that screen readers can announce.

```jsx
// Problematic code in src/components/CartModal.jsx
<button className={styles.closeBtn} onClick={onClose}>
  <svg aria-hidden="true">...</svg>
  {/* aria-label="Close shopping cart" was removed */}
</button>
```

#### Proposed Remediation

Add `aria-label="Close shopping cart"` to the close button:

```jsx
// Proposed fix for CartModal.jsx
<button
  className={styles.closeBtn}
  aria-label="Close shopping cart"
  onClick={onClose}
>
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

#### Why This Approach

An `aria-label` directly on the `<button>` overrides any child content for the accessible name computation. Using a descriptive label like `"Close shopping cart"` (rather than just `"Close"`) provides full context for users who may encounter the button out of sequence via a screen reader's button list. The SVG icon already has `aria-hidden="true"`, so the label is the sole accessible name — no ambiguity with child text.

---

### CI-6 — Checkout Continue Button: Wrong Semantic Role and Not Keyboard Accessible

**Severity:** Critical  
**Pages Affected:** Checkout – Basket Step (`/checkout`, step 1)  
**File:** `src/pages/CheckoutPage.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role, Keyboard accessible

#### Affected Element

| Element Selector | Content | Issues Detected |
|-----------------|---------|-----------------|
| `.checkout-continue-btn` | "Continue" button (advances basket → shipping step) | Interactable role, Keyboard accessible |

#### Root Cause

The "Continue" control is a `<div class="checkout-continue-btn">` with an `onClick` handler. It is not in the tab sequence and exposes no interactive role.

```jsx
// Problematic code in src/pages/CheckoutPage.jsx
<div className="checkout-continue-btn" onClick={proceedToShipping}>
  Continue
</div>
```

#### Proposed Remediation

Replace with a `<button>` element:

```jsx
// Proposed fix for CheckoutPage.jsx
<button
  className="checkout-continue-btn"
  onClick={proceedToShipping}
>
  Continue
</button>
```

#### Why This Approach

This is the most critical step in the purchase funnel. Keyboard users who cannot reach this "Continue" control are completely blocked from proceeding through checkout. A native `<button>` resolves both the semantic role and keyboard-focusability issues in a single change with no additional ARIA required.

---

### CI-7 — Checkout Back Button: Wrong Semantic Role and Not Keyboard Accessible

**Severity:** Critical  
**Pages Affected:** Checkout – Shipping Step (`/checkout`, step 2)  
**File:** `src/pages/CheckoutPage.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role, Keyboard accessible

#### Affected Element

| Element Selector | Content | Issues Detected |
|-----------------|---------|-----------------|
| `.checkout-back-btn` | "← Back to Cart" navigation control | Interactable role, Keyboard accessible |

#### Root Cause

The "Back to Cart" control on the shipping step is `<div class="checkout-back-btn">`. Same root cause as CI-6.

```jsx
// Problematic code in src/pages/CheckoutPage.jsx
<div className="checkout-back-btn" onClick={goBack}>
  ← Back to Cart
</div>
```

#### Proposed Remediation

Replace with a `<button>` element:

```jsx
// Proposed fix for CheckoutPage.jsx
<button
  className="checkout-back-btn"
  onClick={goBack}
>
  ← Back to Cart
</button>
```

#### Why This Approach

Same rationale as CI-6. The control triggers an in-page state change (not a URL navigation), so `<button>` is more semantically accurate than `<a>`. Native button semantics deliver correct role and focus handling without ARIA overhead.

---

### CI-8 — Order Confirmation Home Link: Wrong Semantic Role and Not Keyboard Accessible

**Severity:** Critical  
**Pages Affected:** Order Confirmation (`/order-confirmation`)  
**File:** `src/pages/OrderConfirmationPage.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Evinced Rules:** Interactable role, Keyboard accessible

#### Affected Element

| Element Selector | Content | Issues Detected |
|-----------------|---------|-----------------|
| `.confirm-home-link` | "← Back to Shop" navigation control | Interactable role, Keyboard accessible |

#### Root Cause

The "Back to Shop" control is `<div class="confirm-home-link">` with `onClick={() => navigate('/')}`. It acts as a navigation link but has no semantic role and is not keyboard-reachable.

```jsx
// Problematic code in src/pages/OrderConfirmationPage.jsx
<div className="confirm-home-link" onClick={() => navigate('/')}>
  ← Back to Shop
</div>
```

#### Proposed Remediation

Replace with an `<a>` element (navigation to the homepage is a link, not a button action):

```jsx
// Proposed fix for OrderConfirmationPage.jsx
<a className="confirm-home-link" href="/">
  ← Back to Shop
</a>
```

If the React Router `navigate()` function is needed for smooth SPA navigation, use the `Link` component:

```jsx
import { Link } from 'react-router-dom';

<Link className="confirm-home-link" to="/">
  ← Back to Shop
</Link>
```

#### Why This Approach

This control navigates the user to a different page (`/`), making it semantically a link rather than a button. Using `<a href="/">` or `<Link to="/">` communicates the destination to screen readers (e.g. "Back to Shop, link") and provides native keyboard focus + Enter activation. It also enables middle-click to open in a new tab, consistent with user expectations for navigation links.

---

### CI-9 — Images Missing Alternative Text

**Severity:** Critical  
**Pages Affected:** Homepage (/)  
**Files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Evinced Rule:** Image-alt  
**Evinced Knowledge Base:** https://knowledge.evinced.com/system-validations/image-alt

#### Affected Elements

| Element Selector | Source File | Image Path | Issues Detected |
|-----------------|------------|-----------|-----------------|
| `img[src$="New_Tees.png"]` | `src/components/HeroBanner.jsx` | `/images/home/New_Tees.png` | Image-alt (no `alt` attribute) |
| `img[src$="2bags_charms1.png"]` | `src/components/TheDrop.jsx` | `/images/home/2bags_charms1.png` | Image-alt (no `alt` attribute) |

#### Root Cause

Both `<img>` elements are missing the `alt` attribute. When `alt` is absent, screen readers fall back to reading the image `src` filename (e.g. "New underscore Tees dot png"), which is disruptive and meaningless.

```jsx
// Problematic code in HeroBanner.jsx
<img src="/images/home/New_Tees.png" className="hero-product-img" />

// Problematic code in TheDrop.jsx
<img src="/images/home/2bags_charms1.png" className="drop-product-img" />
```

#### Proposed Remediation

Add descriptive `alt` text that conveys the informational content of each image:

```jsx
// Proposed fix for HeroBanner.jsx
<img
  src="/images/home/New_Tees.png"
  className="hero-product-img"
  alt="New collection of Google-branded tee shirts displayed flat"
/>

// Proposed fix for TheDrop.jsx
<img
  src="/images/home/2bags_charms1.png"
  className="drop-product-img"
  alt="Two Google merchandise bags with charm accessories"
/>
```

#### Why This Approach

WCAG 1.1.1 requires all non-decorative images to carry a text alternative. These images appear in promotional hero and editorial sections and convey the products/offer being advertised — they are informational, not decorative. Descriptive `alt` text should:
- Describe the subject of the image as it relates to the surrounding content.
- Not start with "Image of…" (screen readers already announce `<img>` as an image).
- Be concise (under 150 characters for single-image `alt` attributes).

If an image is purely decorative and adds no informational value, use `alt=""` (empty string) to signal to screen readers that the image should be skipped.

---

### CI-10 — Invalid ARIA Attribute Values

**Severity:** Critical  
**Pages Affected:** Homepage (/), Product Detail (/product/:id)  
**Files:** `src/components/FeaturedPair.jsx`, `src/pages/ProductPage.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced Rule:** Aria-valid-attr-value  
**Evinced Knowledge Base:** https://knowledge.evinced.com/system-validations/aria-valid-attr-value

#### Affected Elements

| Element Selector | Page | Invalid Attribute | Invalid Value | Valid Values |
|-----------------|------|------------------|--------------|--------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | Homepage | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | Homepage | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| `ul[aria-relevant="changes"]` | Product Detail | `aria-relevant` | `"changes"` | Space-separated tokens from: `"additions"`, `"removals"`, `"text"`, `"all"` |

#### Root Cause

**Homepage — FeaturedPair.jsx:**
The heading element has `aria-expanded="yes"`, which is not a valid value for the `aria-expanded` attribute. The attribute accepts only `"true"`, `"false"`, or `"undefined"`. When an invalid value is set, some assistive technologies ignore the attribute entirely; others may behave unpredictably.

```jsx
// Problematic code in src/components/FeaturedPair.jsx
<h1 aria-expanded="yes">{card.title}</h1>
```

**Product Detail — ProductPage.jsx:**
A `<ul>` element has `aria-relevant="changes"`, which is not a valid ARIA token. The `aria-relevant` attribute (used on live regions) accepts a space-separated list of `additions`, `removals`, `text`, and `all`. The value `"changes"` is not among them.

```jsx
// Problematic code in src/pages/ProductPage.jsx
<ul aria-relevant="changes">{/* product details */}</ul>
```

#### Proposed Remediation

**FeaturedPair.jsx:**
Remove `aria-expanded` from `<h1>` entirely. The `aria-expanded` attribute is semantically appropriate only on interactive elements (buttons, comboboxes) that control a collapsible region — not on headings.

```jsx
// Proposed fix for FeaturedPair.jsx
<h1>{card.title}</h1>
```

**ProductPage.jsx:**
If a live region is intended, use the correct `aria-relevant` tokens. If `"changes"` was intended to mean both additions and removals, replace with `"additions removals"` (space-separated):

```jsx
// Proposed fix for ProductPage.jsx — if live region is needed
<ul aria-live="polite" aria-relevant="additions removals">
  {productDetails}
</ul>

// Or, if the aria-relevant is not needed, remove it:
<ul>{productDetails}</ul>
```

#### Why This Approach

Invalid ARIA attribute values cause the attribute to be silently ignored by conforming browsers (per the ARIA specification, invalid values fall back to the "no attribute" state). The fix must either supply a valid enumerated value or remove the attribute if it does not serve a valid semantic purpose. For `aria-expanded` on a heading, removal is correct because headings are not interactive disclosure widgets. For `aria-relevant`, using the correct token set ensures live region changes are announced with the expected scope.

---

### CI-11 — Slider Element Missing Required ARIA Attributes

**Severity:** Critical  
**Pages Affected:** Homepage (/)  
**File:** `src/components/TheDrop.jsx`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced Rule:** Aria-required-attr  
**Evinced Knowledge Base:** https://knowledge.evinced.com/system-validations/aria-required-attr

#### Affected Element

| Element Selector | Role | Missing Required Attributes | Issues Detected |
|-----------------|------|----------------------------|-----------------|
| `.drop-popularity-bar` | `role="slider"` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` | Aria-required-attr, Keyboard accessible |

#### Root Cause

The element has `role="slider"` but is missing all three required ARIA attributes for the `slider` role: `aria-valuenow` (current value), `aria-valuemin` (minimum value), and `aria-valuemax` (maximum value). Without these, screen readers cannot communicate the slider's state. Additionally, the element is not keyboard-focusable (no `tabindex`), which was also detected as a separate `Keyboard accessible` violation.

```jsx
// Problematic code in src/components/TheDrop.jsx
<div className="drop-popularity-bar" role="slider">
  <div className="drop-bar-fill" style={{ width: `${popularity}%` }} />
</div>
```

#### Proposed Remediation

Add all required ARIA attributes and keyboard support. If this is a read-only progress indicator (not a user-controlled slider), `role="slider"` is semantically incorrect — use `role="progressbar"` instead:

**Option A — Fix as a true interactive slider:**
```jsx
// Proposed fix for TheDrop.jsx — if the element is user-interactive
<div
  className="drop-popularity-bar"
  role="slider"
  aria-valuenow={popularity}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Popularity"
  tabIndex={0}
  onKeyDown={handleSliderKeyDown}
>
  <div className="drop-bar-fill" style={{ width: `${popularity}%` }} aria-hidden="true" />
</div>
```

**Option B — Replace with progressbar if read-only (recommended):**
```jsx
// Proposed fix for TheDrop.jsx — if this is a display-only progress indicator
<div
  className="drop-popularity-bar"
  role="progressbar"
  aria-valuenow={popularity}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Popularity: ${popularity}%`}
>
  <div className="drop-bar-fill" style={{ width: `${popularity}%` }} aria-hidden="true" />
</div>
```

#### Why This Approach

The `slider` role requires `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` per the WAI-ARIA specification — without them, the element is invalid. If the control is purely decorative/informational (a popularity bar), `role="progressbar"` is semantically more accurate and still requires the same three value attributes. Using `role="progressbar"` also removes the need for keyboard event handlers (progressbars are not interactive), simplifying the implementation. Providing a meaningful `aria-label` gives the control an accessible name so screen readers can announce "Popularity progress bar, 73%" rather than just a numeric value.

---

## 6. Non-Critical Issues (Serious Severity) — Not Remediated

The following **25 serious-severity** issues were detected by the Evinced audit. These issues represent significant accessibility barriers but were classified as serious (not critical) by the Evinced engine. No remediations were applied for these issues.

### S-1 — Color Contrast: Insufficient Contrast Ratio

**Severity:** Serious  
**WCAG:** 1.4.3 Contrast (Minimum) — Level AA (minimum 4.5:1 for normal text, 3:1 for large text)  
**Evinced Rule:** Color-contrast  
**Evinced Knowledge Base:** https://knowledge.evinced.com/system-validations/color-contrast  
**Total Occurrences:** 18

Affected elements span multiple pages:

| # | Page | Element Selector | Description |
|---|------|-----------------|-------------|
| 1 | Homepage | `.hero-content > p` | Hero subtitle text — insufficient contrast against the hero background image |
| 2 | Checkout – Basket | `.checkout-step:nth-child(3) > .step-label` | Step indicator label — low-contrast text |
| 3 | Checkout – Basket | `.summary-tax-note` | Tax note text in order summary — low-contrast gray on white |
| 4 | Order Confirmation | `.confirm-order-id-label` | Order ID label — low-contrast text |
| 5–17 | Products Page | `.filter-option > .filter-option-label > .filter-count` (×13) | Filter count badges (e.g., "(12)") on each filter option row — very low contrast gray (`#c8c8c8`) on white (`#ffffff`), ratio ~1.4:1 |
| 18 | Products Page | `.products-found` | "X Products Found" count text — low-contrast on white background |

**Source Files:**
- `src/components/HeroBanner.css` — `.hero-content p` foreground `#c8c0b8` on `#e8e0d8` background (~1.3:1)
- `src/components/FilterSidebar.css` — `.filter-count` foreground `#c8c8c8` on `#ffffff` (~1.4:1)
- `src/pages/NewPage.css` — `.products-found` foreground `#b0b4b8` on `#ffffff` (~1.9:1)
- `src/pages/CheckoutPage.jsx` / CSS — `.step-label` and `.summary-tax-note`
- `src/pages/OrderConfirmationPage.jsx` / CSS — `.confirm-order-id-label`

**Why Not Remediated:** Color contrast is classified as Serious (not Critical) by the Evinced engine. It requires design decisions (choosing specific color values) that go beyond structural code fixes. Remediation would involve updating CSS color values after UX/design review.

---

### S-2 — HTML Document Missing Language Attribute

**Severity:** Serious  
**WCAG:** 3.1.1 Language of Page — Level A  
**Evinced Rule:** Html-has-lang  
**Evinced Knowledge Base:** https://knowledge.evinced.com/system-validations/html-has-lang  
**Total Occurrences:** 6 (one per page, as every page shares the same `public/index.html`)

| # | Page | Element Selector | Description |
|---|------|-----------------|-------------|
| 1–6 | All pages | `html` | The `<html>` element has no `lang` attribute |

**Source File:** `public/index.html`

```html
<!-- Problematic code in public/index.html -->
<html>
  <head>...</head>
  <body>...</body>
</html>
```

**Impact:** Screen readers use the `lang` attribute to select the correct text-to-speech engine/pronunciation rules. Without it, users of multilingual screen readers may hear content mispronounced or have automatic language switching fail.

**Proposed (not applied) fix:**
```html
<html lang="en">
```

**Why Not Remediated:** This is a single-line fix that would be straightforward to apply, but since it is classified as Serious (not Critical) by the Evinced engine, it falls outside the scope of critical remediations per the audit task definition.

---

### S-3 — Invalid Language Attribute Value

**Severity:** Serious  
**WCAG:** 3.1.2 Language of Parts — Level AA  
**Evinced Rule:** Valid-lang  
**Evinced Knowledge Base:** https://knowledge.evinced.com/system-validations/valid-lang  
**Total Occurrences:** 1

| # | Page | Element Selector | Invalid `lang` Value | Description |
|---|------|-----------------|---------------------|-------------|
| 1 | Homepage | `p[lang="zz"]` | `"zz"` | A `<p>` element in `TheDrop.jsx` has `lang="zz"` — not a valid BCP 47 language tag |

**Source File:** `src/components/TheDrop.jsx`

```jsx
// Problematic code in TheDrop.jsx
<p lang="zz">Some promotional text</p>
```

**Impact:** An invalid `lang` attribute on an inline element prevents screen readers from correctly switching pronunciation rules for the marked-up passage. Browsers and assistive technologies silently ignore unrecognized language codes.

**Proposed (not applied) fix:**
```jsx
{/* Use a valid BCP 47 tag, e.g., "en" for English, or remove lang if the language matches the document */}
<p lang="en">Some promotional text</p>
{/* Or simply remove lang="" if the text is in the same language as the rest of the document */}
<p>Some promotional text</p>
```

**Why Not Remediated:** Classified as Serious (not Critical) by the Evinced engine.

---

## 7. Cross-Reference: Source Files and Affected Components

The table below maps each source file to the critical issue groups that originate from it.

| Source File | Critical Issue Groups | Critical Issue Count (approx.) |
|-------------|----------------------|-------------------------------|
| `src/components/Header.jsx` | CI-1 | ~40 (present on all 6 page states) |
| `src/components/Footer.jsx` | CI-2 | ~18 (present on all 6 page states) |
| `src/components/PopularSection.jsx` | CI-3 | 9 (Homepage only) |
| `src/components/FilterSidebar.jsx` | CI-4 | 26 (Products Page only) |
| `src/components/CartModal.jsx` | CI-5 | 2 (present on all page states where button is in DOM) |
| `src/pages/CheckoutPage.jsx` | CI-6, CI-7 | 4 (Checkout pages) |
| `src/pages/OrderConfirmationPage.jsx` | CI-8 | 2 (Order Confirmation) |
| `src/components/HeroBanner.jsx` | CI-9 | 1 (Homepage) |
| `src/components/TheDrop.jsx` | CI-9, CI-11 | 3 (Homepage) |
| `src/components/FeaturedPair.jsx` | CI-10 | 2 (Homepage) |
| `src/pages/ProductPage.jsx` | CI-10 | 1 (Product Detail) |
| `public/index.html` | — (S-2, serious) | 0 critical |

### Priority Remediation Order

Given the systemic nature of the issues, the recommended remediation priority is:

1. **`src/components/Header.jsx`** — affects all pages; fixing 4 icon buttons eliminates ~40 critical violations across the entire site.
2. **`src/components/Footer.jsx`** — affects all pages; 2 footer nav items.
3. **`src/components/FilterSidebar.jsx`** — 13 filter options, Products Page only but high-traffic interaction path.
4. **`src/pages/CheckoutPage.jsx`** — CI-6 and CI-7 block keyboard users from completing purchase.
5. **`src/components/PopularSection.jsx`** — 3 shop links, Homepage.
6. **`src/pages/OrderConfirmationPage.jsx`** — CI-8.
7. **`src/components/CartModal.jsx`** — CI-5 (close button accessible name).
8. **`src/components/HeroBanner.jsx` / `TheDrop.jsx`** — CI-9 (image alt), CI-11 (slider ARIA).
9. **`src/components/FeaturedPair.jsx` / `src/pages/ProductPage.jsx`** — CI-10 (invalid ARIA values).
10. **`public/index.html`** — S-2 (lang attribute, serious not critical but a trivial one-line fix).

---

*Report generated on 2026-03-17 by automated Evinced SDK audit via Playwright. Raw JSON results are stored in `tests/e2e/test-results/`.*
