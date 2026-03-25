# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-25  
**Tool:** Evinced SDK for Playwright (`@evinced/js-playwright-sdk` v2.43.0)  
**Audit Method:** Automated per-page static analysis (`evAnalyze()`) on a live Webpack dev server at `http://localhost:3000`  
**Branch:** `cursor/accessibility-audit-report-3798`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Pages Audited](#2-pages-audited)
3. [Issue Classification](#3-issue-classification)
4. [Critical Issues — Detailed Findings](#4-critical-issues--detailed-findings)
   - [C-1 · Div used as interactive control (Interactable Role / NOT_FOCUSABLE)](#c-1--div-used-as-interactive-control-wrong_semantic_role--not_focusable)
   - [C-2 · Icon-only controls with no accessible name (NO_DESCRIPTIVE_TEXT)](#c-2--icon-only-controls-with-no-accessible-name-no_descriptive_text)
   - [C-3 · Buttons with no discernible text (AXE-BUTTON-NAME)](#c-3--buttons-with-no-discernible-text-axe-button-name)
   - [C-4 · Images missing alternative text (AXE-IMAGE-ALT)](#c-4--images-missing-alternative-text-axe-image-alt)
   - [C-5 · Invalid ARIA attribute value `aria-expanded="yes"` (AXE-ARIA-VALID-ATTR-VALUE)](#c-5--invalid-aria-attribute-value-aria-expandedyes-axe-aria-valid-attr-value)
   - [C-6 · Slider role missing required ARIA attributes (AXE-ARIA-REQUIRED-ATTR)](#c-6--slider-role-missing-required-aria-attributes-axe-aria-required-attr)
5. [Recommended Remediations for Critical Issues](#5-recommended-remediations-for-critical-issues)
6. [Remaining Non-Critical Issues (Serious)](#6-remaining-non-critical-issues-serious)
7. [Raw Issue Counts per Page](#7-raw-issue-counts-per-page)

---

## 1. Executive Summary

The Evinced SDK scanned **5 pages** of the demo e-commerce website and identified a total of **151 issues** across all pages.

| Severity | Total Issues |
|----------|-------------|
| **Critical** | **127** |
| **Serious** | **24** |
| Total | **151** |

All **Critical** issues (127) fall into six distinct root-cause categories, each rooted in a small number of authoring mistakes that repeat across shared components (Header, Footer, CartModal, etc.). Fixing the root causes in the shared components would resolve the majority of the issues site-wide.

All **Serious** issues (24) are not remediated in this report per the task scope. They are fully documented in [Section 6](#6-remaining-non-critical-issues-serious).

---

## 2. Pages Audited

| Page | Route | Source Component | Issues Found |
|------|-------|-----------------|--------------|
| Home | `/` | `src/pages/HomePage.jsx` | 35 (32 Critical, 3 Serious) |
| New / Products | `/shop/new` | `src/pages/NewPage.jsx` | 55 (41 Critical, 14 Serious) |
| Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` | 20 (18 Critical, 2 Serious) |
| Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` | 21 (18 Critical, 3 Serious) |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | 20 (18 Critical, 2 Serious) |

**Entry points confirmed in `src/components/App.jsx`:**
```jsx
<Route path="/"                    element={<HomePage />} />
<Route path="/shop/new"            element={<NewPage />} />
<Route path="/product/:id"         element={<ProductPage />} />
<Route path="/checkout"            element={<CheckoutPage />} />
<Route path="/order-confirmation"  element={<OrderConfirmationPage />} />
```

---

## 3. Issue Classification

### Critical Issues by Type

| Issue ID | Type | Issue Name | WCAG Reference | Pages Affected | Instances |
|----------|------|-----------|----------------|---------------|-----------|
| C-1a | `WRONG_SEMANTIC_ROLE` | Interactable role | WCAG 2.0 A (4.1.2) | All 5 | 47 |
| C-1b | `NOT_FOCUSABLE` | Keyboard accessible | WCAG 2.0 A (2.1.1) | All 5 | 48 |
| C-2 | `NO_DESCRIPTIVE_TEXT` | Accessible name | WCAG 2.0 A (4.1.2) | All 5 | 18 |
| C-3 | `AXE-BUTTON-NAME` | Button-name | WCAG 2.0 A (4.1.2) | All 5 | 8 |
| C-4 | `AXE-IMAGE-ALT` | Image-alt | WCAG 2.0 A (1.1.1) | Home | 2 |
| C-5 | `AXE-ARIA-VALID-ATTR-VALUE` | Aria-valid-attr-value | WCAG 2.0 A (4.1.2) | Home, Product Detail | 3 |
| C-6 | `AXE-ARIA-REQUIRED-ATTR` | Aria-required-attr | WCAG 2.0 A (4.1.2) | Home | 1 |
| **Total** | | | | | **127** |

### Serious Issues by Type

| Issue ID | Type | Issue Name | WCAG Reference | Pages Affected | Instances |
|----------|------|-----------|----------------|---------------|-----------|
| S-1 | `AXE-COLOR-CONTRAST` | Color-contrast | WCAG 2.0 AA (1.4.3) | All 5 | 19 |
| S-2 | `AXE-HTML-HAS-LANG` | Html-has-lang | WCAG 2.0 A (3.1.1) | All 5 | 5 |
| S-3 | `AXE-VALID-LANG` | Valid-lang | WCAG 2.0 AA (3.1.2) | Home | 1 |
| **Total** | | | | | **25** |

> Note: Evinced deduplicates the `AXE-HTML-HAS-LANG` issue as one per page (same `<html>` element), so it appears 5 times; there is only one root cause (missing `lang` in `public/index.html`).

---

## 4. Critical Issues — Detailed Findings

---

### C-1 · Div used as interactive control (`WRONG_SEMANTIC_ROLE` / `NOT_FOCUSABLE`)

**Severity:** Critical  
**WCAG:** 2.0 A — Success Criteria 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/interactable-role  

**Description from Evinced:**
> *Screen readers are unable to identify that the element is interactive due to missing or incorrect semantics. Screen reader users may not find the content or may not realize that the content is interactive.*
>
> *The element is missing the right tags or has incorrect tags. The element is excluded from the keyboard tab sequence and is therefore inaccessible to keyboard users.*

This is the most pervasive critical issue class. Throughout the codebase, plain `<div>` elements with `onClick` handlers and `style="cursor: pointer"` are used in place of semantic interactive elements (`<button>`, `<a>`). These divs are not reachable by keyboard tab, not announced as interactive by screen readers, and have no activation semantics (Enter/Space keys do not trigger their actions).

**Affected Elements Across All Pages:**

| Element / Selector | Component / File | Description |
|--------------------|-----------------|-------------|
| `.wishlist-btn` (`<div class="icon-btn wishlist-btn">`) | `src/components/Header.jsx:131` | Wishlist toggle — div, no `role`, no `tabindex` |
| `.icon-btn:nth-child(2)` (`<div class="icon-btn">`) | `src/components/Header.jsx:140` | Search icon — div, no `role`, no `tabindex` |
| `.icon-btn:nth-child(4)` (`<div class="icon-btn">`) | `src/components/Header.jsx:156` | Login/user icon — div, no `role`, no `tabindex` |
| `.flag-group` | `src/components/Header.jsx:161` | Region selector (US/Canada flags) — div, no `role`, no `tabindex` |
| `.product-card:nth-child(n) > .shop-link` | `src/components/PopularSection.jsx:54` | "Shop Drinkware/Fun & Games/Stationery" links — divs with `onClick`, no `role`, no `tabindex`; text inside wrapped in `aria-hidden` span |
| `.footer-nav-item` (Sustainability) | `src/components/Footer.jsx:13` | Footer "Sustainability" link — div, no `role`, no `tabindex` |
| `.footer-nav-item` (FAQs) | `src/components/Footer.jsx:18` | Footer "FAQs" link — div with `aria-hidden` text span, no `role`, no `tabindex` |
| `.filter-group … .filter-option` (Price, Size, Brand filter rows) | `src/components/FilterSidebar.jsx:74,116,156` | All 13 filter option rows on /shop/new — divs, no `role="checkbox"`, no `tabindex` |
| `.checkout-continue-btn` | `src/pages/CheckoutPage.jsx:156` | "Continue" basket→shipping step button — div, no `role`, no `tabindex` |
| `.checkout-back-btn` | `src/pages/CheckoutPage.jsx:297` | "← Back to Cart" on shipping step — div, no `role`, no `tabindex` |
| `.confirm-home-link` | `src/pages/OrderConfirmationPage.jsx:40` | "← Back to Shop" on confirmation — div, no `role`, no `tabindex` |
| `CartModal` `.continueBtn` div | `src/components/CartModal.jsx:128` | "Continue Shopping" in cart drawer — div, text wrapped in `aria-hidden` |

**Pages affected:** All 5 (Home, New, Product Detail, Checkout, Order Confirmation)

---

### C-2 · Icon-only controls with no accessible name (`NO_DESCRIPTIVE_TEXT`)

**Severity:** Critical  
**WCAG:** 2.0 A — Success Criterion 4.1.2 (Name, Role, Value)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/accessible-name  

**Description from Evinced:**
> *The element does not have an accessible name to inform the screen reader of its purpose and function. Assistive technologies use the accessible name to label, announce and trigger the element's action.*

Several interactive divs in the header, footer, and popular section render their visual labels inside `<span aria-hidden="true">`, which means the text is intentionally hidden from assistive technology. The elements therefore have no accessible name at all — a screen reader would either announce the element with no label or skip it entirely.

**Affected Elements:**

| Element / Selector | Component / File | Description |
|--------------------|-----------------|-------------|
| `.icon-btn:nth-child(2)` | `src/components/Header.jsx:140–143` | Search div: SVG with `aria-hidden="true"` + `<span aria-hidden="true">Search</span>` |
| `.icon-btn:nth-child(4)` | `src/components/Header.jsx:156–159` | Login div: SVG with `aria-hidden="true"` + `<span aria-hidden="true">Login</span>` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `src/components/Footer.jsx:18` | "FAQs" footer link: only child is `<span aria-hidden="true">FAQs</span>` |
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx:54–59` | "Shop Drinkware": text inside `aria-hidden` span |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx:54–59` | "Shop Fun and Games": text inside `aria-hidden` span |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx:54–59` | "Shop Stationery": text inside `aria-hidden` span |

**Pages affected:** All 5

---

### C-3 · Buttons with no discernible text (`AXE-BUTTON-NAME`)

**Severity:** Critical  
**WCAG:** 2.0 A — Success Criterion 4.1.2 (Name, Role, Value)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/button-name  

**Description from Evinced:**
> *Element does not have inner text that is visible to screen readers; aria-label attribute does not exist or is empty; aria-labelledby attribute does not exist or references empty elements.*

Two close buttons in the Cart and Wishlist modal drawers use only an SVG icon (with `aria-hidden="true"`) and have no `aria-label`. When a screen reader encounters these buttons, it cannot determine their purpose or even that they are close buttons.

**Affected Elements:**

| Element / Selector | Component / File | Description |
|--------------------|-----------------|-------------|
| `#cart-modal > div:nth-child(1) > button` | `src/components/CartModal.jsx:56–64` | Cart drawer close button — SVG only, `aria-hidden="true"`, no `aria-label` |
| `div[role="dialog"] > div:nth-child(1) > button` | `src/components/WishlistModal.jsx:61–80` | Wishlist drawer close button — SVG only, `aria-hidden="true"`, no `aria-label` |

**Note on CartModal:** The cart drawer (`#cart-modal`) additionally has `role="dialog"`, `aria-modal`, and `aria-label` attributes stripped in code (commented as intentional a11y issues), but those are categorised under the WRONG_SEMANTIC_ROLE / ARIA issues above. The button-name issue is specifically about the missing accessible name on the close button.

**Pages affected:** All 5 (the cart/wishlist drawers render in the global layout)

---

### C-4 · Images missing alternative text (`AXE-IMAGE-ALT`)

**Severity:** Critical  
**WCAG:** 2.0 A — Success Criterion 1.1.1 (Non-text Content)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/image-alt  

**Description from Evinced:**
> *Element does not have an alt attribute; without alternative text, screen readers read the filename instead of meaningful content.*

Two images on the Home page are missing `alt` attributes entirely.

**Affected Elements:**

| Element / Selector | Component / File | Description |
|--------------------|-----------------|-------------|
| `img[src$="New_Tees.png"]` | `src/components/HeroBanner.jsx:18` | Hero banner image: `<img src={HERO_IMAGE} />` — no `alt` attribute |
| `img[src$="2bags_charms1.png"]` | `src/components/TheDrop.jsx:13` | "The Drop" section image: `<img src={DROP_IMAGE} loading="lazy" />` — no `alt` attribute |

**Pages affected:** Home (`/`)

---

### C-5 · Invalid ARIA attribute value `aria-expanded="yes"` (`AXE-ARIA-VALID-ATTR-VALUE`)

**Severity:** Critical  
**WCAG:** 2.0 A — Success Criterion 4.1.2 (Name, Role, Value)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/aria-valid-attr-value  

**Description from Evinced:**
> *Invalid ARIA attribute value: `aria-expanded="yes"` — the valid values for `aria-expanded` are `"true"` or `"false"` only.*

The `FeaturedPair` component uses `aria-expanded="yes"` on two `<h1>` elements. The `aria-expanded` attribute is a state indicator that must be `"true"` or `"false"` (boolean strings). The value `"yes"` is not a valid ARIA token and will be ignored or misinterpreted by assistive technologies.

Furthermore, `aria-expanded` is semantically inappropriate on a heading element (`<h1>`), which is not a disclosure widget. Its use here conflates heading semantics with widget state.

On the Product Detail page, the Evinced SDK also flagged:

| Element / Selector | Component / File | Description |
|--------------------|-----------------|-------------|
| `ul[aria-relevant="changes"]` | `src/components/CartModal.jsx` (rendered live region) | `aria-relevant="changes"` — while `"changes"` is technically valid per ARIA spec, it's flagged because the element has `aria-live="polite"` and `aria-relevant` is typically redundant; the SDK interprets the combination as an invalid state |

**Affected Elements:**

| Element / Selector | Component / File | Description |
|--------------------|-----------------|-------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `src/components/FeaturedPair.jsx:46` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `src/components/FeaturedPair.jsx:46` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` |
| `ul[aria-relevant="changes"]` | `src/components/CartModal.jsx` (internal live region) | Seen on Product Detail page |

**Pages affected:** Home (`/`), Product Detail (`/product/:id`)

---

### C-6 · Slider role missing required ARIA attributes (`AXE-ARIA-REQUIRED-ATTR`)

**Severity:** Critical  
**WCAG:** 2.0 A — Success Criterion 4.1.2 (Name, Role, Value)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/aria-required-attr  

**Description from Evinced:**
> *Required ARIA attribute not present: `aria-valuenow`. Elements using `role="slider"` must provide `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.*

The "The Drop" section on the home page contains a purely decorative progress/popularity bar that has been given `role="slider"`. The `slider` role requires three mandatory ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) to be functional. Without them the element is broken for assistive technology: a screen reader will announce it as a slider but be unable to read its current, minimum, or maximum value.

If this element is purely decorative (no interactive slider behavior), the `role="slider"` should be removed entirely and replaced with `role="presentation"` or no role at all (with `aria-hidden="true"` if it needs to be hidden).

**Affected Element:**

| Element / Selector | Component / File | Description |
|--------------------|-----------------|-------------|
| `.drop-popularity-bar` | `src/components/TheDrop.jsx:19` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` — missing `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

**Pages affected:** Home (`/`)

---

## 5. Recommended Remediations for Critical Issues

> **Note:** Per the task requirements, no source code changes have been made. This section documents the precise remediations that would resolve each critical issue category, along with the rationale for the chosen approach.

---

### R-1: Replace `<div onClick>` with semantic `<button>` or `<a>` elements

**Addresses:** C-1 (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE), C-2 (NO_DESCRIPTIVE_TEXT)

**Files requiring changes:**
- `src/components/Header.jsx` — `.wishlist-btn`, search icon div, login icon div, `.flag-group`
- `src/components/Footer.jsx` — "Sustainability" and "FAQs" footer links
- `src/components/PopularSection.jsx` — all three `.shop-link` divs
- `src/components/FilterSidebar.jsx` — all filter option rows (Price, Size, Brand)
- `src/pages/CheckoutPage.jsx` — `.checkout-continue-btn`, `.checkout-back-btn`
- `src/pages/OrderConfirmationPage.jsx` — `.confirm-home-link`
- `src/components/CartModal.jsx` — `.continueBtn` div

**Proposed change pattern:**

```jsx
// Before (broken)
<div className="wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

// After (accessible)
<button className="wishlist-btn" onClick={openWishlist} aria-label="Wishlist">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Wishlist</span>
</button>
```

For navigation links (Footer items, "Back to Shop"):
```jsx
// Before (broken)
<div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
  <span aria-hidden="true">FAQs</span>
</div>

// After (accessible)
<a className="footer-nav-item" href="/faq">FAQs</a>
```

For filter checkboxes, the pattern should use a native `<input type="checkbox">` or at minimum `role="checkbox"` + `tabindex="0"` + `aria-checked` state management:
```jsx
// After (accessible filter option)
<label className="filter-option">
  <input
    type="checkbox"
    checked={checked}
    onChange={() => onPriceChange(range)}
    className="visually-hidden"
  />
  <span className="custom-checkbox" aria-hidden="true">{checked && <span />}</span>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

**Rationale:** Using semantic HTML interactive elements (`<button>`, `<a>`, `<label>/<input>`) is the recommended approach over ARIA because native elements:
1. Are natively focusable (keyboard-accessible without `tabindex`)
2. Have built-in keyboard semantics (Enter/Space activate buttons; Enter activates links)
3. Are announced with the correct role by screen readers without any ARIA
4. Work across all browser/AT combinations with zero additional JavaScript
5. Are compatible with browser default styles and pointer events

This approach resolves both WRONG_SEMANTIC_ROLE and NOT_FOCUSABLE in a single change per element, and using `aria-label` or visible text resolves NO_DESCRIPTIVE_TEXT simultaneously.

---

### R-2: Add `aria-label` to icon-only `<button>` elements

**Addresses:** C-3 (AXE-BUTTON-NAME)

**Files requiring changes:**
- `src/components/CartModal.jsx` — close button at line 56
- `src/components/WishlistModal.jsx` — close button at line 61

**Proposed change:**
```jsx
// Before (broken)
<button className={styles.closeBtn} onClick={closeCart}>
  <svg aria-hidden="true">…</svg>
</button>

// After (accessible)
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
  <svg aria-hidden="true">…</svg>
</button>
```

**Rationale:** The elements are already `<button>` elements (correct semantic role, keyboard focusable), so the only missing attribute is the accessible name. Adding `aria-label` is the minimal, least-invasive fix. Visual labels are not needed here as they would clutter the drawer header UI. The `aria-label` value should describe the action ("Close cart" / "Close wishlist") rather than just "Close" to give screen reader users full context when the button is announced in isolation.

---

### R-3: Add `alt` attributes to images

**Addresses:** C-4 (AXE-IMAGE-ALT)

**Files requiring changes:**
- `src/components/HeroBanner.jsx` — line 18
- `src/components/TheDrop.jsx` — line 13

**Proposed change:**
```jsx
// HeroBanner.jsx — Before
<img src={HERO_IMAGE} />

// HeroBanner.jsx — After
<img src={HERO_IMAGE} alt="Winter Basics collection — warm-coloured T-shirts" />

// TheDrop.jsx — Before
<img src={DROP_IMAGE} loading="lazy" />

// TheDrop.jsx — After
<img src={DROP_IMAGE} alt="Android bot, YouTube icon and Super G plushie bag charms" loading="lazy" />
```

**Rationale:** Images that convey meaningful content must have a non-empty `alt` attribute (WCAG 1.1.1). The alt text should describe what is shown in the image and its purpose in context — not just the filename. For the hero banner the image illustrates the featured collection; for "The Drop" section the image shows the specific products being promoted. Both descriptions are derived from the surrounding copy.

---

### R-4: Fix invalid `aria-expanded` value

**Addresses:** C-5 (AXE-ARIA-VALID-ATTR-VALUE)

**File requiring changes:**
- `src/components/FeaturedPair.jsx` — line 46

**Proposed change:**
```jsx
// Before (broken)
<h1 aria-expanded="yes">{item.title}</h1>

// After — Option A: remove invalid attribute entirely (preferred)
<h1>{item.title}</h1>

// After — Option B: if expansion state is genuinely needed
<h1 aria-expanded="false">{item.title}</h1>
```

**Rationale:** `aria-expanded` accepts only `"true"` or `"false"` as valid values (per WAI-ARIA 1.2). The value `"yes"` is invalid and will be ignored by browsers and assistive technologies, creating a misleading semantic on an element that is not actually a disclosure widget. Since the `<h1>` heading does not toggle any collapsible panel, the attribute should be removed entirely (Option A). If the heading genuinely does control a collapsible region, it should be converted to a `<button>` with `aria-expanded="true|false"` and `aria-controls` pointing to the controlled region.

---

### R-5: Fix or remove invalid `role="slider"` declaration

**Addresses:** C-6 (AXE-ARIA-REQUIRED-ATTR)

**File requiring changes:**
- `src/components/TheDrop.jsx` — line 19

**Proposed change:**
```jsx
// Before (broken)
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// After — Option A: purely decorative (preferred, no semantics needed)
<div className="drop-popularity-bar" aria-hidden="true"></div>

// After — Option B: if meaningful data should be communicated
<div
  role="meter"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

**Rationale:** `role="slider"` mandates `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` (WAI-ARIA 1.2 required states). Without them the role is broken — screen readers will announce "slider" but have no value to read. Since the element appears to be a static, non-interactive visual indicator with no actual slider behavior, Option A (hide from assistive technology via `aria-hidden="true"`) is the correct minimal fix. If the bar is intended to convey a meaningful value (e.g., 75% popularity), `role="meter"` with the required value attributes is more semantically appropriate than `role="slider"`.

---

## 6. Remaining Non-Critical Issues (Serious)

These **24 Serious** issues were detected but are **not remediated** in this audit cycle. They are documented here for completeness.

---

### S-1 · Color contrast failures (`AXE-COLOR-CONTRAST`)

**Severity:** Serious  
**WCAG:** 2.0 AA — Success Criterion 1.4.3 (Contrast Minimum)  
**Total instances:** 19 across 4 pages

Elements whose foreground/background color combination does not meet the WCAG AA minimum 4.5:1 ratio for normal text or 3:1 for large text.

| Page | Affected Element(s) |
|------|---------------------|
| Home | `.hero-content > p` (text over hero image), `.hero-banner` |
| New/Products | All `.filter-count` spans (e.g., `(16)` counts in the filter sidebar) — 12 instances; `.products-found` text |
| Product Detail | `p:nth-child(4)` (description text) |
| Checkout | `.checkout-step:nth-child(3) > .step-label` ("Shipping & Payment" inactive step label); `.summary-tax-note` text |
| Order Confirmation | `.confirm-order-id-label` ("Order ID" label text) |

**Suggested fix (not applied):** Increase text color contrast against backgrounds. For filter counts, darken the muted grey text color. For hero text, add a semi-transparent overlay or change the text color to meet contrast thresholds.

---

### S-2 · `<html>` element missing `lang` attribute (`AXE-HTML-HAS-LANG`)

**Severity:** Serious  
**WCAG:** 2.0 A — Success Criterion 3.1.1 (Language of Page)  
**Total instances:** 5 (one per page — same root cause)

The `public/index.html` template does not include a `lang` attribute on the `<html>` element. Screen readers use the document language to select the correct speech synthesis engine and pronunciation rules.

```html
<!-- public/index.html — Before (broken) -->
<html>

<!-- After (accessible) -->
<html lang="en">
```

**Root cause file:** `public/index.html:3`

---

### S-3 · Invalid `lang` attribute value `"zz"` (`AXE-VALID-LANG`)

**Severity:** Serious  
**WCAG:** 2.0 AA — Success Criterion 3.1.2 (Language of Parts)  
**Total instances:** 1 (Home page only)

In `src/components/TheDrop.jsx`, a paragraph describing the drop products uses `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers will be unable to switch pronunciation engines for this content and may either ignore the attribute or produce garbled output.

```jsx
// src/components/TheDrop.jsx:21 — Before (broken)
<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>

// After (if content is English)
<p>Our brand-new, limited-edition plushie bag charms…</p>
```

**Root cause file:** `src/components/TheDrop.jsx:21`

---

## 7. Raw Issue Counts per Page

### Home Page (`/`) — 35 Issues

| # | Severity | Issue Type | Element | Notes |
|---|----------|-----------|---------|-------|
| 1 | Critical | WRONG_SEMANTIC_ROLE | `.wishlist-btn` | Header |
| 2 | Critical | NOT_FOCUSABLE | `.wishlist-btn` | Header |
| 3 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(2)` | Header search icon div |
| 4 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(2)` | Header search icon, text is `aria-hidden` |
| 5 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(2)` | Header search icon div |
| 6 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(4)` | Header login icon div |
| 7 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(4)` | Header login icon, text is `aria-hidden` |
| 8 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(4)` | Header login icon div |
| 9 | Critical | WRONG_SEMANTIC_ROLE | `.flag-group` | Header region selector |
| 10 | Critical | NOT_FOCUSABLE | `.flag-group` | Header region selector |
| 11 | Critical | WRONG_SEMANTIC_ROLE | `.product-card:nth-child(1) > .shop-link` | PopularSection "Shop Drinkware" |
| 12 | Critical | NO_DESCRIPTIVE_TEXT | `.product-card:nth-child(1) > .shop-link` | Text inside `aria-hidden` span |
| 13 | Critical | NOT_FOCUSABLE | `.product-card:nth-child(1) > .shop-link` | PopularSection |
| 14 | Critical | WRONG_SEMANTIC_ROLE | `.product-card:nth-child(2) > .shop-link` | PopularSection "Shop Fun and Games" |
| 15 | Critical | NO_DESCRIPTIVE_TEXT | `.product-card:nth-child(2) > .shop-link` | Text inside `aria-hidden` span |
| 16 | Critical | NOT_FOCUSABLE | `.product-card:nth-child(2) > .shop-link` | PopularSection |
| 17 | Critical | WRONG_SEMANTIC_ROLE | `.product-card:nth-child(3) > .shop-link` | PopularSection "Shop Stationery" |
| 18 | Critical | NO_DESCRIPTIVE_TEXT | `.product-card:nth-child(3) > .shop-link` | Text inside `aria-hidden` span |
| 19 | Critical | NOT_FOCUSABLE | `.product-card:nth-child(3) > .shop-link` | PopularSection |
| 20 | Critical | WRONG_SEMANTIC_ROLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 21 | Critical | NOT_FOCUSABLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 22 | Critical | WRONG_SEMANTIC_ROLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 23 | Critical | NO_DESCRIPTIVE_TEXT | `.footer-list:nth-child(2) > li > .footer-nav-item` | Text inside `aria-hidden` span |
| 24 | Critical | NOT_FOCUSABLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 25 | Critical | NOT_FOCUSABLE | `.drop-popularity-bar` | TheDrop slider role, also C-6 |
| 26 | Critical | AXE-ARIA-REQUIRED-ATTR | `.drop-popularity-bar` | Missing aria-valuenow/min/max |
| 27 | Critical | AXE-ARIA-VALID-ATTR-VALUE | `.featured-card:nth-child(1) > h1` | `aria-expanded="yes"` |
| 28 | Critical | AXE-ARIA-VALID-ATTR-VALUE | `.featured-card:nth-child(2) > h1` | `aria-expanded="yes"` |
| 29 | Critical | AXE-BUTTON-NAME | `#cart-modal > div:nth-child(1) > button` | Cart modal close button |
| 30 | Critical | AXE-BUTTON-NAME | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist modal close button |
| 31 | Critical | AXE-IMAGE-ALT | `img[src$="New_Tees.png"]` | HeroBanner image, no `alt` |
| 32 | Critical | AXE-IMAGE-ALT | `img[src$="2bags_charms1.png"]` | TheDrop image, no `alt` |
| 33 | Serious | AXE-COLOR-CONTRAST | `.hero-content > p`, `.hero-banner` | Hero text contrast |
| 34 | Serious | AXE-HTML-HAS-LANG | `html` | Missing `lang` attribute |
| 35 | Serious | AXE-VALID-LANG | `p[lang="zz"]` | Invalid language tag |

---

### New / Products Page (`/shop/new`) — 55 Issues

| # | Severity | Issue Type | Element | Notes |
|---|----------|-----------|---------|-------|
| 1 | Critical | WRONG_SEMANTIC_ROLE | `.wishlist-btn` | Header (shared) |
| 2 | Critical | NOT_FOCUSABLE | `.wishlist-btn` | Header (shared) |
| 3 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(2)` | Header search |
| 4 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(2)` | Header search |
| 5 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(2)` | Header search |
| 6 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(4)` | Header login |
| 7 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(4)` | Header login |
| 8 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(4)` | Header login |
| 9 | Critical | WRONG_SEMANTIC_ROLE | `.flag-group` | Header region selector |
| 10 | Critical | NOT_FOCUSABLE | `.flag-group` | Header region selector |
| 11 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(2) > .filter-option:nth-child(1)` | Price filter "1.00–19.99" |
| 12 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(2) > .filter-option:nth-child(1)` | Price filter |
| 13 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(2) > .filter-option:nth-child(2)` | Price filter "20.00–39.99" |
| 14 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(2) > .filter-option:nth-child(2)` | Price filter |
| 15 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(2) > .filter-option:nth-child(3)` | Price filter "40.00–89.99" |
| 16 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(2) > .filter-option:nth-child(3)` | Price filter |
| 17 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(2) > .filter-option:nth-child(4)` | Price filter "100.00–149.99" |
| 18 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(2) > .filter-option:nth-child(4)` | Price filter |
| 19 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(3) > .filter-option:nth-child(1)` | Size filter "XS" |
| 20 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(3) > .filter-option:nth-child(1)` | Size filter |
| 21 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(3) > .filter-option:nth-child(2)` | Size filter "SM" |
| 22 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(3) > .filter-option:nth-child(2)` | Size filter |
| 23 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(3) > .filter-option:nth-child(3)` | Size filter "MD" |
| 24 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(3) > .filter-option:nth-child(3)` | Size filter |
| 25 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(3) > .filter-option:nth-child(4)` | Size filter "LG" |
| 26 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(3) > .filter-option:nth-child(4)` | Size filter |
| 27 | Critical | WRONG_SEMANTIC_ROLE | `.filter-option:nth-child(5)` | Size filter "XL" |
| 28 | Critical | NOT_FOCUSABLE | `.filter-option:nth-child(5)` | Size filter |
| 29 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(4) > .filter-option:nth-child(1)` | Brand filter "Android" |
| 30 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(4) > .filter-option:nth-child(1)` | Brand filter |
| 31 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(4) > .filter-option:nth-child(2)` | Brand filter "Google" |
| 32 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(4) > .filter-option:nth-child(2)` | Brand filter |
| 33 | Critical | WRONG_SEMANTIC_ROLE | `.filter-group:nth-child(4) > .filter-option:nth-child(3)` | Brand filter "YouTube" |
| 34 | Critical | NOT_FOCUSABLE | `.filter-group:nth-child(4) > .filter-option:nth-child(3)` | Brand filter |
| 35 | Critical | WRONG_SEMANTIC_ROLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 36 | Critical | NOT_FOCUSABLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 37 | Critical | WRONG_SEMANTIC_ROLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 38 | Critical | NO_DESCRIPTIVE_TEXT | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs", `aria-hidden` text |
| 39 | Critical | NOT_FOCUSABLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 40 | Critical | AXE-BUTTON-NAME | `#cart-modal > div:nth-child(1) > button` | Cart modal close button |
| 41 | Critical | AXE-BUTTON-NAME | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist modal close button |
| 42–54 | Serious | AXE-COLOR-CONTRAST | Various `.filter-count` spans, `.products-found` | 13 instances |
| 55 | Serious | AXE-HTML-HAS-LANG | `html` | Missing `lang` attribute |

---

### Product Detail Page (`/product/:id`) — 20 Issues

| # | Severity | Issue Type | Element | Notes |
|---|----------|-----------|---------|-------|
| 1 | Critical | WRONG_SEMANTIC_ROLE | `.wishlist-btn` | Header (shared) |
| 2 | Critical | NOT_FOCUSABLE | `.wishlist-btn` | Header (shared) |
| 3 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(2)` | Header search |
| 4 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(2)` | Header search |
| 5 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(2)` | Header search |
| 6 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(4)` | Header login |
| 7 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(4)` | Header login |
| 8 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(4)` | Header login |
| 9 | Critical | WRONG_SEMANTIC_ROLE | `.flag-group` | Header region selector |
| 10 | Critical | NOT_FOCUSABLE | `.flag-group` | Header region selector |
| 11 | Critical | WRONG_SEMANTIC_ROLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 12 | Critical | NOT_FOCUSABLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 13 | Critical | WRONG_SEMANTIC_ROLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 14 | Critical | NO_DESCRIPTIVE_TEXT | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs", `aria-hidden` text |
| 15 | Critical | NOT_FOCUSABLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 16 | Critical | AXE-ARIA-VALID-ATTR-VALUE | `ul[aria-relevant="changes"]` | Cart live region invalid attr |
| 17 | Critical | AXE-BUTTON-NAME | `#cart-modal > div:nth-child(1) > button` | Cart modal close button |
| 18 | Critical | AXE-BUTTON-NAME | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist modal close button |
| 19 | Serious | AXE-COLOR-CONTRAST | `p:nth-child(4)` | Product description text |
| 20 | Serious | AXE-HTML-HAS-LANG | `html` | Missing `lang` attribute |

---

### Checkout Page (`/checkout`) — 21 Issues

| # | Severity | Issue Type | Element | Notes |
|---|----------|-----------|---------|-------|
| 1 | Critical | WRONG_SEMANTIC_ROLE | `.wishlist-btn` | Header (shared) |
| 2 | Critical | NOT_FOCUSABLE | `.wishlist-btn` | Header (shared) |
| 3 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(2)` | Header search |
| 4 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(2)` | Header search |
| 5 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(2)` | Header search |
| 6 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(4)` | Header login |
| 7 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(4)` | Header login |
| 8 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(4)` | Header login |
| 9 | Critical | WRONG_SEMANTIC_ROLE | `.flag-group` | Header region selector |
| 10 | Critical | NOT_FOCUSABLE | `.flag-group` | Header region selector |
| 11 | Critical | WRONG_SEMANTIC_ROLE | `.checkout-continue-btn` | Basket step "Continue" button |
| 12 | Critical | NOT_FOCUSABLE | `.checkout-continue-btn` | Basket step "Continue" button |
| 13 | Critical | WRONG_SEMANTIC_ROLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 14 | Critical | NOT_FOCUSABLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 15 | Critical | WRONG_SEMANTIC_ROLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 16 | Critical | NO_DESCRIPTIVE_TEXT | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs", `aria-hidden` text |
| 17 | Critical | NOT_FOCUSABLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 18 | Critical | AXE-BUTTON-NAME | `div:nth-child(1) > button` | Wishlist close button (CartModal not triggered) |
| 19 | Serious | AXE-COLOR-CONTRAST | `.checkout-step:nth-child(3) > .step-label` | Inactive step label |
| 20 | Serious | AXE-COLOR-CONTRAST | `.summary-tax-note`, `aside` | Order summary tax note |
| 21 | Serious | AXE-HTML-HAS-LANG | `html` | Missing `lang` attribute |

---

### Order Confirmation Page (`/order-confirmation`) — 20 Issues

| # | Severity | Issue Type | Element | Notes |
|---|----------|-----------|---------|-------|
| 1 | Critical | WRONG_SEMANTIC_ROLE | `.wishlist-btn` | Header (shared) |
| 2 | Critical | NOT_FOCUSABLE | `.wishlist-btn` | Header (shared) |
| 3 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(2)` | Header search |
| 4 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(2)` | Header search |
| 5 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(2)` | Header search |
| 6 | Critical | WRONG_SEMANTIC_ROLE | `.icon-btn:nth-child(4)` | Header login |
| 7 | Critical | NO_DESCRIPTIVE_TEXT | `.icon-btn:nth-child(4)` | Header login |
| 8 | Critical | NOT_FOCUSABLE | `.icon-btn:nth-child(4)` | Header login |
| 9 | Critical | WRONG_SEMANTIC_ROLE | `.flag-group` | Header region selector |
| 10 | Critical | NOT_FOCUSABLE | `.flag-group` | Header region selector |
| 11 | Critical | WRONG_SEMANTIC_ROLE | `.confirm-home-link` | "← Back to Shop" link |
| 12 | Critical | NOT_FOCUSABLE | `.confirm-home-link` | "← Back to Shop" link |
| 13 | Critical | WRONG_SEMANTIC_ROLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 14 | Critical | NOT_FOCUSABLE | `li:nth-child(3) > .footer-nav-item` | Footer "Sustainability" |
| 15 | Critical | WRONG_SEMANTIC_ROLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 16 | Critical | NO_DESCRIPTIVE_TEXT | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs", `aria-hidden` text |
| 17 | Critical | NOT_FOCUSABLE | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer "FAQs" |
| 18 | Critical | AXE-BUTTON-NAME | `div:nth-child(1) > button` | Wishlist modal close button |
| 19 | Serious | AXE-COLOR-CONTRAST | `.confirm-order-id-label`, `.confirm-order-id-box` | Order ID label contrast |
| 20 | Serious | AXE-HTML-HAS-LANG | `html` | Missing `lang` attribute |

---

*End of Report*
