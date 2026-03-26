# Accessibility Audit Report — Demo Website

**Generated:** 2026-03-26  
**Tool:** Evinced JS Playwright SDK (via `@evinced/js-playwright-sdk`)  
**Scanner version:** 2.43.0  
**Auditor:** Automated Cloud Agent  
**Branch:** `cursor/accessibility-audit-report-93e4`

---

## Table of Contents

1. [Repository Overview](#1-repository-overview)
2. [Pages Audited & Entry Points](#2-pages-audited--entry-points)
3. [Audit Methodology](#3-audit-methodology)
4. [Issue Classification Summary](#4-issue-classification-summary)
5. [Critical Issues — Detailed Findings](#5-critical-issues--detailed-findings)
   - [CR-01 — Div-as-button: Wishlist icon button (Header)](#cr-01--div-as-button-wishlist-icon-button-header)
   - [CR-02 — Div-as-button: Search & Login icon buttons (Header)](#cr-02--div-as-button-search--login-icon-buttons-header)
   - [CR-03 — Div-as-button: Region selector (Header)](#cr-03--div-as-button-region-selector-header)
   - [CR-04 — Div-as-link: Shop category links (PopularSection)](#cr-04--div-as-link-shop-category-links-popularsection)
   - [CR-05 — Div-as-link: Footer navigation items (Footer)](#cr-05--div-as-link-footer-navigation-items-footer)
   - [CR-06 — Invalid aria-expanded value on h1 (FeaturedPair)](#cr-06--invalid-aria-expanded-value-on-h1-featuredpair)
   - [CR-07 — Invalid aria-relevant value on ul (ProductPage/WishlistModal)](#cr-07--invalid-aria-relevant-value-on-ul-productpagewishlistmodal)
   - [CR-08 — role=slider missing required ARIA attributes (TheDrop)](#cr-08--roleslider-missing-required-aria-attributes-thedrop)
   - [CR-09 — Images missing alt text (HeroBanner, TheDrop)](#cr-09--images-missing-alt-text-herobanner-thedrop)
   - [CR-10 — Icon-only close buttons without accessible name (CartModal, WishlistModal)](#cr-10--icon-only-close-buttons-without-accessible-name-cartmodal-wishlistmodal)
   - [CR-11 — Sort button has incorrect role (NewPage)](#cr-11--sort-button-has-incorrect-role-newpage)
   - [CR-12 — Sort button missing contextual label (NewPage)](#cr-12--sort-button-missing-contextual-label-newpage)
   - [CR-13 — Cart close button missing accessible name (CartModal)](#cr-13--cart-close-button-missing-accessible-name-cartmodal)
   - [CR-14 — Item remove button missing accessible name (CartModal)](#cr-14--item-remove-button-missing-accessible-name-cartmodal)
6. [Non-Critical Issues (Not Remediated)](#6-non-critical-issues-not-remediated)
   - [Serious: Color Contrast](#serious-color-contrast)
   - [Serious: html-has-lang](#serious-html-has-lang)
   - [Serious: valid-lang](#serious-valid-lang)
   - [Needs Review / Best Practice](#needs-review--best-practice)
7. [Per-Page Issue Counts](#7-per-page-issue-counts)
8. [WCAG Coverage](#8-wcag-coverage)

---

## 1. Repository Overview

| Item | Detail |
|------|--------|
| Framework | React 18, React Router v7, Webpack 5 |
| Pages / Routes | 5 distinct routes |
| Shared components | Header, Footer, CartModal, WishlistModal |
| Source root | `/workspace/src/` |
| Build output | `/workspace/dist/` |
| Test runner | Playwright v1.44+ |
| A11y engine | Evinced JS Playwright SDK 2.43.0 |

The repository is a single-page application (SPA). All routes share the same `Header` and `Footer`. Cart and Wishlist panels are modal drawers rendered globally.

---

## 2. Pages Audited & Entry Points

| # | Route | Entry Point File | Description |
|---|-------|-----------------|-------------|
| 1 | `/` | `src/pages/HomePage.jsx` | Homepage with hero banner, featured products, popular section, trending collections, and "The Drop" section |
| 2 | `/shop/new` | `src/pages/NewPage.jsx` | Products listing with filter sidebar and sort combobox |
| 3 | `/product/:id` | `src/pages/ProductPage.jsx` | Individual product detail with add-to-cart and wishlist |
| 4 | `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout: basket review then shipping/payment form |
| 5 | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation screen |
| — | Cart drawer | `src/components/CartModal.jsx` | Global modal drawer (reachable from all pages) |
| — | Wishlist drawer | `src/components/WishlistModal.jsx` | Global modal drawer (reachable from all pages) |

**Shared layout components audited on every page:**

- `src/components/Header.jsx` — main navigation, header icon buttons
- `src/components/Footer.jsx` — footer navigation links

---

## 3. Audit Methodology

Each route was loaded in a headless Chromium browser via Playwright. The Evinced SDK was run in two modes:

1. **Continuous monitoring (`evStart`/`evStop`):** The SDK observed the live DOM as the user journey progressed through all state transitions (page loads, modal opens, form fills, navigation clicks).
2. **Targeted component scans:** For `/shop/new`, additional scans were run against the sort combobox widget (`evAnalyzeCombobox`) and the main navigation landmark (`evAnalyzeSiteNavigation`). Results were merged and deduplicated with `evMergeIssues`.

The cart drawer was audited in its open state (after adding an item to the cart) to capture modal-specific issues.

All raw JSON results are saved to `/workspace/tests/e2e/test-results/`.

---

## 4. Issue Classification Summary

### Per-Page Totals (raw Evinced counts, including repeated issues across states)

| Page | Total | Critical | Serious | Needs Review | Best Practice |
|------|-------|----------|---------|--------------|---------------|
| Homepage (`/`) | 35 | **32** | 3 | 0 | 0 |
| Shop/New (`/shop/new`) | 59 | **43** | 14 | 1 | 1 |
| Product Detail (`/product/:id`) | 75 | **59** | 16 | 0 | 0 |
| Checkout (`/checkout`) | 98 | **79** | 19 | 0 | 0 |
| Order Confirmation (`/order-confirmation`) | 118 | **97** | 21 | 0 | 0 |
| Cart Modal (open state) | 79 | **63** | 16 | 0 | 0 |
| **Grand Total (raw)** | **464** | **373** | **89** | **1** | **1** |

> **Note:** Raw totals count the same component issue on every page where the component appears (e.g., Header issues are counted on all 6 audited states). The critical findings below are de-duplicated by root cause.

### Deduplicated Critical Root Causes

After deduplication by issue type and component class, **14 distinct critical root-cause patterns** were identified, covering **41 unique component instances** across all pages.

| ID | Issue Type | Evinced Rule | Affected Component | Affected Pages |
|----|-----------|-------------|-------------------|----------------|
| CR-01 | Interactable role + Keyboard accessible | `interactable-role`, `keyboard-accessible` | `div.icon-btn.wishlist-btn` | All pages |
| CR-02 | Interactable role + Accessible name + Keyboard accessible | `interactable-role`, `accessible-name`, `keyboard-accessible` | `div.icon-btn` (Search, Login) | All pages |
| CR-03 | Interactable role + Keyboard accessible | `interactable-role`, `keyboard-accessible` | `div.flag-group` | All pages |
| CR-04 | Interactable role + Accessible name + Keyboard accessible | `interactable-role`, `accessible-name`, `keyboard-accessible` | `div.shop-link` | Homepage |
| CR-05 | Interactable role + Accessible name + Keyboard accessible | `interactable-role`, `accessible-name`, `keyboard-accessible` | `div.footer-nav-item` (FAQs) | All pages |
| CR-06 | Invalid ARIA attribute value | `aria-valid-attr-value` | `h1[aria-expanded="yes"]` | Homepage |
| CR-07 | Invalid ARIA attribute value | `aria-valid-attr-value` | `ul[aria-relevant="changes"]` | Product Detail, Checkout, Order Confirmation, Cart Modal |
| CR-08 | Missing required ARIA attribute | `aria-required-attr` | `div[role="slider"]` | Homepage |
| CR-09 | Images missing alt text | `image-alt` | `img` (HeroBanner, TheDrop) | Homepage |
| CR-10 | Button has no accessible name | `button-name` | `button.closeBtn` (Cart, Wishlist) | All pages |
| CR-11 | Element has incorrect role | `element-incorrect-role` (combobox) | `button.sort-btn` | Shop/New |
| CR-12 | Missing contextual labeling | `missing-contextual-labeling` | `button.sort-btn` | Shop/New |
| CR-13 | Button has no accessible name | `button-name` | Cart close `<button>` | All pages |
| CR-14 | Button has no accessible name | `button-name` | Cart item remove `<button>` | Checkout, Order Confirmation |

---

## 5. Critical Issues — Detailed Findings

> **No remediations were applied to the source code per the task requirements. This section documents the findings and the recommended fix for each.**

---

### CR-01 — Div-as-button: Wishlist icon button (Header)

**Severity:** Critical  
**WCAG:** 1.3.1 (A), 2.1.1 (A), 4.1.2 (A)  
**Evinced rules:** `interactable-role`, `keyboard-accessible`  
**Affected pages:** All pages (shared Header component)  
**Source file:** `src/components/Header.jsx`

**Affected element:**

```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>
```

**Issue:**  
The wishlist toggle is a `<div>` acting as a button. It has no `role="button"` and no `tabindex`, making it completely invisible to screen readers as an interactive control and unreachable via keyboard Tab navigation. The SVG icon is correctly marked `aria-hidden`, but the `<span>Wishlist</span>` text provides no interactivity semantics.

**Recommended fix:**  
Replace the `<div>` with a native `<button>` element, or add `role="button"` and `tabindex="0"` with keyboard event handlers (`onKeyDown` for Enter/Space). A native button is strongly preferred:

```jsx
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</button>
```

**Why this approach:**  
Native `<button>` elements are keyboard-focusable by default, fire `click` on Enter and Space, are announced by screen readers as "button", and correctly inherit focus-visible styles. This eliminates both the `interactable-role` and `keyboard-accessible` violations in a single change.

---

### CR-02 — Div-as-button: Search & Login icon buttons (Header)

**Severity:** Critical  
**WCAG:** 1.3.1 (A), 2.1.1 (A), 4.1.2 (A)  
**Evinced rules:** `interactable-role`, `accessible-name`, `keyboard-accessible`  
**Affected pages:** All pages (shared Header component)  
**Source file:** `src/components/Header.jsx`

**Affected elements (2):**

```html
<!-- Search button -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>

<!-- Login button -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Issue:**  
Both controls use `<div>` without semantic role. Additionally, the visible text label (`<span aria-hidden="true">`) is intentionally hidden from the accessibility tree, leaving the elements with **no accessible name** in addition to lacking an interactive role. Screen readers cannot identify these as clickable controls, and keyboard users cannot reach them.

**Recommended fix:**

```jsx
<button className="icon-btn" onClick={openSearch} aria-label="Search">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</button>

<button className="icon-btn" onClick={openLogin} aria-label="Login">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</button>
```

**Why this approach:**  
Using native `<button>` with an explicit `aria-label` resolves all three violations simultaneously. The `aria-label` takes precedence over any child text content, ensuring the accessible name is precise and does not include the SVG's hidden content.

---

### CR-03 — Div-as-button: Region selector (Header)

**Severity:** Critical  
**WCAG:** 1.3.1 (A), 2.1.1 (A), 4.1.2 (A)  
**Evinced rules:** `interactable-role`, `keyboard-accessible`  
**Affected pages:** All pages (shared Header component)  
**Source file:** `src/components/Header.jsx`

**Affected element:**

```html
<div class="flag-group" style="cursor: pointer;">
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" width="24" height="24">
  <span>US / USD</span>
</div>
```

**Issue:**  
The region/currency selector is a `<div>` with a click handler and `cursor: pointer` style, but no `role="button"` and no `tabindex`. It is inaccessible to keyboard users and announced as a generic container by screen readers.

**Recommended fix:**

```jsx
<button className="flag-group" onClick={openRegionSelector} aria-label="Select region: US / USD">
  <img src="/images/icons/united-states-of-america.png" alt="" />
  <span aria-hidden="true">US / USD</span>
</button>
```

**Why this approach:**  
Moving to a `<button>` exposes the control to keyboard navigation. The `aria-label` provides a complete, meaningful description. The flag image is decorative in this context (redundant with the text label), so `alt=""` is appropriate to suppress filename announcement.

---

### CR-04 — Div-as-link: Shop category links (PopularSection)

**Severity:** Critical  
**WCAG:** 1.3.1 (A), 2.1.1 (A), 4.1.2 (A)  
**Evinced rules:** `interactable-role`, `accessible-name`, `keyboard-accessible`  
**Affected pages:** Homepage  
**Source file:** `src/components/PopularSection.jsx`

**Affected elements (3):**

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

**Issue:**  
These elements navigate users to category pages (functioning as links) but use `<div>` without `role="link"` or `tabindex`. The visible text label is wrapped in `aria-hidden="true"`, so the accessible name is empty — screen readers cannot identify the element or its destination.

**Recommended fix:**

```jsx
<a href="/shop/new?category=drinkware" className="shop-link">
  Shop Drinkware
</a>
```

Or, if client-side routing is required:

```jsx
<Link to="/shop/new?category=drinkware" className="shop-link">
  Shop Drinkware
</Link>
```

**Why this approach:**  
Native `<a>` elements expose link semantics, are keyboard-focusable by default, and support right-click/open-in-new-tab. React Router's `<Link>` component wraps a native anchor. Remove the `aria-hidden` from the text to restore the accessible name. This resolves all three violations at once.

---

### CR-05 — Div-as-link: Footer navigation items (Footer)

**Severity:** Critical  
**WCAG:** 1.3.1 (A), 2.1.1 (A), 4.1.2 (A)  
**Evinced rules:** `interactable-role`, `accessible-name`, `keyboard-accessible`  
**Affected pages:** All pages (shared Footer component)  
**Source file:** `src/components/Footer.jsx`

**Affected elements (2):**

```html
<div class="footer-nav-item" style="cursor: pointer;">
  <span>Sustainability</span>
</div>
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

**Issue:**  
Footer navigation items are `<div>` elements used as navigation links. The FAQs item additionally marks its visible text as `aria-hidden`, giving it an empty accessible name. Neither item is keyboard-accessible.

**Recommended fix:**

```jsx
<li>
  <a href="/sustainability" className="footer-nav-item">Sustainability</a>
</li>
<li>
  <a href="/faqs" className="footer-nav-item">FAQs</a>
</li>
```

**Why this approach:**  
Native `<a>` inside a `<nav>` list is the standard semantic pattern for navigation links. It requires no ARIA, is keyboard-focusable, and is correctly announced as a link. Remove `aria-hidden` from the text so the accessible name is derived from the element's text content.

---

### CR-06 — Invalid aria-expanded value on h1 (FeaturedPair)

**Severity:** Critical  
**WCAG:** 4.1.2 (A)  
**Evinced rule:** `aria-valid-attr-value`  
**Affected pages:** Homepage  
**Source file:** `src/components/FeaturedPair.jsx`

**Affected elements (2):**

```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Issue:**  
`aria-expanded` requires a boolean value: `"true"` or `"false"`. The value `"yes"` is invalid and is ignored or misinterpreted by assistive technologies. Additionally, `aria-expanded` is not a valid or meaningful attribute on a static heading element — headings do not have an expandable state.

**Recommended fix:**  
Remove `aria-expanded` entirely from heading elements:

```jsx
<h1>Keep on Truckin'</h1>
```

If a disclosure pattern is genuinely needed (e.g., the heading controls a collapsible section), move the `aria-expanded` attribute to the interactive trigger button, not the heading itself.

**Why this approach:**  
Removing an invalid, semantically meaningless attribute is the simplest and most correct fix. `aria-expanded` is a state attribute for interactive disclosure widgets (buttons, comboboxes), not for headings. Using it on `<h1>` communicates false information to assistive technologies.

---

### CR-07 — Invalid aria-relevant value on ul (ProductPage/WishlistModal)

**Severity:** Critical  
**WCAG:** 4.1.2 (A)  
**Evinced rule:** `aria-valid-attr-value`  
**Affected pages:** Product Detail, Checkout, Order Confirmation, Cart Modal  
**Source file:** `src/pages/ProductPage.jsx` (WishlistModal live region `<ul>`)

**Affected element:**

```html
<ul class="PZdSKB1ULfufQL0NRQ7a" aria-relevant="changes" aria-live="polite">
  <li style="display: none;">
    <span role="meter" aria-label="Stock level"></span>
  </li>
</ul>
```

**Issue:**  
`aria-relevant` accepts only space-separated tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not a valid token and will be ignored by assistive technologies. The element also contains a `<span role="meter">` without required ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).

**Recommended fix:**

```jsx
<ul aria-live="polite" aria-relevant="additions text">
  <li>
    <span
      role="meter"
      aria-label="Stock level"
      aria-valuenow={stockLevel}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  </li>
</ul>
```

**Why this approach:**  
`"additions text"` is the most common and broadly supported value for a live region announcing new content. The `role="meter"` requires three numeric ARIA attributes to convey current value, minimum, and maximum to screen readers; without them the element is announced with no meaningful information.

---

### CR-08 — role=slider missing required ARIA attributes (TheDrop)

**Severity:** Critical  
**WCAG:** 4.1.2 (A)  
**Evinced rule:** `aria-required-attr`  
**Affected pages:** Homepage  
**Source file:** `src/components/TheDrop.jsx`

**Affected element:**

```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Issue:**  
The `slider` role mandates three ARIA attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. None are present. Assistive technologies cannot convey the slider's current value, minimum, or maximum to the user.

**Recommended fix:**

```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext={`${popularityValue}% popularity`}
  className="drop-popularity-bar"
/>
```

**Why this approach:**  
All three attributes are required by the ARIA specification for `role="slider"`. `aria-valuetext` is optional but recommended when the raw numeric value is less meaningful to users than a descriptive text equivalent. If the bar is purely decorative (non-interactive), use `role="img"` with a descriptive `aria-label` instead, which requires no value attributes.

---

### CR-09 — Images missing alt text (HeroBanner, TheDrop)

**Severity:** Critical  
**WCAG:** 1.1.1 (A)  
**Evinced rule:** `image-alt`  
**Affected pages:** Homepage  
**Source files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`

**Affected elements (2):**

```html
<img src="/images/home/New_Tees.png">
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**Issue:**  
Both images have no `alt` attribute. Screen readers announce the filename (`New_Tees.png`, `2bags_charms1.png`) as the image description, which is meaningless to users. For decorative images, an empty `alt=""` is required to suppress announcement. For informative images, a meaningful description is required.

**Recommended fix:**

```jsx
{/* HeroBanner — informative image */}
<img src="/images/home/New_Tees.png" alt="New winter basics tee collection" />

{/* TheDrop — decorative product visual */}
<img src="/images/home/2bags_charms1.png" alt="" loading="lazy" />
```

**Why this approach:**  
WCAG 1.1.1 requires all `<img>` elements to have an `alt` attribute. Informative images need a description that communicates the image's purpose or content; decorative images should use `alt=""` to be skipped by screen readers. The hero image likely conveys marketing content (informative); the drop promotional image is likely decorative alongside its text description.

---

### CR-10 — Icon-only close buttons without accessible name (CartModal, WishlistModal)

**Severity:** Critical  
**WCAG:** 4.1.2 (A)  
**Evinced rule:** `button-name`  
**Affected pages:** All pages (Cart and Wishlist drawers)  
**Source files:** `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`

**Affected elements:**

```html
<!-- Cart close button -->
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>

<!-- Wishlist close button -->
<button class="WEtKZofboSdJ1n7KLpwd">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

**Issue:**  
Both close buttons contain only an SVG icon marked `aria-hidden`. There is no inner text and no `aria-label`, so the button has no accessible name. Screen readers announce these as "button" with no indication of purpose.

**Recommended fix:**

```jsx
{/* Cart close button */}
<button
  className={styles.closeBtn}
  onClick={onClose}
  aria-label="Close shopping cart"
>
  <svg width="20" height="20" aria-hidden="true" focusable="false">…</svg>
</button>

{/* Wishlist close button */}
<button
  className={styles.closeBtn}
  onClick={onClose}
  aria-label="Close wishlist"
>
  <svg width="20" height="20" aria-hidden="true" focusable="false">…</svg>
</button>
```

**Why this approach:**  
Adding `aria-label` to the button provides an accessible name without changing the visual appearance. `focusable="false"` on the SVG prevents IE/Edge from placing focus on the SVG itself. The label should describe the action ("Close shopping cart") rather than the icon ("X") to be maximally informative.

---

### CR-11 — Sort button has incorrect role (NewPage)

**Severity:** Critical  
**WCAG:** 4.1.2 (A)  
**Evinced rule:** `element-incorrect-role` (Evinced combobox component rule)  
**Affected pages:** Shop/New (`/shop/new`)  
**Source file:** `src/pages/NewPage.jsx`

**Affected element:**

```html
<button class="sort-btn">
  Sort by Relevance (Default)
  <svg aria-hidden="true">…</svg>
</button>
```

**Issue:**  
The sort trigger is implemented as a `<button>` but is expected (by Evinced's combobox component analysis) to carry `role="combobox"` since it opens a listbox of sort options. Without the `combobox` role, assistive technologies announce it as a plain button with no indication that activating it reveals a list of selectable options.

**Recommended fix:**

```jsx
<button
  className="sort-btn"
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls="sort-options-list"
  aria-label="Sort products"
  onClick={toggleSort}
>
  {currentSortLabel}
  <svg aria-hidden="true">…</svg>
</button>
<ul
  id="sort-options-list"
  role="listbox"
  aria-label="Sort options"
  hidden={!isOpen}
>
  {sortOptions.map(option => (
    <li
      key={option.value}
      role="option"
      aria-selected={currentSort === option.value}
      tabIndex={0}
      onClick={() => selectSort(option.value)}
      onKeyDown={handleOptionKeyDown}
    >
      {option.label}
    </li>
  ))}
</ul>
```

**Why this approach:**  
The ARIA combobox pattern requires `role="combobox"` on the trigger with `aria-haspopup="listbox"` and `aria-expanded` to communicate state. `role="listbox"` with `role="option"` children on the dropdown provides the full semantic contract for a custom select widget. `aria-controls` programmatically links the trigger to the options list.

---

### CR-12 — Sort button missing contextual label (NewPage)

**Severity:** Critical  
**WCAG:** 1.3.1 (A), 4.1.2 (A)  
**Evinced rule:** `missing-contextual-labeling`  
**Affected pages:** Shop/New (`/shop/new`)  
**Source file:** `src/pages/NewPage.jsx`

**Affected element:**

```html
<button class="sort-btn">
  Sort by Relevance (Default)
  <svg aria-hidden="true">…</svg>
</button>
```

**Issue:**  
As a combobox widget, the sort trigger requires a group-level label (via `aria-label` or an associated `<label>`) so that assistive technologies can identify the widget's purpose when announcing it in context. The visible text "Sort by Relevance (Default)" is the current value display, not a widget label.

**Recommended fix:**

```jsx
<div role="group" aria-label="Sort products" className="sort-dropdown">
  <button
    className="sort-btn"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls="sort-options-list"
  >
    {currentSortLabel}
    <svg aria-hidden="true">…</svg>
  </button>
  {/* options list … */}
</div>
```

**Why this approach:**  
Wrapping the combobox in a `role="group"` with `aria-label="Sort products"` provides the contextual label that Evinced's combobox analysis requires. This helps screen reader users understand the purpose of the widget before interacting with it, rather than relying solely on the trigger button's announced value.

---

### CR-13 — Cart close button missing accessible name (CartModal)

**Severity:** Critical  
**WCAG:** 4.1.2 (A)  
**Evinced rule:** `button-name`  
**Affected pages:** All pages (Cart drawer)  
**Source file:** `src/components/CartModal.jsx`

> This issue is the same root cause as **CR-10** (icon-only button without accessible name). The cart modal has its close button rendered at the top level of the drawer (`#cart-modal > div:nth-child(1) > button`) rather than inside `div[role="dialog"]`. Evinced detected it as a separate instance because the CSS Modules hashed class name differs.

**Affected element:**

```html
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

**Recommended fix:** Same as CR-10 — add `aria-label="Close shopping cart"` to the button.

---

### CR-14 — Item remove button missing accessible name (CartModal)

**Severity:** Critical  
**WCAG:** 4.1.2 (A)  
**Evinced rule:** `button-name`  
**Affected pages:** Checkout, Order Confirmation (cart state persists)  
**Source file:** `src/components/CartModal.jsx`

**Affected element:**

```html
<button class="cxg80OkqBVvKnUqn73Qw">
  <svg width="16" height="16" aria-hidden="true">…</svg>
</button>
```

**Issue:**  
The remove-item button in each cart row contains only an SVG icon with no accessible name. Screen readers cannot identify which item will be removed or what the button's purpose is.

**Recommended fix:**

```jsx
{cartItems.map(item => (
  <li key={item.id}>
    {/* … */}
    <button
      className={styles.removeBtn}
      onClick={() => removeItem(item.id)}
      aria-label={`Remove ${item.name} from cart`}
    >
      <svg width="16" height="16" aria-hidden="true" focusable="false">…</svg>
    </button>
  </li>
))}
```

**Why this approach:**  
Item-specific `aria-label` values (e.g., "Remove Google Tote Bag from cart") allow screen reader users to unambiguously identify the target item before activating the button. This is especially important in a list context where multiple remove buttons exist on the page simultaneously.

---

## 6. Non-Critical Issues (Not Remediated)

The following issues were detected and classified as **Serious** severity (below the critical threshold) and were not remediated per the task scope. They are documented here for completeness and should be addressed in a follow-up accessibility sprint.

---

### Serious: Color Contrast

**Evinced rule:** `color-contrast`  
**WCAG:** 1.4.3 (AA) — Minimum Contrast (4.5:1 for normal text)  
**Affected pages:** Homepage, Shop/New, Product Detail (through Cart Modal state)

| # | Element | Selector | Contrast Ratio | Required | Source File |
|---|---------|----------|---------------|----------|-------------|
| 1 | Hero subtitle | `.hero-content > p` ("Warm hues for cooler days") | ~1.3:1 | 4.5:1 | `src/components/HeroBanner.css` |
| 2 | Filter count | `.filter-count` (e.g., "(8)") | ~1.4:1 | 4.5:1 | `src/components/FilterSidebar.css` |
| 3 | Filter count (multiple) | `.filter-count` (all instances) | ~1.4:1 | 4.5:1 | `src/components/FilterSidebar.css` |
| 4 | Products found | `.products-found` ("16 Products Found") | ~1.9:1 | 4.5:1 | `src/pages/NewPage.css` |

**Total unique contrast violations:** 9 unique selectors (filter-count appears in many filter groups)

**Recommended approach:** Darken the foreground text colors to achieve at minimum 4.5:1 against their backgrounds. For `.hero-content > p`, this means adjusting `color: #c8c0b8` on a `#e8e0d8` background; for `.filter-count`, adjusting `color: #c8c8c8` on `#ffffff` background.

---

### Serious: html-has-lang

**Evinced rule:** `html-has-lang`  
**WCAG:** 3.1.1 (A) — Language of Page  
**Affected pages:** All pages  
**Source file:** `public/index.html`

**Issue:** The root `<html>` element has no `lang` attribute. Screen readers use this to determine which speech engine/language profile to use.

**Affected element:**

```html
<html style="scroll-behavior: unset;">
```

**Recommended fix:**

```html
<html lang="en" style="scroll-behavior: unset;">
```

**Note:** This single-file change would resolve this issue across all pages simultaneously.

---

### Serious: valid-lang

**Evinced rule:** `valid-lang`  
**WCAG:** 3.1.2 (AA) — Language of Parts  
**Affected pages:** Homepage  
**Source file:** `src/components/TheDrop.jsx`

**Issue:** A `<p>` element has `lang="zz"`, which is not a valid BCP 47 language tag. Assistive technologies may switch to an incorrect voice profile for this text.

**Affected element:**

```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>
```

**Recommended fix:** Remove `lang="zz"` if the text is in English, or replace it with the correct BCP 47 tag (e.g., `lang="en"` for English).

---

### Needs Review / Best Practice

| Severity | Rule | Page | Element | Detail |
|----------|------|------|---------|--------|
| Needs Review | `skipped-combobox-analysis` | Shop/New | `.sort-btn` | Evinced skipped detailed combobox analysis because the sort dropdown did not open during the combobox scan; the sort-btn issues are captured in CR-11 and CR-12 |
| Best Practice | `menu-as-nav-element` | Shop/New | `nav[aria-label="Main navigation"] ul[role="menu"]` | Submenu `<ul>` elements inside the main `<nav>` landmark carry `role="menu"`, which implies application widget semantics; ARIA navigation landmarks should only contain `role="link"`, `role="button"`, or `role="group"` children |

---

## 7. Per-Page Issue Counts

### Homepage (`/`)

| Issue Type | Severity | Count | Root Cause |
|------------|----------|-------|------------|
| Interactable role | Critical | 9 | CR-01, CR-02, CR-03, CR-04 |
| Keyboard accessible | Critical | 10 | CR-01, CR-02, CR-03, CR-04 |
| Accessible name | Critical | 7 | CR-02, CR-04 |
| Aria-valid-attr-value | Critical | 2 | CR-06 |
| Image-alt | Critical | 2 | CR-09 |
| Aria-required-attr | Critical | 1 | CR-08 |
| Button-name | Critical | 1 | CR-10/CR-13 |
| **Critical subtotal** | | **32** | |
| Color-contrast | Serious | 1 | Non-critical S-01 |
| Html-has-lang | Serious | 1 | Non-critical S-02 |
| Valid-lang | Serious | 1 | Non-critical S-03 |
| **Serious subtotal** | | **3** | |
| **Page total** | | **35** | |

### Shop/New (`/shop/new`)

| Issue Type | Severity | Count | Root Cause |
|------------|----------|-------|------------|
| Interactable role | Critical | 18 | CR-01, CR-02, CR-03, CR-05 + product card divs |
| Keyboard accessible | Critical | 18 | CR-01, CR-02, CR-03, CR-05 + product card divs |
| Accessible name | Critical | 3 | CR-02, CR-05 |
| Button-name | Critical | 2 | CR-10/CR-13 |
| Element has incorrect role | Critical | 1 | CR-11 |
| Missing contextual labeling | Critical | 1 | CR-12 |
| **Critical subtotal** | | **43** | |
| Color-contrast | Serious | 13 | `.filter-count`, `.products-found` |
| Html-has-lang | Serious | 1 | Non-critical S-02 |
| Skipped combobox analysis | Needs Review | 1 | — |
| Menu as nav element | Best Practice | 1 | — |
| **Non-critical subtotal** | | **16** | |
| **Page total** | | **59** | |

### Product Detail (`/product/:id`)

| Issue Type | Severity | Count | Root Cause |
|------------|----------|-------|------------|
| Interactable role | Critical | 24 | All header/footer + product page controls |
| Keyboard accessible | Critical | 24 | All header/footer + product page controls |
| Accessible name | Critical | 6 | CR-02, CR-05 |
| Button-name | Critical | 4 | CR-10/CR-13 |
| Aria-valid-attr-value | Critical | 1 | CR-07 |
| **Critical subtotal** | | **59** | |
| Color-contrast | Serious | 14 | Product description text |
| Html-has-lang | Serious | 2 | Non-critical S-02 |
| **Serious subtotal** | | **16** | |
| **Page total** | | **75** | |

### Checkout (`/checkout`)

| Issue Type | Severity | Count | Root Cause |
|------------|----------|-------|------------|
| Interactable role | Critical | 32 | Header/footer/checkout divs |
| Keyboard accessible | Critical | 32 | Header/footer/checkout divs |
| Accessible name | Critical | 8 | CR-02, CR-05 |
| Button-name | Critical | 6 | CR-10/CR-13/CR-14 |
| Aria-valid-attr-value | Critical | 1 | CR-07 |
| **Critical subtotal** | | **79** | |
| Color-contrast | Serious | 16 | Various checkout elements |
| Html-has-lang | Serious | 3 | Non-critical S-02 |
| **Serious subtotal** | | **19** | |
| **Page total** | | **98** | |

### Order Confirmation (`/order-confirmation`)

| Issue Type | Severity | Count | Root Cause |
|------------|----------|-------|------------|
| Interactable role | Critical | 39 | Accumulated across full journey |
| Keyboard accessible | Critical | 39 | Accumulated across full journey |
| Accessible name | Critical | 11 | CR-02, CR-05 |
| Button-name | Critical | 7 | CR-10/CR-13/CR-14 |
| Aria-valid-attr-value | Critical | 1 | CR-07 |
| **Critical subtotal** | | **97** | |
| Color-contrast | Serious | 17 | Various |
| Html-has-lang | Serious | 4 | Non-critical S-02 |
| **Serious subtotal** | | **21** | |
| **Page total** | | **118** | |

### Cart Modal (open state)

| Issue Type | Severity | Count | Root Cause |
|------------|----------|-------|------------|
| Interactable role | Critical | 25 | Header/footer + cart div controls |
| Keyboard accessible | Critical | 25 | Header/footer + cart div controls |
| Accessible name | Critical | 9 | CR-02, CR-05 |
| Button-name | Critical | 3 | CR-10/CR-13 |
| Aria-valid-attr-value | Critical | 1 | CR-07 |
| **Critical subtotal** | | **63** | |
| Color-contrast | Serious | 14 | Various |
| Html-has-lang | Serious | 2 | Non-critical S-02 |
| **Serious subtotal** | | **16** | |
| **Page total** | | **79** | |

---

## 8. WCAG Coverage

All critical issues detected map to WCAG 2.x Level A or Level AA success criteria:

| WCAG SC | Level | Name | Critical Issues Mapping |
|---------|-------|------|------------------------|
| 1.1.1 | A | Non-text Content | CR-09 (missing alt text) |
| 1.3.1 | A | Info and Relationships | CR-01–CR-05, CR-11–CR-12 (div-as-interactive) |
| 2.1.1 | A | Keyboard | CR-01–CR-05 (keyboard inaccessible interactive elements) |
| 4.1.2 | A | Name, Role, Value | CR-01–CR-14 (all missing roles, names, valid ARIA values) |
| 1.4.3 | AA | Contrast (Minimum) | Non-critical: color-contrast issues |
| 3.1.1 | A | Language of Page | Non-critical: html-has-lang |
| 3.1.2 | AA | Language of Parts | Non-critical: valid-lang |

All detected critical issues violate WCAG 2.0 A, 2.1 A, and 2.2 A simultaneously (the Evinced SDK reports applicable criteria across all WCAG versions). The issues concentrate around four WCAG principles:

- **Perceivable:** Missing text alternatives (CR-09)
- **Operable:** Keyboard access barriers (CR-01–CR-05)
- **Robust:** Invalid/missing ARIA semantics (CR-06–CR-08, CR-10–CR-14)

---

*Report generated by Evinced JS Playwright SDK v2.43.0 via automated audit on 2026-03-26.*  
*Raw JSON data: `/workspace/tests/e2e/test-results/*.json`*
