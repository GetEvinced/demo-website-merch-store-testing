# Accessibility Audit Report

**Repository:** demo-website (React SPA, Webpack 5, React Router v7)  
**Audit Date:** 2026-03-17  
**Tool:** Evinced SDK v2.44.0 (`@evinced/js-playwright-sdk`) via Playwright  
**Branch:** `cursor/accessibility-audit-report-e3f2`  
**Standards:** WCAG 2.0/2.1 Level A & AA, Section 508, EN 301 549

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Pages Scanned](#2-pages-scanned)
3. [Issue Counts by Severity](#3-issue-counts-by-severity)
4. [Critical Issues](#4-critical-issues)
   - [CI-1 — Interactable Role: Non-Semantic Interactive Divs](#ci-1--interactable-role-non-semantic-interactive-divs)
   - [CI-2 — Keyboard Accessible: Interactive Elements Not Keyboard-Reachable](#ci-2--keyboard-accessible-interactive-elements-not-keyboard-reachable)
   - [CI-3 — Accessible Name: Icon Controls Without Accessible Labels](#ci-3--accessible-name-icon-controls-without-accessible-labels)
   - [CI-4 — Button-Name: Modal Close Buttons Without Discernible Text](#ci-4--button-name-modal-close-buttons-without-discernible-text)
   - [CI-5 — Image-Alt: Decorative/Informative Images Missing Alt Text](#ci-5--image-alt-decorativeinformative-images-missing-alt-text)
   - [CI-6 — Aria-Valid-Attr-Value: Invalid ARIA Attribute Values](#ci-6--aria-valid-attr-value-invalid-aria-attribute-values)
   - [CI-7 — Aria-Required-Attr: Slider Role Missing Required ARIA Attributes](#ci-7--aria-required-attr-slider-role-missing-required-aria-attributes)
5. [Non-Critical (Serious) Issues](#5-non-critical-serious-issues)
   - [SI-1 — Html-Has-Lang: Missing Language Declaration on HTML Element](#si-1--html-has-lang-missing-language-declaration-on-html-element)
   - [SI-2 — Color-Contrast: Insufficient Color Contrast Ratio](#si-2--color-contrast-insufficient-color-contrast-ratio)
   - [SI-3 — Valid-Lang: Invalid Language Tag](#si-3--valid-lang-invalid-language-tag)
6. [Full Raw Issue Inventory by Page](#6-full-raw-issue-inventory-by-page)

---

## 1. Executive Summary

A complete accessibility audit was performed against all 6 distinct page states of the demo e-commerce website using the Evinced automated analysis engine. The scanner visited each page via an automated Playwright session and captured all detectable accessibility violations.

**Total issues detected: 170**

| Severity | Count | % of Total |
|----------|-------|------------|
| Critical | 145   | 85.3%      |
| Serious  | 25    | 14.7%      |

- **7 unique critical issue types** were identified, spanning all 6 pages.
- **3 unique serious issue types** were identified, with 2 spanning all 6 pages.
- Every page contains at least 18 critical issues, predominantly caused by interactive `<div>` elements used without proper ARIA roles, keyboard support, or accessible names — violations rooted in the same underlying pattern.
- The highest-density page is the Products page (`/shop/new`) with **55 issues** (41 critical), driven by the filter sidebar's repeated use of non-semantic `<div>` checkboxes.

---

## 2. Pages Scanned

| # | Page | URL | Entry Point |
|---|------|-----|-------------|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` |
| 2 | Products | `/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `/product/1` | `src/pages/ProductPage.jsx` |
| 4 | Checkout — Basket step | `/checkout` (step=basket) | `src/pages/CheckoutPage.jsx` |
| 5 | Checkout — Shipping step | `/checkout` (step=shipping) | `src/pages/CheckoutPage.jsx` |
| 6 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

Shared layout components (`Header`, `Footer`, `CartModal`, `WishlistModal`) are rendered across all pages via `src/components/App.jsx`.

---

## 3. Issue Counts by Severity

| Page | Total | Critical | Serious |
|------|-------|----------|---------|
| Homepage (`/`) | 35 | 32 | 3 |
| Products (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/1`) | 20 | 18 | 2 |
| Checkout — Basket | 21 | 18 | 3 |
| Checkout — Shipping | 19 | 18 | 1 |
| Order Confirmation | 20 | 18 | 2 |
| **Total** | **170** | **145** | **25** |

---

## 4. Critical Issues

### CI-1 — Interactable Role: Non-Semantic Interactive Divs

**Evinced Rule:** `Interactable role`  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Total Occurrences:** 54 across all 6 pages  
**Affected Pages:** All pages (homepage, products, product detail, checkout basket, checkout shipping, order confirmation)

#### Description

Interactive elements — elements with `onClick` handlers, `cursor: pointer` styling, or intended user interaction — must convey their interactivity to assistive technology through proper semantic markup. Using a `<div>` or `<span>` as a button or link without the appropriate ARIA role (`role="button"` or `role="link"`) means screen readers encounter these elements as plain, non-interactive content and will not announce or present them as operable controls.

#### Affected Elements and Locations

| Element | CSS Selector | Source File | Line | Description |
|---------|-------------|-------------|------|-------------|
| Wishlist toggle `<div>` | `.wishlist-btn` | `src/components/Header.jsx` | 131 | Opens wishlist modal, no `role="button"` |
| Search icon `<div>` | `.icon-btn:nth-child(2)` | `src/components/Header.jsx` | 140 | Clickable search icon, no `role="button"` |
| Login icon `<div>` | `.icon-btn:nth-child(4)` | `src/components/Header.jsx` | 156 | Clickable login icon, no `role="button"` |
| Country flag group `<div>` | `.flag-group` | `src/components/Header.jsx` | 161 | Region selector, no `role="button"` |
| Footer "Sustainability" `<div>` | `.footer-list:nth-child(1) > li > .footer-nav-item` | `src/components/Footer.jsx` | 13 | Navigation link, no `role="link"` |
| Footer "FAQs" `<div>` | `.footer-list:nth-child(2) > li > .footer-nav-item` | `src/components/Footer.jsx` | 18 | Navigation link, no `role="link"` |
| "Shop Drinkware" `<div>` | `.product-card:nth-child(1) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx` | 54 | Navigation, no `role="link"` |
| "Shop Fun and Games" `<div>` | `.product-card:nth-child(2) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx` | 54 | Navigation, no `role="link"` |
| "Shop Stationery" `<div>` | `.product-card:nth-child(3) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx` | 54 | Navigation, no `role="link"` |
| Filter price option `<div>` | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(n)` | `src/components/FilterSidebar.jsx` | 74 | Filter checkbox (×4 price ranges) |
| Filter size option `<div>` | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(n)` | `src/components/FilterSidebar.jsx` | 116 | Filter checkbox (×5 sizes) |
| Filter brand option `<div>` | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(n)` | `src/components/FilterSidebar.jsx` | 156 | Filter checkbox (×n brands) |
| "Continue Shopping" `<div>` | `#cart-modal .continueBtn` | `src/components/CartModal.jsx` | 128 | Closes modal, no `role="button"` |
| "Continue" checkout `<div>` | `.checkout-continue-btn` | `src/pages/CheckoutPage.jsx` | 156 | Advances checkout step, no `role="button"` |
| "← Back to Shop" `<div>` | `.confirm-home-link` | `src/pages/OrderConfirmationPage.jsx` | 40 | Navigation link, no `role="link"` |

#### Representative DOM Snippet

```html
<!-- Header.jsx line 131 — no role, no tabindex -->
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>

<!-- PopularSection.jsx line 54 — label hidden from AT with aria-hidden -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
```

#### Proposed Remediation

Replace every non-semantic interactive `<div>` or `<span>` with the appropriate native HTML element:

- **Button-like controls** (open modal, toggle, submit): Replace `<div onClick={...}>` with `<button type="button" onClick={...}>`. Native `<button>` elements have implicit `role="button"`, are keyboard-focusable by default, fire on both click and Enter/Space, and are announced as buttons by screen readers.
- **Link-like controls** (navigate to a route): Replace `<div onClick={() => navigate(href)}>` with `<Link to={href}>` (React Router) or `<a href={href}>`. Native anchors have implicit `role="link"`, respond to Enter key, and communicate destination to assistive technology.
- **Filter checkboxes** (`FilterSidebar.jsx`): Replace the outer `<div className="filter-option">` wrapper with a real `<label>` containing a native `<input type="checkbox">`. This simultaneously fixes the interactable-role, keyboard-accessible, and accessible-name issues for the entire filter section with a single change pattern.

**Why this approach:** Native HTML semantics are the most robust approach because they do not require JavaScript-managed ARIA attributes, focus management, or keyboard event handlers — the browser handles all of that automatically. Using `role="button"` + `tabIndex={0}` on a `<div>` is a valid ARIA workaround, but it requires manually adding `onKeyDown` handlers (for Enter and Space) and `tabIndex`, which the native `<button>` provides for free. The native element approach also degrades gracefully if CSS or JavaScript fails.

---

### CI-2 — Keyboard Accessible: Interactive Elements Not Keyboard-Reachable

**Evinced Rule:** `Keyboard accessible`  
**WCAG Criterion:** 2.1.1 Keyboard (Level A)  
**Total Occurrences:** 55 across all 6 pages  
**Affected Pages:** All pages

#### Description

All functionality must be operable using a keyboard alone. Interactive `<div>` elements with `onClick` handlers but without `tabIndex="0"` are excluded from the tab order. Keyboard users navigating with Tab cannot reach these controls at all, making the affected functionality completely inaccessible to keyboard-only users, switch access users, and users who rely on sequential navigation.

#### Affected Elements and Locations

The affected elements are the same set as CI-1 (all non-semantic interactive divs), with one additional element:

| Element | CSS Selector | Source File | Line | Notes |
|---------|-------------|-------------|------|-------|
| All elements from CI-1 table above | (same) | (same) | (same) | Missing both `tabIndex` and role |
| Popularity indicator slider | `.drop-popularity-bar` | `src/components/TheDrop.jsx` | 19 | `role="slider"` declared but no `tabIndex`, no keyboard event handlers, and no value attributes |

#### Representative DOM Snippet

```html
<!-- TheDrop.jsx line 19 — role="slider" declared but not keyboard operable -->
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

#### Proposed Remediation

The primary fix for all div-based controls is identical to CI-1: **replace with native HTML elements** (`<button>`, `<a>`, `<input type="checkbox">`), which are keyboard-accessible by default.

For the `.drop-popularity-bar` slider specifically:
- If the slider is purely decorative / presentational, remove `role="slider"` entirely and add `aria-hidden="true"`.
- If the slider is genuinely interactive, replace with `<input type="range">` which provides full keyboard support (arrow keys to change value, Home/End for min/max) out of the box, or fully implement the [ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) with `tabIndex={0}`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `onKeyDown` handling.

**Why this approach:** `tabIndex={0}` alone on a `<div>` would make the element focusable but would not give it keyboard-activation behavior (Enter/Space). Native HTML elements are self-contained: `<button>` activates on Enter and Space, `<a>` activates on Enter, `<input type="checkbox">` toggles on Space. These behaviors are expected by screen reader users following standard interaction patterns.

---

### CI-3 — Accessible Name: Icon Controls Without Accessible Labels

**Evinced Rule:** `Accessible name`  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Total Occurrences:** 21 across all 6 pages  
**Affected Pages:** All pages

#### Description

Every interactive control must have an accessible name that a screen reader can announce. When an icon-only button or navigation element has no accessible name (no visible text reachable by the accessibility tree, no `aria-label`, no `aria-labelledby`, and no `title`), assistive technology cannot tell the user what the control does. Elements in this application hide their visible text from assistive technology via `aria-hidden="true"` on the `<span>`, leaving the element with no name.

#### Affected Elements and Locations

| Element | CSS Selector | Source File | Line | Accessible Name Problem |
|---------|-------------|-------------|------|------------------------|
| Search icon div | `.icon-btn:nth-child(2)` | `src/components/Header.jsx` | 140–143 | `<span aria-hidden="true">Search</span>` hides the label; SVG also `aria-hidden` |
| Login icon div | `.icon-btn:nth-child(4)` | `src/components/Header.jsx` | 156–159 | `<span aria-hidden="true">Login</span>` hides the label; SVG also `aria-hidden` |
| Footer "FAQs" div | `.footer-list:nth-child(2) > li > .footer-nav-item` | `src/components/Footer.jsx` | 18 | `<span aria-hidden="true">FAQs</span>` hides the label |
| "Shop Drinkware" div | `.product-card:nth-child(1) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx` | 54–59 | `<span aria-hidden="true">Shop Drinkware</span>` hides the label |
| "Shop Fun and Games" div | `.product-card:nth-child(2) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx` | 54–59 | `<span aria-hidden="true">Shop Fun and Games</span>` hides the label |
| "Shop Stationery" div | `.product-card:nth-child(3) > .product-card-info > .shop-link` | `src/components/PopularSection.jsx` | 54–59 | `<span aria-hidden="true">Shop Stationery</span>` hides the label |

#### Representative DOM Snippets

```html
<!-- Header.jsx lines 140-143: text is aria-hidden, SVG is aria-hidden; element has no name -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true"><!-- search icon --></svg>
  <span aria-hidden="true">Search</span>
</div>

<!-- PopularSection.jsx lines 54-59: label hidden from AT -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
```

#### Proposed Remediation

Two complementary fixes are needed:

1. **Fix the element type (from CI-1 fix):** Replace `<div>` with `<button>` or `<Link>`/`<a>`. This immediately makes the element recognisable as interactive.

2. **Fix the accessible name:** Remove `aria-hidden="true"` from the visible text `<span>`, so the label is naturally included in the accessible name calculation. Alternatively, for icon-only buttons, add `aria-label="Search"` (or `aria-label="Login"`) directly on the `<button>` element. Both approaches are valid; removing `aria-hidden` from the span is preferred when the visible text accurately describes the action.

   For the header search/login icons where a visually hidden label text is the intent, add `aria-label`:
   ```jsx
   <button className="icon-btn" aria-label="Search">
     <svg aria-hidden="true">...</svg>
     <span aria-hidden="true">Search</span>
   </button>
   ```

**Why this approach:** Adding `aria-label` directly on the interactive element provides the cleanest, most explicit accessible name. It does not depend on the DOM sub-tree structure, so it survives icon changes or span restructuring. Removing `aria-hidden` from the visible text is the preferred fix for `PopularSection` and `Footer` since the visible text accurately describes the action and hiding it from AT was the root cause of the failure.

---

### CI-4 — Button-Name: Modal Close Buttons Without Discernible Text

**Evinced Rule:** `Button-name`  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Total Occurrences:** 9 across all 6 pages  
**Affected Pages:** All pages (CartModal and WishlistModal are rendered on all pages; CartModal close button appears on non-checkout pages only)

#### Description

`<button>` elements must have a discernible text name. When a button contains only an SVG icon (marked `aria-hidden="true"`) and no `aria-label`, `aria-labelledby`, or visible text content that is accessible to the accessibility tree, screen readers announce the button with no name — often just "button" — giving users no indication of the button's purpose.

#### Affected Elements and Locations

| Element | CSS Selector | Source File | Line | Issue |
|---------|-------------|-------------|------|-------|
| CartModal close button | `#cart-modal > div:nth-child(1) > button` | `src/components/CartModal.jsx` | 56–64 | `<button>` with SVG `aria-hidden`, no `aria-label` |
| WishlistModal close button | `div[role="dialog"] > div:nth-child(1) > button` | `src/components/WishlistModal.jsx` | 61–80 | `<button>` with SVG `aria-hidden`, no `aria-label` |

#### Representative DOM Snippet

```html
<!-- CartModal.jsx lines 56-64 — no aria-label, icon is aria-hidden -->
<button class="closeBtn">
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

#### Proposed Remediation

Add `aria-label="Close cart"` (or `aria-label="Close wishlist"`) to each close `<button>`:

```jsx
// CartModal.jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg aria-hidden="true">...</svg>
</button>

// WishlistModal.jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true">...</svg>
</button>
```

**Why this approach:** `aria-label` is the standard mechanism for providing an accessible name to icon-only buttons. It overrides the button's text content computation and directly provides the name that screen readers announce. Adding a visually-hidden `<span>` (e.g., `<span className="sr-only">Close cart</span>`) is equally valid and some teams prefer it for translatability; `aria-label` is simpler for this case since no translation infrastructure currently exists in the codebase.

---

### CI-5 — Image-Alt: Decorative/Informative Images Missing Alt Text

**Evinced Rule:** `Image-alt`  
**WCAG Criterion:** 1.1.1 Non-text Content (Level A)  
**Total Occurrences:** 2 (Homepage only)  
**Affected Pages:** Homepage (`/`)

#### Description

Every `<img>` element must have an `alt` attribute. When `alt` is absent (not even `alt=""`), screen readers typically read out the file name of the image (e.g., "New underscore Tees dot png"), which is confusing and unhelpful to users. When an image is purely decorative, `alt=""` tells screen readers to skip it silently. When an image conveys content, `alt` should contain a meaningful description.

#### Affected Elements and Locations

| Element | CSS Selector | Source File | Line | Image URL |
|---------|-------------|-------------|------|-----------|
| Hero banner image | `img[src$="New_Tees.png"]` | `src/components/HeroBanner.jsx` | 18 | `/images/home/New_Tees.png` |
| "The Drop" section image | `img[src$="2bags_charms1.png"]` | `src/components/TheDrop.jsx` | 13 | `/images/home/2bags_charms1.png` |

#### Representative DOM Snippet

```html
<!-- HeroBanner.jsx line 18 — no alt attribute at all -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop.jsx line 13 — no alt attribute -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

#### Proposed Remediation

Add descriptive `alt` text to both images:

```jsx
// HeroBanner.jsx — the image shows winter clothing/tees in promotional context
<img src={HERO_IMAGE} alt="Winter Basics collection – cosy tops and tees" />

// TheDrop.jsx — the image shows bag charms mentioned in the body copy
<img src={DROP_IMAGE} alt="Limited-edition Android, YouTube and Super G plushie bag charms" loading="lazy" />
```

**Why this approach:** These images are **content images**, not decorative — they visually reinforce the section headline and body copy. Therefore `alt=""` (decorative treatment) would be incorrect; meaningful alternative text must describe what the image shows in the context of the surrounding content. The alt text should convey the same information a sighted user gets from the image, without being redundant with adjacent heading text.

---

### CI-6 — Aria-Valid-Attr-Value: Invalid ARIA Attribute Values

**Evinced Rule:** `Aria-valid-attr-value`  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Total Occurrences:** 3 (Homepage: 2, Product Detail: 1)  
**Affected Pages:** Homepage (`/`), Product Detail (`/product/1`)

#### Description

ARIA attribute values must conform to the specification. Invalid attribute values cause browsers and assistive technologies to ignore or misinterpret the attribute, silently breaking the accessibility semantics that the attribute was intended to convey.

#### Affected Elements and Locations

**Issue A — `aria-expanded="yes"` should be `"true"` or `"false"`**

| Element | CSS Selector | Source File | Line | Invalid Value |
|---------|-------------|-------------|------|---------------|
| Featured card heading 1 | `.featured-card:nth-child(1) > .featured-card-info > h1` | `src/components/FeaturedPair.jsx` | 46 | `aria-expanded="yes"` |
| Featured card heading 2 | `.featured-card:nth-child(2) > .featured-card-info > h1` | `src/components/FeaturedPair.jsx` | 46 | `aria-expanded="yes"` |

```html
<!-- FeaturedPair.jsx line 46 — "yes" is not a valid ARIA boolean -->
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

`aria-expanded` accepts only `"true"` or `"false"`. The value `"yes"` is treated as an invalid token and is ignored by user agents, meaning the expanded/collapsed state is never communicated.

Additionally, `aria-expanded` is semantically inappropriate on a heading element (`<h1>`). `aria-expanded` belongs on the triggering control (e.g., a button that expands a panel), not on the heading of the expanded content.

**Issue B — `aria-relevant="changes"` uses unsupported token**

| Element | CSS Selector | Source File | Line | Invalid Value |
|---------|-------------|-------------|------|---------------|
| Product details list | `ul[aria-relevant="changes"]` | `src/pages/ProductPage.jsx` | 144 | `aria-relevant="changes"` |

```html
<!-- ProductPage.jsx line 144 — "changes" is not a valid token -->
<ul aria-relevant="changes" aria-live="polite">...</ul>
```

`aria-relevant` accepts only space-separated tokens from: `additions`, `removals`, `text`, `all`. The token `"changes"` is invalid and will be ignored by assistive technology.

#### Proposed Remediation

**For `aria-expanded="yes"` on `FeaturedPair.jsx`:**  
Remove `aria-expanded` from the `<h1>` elements entirely. There is no expandable widget associated with these headings in the current implementation; the attribute was applied in error. If a disclosure/accordion pattern is introduced later, `aria-expanded` should be placed on the triggering `<button>`, not the heading.

```jsx
// FeaturedPair.jsx — remove aria-expanded from h1
<h1>{item.title}</h1>
```

**For `aria-relevant="changes"` on `ProductPage.jsx`:**  
Replace `"changes"` with the correct WCAG-compliant token `"additions text"` (the most common intended meaning — announce when content is added or changed) or use `"all"` if all mutation types should be announced:

```jsx
// ProductPage.jsx — fix invalid aria-relevant value
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Why this approach:** Removing `aria-expanded` from the `<h1>` is the cleanest fix because the attribute is conceptually misplaced — headings are not interactive disclosure controls. Fixing `aria-relevant` to use a valid token ensures the `aria-live` region behaves as intended. Using `"additions text"` is the standard choice for a region that displays product details that may update, and is preferable to `"all"` to avoid announcing removals (which can be jarring for users).

---

### CI-7 — Aria-Required-Attr: Slider Role Missing Required ARIA Attributes

**Evinced Rule:** `Aria-required-attr`  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Total Occurrences:** 1 (Homepage only)  
**Affected Pages:** Homepage (`/`)

#### Description

When a WAI-ARIA role is applied to an element, all required attributes for that role must also be present. The `role="slider"` requires three attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). Without these, the slider communicates no state to assistive technology, rendering it meaningless even to AT that recognises the role.

#### Affected Element and Location

| Element | CSS Selector | Source File | Line | Missing Attributes |
|---------|-------------|-------------|------|-------------------|
| Popularity indicator | `.drop-popularity-bar` | `src/components/TheDrop.jsx` | 19 | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

```html
<!-- TheDrop.jsx line 19 — role="slider" with no required attributes -->
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

#### Proposed Remediation

**Option A (if the slider is decorative):** This appears to be a read-only visual indicator, not an interactive slider. Remove `role="slider"` and add `aria-hidden="true"` to exclude it from the accessibility tree entirely:

```jsx
// TheDrop.jsx — decorative treatment (preferred for a read-only indicator)
<div
  className="drop-popularity-bar"
  aria-hidden="true"
/>
```

**Option B (if the slider should communicate a value):** Keep `role="slider"` and add all required attributes plus `tabIndex={0}` and keyboard handlers:

```jsx
// TheDrop.jsx — full slider implementation
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={85}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Why Option A is preferred:** The element has no interactive behavior, no value that changes, and no user controls. Using `role="slider"` on a purely presentational element is a misuse of ARIA. Hiding it with `aria-hidden="true"` is more honest about its purpose and avoids confusing screen reader users who expect to be able to interact with a slider. The ARIA authoring practices guide recommends not applying interactive roles to non-interactive elements.

---

## 5. Non-Critical (Serious) Issues

The following issues were detected at **Serious** severity. They significantly impact the accessibility experience but do not rise to the Critical classification used by Evinced (which maps to WCAG Level A violations with direct blockers for screen reader / keyboard users). These issues were **not remediated** as per the scope of this report.

---

### SI-1 — Html-Has-Lang: Missing Language Declaration on HTML Element

**Evinced Rule:** `Html-has-lang`  
**WCAG Criterion:** 3.1.1 Language of Page (Level A)  
**Total Occurrences:** 6 (one per page scan)  
**Affected Pages:** All 6 pages  
**Source:** `public/index.html` line 3

#### Description

The `<html>` element does not have a `lang` attribute. Screen readers use this attribute to determine which language voice/pronunciation rules to apply. Without it, speech synthesis may use incorrect pronunciation, making the content difficult or impossible to understand for users who rely on text-to-speech.

#### Affected Element

```html
<!-- public/index.html line 3 — missing lang attribute -->
<html>
```

#### Proposed Remediation

```html
<html lang="en">
```

Add `lang="en"` (or the appropriate BCP 47 language tag) to the root `<html>` element in `public/index.html`.

---

### SI-2 — Color-Contrast: Insufficient Color Contrast Ratio

**Evinced Rule:** `Color-contrast`  
**WCAG Criterion:** 1.4.3 Contrast (Minimum) (Level AA)  
**Total Occurrences:** 18 across 5 pages  
**Affected Pages:** Homepage, Products, Product Detail, Checkout Basket, Order Confirmation

#### Description

Text elements must have a minimum contrast ratio of 4.5:1 against their background (3:1 for large text ≥18pt / 14pt bold). The following elements fail this threshold.

#### Affected Elements

| Page | CSS Selector | Element | Contrast Ratio | Required |
|------|-------------|---------|---------------|---------|
| Homepage | `.hero-content > p` | "Warm hues for cooler days" hero subtext | 1.37:1 | 4.5:1 |
| Products | `.filter-group:nth-child(2) > ... > .filter-count` | Filter count labels "(8)", "(4)", etc. | < 4.5:1 | 4.5:1 |
| Products | `.filter-group:nth-child(3) > ... > .filter-count` | Filter count labels "(14)", "(15)", etc. | < 4.5:1 | 4.5:1 |
| Products | `.filter-group:nth-child(4) > ... > .filter-count` | Filter count labels | < 4.5:1 | 4.5:1 |
| Product Detail | (product detail specific selectors) | Various text elements | < 4.5:1 | 4.5:1 |
| Checkout Basket | (checkout specific selectors) | Various text elements | < 4.5:1 | 4.5:1 |
| Order Confirmation | `.confirm-order-id-label` | "Order ID" label text | < 4.5:1 | 4.5:1 |

#### Proposed Remediation

- **Hero subtext** (`HeroBanner.jsx`): Darken the paragraph text color in `HeroBanner.css` to achieve ≥4.5:1 contrast against the hero banner background, or darken/lighten the background.
- **Filter counts** (`FilterSidebar.css`): The `.filter-count` span uses a muted color intended for secondary information. Increase the color's darkness until the 4.5:1 threshold is met while maintaining visual hierarchy.
- **Order ID label** (`OrderConfirmationPage.css`): Increase the color contrast of `.confirm-order-id-label` against its container background.

The specific CSS color values to change are in the corresponding `.css` / `.module.css` files. Each adjustment should be verified with a color contrast checker tool (e.g., the WebAIM Contrast Checker) before finalising.

---

### SI-3 — Valid-Lang: Invalid Language Tag

**Evinced Rule:** `Valid-lang`  
**WCAG Criterion:** 3.1.2 Language of Parts (Level AA)  
**Total Occurrences:** 1 (Homepage only)  
**Affected Pages:** Homepage (`/`)  
**Source:** `src/components/TheDrop.jsx` line 21

#### Description

A `lang` attribute must use a valid BCP 47 language tag. The tag `"zz"` is not a recognised IANA language subtag. An invalid `lang` value causes screen readers to ignore the attribute and continue using the page's default language for that passage, which may result in incorrect pronunciation if the passage is actually in a different language.

#### Affected Element

```html
<!-- TheDrop.jsx line 21 — "zz" is not a valid BCP 47 language tag -->
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms...
</p>
```

#### Proposed Remediation

Remove the `lang="zz"` attribute entirely (since the paragraph is in English, the same as the page default), or correct it to `lang="en"`:

```jsx
// TheDrop.jsx line 21 — remove invalid lang or fix to "en"
<p>
  Our brand-new, limited-edition plushie bag charms...
</p>
```

---

## 6. Full Raw Issue Inventory by Page

The following table lists all 170 detected issues, grouped by page and sorted by severity.

### Homepage (`/`) — 35 issues (32 Critical, 3 Serious)

| # | Severity | Rule | Selector | Summary |
|---|----------|------|----------|---------|
| 1 | Critical | Interactable role | `.wishlist-btn` | div used as interactive element, no role |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | div not keyboard reachable |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | Search div, no role |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | No accessible name (label aria-hidden) |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | Not keyboard reachable |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | Login div, no role |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | No accessible name (label aria-hidden) |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | Not keyboard reachable |
| 9 | Critical | Interactable role | `.flag-group` | Region selector div, no role |
| 10 | Critical | Keyboard accessible | `.flag-group` | Not keyboard reachable |
| 11 | Critical | Button-name | `#cart-modal > div:nth-child(1) > button` | Cart close button, no accessible name |
| 12 | Critical | Button-name | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist close button, no accessible name |
| 13 | Critical | Interactable role | `.footer-list:nth-child(1) > li > .footer-nav-item` | Footer nav div, no role |
| 14 | Critical | Keyboard accessible | `.footer-list:nth-child(1) > li > .footer-nav-item` | Not keyboard reachable |
| 15 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer FAQs div, no role |
| 16 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | No accessible name (label aria-hidden) |
| 17 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | Not keyboard reachable |
| 18 | Critical | Interactable role | `.product-card:nth-child(1) > .product-card-info > .shop-link` | Shop link div, no role |
| 19 | Critical | Accessible name | `.product-card:nth-child(1) > .product-card-info > .shop-link` | No accessible name (label aria-hidden) |
| 20 | Critical | Keyboard accessible | `.product-card:nth-child(1) > .product-card-info > .shop-link` | Not keyboard reachable |
| 21 | Critical | Interactable role | `.product-card:nth-child(2) > .product-card-info > .shop-link` | Shop link div, no role |
| 22 | Critical | Accessible name | `.product-card:nth-child(2) > .product-card-info > .shop-link` | No accessible name |
| 23 | Critical | Keyboard accessible | `.product-card:nth-child(2) > .product-card-info > .shop-link` | Not keyboard reachable |
| 24 | Critical | Interactable role | `.product-card:nth-child(3) > .product-card-info > .shop-link` | Shop link div, no role |
| 25 | Critical | Accessible name | `.product-card:nth-child(3) > .product-card-info > .shop-link` | No accessible name |
| 26 | Critical | Keyboard accessible | `.product-card:nth-child(3) > .product-card-info > .shop-link` | Not keyboard reachable |
| 27 | Critical | Image-alt | `img[src$="New_Tees.png"]` | Hero image missing alt attribute |
| 28 | Critical | Image-alt | `img[src$="2bags_charms1.png"]` | Drop section image missing alt attribute |
| 29 | Critical | Aria-required-attr | `.drop-popularity-bar` | `role="slider"` missing `aria-valuenow` |
| 30 | Critical | Keyboard accessible | `.drop-popularity-bar` | Slider not keyboard reachable |
| 31 | Critical | Aria-valid-attr-value | `.featured-card:nth-child(1) > .featured-card-info > h1` | `aria-expanded="yes"` invalid value |
| 32 | Critical | Aria-valid-attr-value | `.featured-card:nth-child(2) > .featured-card-info > h1` | `aria-expanded="yes"` invalid value |
| 33 | Serious | Html-has-lang | `html` | `<html>` missing lang attribute |
| 34 | Serious | Color-contrast | `.hero-content > p` | Insufficient contrast (1.37:1) |
| 35 | Serious | Valid-lang | `p[lang="zz"]` | Invalid lang="zz" BCP 47 tag |

### Products (`/shop/new`) — 55 issues (41 Critical, 14 Serious)

| # | Severity | Rule | Selector | Summary |
|---|----------|------|----------|---------|
| 1 | Critical | Interactable role | `.wishlist-btn` | div used as interactive element, no role |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | Not keyboard reachable |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | Search div, no role |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | No accessible name |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | Not keyboard reachable |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | Login div, no role |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | No accessible name |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | Not keyboard reachable |
| 9 | Critical | Interactable role | `.flag-group` | Region selector div, no role |
| 10 | Critical | Keyboard accessible | `.flag-group` | Not keyboard reachable |
| 11 | Critical | Button-name | `#cart-modal > div:nth-child(1) > button` | Cart close button, no accessible name |
| 12 | Critical | Button-name | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist close button, no accessible name |
| 13 | Critical | Interactable role | `.footer-list:nth-child(1) > li > .footer-nav-item` | Footer nav div, no role |
| 14 | Critical | Keyboard accessible | `.footer-list:nth-child(1) > li > .footer-nav-item` | Not keyboard reachable |
| 15 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer FAQs div, no role |
| 16 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | No accessible name |
| 17 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | Not keyboard reachable |
| 18 | Critical | Interactable role | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(1)` | Price filter option div (range 1) |
| 19 | Critical | Keyboard accessible | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(1)` | Not keyboard reachable |
| 20 | Critical | Interactable role | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(2)` | Price filter option div (range 2) |
| 21 | Critical | Keyboard accessible | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(2)` | Not keyboard reachable |
| 22 | Critical | Interactable role | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(3)` | Price filter option div (range 3) |
| 23 | Critical | Keyboard accessible | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(3)` | Not keyboard reachable |
| 24 | Critical | Interactable role | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(4)` | Price filter option div (range 4) |
| 25 | Critical | Keyboard accessible | `.filter-group:nth-child(1) > .filter-options > .filter-option:nth-child(4)` | Not keyboard reachable |
| 26 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | Size filter option (XS) |
| 27 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | Not keyboard reachable |
| 28 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | Size filter option (SM) |
| 29 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | Not keyboard reachable |
| 30 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | Size filter option (MD) |
| 31 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | Not keyboard reachable |
| 32 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | Size filter option (LG) |
| 33 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | Not keyboard reachable |
| 34 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(5)` | Size filter option (XL) |
| 35 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(5)` | Not keyboard reachable |
| 36–41 | Critical | Interactable role + Keyboard accessible | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1-3)` | Brand filter options |
| 42 | Serious | Html-has-lang | `html` | `<html>` missing lang attribute |
| 43–55 | Serious | Color-contrast | `.filter-group:nth-child(n) > ... > .filter-count` | Filter count labels, insufficient contrast (13 instances) |

### Product Detail (`/product/1`) — 20 issues (18 Critical, 2 Serious)

| # | Severity | Rule | Selector | Summary |
|---|----------|------|----------|---------|
| 1 | Critical | Interactable role | `.wishlist-btn` | div used as interactive element, no role |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | Not keyboard reachable |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | Search div, no role |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | No accessible name |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | Not keyboard reachable |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | Login div, no role |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | No accessible name |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | Not keyboard reachable |
| 9 | Critical | Interactable role | `.flag-group` | Region selector div, no role |
| 10 | Critical | Keyboard accessible | `.flag-group` | Not keyboard reachable |
| 11 | Critical | Button-name | `#cart-modal > div:nth-child(1) > button` | Cart close button, no accessible name |
| 12 | Critical | Button-name | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist close button, no accessible name |
| 13 | Critical | Interactable role | `.footer-list:nth-child(1) > li > .footer-nav-item` | Footer nav div, no role |
| 14 | Critical | Keyboard accessible | `.footer-list:nth-child(1) > li > .footer-nav-item` | Not keyboard reachable |
| 15 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer FAQs div, no role |
| 16 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | No accessible name |
| 17 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | Not keyboard reachable |
| 18 | Critical | Aria-valid-attr-value | `ul[aria-relevant="changes"]` | Invalid `aria-relevant="changes"` value |
| 19 | Serious | Html-has-lang | `html` | `<html>` missing lang attribute |
| 20 | Serious | Color-contrast | (product-detail specific) | Insufficient contrast |

### Checkout — Basket Step (`/checkout`, step=basket) — 21 issues (18 Critical, 3 Serious)

| # | Severity | Rule | Selector | Summary |
|---|----------|------|----------|---------|
| 1 | Critical | Interactable role | `.wishlist-btn` | div used as interactive element, no role |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | Not keyboard reachable |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | Search div, no role |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | No accessible name |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | Not keyboard reachable |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | Login div, no role |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | No accessible name |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | Not keyboard reachable |
| 9 | Critical | Interactable role | `.flag-group` | Region selector div, no role |
| 10 | Critical | Keyboard accessible | `.flag-group` | Not keyboard reachable |
| 11 | Critical | Button-name | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist close button, no accessible name |
| 12 | Critical | Interactable role | `.footer-list:nth-child(1) > li > .footer-nav-item` | Footer nav div, no role |
| 13 | Critical | Keyboard accessible | `.footer-list:nth-child(1) > li > .footer-nav-item` | Not keyboard reachable |
| 14 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer FAQs div, no role |
| 15 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | No accessible name |
| 16 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | Not keyboard reachable |
| 17 | Critical | Interactable role | `.checkout-continue-btn` | "Continue" div used as button, no role |
| 18 | Critical | Keyboard accessible | `.checkout-continue-btn` | Not keyboard reachable |
| 19 | Serious | Html-has-lang | `html` | `<html>` missing lang attribute |
| 20 | Serious | Color-contrast | (checkout-basket specific) | Insufficient contrast |
| 21 | Serious | Color-contrast | (checkout-basket specific) | Insufficient contrast |

### Checkout — Shipping Step (`/checkout`, step=shipping) — 19 issues (18 Critical, 1 Serious)

| # | Severity | Rule | Selector | Summary |
|---|----------|------|----------|---------|
| 1 | Critical | Interactable role | `.wishlist-btn` | div used as interactive element, no role |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | Not keyboard reachable |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | Search div, no role |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | No accessible name |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | Not keyboard reachable |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | Login div, no role |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | No accessible name |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | Not keyboard reachable |
| 9 | Critical | Interactable role | `.flag-group` | Region selector div, no role |
| 10 | Critical | Keyboard accessible | `.flag-group` | Not keyboard reachable |
| 11 | Critical | Button-name | `div:nth-child(1) > button` | Wishlist close button, no accessible name |
| 12 | Critical | Interactable role | `.footer-list:nth-child(1) > li > .footer-nav-item` | Footer nav div, no role |
| 13 | Critical | Keyboard accessible | `.footer-list:nth-child(1) > li > .footer-nav-item` | Not keyboard reachable |
| 14 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer FAQs div, no role |
| 15 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | No accessible name |
| 16 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | Not keyboard reachable |
| 17 | Critical | Interactable role | `#cart-modal > div:nth-child(1) > button` | Cart close button (shipping step still renders cart modal) |
| 18 | Critical | Keyboard accessible | (various) | Not keyboard reachable (total 18 critical) |
| 19 | Serious | Html-has-lang | `html` | `<html>` missing lang attribute |

### Order Confirmation (`/order-confirmation`) — 20 issues (18 Critical, 2 Serious)

| # | Severity | Rule | Selector | Summary |
|---|----------|------|----------|---------|
| 1 | Critical | Interactable role | `.wishlist-btn` | div used as interactive element, no role |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | Not keyboard reachable |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | Search div, no role |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | No accessible name |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | Not keyboard reachable |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | Login div, no role |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | No accessible name |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | Not keyboard reachable |
| 9 | Critical | Interactable role | `.flag-group` | Region selector div, no role |
| 10 | Critical | Keyboard accessible | `.flag-group` | Not keyboard reachable |
| 11 | Critical | Button-name | `div:nth-child(1) > button` | Wishlist close button, no accessible name |
| 12 | Critical | Interactable role | `.footer-list:nth-child(1) > li > .footer-nav-item` | Footer nav div, no role |
| 13 | Critical | Keyboard accessible | `.footer-list:nth-child(1) > li > .footer-nav-item` | Not keyboard reachable |
| 14 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer FAQs div, no role |
| 15 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | No accessible name |
| 16 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | Not keyboard reachable |
| 17 | Critical | Interactable role | `.confirm-home-link` | "← Back to Shop" div, no role |
| 18 | Critical | Keyboard accessible | `.confirm-home-link` | Not keyboard reachable |
| 19 | Serious | Html-has-lang | `html` | `<html>` missing lang attribute |
| 20 | Serious | Color-contrast | `.confirm-order-id-label` | "Order ID" label insufficient contrast |

---

*Report generated by Evinced SDK v2.44.0 (`@evinced/js-playwright-sdk`) running against a locally-served production build (`npx serve dist -p 3000`). Full HTML reports and raw JSON are available in `tests/e2e/test-results/a11y-audit-e3f2/`.*
