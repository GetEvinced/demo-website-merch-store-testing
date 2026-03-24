# Accessibility Audit Report — Demo E-Commerce Website

**Audit Date:** 2026-03-24  
**Tool:** Evinced JS Playwright SDK v2.17+  
**Auditor:** Automated cloud agent (Cursor)  
**Audit Method:** Per-page `evAnalyze()` scans via Playwright/Chromium  
**Total Issues Found:** 151 (127 Critical, 24 Serious)

---

## Table of Contents

1. [Repository Overview & Page Inventory](#1-repository-overview--page-inventory)
2. [Summary by Page and Severity](#2-summary-by-page-and-severity)
3. [Critical Issues — Detailed Findings](#3-critical-issues--detailed-findings)
   - [CI-1: Wrong Semantic Role (div/span used as interactive element)](#ci-1-wrong-semantic-role)
   - [CI-2: Not Focusable (interactive element unreachable by keyboard)](#ci-2-not-focusable)
   - [CI-3: No Descriptive Text (interactive element has no accessible name)](#ci-3-no-descriptive-text)
   - [CI-4: Button Has No Accessible Name (AXE-BUTTON-NAME)](#ci-4-button-has-no-accessible-name)
   - [CI-5: Invalid ARIA Attribute Value (AXE-ARIA-VALID-ATTR-VALUE)](#ci-5-invalid-aria-attribute-value)
   - [CI-6: Images Missing Alt Text (AXE-IMAGE-ALT)](#ci-6-images-missing-alt-text)
   - [CI-7: Slider Missing Required ARIA Attributes (AXE-ARIA-REQUIRED-ATTR)](#ci-7-slider-missing-required-aria-attributes)
4. [Recommended Remediation for Each Critical Issue](#4-recommended-remediation-for-each-critical-issue)
5. [Remaining Non-Critical Issues (Not Remediated)](#5-remaining-non-critical-issues-not-remediated)

---

## 1. Repository Overview & Page Inventory

The repository is a React 18 single-page application (SPA) bundled with Webpack 5 and using React Router v7. The app simulates an e-commerce store with the following pages:

| Route | Component | Description |
|---|---|---|
| `/` | `src/pages/HomePage.jsx` | Landing page with hero banner, featured pairs, trending collections, popular section, "The Drop" section |
| `/shop/new` | `src/pages/NewPage.jsx` | Product listing with filter sidebar, sort dropdown, product grid |
| `/product/:id` | `src/pages/ProductPage.jsx` | Product detail page with image, description, quantity selector, add to cart/wishlist |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout: basket review then shipping + payment form |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Order success page with order ID |

**Shared Components (appear on every page):**
- `src/components/Header.jsx` — logo, icon bar (wishlist, search, cart, login, flag), main navigation
- `src/components/Footer.jsx` — footer links
- `src/components/CartModal.jsx` — cart drawer/modal
- `src/components/WishlistModal.jsx` — wishlist drawer/modal

**Audit Entry Points:**  
All five pages were audited individually using Playwright. Checkout and Order Confirmation required navigation through the full add-to-cart flow to populate the required state.

---

## 2. Summary by Page and Severity

| Page | URL | Total | Critical | Serious |
|---|---|---|---|---|
| Homepage | `/` | 35 | 32 | 3 |
| Products Listing | `/shop/new` | 55 | 41 | 14 |
| Product Detail | `/product/:id` | 20 | 18 | 2 |
| Checkout | `/checkout` | 21 | 18 | 3 |
| Order Confirmation | `/order-confirmation` | 20 | 18 | 2 |
| **Total** | | **151** | **127** | **24** |

### Issue Type Breakdown (Critical)

| ID | Issue Type | Evinced Rule | Count | Pages Affected |
|---|---|---|---|---|
| CI-1 | Wrong Semantic Role | `WRONG_SEMANTIC_ROLE` | 47 | All 5 |
| CI-2 | Not Focusable | `NOT_FOCUSABLE` | 48 | All 5 |
| CI-3 | No Descriptive Text | `NO_DESCRIPTIVE_TEXT` | 18 | All 5 |
| CI-4 | Button Has No Name | `AXE-BUTTON-NAME` | 8 | All 5 |
| CI-5 | Invalid ARIA Attribute Value | `AXE-ARIA-VALID-ATTR-VALUE` | 3 | Homepage, Product Detail |
| CI-6 | Image Missing Alt | `AXE-IMAGE-ALT` | 2 | Homepage only |
| CI-7 | Slider Missing Required ARIA | `AXE-ARIA-REQUIRED-ATTR` | 1 | Homepage only |
| | **Total Critical** | | **127** | |

### Issue Type Breakdown (Serious / Non-Critical)

| ID | Issue Type | Evinced Rule | Count | Pages Affected |
|---|---|---|---|---|
| NC-1 | Insufficient Color Contrast | `AXE-COLOR-CONTRAST` | 18 | All 5 |
| NC-2 | HTML Missing Lang Attribute | `AXE-HTML-HAS-LANG` | 5 | All 5 |
| NC-3 | Invalid Lang Attribute Value | `AXE-VALID-LANG` | 1 | Homepage only |
| | **Total Serious** | | **24** | |

---

## 3. Critical Issues — Detailed Findings

### CI-1: Wrong Semantic Role

**Evinced Rule:** `WRONG_SEMANTIC_ROLE`  
**WCAG:** 4.1.2 — Name, Role, Value (Level A)  
**Count:** 47 instances across all pages  
**Severity:** Critical

Interactive behavior is implemented on `<div>` elements without supplying the correct ARIA role. Assistive technologies (screen readers) cannot determine that these elements are interactive, so users relying on AT cannot discover or activate them.

#### Affected Elements by Page

| Page | CSS Selector | Element Description | Source File |
|---|---|---|---|
| All 5 pages | `.wishlist-btn` | Wishlist icon button in header — `<div>` with `onClick`, no `role="button"` | `src/components/Header.jsx:131` |
| All 5 pages | `.icon-btn:nth-child(2)` | Search icon button in header — `<div>` with no `role` | `src/components/Header.jsx:140` |
| All 5 pages | `.icon-btn:nth-child(4)` | User/login icon button in header — `<div>` with no `role` | `src/components/Header.jsx:156` |
| All 5 pages | `.flag-group` | Country/region selector — `<div>` with `onClick`, no `role` | `src/components/Header.jsx:161` |
| All 5 pages | `li:nth-child(3) > .footer-nav-item` | "Sustainability" footer link — `<div>` with `onClick`, no `role` | `src/components/Footer.jsx:13` |
| All 5 pages | `.footer-list:nth-child(2) > li > .footer-nav-item` | "FAQs" footer link — `<div>` with `onClick`, no `role` | `src/components/Footer.jsx:18` |
| Homepage | `.product-card:nth-child(1,2,3) > .product-card-info > .shop-link` | "Shop …" navigation `<div>` in PopularSection (×3) | `src/components/PopularSection.jsx:54` |
| Products | `.filter-group:nth-child(2,3,4) > .filter-options > .filter-option:nth-child(n)` | Filter option checkboxes — `<div>` with `onClick`, no `role="checkbox"` | `src/components/FilterSidebar.jsx:74,116,156` |
| Checkout | `.checkout-continue-btn` | "Continue" button — `<div>` advancing checkout step | `src/pages/CheckoutPage.jsx:156` |
| Order Confirmation | `.confirm-home-link` | "← Back to Shop" navigation — `<div>` with `onClick`, no `role` | `src/pages/OrderConfirmationPage.jsx:40` |

---

### CI-2: Not Focusable

**Evinced Rule:** `NOT_FOCUSABLE`  
**WCAG:** 2.1.1 — Keyboard (Level A)  
**Count:** 48 instances across all pages  
**Severity:** Critical

The same `<div>`-as-interactive-element pattern from CI-1 also means these elements have no `tabindex`, making them unreachable by keyboard navigation. Each CI-1 element also generates a `NOT_FOCUSABLE` violation. An additional unique element is:

| Page | CSS Selector | Element Description | Source File |
|---|---|---|---|
| Homepage | `.drop-popularity-bar` | Popularity slider (`role="slider"`) — custom element with no `tabindex` | `src/components/TheDrop.jsx:19` |

> **Note:** The `.drop-popularity-bar` element has `role="slider"` but no `tabindex="0"`, making it unreachable by keyboard. It also lacks required ARIA attributes (see CI-7).

---

### CI-3: No Descriptive Text

**Evinced Rule:** `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 — Name, Role, Value (Level A) & 2.4.6 — Headings and Labels (Level AA)  
**Count:** 18 instances across all pages  
**Severity:** Critical

Interactive elements exist where their accessible name is either absent or is hidden from assistive technology via `aria-hidden="true"` on the only text content.

#### Affected Elements by Page

| Page | CSS Selector | Element Description | Source File | Problem |
|---|---|---|---|---|
| All 5 pages | `.icon-btn:nth-child(2)` | Search `<div>` | `src/components/Header.jsx:142` | `<span aria-hidden="true">Search</span>` — only text is hidden from AT |
| All 5 pages | `.icon-btn:nth-child(4)` | Login `<div>` | `src/components/Header.jsx:158` | `<span aria-hidden="true">Login</span>` — only text is hidden from AT |
| All 5 pages | `.footer-list:nth-child(2) > li > .footer-nav-item` | "FAQs" footer div | `src/components/Footer.jsx:18` | `<span aria-hidden="true">FAQs</span>` — only text is hidden from AT |
| Homepage | `.product-card:nth-child(1,2,3) > .product-card-info > .shop-link` | "Shop …" `<div>` in PopularSection (×3) | `src/components/PopularSection.jsx:59` | `<span aria-hidden="true">{product.shopLabel}</span>` — only text is hidden from AT |

---

### CI-4: Button Has No Accessible Name

**Evinced Rule:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 — Name, Role, Value (Level A)  
**Count:** 8 instances (2 per page × 5 pages, with slight variation)  
**Severity:** Critical

Proper `<button>` elements exist but have no accessible name because they contain only an SVG icon with `aria-hidden="true"` and no `aria-label`.

#### Affected Elements

| Page | CSS Selector | Element Description | Source File |
|---|---|---|---|
| All pages (CartModal) | `#cart-modal > div:nth-child(1) > button` | Cart modal close button — icon-only `<button>`, SVG is `aria-hidden` | `src/components/CartModal.jsx:56` |
| All pages (WishlistModal) | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist modal close button — icon-only `<button>`, SVG is `aria-hidden` | `src/components/WishlistModal.jsx:61` |
| Checkout / Order Confirmation | `div:nth-child(1) > button` | Close button variant (same issue, slightly different selector on pages without both modals open) | Same files above |

> **Note:** Both modals are loaded in the DOM on every page via the shared App layout. The WishlistModal has `role="dialog"` / `aria-modal` / `aria-label` correctly set; the CartModal does not (it also lacks `role="dialog"` — though that violation falls under a different rule not detected as critical here).

---

### CI-5: Invalid ARIA Attribute Value

**Evinced Rule:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 — Name, Role, Value (Level A)  
**Count:** 3 instances  
**Severity:** Critical

ARIA attributes are present but set to invalid values that do not match the specification.

#### Affected Elements

| Page | CSS Selector | Element | Invalid Attribute | Invalid Value | Valid Values | Source File |
|---|---|---|---|---|---|---|
| Homepage | `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">` | `aria-expanded` | `"yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx:46` |
| Homepage | `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">` (second card) | `aria-expanded` | `"yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx:46` |
| Product Detail | `ul[aria-relevant="changes"]` | Details list `<ul aria-relevant="changes">` | `aria-relevant` | `"changes"` | Space-separated tokens from: `additions`, `removals`, `text`, `all` | `src/pages/ProductPage.jsx:144` |

---

### CI-6: Images Missing Alt Text

**Evinced Rule:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 — Non-text Content (Level A)  
**Count:** 2 instances  
**Severity:** Critical  
**Pages Affected:** Homepage only

`<img>` elements without an `alt` attribute. Screen readers announce the filename as content, which provides no meaningful information.

#### Affected Elements

| Page | CSS Selector | Image Src | Source File |
|---|---|---|---|
| Homepage | `img[src$="New_Tees.png"]` | `/images/home/New_Tees.png` — hero banner product image | `src/components/HeroBanner.jsx:18` |
| Homepage | `img[src$="2bags_charms1.png"]` | `/images/home/2bags_charms1.png` — "The Drop" section image | `src/components/TheDrop.jsx:13` |

---

### CI-7: Slider Missing Required ARIA Attributes

**Evinced Rule:** `AXE-ARIA-REQUIRED-ATTR`  
**WCAG:** 4.1.2 — Name, Role, Value (Level A)  
**Count:** 1 instance  
**Severity:** Critical  
**Pages Affected:** Homepage only

An element has `role="slider"` but is missing the three required attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, assistive technologies cannot convey the current or range values to screen reader users.

#### Affected Element

| Page | CSS Selector | Element | Missing Attributes | Source File |
|---|---|---|---|---|
| Homepage | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator">` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` | `src/components/TheDrop.jsx:19` |

---

## 4. Recommended Remediation for Each Critical Issue

> **Note per user instructions: No source code modifications were made. The remediations below are recommendations only.**

---

### Remediation for CI-1 + CI-2: Wrong Semantic Role & Not Focusable

**Root Cause:** `<div>` elements are used as interactive controls (buttons, links, checkboxes) without the required semantic role or keyboard accessibility attributes.

**Recommended Fix Pattern:**

Replace `<div>` interactive elements with native HTML elements or add the appropriate ARIA role and `tabindex="0"`:

**Option A — Preferred: Replace `<div>` with native `<button>` or `<a>`**

For elements acting as buttons (wishlist toggle, search, login, flag selector, filter options, Continue button, Back to Shop):
```jsx
// Before (wrong):
<div className="wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

// After (correct):
<button className="wishlist-btn" onClick={openWishlist} aria-label="Open Wishlist">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Wishlist</span>
</button>
```

For elements acting as links (footer nav items, "Back to Shop"):
```jsx
// Before (wrong):
<div className="footer-nav-item" onClick={() => {}}>Sustainability</div>

// After (correct):
<a href="/sustainability" className="footer-nav-item">Sustainability</a>
```

For filter options acting as checkboxes:
```jsx
// Before (wrong):
<div className="filter-option" onClick={() => onPriceChange(range)}>

// After (correct):
<label className="filter-option">
  <input type="checkbox" checked={checked} onChange={() => onPriceChange(range)} />
  …
</label>
```

**Option B — Alternative: Add `role` + `tabindex` + keyboard handler**

If `<div>` must be kept for styling reasons, add `role="button"`, `tabindex="0"`, and an `onKeyDown` handler to support Enter/Space activation:
```jsx
<div
  className="checkout-continue-btn"
  role="button"
  tabIndex={0}
  onClick={() => setStep('shipping')}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setStep('shipping'); }}
>
  Continue
</div>
```

**Why this approach:** Native HTML semantics are automatically keyboard-accessible, announced correctly by screen readers, and require no extra ARIA attributes. They are the most robust solution and require the least ongoing maintenance.

**Affected files:**
- `src/components/Header.jsx` — `.wishlist-btn`, `.icon-btn` (search, login), `.flag-group`
- `src/components/Footer.jsx` — `.footer-nav-item` (both)
- `src/components/PopularSection.jsx` — `.shop-link` (×3)
- `src/components/FilterSidebar.jsx` — `.filter-option` (×11)
- `src/pages/CheckoutPage.jsx` — `.checkout-continue-btn`, `.checkout-back-btn`
- `src/pages/OrderConfirmationPage.jsx` — `.confirm-home-link`
- `src/components/CartModal.jsx` — `.continueBtn`

---

### Remediation for CI-3: No Descriptive Text

**Root Cause:** Interactive elements have their visible label wrapped in `<span aria-hidden="true">`, making the accessible name empty.

**Recommended Fix:** Remove `aria-hidden="true"` from the text spans **or** add an explicit `aria-label` on the parent element.

```jsx
// Before (wrong):
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>  {/* text hidden from AT */}
</div>

// After (correct — Option A: remove aria-hidden):
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
  <span>Search</span>
</button>

// After (correct — Option B: add aria-label to parent):
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</button>
```

**Why this approach:** Providing a visible label or explicit `aria-label` ensures screen readers announce a meaningful name. Option B (aria-label on button, aria-hidden on span) avoids double-announcing the label to screen readers while keeping the visible text for sighted users.

**Affected files:**
- `src/components/Header.jsx` — search `<div>` (line 142), login `<div>` (line 158)
- `src/components/Footer.jsx` — FAQs `<div>` (line 18)
- `src/components/PopularSection.jsx` — `.shop-link` spans (line 59)

---

### Remediation for CI-4: Button Has No Accessible Name

**Root Cause:** `<button>` elements in CartModal and WishlistModal contain only an SVG with `aria-hidden="true"` and no `aria-label`.

**Recommended Fix:** Add `aria-label` to both close buttons.

```jsx
// CartModal.jsx — Before:
<button className={styles.closeBtn} onClick={closeCart}>
  <svg aria-hidden="true">…</svg>
</button>

// After:
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close shopping cart">
  <svg aria-hidden="true">…</svg>
</button>
```

```jsx
// WishlistModal.jsx — Before:
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist}>
  <svg aria-hidden="true">…</svg>
</button>

// After:
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** The `aria-label` attribute provides a text alternative directly on the `<button>` without requiring DOM changes. It overrides the computed accessible name. Descriptive labels (e.g., "Close shopping cart" vs. generic "Close") are preferred as they give context when multiple close buttons exist on a page.

**Affected files:**
- `src/components/CartModal.jsx` (line 56)
- `src/components/WishlistModal.jsx` (line 61)

---

### Remediation for CI-5: Invalid ARIA Attribute Value

**Root Cause A — `aria-expanded="yes"` in FeaturedPair:**  
`aria-expanded` is a boolean state attribute. Its valid values are `"true"` or `"false"`. The value `"yes"` is not valid per WAI-ARIA specification and causes the attribute to be ignored by assistive technologies.

**Recommended Fix:**

```jsx
// FeaturedPair.jsx — Before:
<h1 aria-expanded="yes">{item.title}</h1>

// After (if expansion state is needed):
<h1 aria-expanded="false">{item.title}</h1>

// Or better: remove the attribute entirely if it's not representing a real expandable widget
<h3>{item.title}</h3>
```

> Note: `aria-expanded` on a heading element is semantically incorrect anyway — headings do not expand. This attribute should be removed unless the heading is the trigger for an accordion/disclosure widget.

**Root Cause B — `aria-relevant="changes"` in ProductPage:**  
`aria-relevant` requires one or more space-separated tokens from the set: `additions`, `removals`, `text`, `all`. The value `"changes"` is not in that set and is therefore invalid.

**Recommended Fix:**

```jsx
// ProductPage.jsx — Before:
<ul className={styles.detailsList} aria-relevant="changes" aria-live="polite">

// After (correct value — typically "additions text" covers most live-region needs):
<ul className={styles.detailsList} aria-relevant="additions text" aria-live="polite">

// Or remove aria-relevant if default behavior is acceptable:
<ul className={styles.detailsList} aria-live="polite">
```

**Why this approach:** Correcting invalid ARIA values ensures they function as intended. For `aria-expanded`, the value must reflect boolean state. For `aria-relevant`, using `"additions text"` is the most common valid combination for dynamic content lists.

**Affected files:**
- `src/components/FeaturedPair.jsx` (line 46)
- `src/pages/ProductPage.jsx` (line 144)

---

### Remediation for CI-6: Images Missing Alt Text

**Root Cause:** Two `<img>` elements in `HeroBanner.jsx` and `TheDrop.jsx` are missing the `alt` attribute entirely. Screen readers fall back to announcing the URL/filename.

**Recommended Fix:** Add descriptive `alt` attributes.

```jsx
// HeroBanner.jsx — Before:
<img src={HERO_IMAGE} />

// After:
<img src={HERO_IMAGE} alt="Winter Basics — new tees collection" />
```

```jsx
// TheDrop.jsx — Before:
<img src={DROP_IMAGE} loading="lazy" />

// After:
<img src={DROP_IMAGE} loading="lazy" alt="Android, YouTube, and Super G plushie bag charms" />
```

**Why this approach:** All meaningful images must have alternative text per WCAG 1.1.1. The `alt` text should convey the image's purpose in context — for the hero it reinforces the promotion headline, for "The Drop" it describes the featured products. If the image were purely decorative, `alt=""` would be correct, but both images are content-bearing.

**Affected files:**
- `src/components/HeroBanner.jsx` (line 18)
- `src/components/TheDrop.jsx` (line 13)

---

### Remediation for CI-7: Slider Missing Required ARIA Attributes

**Root Cause:** The "Drop popularity" element has `role="slider"` but is missing the three ARIA attributes required by the slider role specification: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, the element conveys no state to assistive technologies.

**Recommended Fix:**

```jsx
// TheDrop.jsx — Before:
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// After (provide required attributes and keyboard access):
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext="75% popularity"
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

> If this element is purely decorative (not interactive), using `role="slider"` is incorrect. The simplest fix would be to remove the `role` attribute or replace it with `role="presentation"`:
```jsx
<div className="drop-popularity-bar" aria-label="Popularity: high" role="img" />
```

**Why this approach:** The WAI-ARIA specification mandates `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for `role="slider"`. The fix adds meaningful values. If the element is not truly interactive (users cannot change the value), using `role="img"` with a descriptive `aria-label` is more semantically accurate and simpler to maintain.

**Affected files:**
- `src/components/TheDrop.jsx` (line 19)

---

## 5. Remaining Non-Critical Issues (Not Remediated)

These issues were classified as **Serious** (not Critical) by Evinced and are documented here for tracking.

---

### NC-1: Insufficient Color Contrast (AXE-COLOR-CONTRAST)

**WCAG:** 1.4.3 — Contrast (Minimum) (Level AA) — minimum 4.5:1 for normal text  
**Count:** 18 instances  
**Severity:** Serious

Text elements with insufficient contrast between foreground and background colors.

| Page | CSS Selector | Element Description | Source File | Notes |
|---|---|---|---|---|
| Homepage | `.hero-content > p` (within `.hero-banner`) | Hero subtitle "Warm hues for cooler days" | `src/components/HeroBanner.css` | Light-colored text on similarly-light hero background |
| Products | `.filter-group:nth-child(2-4) > .filter-options > .filter-option:nth-child(n) > .filter-option-label > .filter-count` | Product count badges in filter sidebar (×11) | `src/components/FilterSidebar.css` | `.filter-count` color is too light against white background |
| Products | `.products-found` | "X Products Found" label | `src/pages/NewPage.css` | Light gray text on white |
| Product Detail | `p:nth-child(4)` (within `#main-content > div`) | Product description text | `src/pages/ProductPage.module.css` | `.productDescription` color lacks sufficient contrast |
| Checkout | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" step label (inactive state) | `src/pages/CheckoutPage.css` | Inactive step label is too light |
| Checkout | `.summary-tax-note` (within `aside`) | "Taxes calculated at next step" note | `src/pages/CheckoutPage.css` | Muted helper text |
| Order Confirmation | `.confirm-order-id-label` (within `.confirm-order-id-box`) | "Order ID" label in confirmation box | `src/pages/OrderConfirmationPage.css` | Label text too light |

**Recommended Fix (not implemented):** Increase contrast for all affected text elements to meet the WCAG AA minimum ratio of 4.5:1 for normal text (or 3:1 for large text ≥18pt/14pt bold). Use a tool such as [Colorable](https://colorable.jxnblk.com/) or browser DevTools contrast checker to find compliant hex values.

---

### NC-2: HTML Element Missing Lang Attribute (AXE-HTML-HAS-LANG)

**WCAG:** 3.1.1 — Language of Page (Level A)  
**Count:** 5 instances (one per page — same root cause)  
**Severity:** Serious

The `<html>` element in `public/index.html` has no `lang` attribute. Screen readers use the `lang` attribute to select the correct pronunciation and language rules. Without it, content may be read with incorrect pronunciation.

| Page | CSS Selector | Source File |
|---|---|---|
| All 5 pages | `html` | `public/index.html:3` |

**Recommended Fix (not implemented):**

```html
<!-- public/index.html — Before: -->
<html>

<!-- After: -->
<html lang="en">
```

**Why not remediated:** While this is Level A (the most basic WCAG conformance level), the user instructions specified no remediations. The fix is trivial: add `lang="en"` to the `<html>` tag in `public/index.html`.

---

### NC-3: Invalid Lang Attribute Value (AXE-VALID-LANG)

**WCAG:** 3.1.2 — Language of Parts (Level AA)  
**Count:** 1 instance  
**Severity:** Serious  
**Page:** Homepage only

A paragraph element has `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers may attempt to use this invalid language code for pronunciation switching and fail silently.

| Page | CSS Selector | Element | Source File |
|---|---|---|---|
| Homepage | `p[lang="zz"]` | Paragraph in "The Drop" section | `src/components/TheDrop.jsx:21` |

**Recommended Fix (not implemented):** Remove the `lang` attribute (the page is already in English) or replace `"zz"` with the correct BCP 47 language tag (e.g., `lang="en"` for English):

```jsx
// TheDrop.jsx — Before:
<p lang="zz">Our brand-new, limited-edition…</p>

// After:
<p>Our brand-new, limited-edition…</p>
```

---

## Appendix: Raw Scan Statistics

| Page | Scan Method | Issues |
|---|---|---|
| Homepage (`/`) | `evAnalyze()` | 35 |
| Products (`/shop/new`) | `evAnalyze()` | 55 |
| Product Detail (`/product/1`) | `evAnalyze()` | 20 |
| Checkout (`/checkout`) | `evAnalyze()` | 21 |
| Order Confirmation (`/order-confirmation`) | `evAnalyze()` | 20 |
| **Total** | | **151** |

Raw JSON results are saved in `tests/e2e/test-results/`:
- `page-homepage.json`
- `page-products.json`
- `page-product-detail.json`
- `page-checkout.json`
- `page-order-confirmation.json`
