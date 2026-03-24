# Accessibility Audit Report

**Repository:** Demo E-commerce Website (React SPA)  
**Audit Date:** 2026-03-24  
**Tool:** Evinced JS Playwright SDK (per-page `evAnalyze()` scans)  
**Auditor:** Automated Cloud Agent  
**Scope:** All 5 application routes

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Pages Audited](#pages-audited)
3. [Issue Classification](#issue-classification)
4. [Critical Issues — Detailed Analysis](#critical-issues--detailed-analysis)
   - [CI-1: WRONG_SEMANTIC_ROLE — `<div>` Used as Interactive Control](#ci-1-wrong_semantic_role--div-used-as-interactive-control)
   - [CI-2: NOT_FOCUSABLE — Interactive Elements Unreachable by Keyboard](#ci-2-not_focusable--interactive-elements-unreachable-by-keyboard)
   - [CI-3: NO_DESCRIPTIVE_TEXT — Missing Accessible Names on Interactive Elements](#ci-3-no_descriptive_text--missing-accessible-names-on-interactive-elements)
   - [CI-4: AXE-BUTTON-NAME — Close/Dismiss Buttons Without Accessible Names](#ci-4-axe-button-name--closedismiss-buttons-without-accessible-names)
   - [CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values](#ci-5-axe-aria-valid-attr-value--invalid-aria-attribute-values)
   - [CI-6: AXE-IMAGE-ALT — Images Missing Alternative Text](#ci-6-axe-image-alt--images-missing-alternative-text)
   - [CI-7: AXE-ARIA-REQUIRED-ATTR — `role="slider"` Missing Required Attributes](#ci-7-axe-aria-required-attr--roleslider-missing-required-attributes)
5. [Proposed Remediations for Critical Issues](#proposed-remediations-for-critical-issues)
6. [Remaining Non-Critical Issues](#remaining-non-critical-issues)
7. [Summary Table](#summary-table)

---

## Executive Summary

The automated Evinced accessibility audit scanned all five pages of the demo e-commerce website and detected a total of **151 issues** across **7 distinct critical issue types** and **3 non-critical (serious) issue types**.

| Severity | Count | Unique Types |
|----------|-------|--------------|
| **CRITICAL** | 127 | 7 |
| **SERIOUS** | 24 | 3 |
| **Total** | **151** | **10** |

The most impactful critical issues are widespread use of `<div>` elements as interactive controls — affecting every page — which simultaneously violates semantic role requirements, keyboard accessibility, and accessible naming. These issues collectively block keyboard-only users and screen reader users from using core navigation, filtering, cart interactions, and checkout flows.

---

## Pages Audited

| Page | URL | Entry Point | Total Issues | Critical | Serious |
|------|-----|------------|--------------|----------|---------|
| Homepage | `/` | `src/pages/HomePage.jsx` | 35 | 32 | 3 |
| Products | `/shop/new` | `src/pages/NewPage.jsx` | 55 | 41 | 14 |
| Product Detail | `/product/1` | `src/pages/ProductPage.jsx` | 20 | 18 | 2 |
| Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` | 21 | 18 | 3 |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | 20 | 18 | 2 |

**Shared components contributing issues across all pages:**
- `src/components/Header.jsx` — `.wishlist-btn`, `.icon-btn` (search/login), `.flag-group`
- `src/components/Footer.jsx` — `.footer-nav-item` (Sustainability, FAQs)
- `src/components/CartModal.jsx` — close button, `WishlistModal.jsx` — close button

---

## Issue Classification

### Critical Issues (127 instances across 7 types)

| ID | Type | Evinced Rule | Instances | Pages Affected |
|----|------|-------------|-----------|----------------|
| CI-1 | Wrong semantic role | `WRONG_SEMANTIC_ROLE` | 47 | All 5 |
| CI-2 | Not keyboard focusable | `NOT_FOCUSABLE` | 48 | All 5 |
| CI-3 | No descriptive/accessible name | `NO_DESCRIPTIVE_TEXT` | 18 | All 5 |
| CI-4 | Button without accessible name | `AXE-BUTTON-NAME` | 8 | All 5 |
| CI-5 | Invalid ARIA attribute values | `AXE-ARIA-VALID-ATTR-VALUE` | 3 | Homepage, Product Detail |
| CI-6 | Images missing alt text | `AXE-IMAGE-ALT` | 2 | Homepage only |
| CI-7 | Slider missing required ARIA | `AXE-ARIA-REQUIRED-ATTR` | 1 | Homepage only |

### Non-Critical (Serious) Issues (24 instances across 3 types)

| ID | Type | Evinced Rule | Instances | Pages Affected |
|----|------|-------------|-----------|----------------|
| NC-1 | Insufficient color contrast | `AXE-COLOR-CONTRAST` | 18 | All 5 |
| NC-2 | `<html>` missing `lang` attribute | `AXE-HTML-HAS-LANG` | 5 | All 5 |
| NC-3 | Invalid `lang` attribute value | `AXE-VALID-LANG` | 1 | Homepage only |

---

## Critical Issues — Detailed Analysis

---

### CI-1: WRONG_SEMANTIC_ROLE — `<div>` Used as Interactive Control

**Evinced Rule:** `WRONG_SEMANTIC_ROLE` (Interactable Role)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 47 across all 5 pages  
**Source:** Evinced Core engine  

**Description:**  
Interactive elements such as buttons, links, and inputs must use native HTML semantics or an explicit ARIA `role` so that assistive technologies can identify them as interactive. These `<div>` elements respond to `onClick` events but carry no semantic information — screen readers announce them as plain containers, not controls, and keyboard users cannot reach them via Tab.

#### Affected Elements by Page

**Homepage (`/`) — 9 instances**

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" onClick={openWishlist}>…` | `src/components/Header.jsx:131` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" onClick={…}>` (Search) | `src/components/Header.jsx:140` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" onClick={…}>` (Login) | `src/components/Header.jsx:156` |
| `.flag-group` | `<div class="flag-group" onClick={…}>` | `src/components/Header.jsx:161` |
| `.product-card:nth-child(1) > … > .shop-link` | `<div class="shop-link" onClick={…}>Shop Drinkware` | `src/components/TrendingCollections.jsx` |
| `.product-card:nth-child(2) > … > .shop-link` | `<div class="shop-link" onClick={…}>Shop Fun and Games` | `src/components/TrendingCollections.jsx` |
| `.product-card:nth-child(3) > … > .shop-link` | `<div class="shop-link" onClick={…}>Shop Stationery` | `src/components/TrendingCollections.jsx` |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" onClick={…}>Sustainability` | `src/components/Footer.jsx:14` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" onClick={…}><span aria-hidden="true">FAQs</span>` | `src/components/Footer.jsx:18` |

**Products (`/shop/new`) — 13 additional instances (above 9 shared + 4 new filter options)**

Filter sidebar `.filter-option` divs (all act as checkbox triggers but use `<div>` wrappers):
- Price range filters: `$1.00–$19.99`, `$20–$39.99`, `$40–$89.99`, `$100–$149.99`  
- Size filters: `XS`, `SM`, `MD`, `LG`, `XL`  
- Brand filters: `Android`, `Google`, `YouTube`  
Source: `src/components/FilterSidebar.jsx` (each `<div className="filter-option" onClick={…}>`)

**Checkout (`/checkout`) — 1 unique instance**

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" onClick={() => setStep('shipping')}>Continue` | `src/pages/CheckoutPage.jsx:157` |

**Order Confirmation (`/order-confirmation`) — 1 unique instance**

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.confirm-home-link` | `<div class="confirm-home-link" onClick={() => {}}>← Back to Shop` | `src/pages/OrderConfirmationPage.jsx:40` |

---

### CI-2: NOT_FOCUSABLE — Interactive Elements Unreachable by Keyboard

**Evinced Rule:** `NOT_FOCUSABLE` (Keyboard Accessible)  
**WCAG:** 2.1.1 Keyboard (Level A)  
**Total Instances:** 48 across all 5 pages  
**Source:** Evinced Core engine  

**Description:**  
The same set of `<div>` elements identified in CI-1 are also not keyboard-reachable because they have no `tabindex` attribute. Without `tabindex="0"`, these divs are skipped entirely by keyboard Tab navigation. Additionally, `.drop-popularity-bar` has `role="slider"` — sliders are inherently expected to be focusable — but lacks `tabindex`.

**All affected selectors are identical to CI-1, plus:**

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` | `src/components/TheDrop.jsx:19` |

This element carries `role="slider"` (which implies interactivity) but has no `tabindex` and no ARIA value attributes, making it unreachable and non-functional for keyboard and screen reader users.

---

### CI-3: NO_DESCRIPTIVE_TEXT — Missing Accessible Names on Interactive Elements

**Evinced Rule:** `NO_DESCRIPTIVE_TEXT` (Accessible Name)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 18 across all 5 pages  
**Source:** Evinced Core engine  

**Description:**  
Interactive elements must have accessible names so that screen reader users know what the control does. The following elements either have no text content accessible to assistive technology, or their visible text is hidden via `aria-hidden="true"`.

#### Affected Elements

| Selector | DOM Snippet | Reason | Source File |
|----------|-------------|--------|-------------|
| `.icon-btn:nth-child(2)` (Search) | `<span aria-hidden="true">Search</span>` | Text inside `aria-hidden` span — screen reader gets nothing | `Header.jsx:142` |
| `.icon-btn:nth-child(4)` (Login) | `<span aria-hidden="true">Login</span>` | Text inside `aria-hidden` span — screen reader gets nothing | `Header.jsx:158` |
| `.product-card:nth-child(1) > … > .shop-link` | `<span aria-hidden="true">Shop Drinkware</span>` | Text inside `aria-hidden` span | `TrendingCollections.jsx` |
| `.product-card:nth-child(2) > … > .shop-link` | `<span aria-hidden="true">Shop Fun and Games</span>` | Text inside `aria-hidden` span | `TrendingCollections.jsx` |
| `.product-card:nth-child(3) > … > .shop-link` | `<span aria-hidden="true">Shop Stationery</span>` | Text inside `aria-hidden` span | `TrendingCollections.jsx` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | `<span aria-hidden="true">FAQs</span>` | Text inside `aria-hidden` span | `Footer.jsx:18` |

These 6 distinct element types appear across all 5 pages (shared components), producing 18 total instances in the audit.

---

### CI-4: AXE-BUTTON-NAME — Close/Dismiss Buttons Without Accessible Names

**Evinced Rule:** `AXE-BUTTON-NAME` (Button-name)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 8 across all 5 pages (2 per page)  
**Source:** axe-core  

**Description:**  
Native `<button>` elements that contain only icon SVGs (with `aria-hidden="true"`) and no `aria-label` or visible text have no accessible name. Screen readers cannot identify these controls and may announce them as simply "button" with no context.

#### Affected Elements

**Cart Modal close button** (present on all 5 pages — always rendered in DOM):

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `#cart-modal > div:nth-child(1) > button` | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg aria-hidden="true">…×…</svg></button>` | `src/components/CartModal.jsx:56` |

```jsx
{/* Current — no accessible name */}
<button className={styles.closeBtn} onClick={closeCart}>
  <svg … aria-hidden="true">…</svg>
</button>
```

**Wishlist Modal close button** (present on all 5 pages — always rendered in DOM):

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg aria-hidden="true">…×…</svg></button>` | `src/components/WishlistModal.jsx:202` |

```jsx
{/* Current — no accessible name */}
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist}>
  <svg … aria-hidden="true">…</svg>
</button>
```

---

### CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values

**Evinced Rule:** `AXE-ARIA-VALID-ATTR-VALUE` (Aria-valid-attr-value)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 3 (2 on Homepage, 1 on Product Detail)  
**Source:** axe-core  

**Description:**  
ARIA attribute values must conform to the specification's enumerated or token-based values. Using out-of-spec values causes assistive technologies to either ignore the attribute entirely or misinterpret the element state.

#### Instance 1 & 2: `aria-expanded="yes"` on `<h1>` — FeaturedPair component

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `src/components/FeaturedPair.jsx:43` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | `src/components/FeaturedPair.jsx:43` |

```jsx
{/* Current — invalid value */}
<h1 aria-expanded="yes">{item.title}</h1>
```

`aria-expanded` accepts only `"true"` or `"false"`. The value `"yes"` is not a valid boolean in ARIA and will be rejected by assistive technologies. Furthermore, `aria-expanded` is inappropriate on a static heading element (`<h1>`) that controls no expandable panel.

#### Instance 3: `aria-relevant="changes"` on `<ul>` — ProductPage

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `ul[aria-relevant="changes"]` | `<ul … aria-relevant="changes" aria-live="polite">` | `src/pages/ProductPage.jsx:146` |

```jsx
{/* Current — invalid token */}
<ul className={styles.detailsList} aria-relevant="changes" aria-live="polite">
```

`aria-relevant` accepts space-separated tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not a valid token and will be ignored by screen readers, meaning live-region update announcements may not be filtered as intended.

---

### CI-6: AXE-IMAGE-ALT — Images Missing Alternative Text

**Evinced Rule:** `AXE-IMAGE-ALT` (Image-alt)  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Total Instances:** 2 (Homepage only)  
**Source:** axe-core  

**Description:**  
Informational `<img>` elements must have an `alt` attribute that conveys equivalent information to sighted users. Without `alt`, screen readers fall back to reading the filename (e.g. "New underscore Tees dot png"), which is meaningless or confusing.

#### Affected Elements

| Selector | DOM Snippet | Current State | Source File |
|----------|-------------|---------------|-------------|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | No `alt` attribute | `src/components/HeroBanner.jsx:15` |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | No `alt` attribute | `src/components/TheDrop.jsx:11` |

```jsx
{/* HeroBanner.jsx — current, missing alt */}
<img src={HERO_IMAGE} />

{/* TheDrop.jsx — current, missing alt */}
<img src={DROP_IMAGE} loading="lazy" />
```

---

### CI-7: AXE-ARIA-REQUIRED-ATTR — `role="slider"` Missing Required Attributes

**Evinced Rule:** `AXE-ARIA-REQUIRED-ATTR` (Aria-required-attr)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 1 (Homepage only)  
**Source:** axe-core  

**Description:**  
The ARIA `slider` role requires three mandatory attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). Without them, assistive technologies cannot convey any value information to the user — the control is essentially broken for screen reader users.

#### Affected Element

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` | `src/components/TheDrop.jsx:19` |

```jsx
{/* Current — missing aria-valuenow, aria-valuemin, aria-valuemax */}
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

This element also appears in CI-2 (NOT_FOCUSABLE) as it lacks `tabindex="0"` needed for keyboard interaction.

---

## Proposed Remediations for Critical Issues

> **Note:** No source code has been modified. The remediations below are proposed changes with explanations of the approach.

---

### Fix for CI-1 + CI-2 + CI-3 (WRONG_SEMANTIC_ROLE / NOT_FOCUSABLE / NO_DESCRIPTIVE_TEXT)

These three issue types are caused by the same root problem: non-semantic `<div>` elements used as interactive controls. The canonical fix is to **replace each `<div>` with the appropriate native HTML element**.

**Rationale for native element approach over ARIA attributes:**  
Adding `role="button"`, `tabindex="0"`, and keyboard event handlers to a `<div>` technically satisfies individual ARIA rules but is brittle and incomplete. Native HTML elements (`<button>`, `<a>`) provide role, focusability, keyboard activation (Enter/Space), and browser-default behavior without additional code. The [First Rule of ARIA Use](https://www.w3.org/TR/using-aria/#rule1) states: if you can use a native HTML element with the semantics already built in, do so.

---

#### Fix CI-1a: Header icon buttons (`Header.jsx`)

**Affected elements:** `.wishlist-btn`, `.icon-btn:nth-child(2)` (Search), `.icon-btn:nth-child(4)` (Login), `.flag-group`

**Current code (`src/components/Header.jsx`):**
```jsx
{/* Wishlist — div used as button, no accessible name conveyed */}
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg … aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

{/* Search — div used as button, accessible name hidden */}
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg … aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>

{/* Login — div used as button, accessible name hidden */}
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg … aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</div>

{/* Flag group — div used as button, no accessible name */}
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  <img src="…" alt="United States Flag" />
  <img src="…" alt="Canada Flag" />
</div>
```

**Proposed fix:**
```jsx
{/* Wishlist — native button, accessible name from visible <span> */}
<button className="icon-btn wishlist-btn" onClick={openWishlist}>
  <svg … aria-hidden="true">…</svg>
  <span>Wishlist</span>
  {wishlistCount > 0 && <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>}
</button>

{/* Search — native button, aria-label provides accessible name */}
<button className="icon-btn" aria-label="Search">
  <svg … aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</button>

{/* Login — native button, aria-label provides accessible name */}
<button className="icon-btn" aria-label="Login">
  <svg … aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</button>

{/* Flag group — native button, aria-label provides accessible name */}
<button className="flag-group" onClick={() => {}} aria-label="Select region">
  <img src="…" alt="United States Flag" />
  <img src="…" alt="Canada Flag" />
</button>
```

**Why this approach:**  
`<button>` elements are natively focusable (no `tabindex` needed), receive Enter/Space keyboard activation automatically, and expose `role="button"` to assistive technologies. The `aria-label` on the Search and Login buttons provides an accessible name even when the `<span>` text is hidden via `aria-hidden`. Removing `style={{cursor:'pointer'}}` is possible via CSS since buttons already show a pointer on most browsers or can be styled.

---

#### Fix CI-1b: Footer navigation items (`Footer.jsx`)

**Affected elements:** `.footer-nav-item` (Sustainability, FAQs)

**Current code (`src/components/Footer.jsx`):**
```jsx
{/* "Sustainability" — div as link, no tabindex */}
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div></li>

{/* "FAQs" — div as link, accessible name hidden */}
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}><span aria-hidden="true">FAQs</span></div></li>
```

**Proposed fix:**
```jsx
{/* "Sustainability" — native anchor, accessible name from text content */}
<li><a href="#sustainability" className="footer-nav-item">Sustainability</a></li>

{/* "FAQs" — native anchor, accessible name from visible text (aria-hidden removed) */}
<li><a href="#faqs" className="footer-nav-item">FAQs</a></li>
```

**Why this approach:**  
These are navigation links, not action buttons — `<a>` is the correct semantic. Native anchors are keyboard-focusable, activated by Enter, and expose `role="link"`. Removing `aria-hidden` from the text makes it available to assistive technologies. If the `href` destinations are not yet implemented, `href="#"` or `href="/faqs"` are acceptable placeholders.

---

#### Fix CI-1c: Filter sidebar options (`FilterSidebar.jsx`)

**Affected elements:** All `.filter-option` `<div>` elements (13 instances on Products page)

**Current code (`src/components/FilterSidebar.jsx`):**
```jsx
<div key={range.label} className="filter-option" onClick={() => onPriceChange(range)}>
  <div className={`custom-checkbox${checked ? ' custom-checkbox--checked' : ''}`}>
    {checked && <div className="custom-checkbox-checkmark" />}
  </div>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</div>
```

**Proposed fix (use native `<label>` + `<input type="checkbox">`):**
```jsx
<label key={range.label} className="filter-option">
  <input
    type="checkbox"
    checked={checked}
    onChange={() => onPriceChange(range)}
    className="filter-option-input"  /* visually hidden via CSS */
  />
  <span className="custom-checkbox" aria-hidden="true">
    {checked && <span className="custom-checkbox-checkmark" />}
  </span>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

**Why this approach:**  
Filter options are functionally checkboxes. Using native `<input type="checkbox">` inside a `<label>` gives: correct role (`checkbox`), keyboard focus, Space-key toggle, and checked/unchecked state announcement — all automatically. The visual custom checkbox can remain for styling by visually hiding the native input with `position: absolute; opacity: 0; width: 1px; height: 1px`. This is the most robust pattern per WAI-ARIA Authoring Practices.

---

#### Fix CI-1d: Checkout "Continue" button (`CheckoutPage.jsx`)

**Current code (`src/pages/CheckoutPage.jsx:157`):**
```jsx
<div
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
  style={{ cursor: 'pointer' }}
>
  Continue
</div>
```

**Proposed fix:**
```jsx
<button
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
  type="button"
>
  Continue
</button>
```

**Why this approach:**  
`<button type="button">` is the exact semantic match for a control that triggers an in-page action (step change). It is natively focusable, keyboard-activated, and properly announced as "Continue button" to screen readers.

---

#### Fix CI-1e: Order Confirmation "Back to Shop" link (`OrderConfirmationPage.jsx`)

**Current code (`src/pages/OrderConfirmationPage.jsx:40`):**
```jsx
<div className="confirm-home-link" onClick={() => {}} style={{ cursor: 'pointer' }}>
  ← Back to Shop
</div>
```

**Proposed fix:**
```jsx
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Why this approach:**  
This element navigates to the home page — it is semantically a link, not a button. Using React Router's `<Link>` (which renders as `<a>`) gives it the correct role, keyboard focus, and Enter-key activation. The `onClick={() => {}}` handler was a no-op and is not needed.

---

#### Fix CI-1f: Cart Modal "Continue Shopping" div (`CartModal.jsx`)

**Current code (`src/components/CartModal.jsx:128`):**
```jsx
<div
  className={styles.continueBtn}
  onClick={closeCart}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">Continue Shopping</span>
</div>
```

**Proposed fix:**
```jsx
<button
  className={styles.continueBtn}
  onClick={closeCart}
  type="button"
>
  Continue Shopping
</button>
```

**Why this approach:**  
Closing the cart is an action, so `<button>` is appropriate. Removing `aria-hidden` from the text span ensures screen readers can announce the button's accessible name.

---

### Fix for CI-4 (AXE-BUTTON-NAME — Close buttons without accessible names)

**Affected elements:**  
- `CartModal.jsx:56` — Cart drawer close button  
- `WishlistModal.jsx:202` — Wishlist drawer close button  

**Current code:**
```jsx
{/* CartModal.jsx */}
<button className={styles.closeBtn} onClick={closeCart}>
  <svg … aria-hidden="true">…×…</svg>
</button>

{/* WishlistModal.jsx */}
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist}>
  <svg … aria-hidden="true">…×…</svg>
</button>
```

**Proposed fix:**
```jsx
{/* CartModal.jsx */}
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
  <svg … aria-hidden="true">…×…</svg>
</button>

{/* WishlistModal.jsx */}
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
  <svg … aria-hidden="true">…×…</svg>
</button>
```

**Why this approach:**  
`aria-label` directly provides the accessible name for the button while keeping the visual SVG icon intact. The SVG correctly retains `aria-hidden="true"` since the icon is purely decorative — the accessible name comes from `aria-label` instead. This is the lightest-touch fix that resolves the issue without restructuring the component.

---

### Fix for CI-5 (AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA values)

#### Fix CI-5a: `aria-expanded="yes"` on `<h1>` (`FeaturedPair.jsx`)

**Current code (`src/components/FeaturedPair.jsx:43`):**
```jsx
<h1 aria-expanded="yes">{item.title}</h1>
```

**Proposed fix:**  
Remove `aria-expanded` entirely from the `<h1>`. Headings are static content — they do not expand or collapse anything. If the intent was to indicate a collapsible section, the attribute should be on the toggle control (a `<button>`), not on the heading it labels.

```jsx
<h1>{item.title}</h1>
```

**Why this approach:**  
`aria-expanded` belongs on interactive controls that disclose or hide content — not on headings. Even correcting to `"true"` or `"false"` would be semantically wrong on a `<h1>`. Complete removal is the correct fix.

---

#### Fix CI-5b: `aria-relevant="changes"` on `<ul>` (`ProductPage.jsx`)

**Current code (`src/pages/ProductPage.jsx:146`):**
```jsx
<ul className={styles.detailsList} aria-relevant="changes" aria-live="polite">
```

**Proposed fix:**  
Replace `"changes"` with a valid token. The most semantically appropriate value here is `"additions text"` (announce when items are added and when text changes), or simply remove `aria-relevant` to use the live-region default behavior (which is `additions text`).

```jsx
<ul className={styles.detailsList} aria-live="polite">
```

**Why this approach:**  
Removing `aria-relevant` relies on the default behavior of `aria-live="polite"` which already announces additions and text changes — this is the common case. If filtering of announcements is desired, valid tokens (`additions`, `removals`, `text`, `all`) can be combined, but `"changes"` is not a valid token in the ARIA spec.

---

### Fix for CI-6 (AXE-IMAGE-ALT — Missing `alt` text)

**Affected elements:**  
- `HeroBanner.jsx:15` — `<img src="/images/home/New_Tees.png">`  
- `TheDrop.jsx:11` — `<img src="/images/home/2bags_charms1.png">`  

**Proposed fix (`src/components/HeroBanner.jsx`):**
```jsx
{/* Current */}
<img src={HERO_IMAGE} />

{/* Proposed */}
<img src={HERO_IMAGE} alt="Warm-toned winter basic t-shirts" />
```

**Proposed fix (`src/components/TheDrop.jsx`):**
```jsx
{/* Current */}
<img src={DROP_IMAGE} loading="lazy" />

{/* Proposed */}
<img src={DROP_IMAGE} loading="lazy" alt="Limited-edition Android, YouTube, and Super G plushie bag charms" />
```

**Why this approach:**  
Both images are informational — they illustrate the featured promotion and "The Drop" product respectively. The `alt` text should convey the same information a sighted user gets from seeing the image. The proposed `alt` values describe the content of each image based on its context and surrounding copy. If images are purely decorative, `alt=""` would be appropriate — but in promotional contexts, the images carry meaning and should be described.

---

### Fix for CI-7 (AXE-ARIA-REQUIRED-ATTR — `role="slider"` missing required attrs)

**Affected element:** `.drop-popularity-bar` in `src/components/TheDrop.jsx:19`

**Current code:**
```jsx
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

**Option A — Provide all required ARIA attributes (if the slider is functional):**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext="High popularity"
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Option B — Replace with a `<meter>` element (if purely informational):**
```jsx
<meter
  className="drop-popularity-bar"
  value={75}
  min={0}
  max={100}
  aria-label="Popularity indicator"
>
  75%
</meter>
```

**Option C — Use a decorative progress bar (if no interaction is intended):**
```jsx
<div
  role="progressbar"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

**Recommended approach (Option C):**  
The `.drop-popularity-bar` appears to be a read-only visual indicator of product popularity, not an interactive range input. `role="progressbar"` (like `role="slider"`) requires `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`, but unlike slider, `progressbar` does not imply interactivity and does not require `tabindex`. This most accurately models the element's semantic purpose.

---

## Remaining Non-Critical Issues

These issues have **SERIOUS** severity (not CRITICAL). They affect real users — particularly those with low vision and users in non-English contexts — but are lower priority than the critical blocking issues above.

---

### NC-1: AXE-COLOR-CONTRAST — Insufficient Text Color Contrast

**Evinced Rule:** `AXE-COLOR-CONTRAST`  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Total Instances:** 18 across all 5 pages  

| Page | Selector | DOM Content | File |
|------|----------|-------------|------|
| Homepage | `.hero-content > p` | "Warm hues for cooler days" | `src/components/HeroBanner.css` |
| Products | `.filter-count` (×12 instances) | "(8)", "(4)", "(14)", etc. — all filter count badges | `src/components/FilterSidebar.css` |
| Products | `.products-found` | "16 Products Found" | `src/pages/NewPage.css` |
| Product Detail | `p:nth-child(4)` (`.productDescription`) | Product description paragraph | `src/pages/ProductPage.module.css` |
| Checkout | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" (inactive step label) | `src/pages/CheckoutPage.css` |
| Checkout | `.summary-tax-note` | "Taxes calculated at next step" | `src/pages/CheckoutPage.css` |
| Order Confirmation | `.confirm-order-id-label` | "Order ID" | `src/pages/OrderConfirmationPage.css` |

**Root Cause:** Light gray or muted-color text on white/light backgrounds falls below the 4.5:1 minimum contrast ratio required for normal text under WCAG 1.4.3.

**Remediation direction (not applied):** Darken the foreground color values in the respective CSS files. Each color should be adjusted to achieve at least 4.5:1 contrast ratio against its background. Tools such as the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) can verify ratios.

---

### NC-2: AXE-HTML-HAS-LANG — `<html>` Element Missing `lang` Attribute

**Evinced Rule:** `AXE-HTML-HAS-LANG`  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Total Instances:** 5 (one per page — same root file)  

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `html` | `<html style="scroll-behavior: unset;">` | `public/index.html` |

**Current code (`public/index.html`):**
```html
<!DOCTYPE html>
<!-- A11Y-AXE html-has-lang: <html> element is missing a lang attribute -->
<html>
```

**Remediation direction (not applied):**
```html
<html lang="en">
```

**Why not applied:** This is already documented as an intentional demo issue in the source. Adding `lang="en"` to `public/index.html` would resolve this single-line change across all 5 pages simultaneously.

---

### NC-3: AXE-VALID-LANG — Invalid `lang` Attribute Value

**Evinced Rule:** `AXE-VALID-LANG`  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Total Instances:** 1 (Homepage only)  

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `p[lang="zz"]` | `<p lang="zz">Our brand-new, limited-edition plushie…</p>` | `src/components/TheDrop.jsx:20` |

**Current code (`src/components/TheDrop.jsx`):**
```jsx
{/* A11Y-AXE valid-lang: lang="zz" is not a valid BCP 47 language tag */}
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms…
</p>
```

The language code `"zz"` is not a registered [BCP 47](https://tools.ietf.org/html/bcp47) language subtag. Screen readers use `lang` attributes to select the correct pronunciation engine/voice. An invalid value may cause the reader to mispronounce or skip switching voices.

**Remediation direction (not applied):** Remove `lang="zz"` if the content is in English (the page's default language), or replace with a valid code (e.g., `lang="en"`) so screen readers can apply the correct language rules.

---

## Summary Table

### Critical Issues — Complete Instance List

| # | Issue ID | Type | Severity | Page(s) | Selector | Source File |
|---|----------|------|----------|---------|----------|-------------|
| 1 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | All | `.wishlist-btn` | `Header.jsx:131` |
| 2 | CI-2 | NOT_FOCUSABLE | CRITICAL | All | `.wishlist-btn` | `Header.jsx:131` |
| 3 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | All | `.icon-btn:nth-child(2)` (Search) | `Header.jsx:140` |
| 4 | CI-3 | NO_DESCRIPTIVE_TEXT | CRITICAL | All | `.icon-btn:nth-child(2)` (Search) | `Header.jsx:142` |
| 5 | CI-2 | NOT_FOCUSABLE | CRITICAL | All | `.icon-btn:nth-child(2)` (Search) | `Header.jsx:140` |
| 6 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | All | `.icon-btn:nth-child(4)` (Login) | `Header.jsx:156` |
| 7 | CI-3 | NO_DESCRIPTIVE_TEXT | CRITICAL | All | `.icon-btn:nth-child(4)` (Login) | `Header.jsx:158` |
| 8 | CI-2 | NOT_FOCUSABLE | CRITICAL | All | `.icon-btn:nth-child(4)` (Login) | `Header.jsx:156` |
| 9 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | All | `.flag-group` | `Header.jsx:161` |
| 10 | CI-2 | NOT_FOCUSABLE | CRITICAL | All | `.flag-group` | `Header.jsx:161` |
| 11 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | All | `li:nth-child(3) > .footer-nav-item` (Sustainability) | `Footer.jsx:14` |
| 12 | CI-2 | NOT_FOCUSABLE | CRITICAL | All | `li:nth-child(3) > .footer-nav-item` (Sustainability) | `Footer.jsx:14` |
| 13 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | All | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | `Footer.jsx:18` |
| 14 | CI-3 | NO_DESCRIPTIVE_TEXT | CRITICAL | All | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | `Footer.jsx:18` |
| 15 | CI-2 | NOT_FOCUSABLE | CRITICAL | All | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | `Footer.jsx:18` |
| 16 | CI-4 | AXE-BUTTON-NAME | CRITICAL | All | `#cart-modal > div:nth-child(1) > button` (Cart close) | `CartModal.jsx:56` |
| 17 | CI-4 | AXE-BUTTON-NAME | CRITICAL | All | `div[role="dialog"] > div:nth-child(1) > button` (Wishlist close) | `WishlistModal.jsx:202` |
| 18 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | Homepage | `.product-card:nth-child(1) > … > .shop-link` | `TrendingCollections.jsx` |
| 19 | CI-3 | NO_DESCRIPTIVE_TEXT | CRITICAL | Homepage | `.product-card:nth-child(1) > … > .shop-link` | `TrendingCollections.jsx` |
| 20 | CI-2 | NOT_FOCUSABLE | CRITICAL | Homepage | `.product-card:nth-child(1) > … > .shop-link` | `TrendingCollections.jsx` |
| 21 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | Homepage | `.product-card:nth-child(2) > … > .shop-link` | `TrendingCollections.jsx` |
| 22 | CI-3 | NO_DESCRIPTIVE_TEXT | CRITICAL | Homepage | `.product-card:nth-child(2) > … > .shop-link` | `TrendingCollections.jsx` |
| 23 | CI-2 | NOT_FOCUSABLE | CRITICAL | Homepage | `.product-card:nth-child(2) > … > .shop-link` | `TrendingCollections.jsx` |
| 24 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | Homepage | `.product-card:nth-child(3) > … > .shop-link` | `TrendingCollections.jsx` |
| 25 | CI-3 | NO_DESCRIPTIVE_TEXT | CRITICAL | Homepage | `.product-card:nth-child(3) > … > .shop-link` | `TrendingCollections.jsx` |
| 26 | CI-2 | NOT_FOCUSABLE | CRITICAL | Homepage | `.product-card:nth-child(3) > … > .shop-link` | `TrendingCollections.jsx` |
| 27 | CI-2 | NOT_FOCUSABLE | CRITICAL | Homepage | `.drop-popularity-bar` | `TheDrop.jsx:19` |
| 28 | CI-7 | AXE-ARIA-REQUIRED-ATTR | CRITICAL | Homepage | `.drop-popularity-bar` | `TheDrop.jsx:19` |
| 29 | CI-5 | AXE-ARIA-VALID-ATTR-VALUE | CRITICAL | Homepage | `.featured-card:nth-child(1) > … > h1` | `FeaturedPair.jsx:43` |
| 30 | CI-5 | AXE-ARIA-VALID-ATTR-VALUE | CRITICAL | Homepage | `.featured-card:nth-child(2) > … > h1` | `FeaturedPair.jsx:43` |
| 31 | CI-6 | AXE-IMAGE-ALT | CRITICAL | Homepage | `img[src$="New_Tees.png"]` | `HeroBanner.jsx:15` |
| 32 | CI-6 | AXE-IMAGE-ALT | CRITICAL | Homepage | `img[src$="2bags_charms1.png"]` | `TheDrop.jsx:11` |
| 33 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | Products | `.filter-option` ×13 (price/size/brand filters) | `FilterSidebar.jsx` |
| 34 | CI-2 | NOT_FOCUSABLE | CRITICAL | Products | `.filter-option` ×13 (price/size/brand filters) | `FilterSidebar.jsx` |
| 35 | CI-5 | AXE-ARIA-VALID-ATTR-VALUE | CRITICAL | Product Detail | `ul[aria-relevant="changes"]` | `ProductPage.jsx:146` |
| 36 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | Checkout | `.checkout-continue-btn` | `CheckoutPage.jsx:157` |
| 37 | CI-2 | NOT_FOCUSABLE | CRITICAL | Checkout | `.checkout-continue-btn` | `CheckoutPage.jsx:157` |
| 38 | CI-1 | WRONG_SEMANTIC_ROLE | CRITICAL | Order Confirm | `.confirm-home-link` | `OrderConfirmationPage.jsx:40` |
| 39 | CI-2 | NOT_FOCUSABLE | CRITICAL | Order Confirm | `.confirm-home-link` | `OrderConfirmationPage.jsx:40` |

### Non-Critical Issues — Complete Instance List

| # | Issue ID | Type | Severity | Page(s) | Selector | Source File |
|---|----------|------|----------|---------|----------|-------------|
| 1 | NC-2 | AXE-HTML-HAS-LANG | SERIOUS | All | `html` | `public/index.html` |
| 2 | NC-1 | AXE-COLOR-CONTRAST | SERIOUS | Homepage | `.hero-content > p` | `HeroBanner.css` |
| 3 | NC-3 | AXE-VALID-LANG | SERIOUS | Homepage | `p[lang="zz"]` | `TheDrop.jsx:20` |
| 4 | NC-1 | AXE-COLOR-CONTRAST | SERIOUS | Products | `.filter-count` ×12 (all filter option counts) | `FilterSidebar.css` |
| 5 | NC-1 | AXE-COLOR-CONTRAST | SERIOUS | Products | `.products-found` | `NewPage.css` |
| 6 | NC-1 | AXE-COLOR-CONTRAST | SERIOUS | Product Detail | `p:nth-child(4)` (`.productDescription`) | `ProductPage.module.css` |
| 7 | NC-1 | AXE-COLOR-CONTRAST | SERIOUS | Checkout | `.checkout-step:nth-child(3) > .step-label` | `CheckoutPage.css` |
| 8 | NC-1 | AXE-COLOR-CONTRAST | SERIOUS | Checkout | `.summary-tax-note` | `CheckoutPage.css` |
| 9 | NC-1 | AXE-COLOR-CONTRAST | SERIOUS | Order Confirm | `.confirm-order-id-label` | `OrderConfirmationPage.css` |

---

*Report generated by Evinced JS Playwright SDK automated audit — 2026-03-24*
