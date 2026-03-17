# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-17  
**Tool:** Evinced JS Playwright SDK v2.44.0  
**Auditor:** Automated Cloud Agent  
**Branch:** `cursor/repository-accessibility-audit-cca6`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Audit Scope & Methodology](#2-audit-scope--methodology)
3. [Issue Summary by Page](#3-issue-summary-by-page)
4. [Critical Issues — Detailed Analysis](#4-critical-issues--detailed-analysis)
   - [CI-1: Header Icon Buttons Are Non-Focusable `<div>` Elements](#ci-1-header-icon-buttons-are-non-focusable-div-elements)
   - [CI-2: Footer Navigation Items Are Non-Focusable `<div>` Elements](#ci-2-footer-navigation-items-are-non-focusable-div-elements)
   - [CI-3: "Popular" Section Shop Links Are Non-Focusable `<div>` Elements with Hidden Text](#ci-3-popular-section-shop-links-are-non-focusable-div-elements-with-hidden-text)
   - [CI-4: Filter Options Are Non-Interactive `<div>` Elements](#ci-4-filter-options-are-non-interactive-div-elements)
   - [CI-5: Cart Modal Close Button Has No Accessible Name](#ci-5-cart-modal-close-button-has-no-accessible-name)
   - [CI-6: Wishlist Modal Close Button Has No Accessible Name](#ci-6-wishlist-modal-close-button-has-no-accessible-name)
   - [CI-7: Cart Modal "Continue Shopping" Is a Non-Interactive `<div>` with Hidden Text](#ci-7-cart-modal-continue-shopping-is-a-non-interactive-div-with-hidden-text)
   - [CI-8: Cart Item Delete Button Has No Accessible Name](#ci-8-cart-item-delete-button-has-no-accessible-name)
   - [CI-9: Checkout "Back to Cart" Is a Non-Focusable `<div>`](#ci-9-checkout-back-to-cart-is-a-non-focusable-div)
   - [CI-10: Order Confirmation "Back to Shop" Is a Non-Focusable `<div>`](#ci-10-order-confirmation-back-to-shop-is-a-non-focusable-div)
   - [CI-11: Images Missing Alt Text](#ci-11-images-missing-alt-text)
   - [CI-12: Invalid ARIA Attribute Values](#ci-12-invalid-aria-attribute-values)
   - [CI-13: Popularity Slider Missing Required ARIA Attributes](#ci-13-popularity-slider-missing-required-aria-attributes)
   - [CI-14: Sort Dropdown Button Has Incorrect Role and Missing ARIA Pattern](#ci-14-sort-dropdown-button-has-incorrect-role-and-missing-aria-pattern)
5. [Non-Critical Issues (Not Remediated)](#5-non-critical-issues-not-remediated)
6. [Appendix: Issue Counts by Evinced Rule Type](#6-appendix-issue-counts-by-evinced-rule-type)

---

## 1. Executive Summary

A full accessibility audit of the Demo Website was performed using the Evinced Playwright SDK across all six application pages/states. The scanner identified **177 issues in total**, of which **151 are classified as Critical**.

| Severity | Count |
|----------|-------|
| Critical | 151 |
| Serious | 24 |
| Needs Review | 1 |
| Best Practice | 1 |
| **Total** | **177** |

The 151 critical issues consolidate into **14 distinct defect patterns** (CI-1 through CI-14), most of which stem from a recurring anti-pattern: interactive UI controls implemented as `<div>` or `<span>` elements instead of native HTML interactive elements (`<button>`, `<a>`, `<input>`). This single root-cause accounts for the vast majority of the critical findings.

The most severe impact areas are:
- **Every page**: Header icon buttons (Wishlist, Search, Login, Flag) and footer navigation items are completely inaccessible to keyboard and screen-reader users.
- **Products page**: All 14 filter checkboxes are keyboard inaccessible.
- **Cart modal**: Close button and "Continue Shopping" have no accessible name.
- **Homepage**: Two images lack alt text and the featured-card headings carry invalid ARIA values.

> **No remediations have been applied to the source code.** This report documents every critical issue found, the recommended fix, and the rationale for each recommendation. The non-critical issues are catalogued in Section 5.

---

## 2. Audit Scope & Methodology

### Application Under Test

| Property | Value |
|----------|-------|
| Framework | React 18, React Router v7, Webpack 5 |
| Dev server | `npx serve dist -p 3000 --single` |
| Base URL | `http://localhost:3000` |

### Pages Audited

| # | Page / State | URL | Test Method |
|---|--------------|-----|-------------|
| 1 | Homepage | `/` | `evAnalyze()` after page load |
| 2 | Products listing | `/shop/new` | `evAnalyze()` + `analyzeCombobox(.sort-btn)` + `analyzeSiteNavigation(nav)` merged via `evMergeIssues()` |
| 3 | Product detail | `/product/1` (first product) | Navigate from products page; `evAnalyze()` after load |
| 4 | Checkout – basket step | Cart modal open on product detail | Add item to cart, wait for cart drawer; `evAnalyze()` |
| 5 | Checkout – shipping step | `/checkout` (step 2 — Shipping & Payment form) | Add to cart → Proceed to Checkout → Continue; `evAnalyze()` |
| 6 | Order confirmation | `/order-confirmation` | Full checkout flow → Ship It!; `evAnalyze()` |

### Tooling

- **Evinced JS Playwright SDK v2.44.0** — primary analysis engine (offline JWT mode)
- **Playwright v1.58.2** — browser automation (Chromium headless)
- Axe-based rules were **not** used; all findings are Evinced-native rules or Evinced-wrapped Axe rules (prefixed `AXE-`)

### Severity Definitions (Evinced)

| Severity | Meaning |
|----------|---------|
| **Critical** | Blocks or severely impairs access for users with disabilities; directly violates WCAG 2.x Level A/AA success criteria |
| **Serious** | Meaningfully degrades the experience; typically a WCAG Level AA violation |
| **Needs Review** | Automated analysis cannot determine pass/fail; requires manual inspection |
| **Best Practice** | Exceeds minimum requirements; adoption is recommended |

---

## 3. Issue Summary by Page

| Page | Total | Critical | Serious | Needs Review | Best Practice |
|------|-------|----------|---------|--------------|---------------|
| Homepage (/) | 35 | 32 | 3 | 0 | 0 |
| Products (/shop/new) | 59 | 43 | 14 | 1 | 1 |
| Product Detail (/product/:id) | 20 | 18 | 2 | 0 | 0 |
| Checkout – Basket (cart modal) | 24 | 22 | 2 | 0 | 0 |
| Checkout – Shipping (step 2) | 19 | 18 | 1 | 0 | 0 |
| Order Confirmation | 20 | 18 | 2 | 0 | 0 |
| **Total** | **177** | **151** | **24** | **1** | **1** |

> Note: Many critical issues recur across pages because Header and Footer components are shared globally. For example, the four non-focusable header icon buttons appear once per page, generating 24 individual issue records (4 elements × 6 pages) from a single root cause in `Header.jsx`.

---

## 4. Critical Issues — Detailed Analysis

Each section below covers one distinct defect pattern. For each pattern the following are provided:
- **Affected elements** with CSS selector and DOM snippet
- **Pages affected**
- **Source file(s)**
- **Evinced rules triggered**
- **WCAG criteria violated**
- **Recommended fix** (no code changes have been applied)
- **Rationale** for the chosen remediation approach

---

### CI-1: Header Icon Buttons Are Non-Focusable `<div>` Elements

**Evinced rules:** `WRONG_SEMANTIC_ROLE` (Critical) · `NOT_FOCUSABLE` (Critical) · `NO_DESCRIPTIVE_TEXT` (Critical, for Search and Login)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Pages:** All six pages (Header is a shared component)  
**Source file:** `src/components/Header.jsx`

#### Affected Elements

| Selector | DOM Snippet |
|----------|-------------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor: pointer;"><svg aria-hidden="true">…</svg><span>Wishlist</span></div>` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor: pointer;"><svg aria-hidden="true">…</svg></div>` (Search — no text) |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor: pointer;"><svg aria-hidden="true">…</svg></div>` (Login — no text) |
| `.flag-group` | `<div class="flag-group" style="cursor: pointer;"><img …><img …></div>` (Language selector) |

#### Issue Description

The header contains four interactive controls (Wishlist, Search, Login, Language/Flag selector) rendered as `<div>` elements with an `onClick` handler and `cursor: pointer`. Because `<div>` is not a native interactive element, these controls:
1. Are not reachable by keyboard Tab navigation (no `tabindex`).
2. Cannot be activated with Enter or Space keys.
3. Have no implicit ARIA role; assistive technologies announce them as generic containers.
4. The Search and Login icons have no visible or accessible label at all — the SVG content is `aria-hidden="true"` and there is no accompanying text.

#### Recommended Fix

Replace each `<div>` with a `<button>` element and add a descriptive `aria-label` for icon-only buttons.

```jsx
// Wishlist (has visible text already)
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</button>

// Search (icon only)
<button className="icon-btn" onClick={openSearch} aria-label="Search">
  <svg aria-hidden="true">…</svg>
</button>

// Login (icon only)
<button className="icon-btn" onClick={openLogin} aria-label="Log in">
  <svg aria-hidden="true">…</svg>
</button>

// Language/Flag selector
<button className="flag-group" onClick={openLanguageMenu} aria-label="Select language">
  <img src="…united-states-of-america.png" alt="United States Flag" />
  <img src="…canada.png" alt="Canada Flag" />
</button>
```

#### Rationale

`<button>` is the semantically correct element for an action that does not navigate to a new URL. Native `<button>` elements receive keyboard focus by default, respond to Enter and Space activation, and are announced as "button" by screen readers without any additional ARIA. Adding `aria-label` on icon-only buttons satisfies WCAG 4.1.2 (accessible name) and is the minimum viable label source when no visible text is present. This approach requires zero CSS changes because the existing `.icon-btn` class styling applies identically to `<button>` after removing `cursor: pointer` (buttons already have pointer cursors by default after a CSS reset).

---

### CI-2: Footer Navigation Items Are Non-Focusable `<div>` Elements

**Evinced rules:** `WRONG_SEMANTIC_ROLE` (Critical) · `NOT_FOCUSABLE` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Pages:** All six pages (Footer is a shared component)  
**Source file:** `src/components/Footer.jsx`

#### Affected Elements

| Selector | DOM Snippet |
|----------|-------------|
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;"><span aria-hidden="true">FAQs</span></div>` |

#### Issue Description

Two footer navigation items ("Sustainability" and "FAQs") are rendered as `<div>` elements with click handlers. They are not keyboard reachable and are not announced as interactive by screen readers. The FAQs item additionally hides its visible label inside a `<span aria-hidden="true">`, leaving it with no accessible name at all.

#### Recommended Fix

Replace `<div>` with the appropriate semantic element:
- If the item navigates to a new page: use `<a href="…">`.
- If it performs an in-page action (expand/collapse, open panel): use `<button>`.
- Remove `aria-hidden="true"` from any inner text `<span>`.

```jsx
// Sustainability (navigation action)
<li>
  <a href="/sustainability" className="footer-nav-item">Sustainability</a>
</li>

// FAQs (navigation action)
<li>
  <a href="/faqs" className="footer-nav-item">FAQs</a>
</li>
```

#### Rationale

Footer navigation links that take users to other pages are link semantics by definition. Using `<a>` provides: keyboard focusability, Enter-key activation, announcement as "link" by screen readers (with the destination implied by context), and standard browser right-click/middle-click behaviours. Removing `aria-hidden="true"` from the text `<span>` gives the element its accessible name. No ARIA attributes are needed when native elements are used correctly.

---

### CI-3: "Popular" Section Shop Links Are Non-Focusable `<div>` Elements with Hidden Text

**Evinced rules:** `WRONG_SEMANTIC_ROLE` (Critical) · `NOT_FOCUSABLE` (Critical) · `NO_DESCRIPTIVE_TEXT` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A) · 1.3.1 Info and Relationships (Level A)  
**Pages:** Homepage (/) only  
**Source file:** `src/components/PopularSection.jsx`

#### Affected Elements

| Selector | DOM Snippet |
|----------|-------------|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Drinkware</span></div>` |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Fun and Games</span></div>` |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Stationery</span></div>` |

#### Issue Description

The "Popular" section renders three category cards, each with a "Shop [Category]" link implemented as a `<div>`. These are keyboard-inaccessible and have no accessible name because their visible text is wrapped in `<span aria-hidden="true">`, which actively hides the text from the accessibility tree.

#### Recommended Fix

Replace `<div class="shop-link">` with `<a href="…" class="shop-link">` and remove `aria-hidden="true"` from the inner `<span>`.

```jsx
<a href="/shop/new?category=drinkware" className="shop-link">
  <span>Shop Drinkware</span>
</a>
```

#### Rationale

These controls navigate users to a filtered product listing — they are links by nature. Using `<a>` provides all necessary keyboard and screen-reader semantics natively. Removing `aria-hidden` from the visible text provides the accessible name through the standard text-content calculation (WCAG's accessible name computation algorithm), requiring no additional `aria-label`. This is the most maintainable approach: the accessible name stays in sync with the visible label automatically.

---

### CI-4: Filter Options Are Non-Interactive `<div>` Elements

**Evinced rules:** `WRONG_SEMANTIC_ROLE` (Critical) · `NOT_FOCUSABLE` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Pages:** Products (/shop/new) only  
**Source file:** `src/components/FilterSidebar.jsx`

#### Affected Elements

14 filter option `<div>` elements representing checkboxes across three filter groups:

| Filter Group | Options | Selectors (examples) |
|-------------|---------|---------------------|
| Price | $1.00–$100+ (4 items) | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1..4)` |
| Size | XS / SM / MD / LG / XL (5 items) | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1..4)`, `.filter-option:nth-child(5)` |
| Brand | Android / Google / YouTube (3 items) | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1..3)` |

DOM pattern for each:
```html
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">XS<span class="filter-count">(14)</span></span>
</div>
```

#### Issue Description

All 14 filter options are `<div>` elements with custom checkbox visuals and click handlers. They are completely keyboard-inaccessible: users who rely on Tab, Enter, or Space cannot interact with any filter. Screen readers announce each as a generic group container with no role or state information (no checked/unchecked state is exposed).

#### Recommended Fix

Replace each filter option with a native `<input type="checkbox">` / `<label>` pair. The existing custom visual can be retained via CSS (hiding the native input and styling the custom element via the `:checked` pseudo-class).

```jsx
<li className="filter-option">
  <label className="filter-option-label-wrap">
    <input
      type="checkbox"
      className="filter-checkbox-input" // visually hidden via CSS
      checked={isSelected}
      onChange={() => onFilterChange(value)}
    />
    <span className="custom-checkbox" aria-hidden="true" />
    <span className="filter-option-label">
      XS<span className="filter-count">(14)</span>
    </span>
  </label>
</li>
```

#### Rationale

`<input type="checkbox">` is the unambiguously correct semantic element for a binary on/off filter control. It is natively keyboard focusable, supports Space-key toggle, exposes `checked`/`unchecked` state to screen readers automatically, and participates correctly in form submission. The native checkbox satisfies WCAG 4.1.2 (name, role, value) without any ARIA attributes. The `<label>` wrapping pattern ensures the full label text (including the count) is associated with the checkbox, satisfying WCAG 1.3.1. Visually hiding the native `<input>` with CSS (not `display:none` or `visibility:hidden`) preserves all accessibility semantics while allowing custom visual styling.

---

### CI-5: Cart Modal Close Button Has No Accessible Name

**Evinced rules:** `AXE-BUTTON-NAME` (Critical) · `NO_DESCRIPTIVE_TEXT` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages:** Homepage, Products, Product Detail, Checkout – Basket  
**Source file:** `src/components/CartModal.jsx`

#### Affected Element

| Selector | DOM Snippet |
|----------|-------------|
| `#cart-modal > div:nth-child(1) > button` | `<button class="[css-module-hash]"><svg width="20" height="20" … aria-hidden="true">…</svg></button>` |

#### Issue Description

The shopping cart drawer's close button is a `<button>` element (semantically correct) but contains only an SVG icon with `aria-hidden="true"`. The button has no `aria-label`, `aria-labelledby`, or visible text, so its accessible name is empty. Screen readers announce it as "button" with no purpose, making it indistinguishable from any other unlabelled button on the page.

#### Recommended Fix

Add `aria-label="Close shopping cart"` to the close button:

```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg width="20" height="20" … aria-hidden="true">…</svg>
</button>
```

#### Rationale

`aria-label` is the appropriate technique for icon-only buttons where no visible text label exists and `aria-labelledby` cannot be used (no existing text node describes this button). The label "Close shopping cart" is specific enough to communicate both the action ("Close") and the context ("shopping cart"), which is essential when multiple modal close buttons coexist on the same page (cart and wishlist). Adding `aria-label` is a single-attribute change with no visual or functional side effects.

---

### CI-6: Wishlist Modal Close Button Has No Accessible Name

**Evinced rules:** `AXE-BUTTON-NAME` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages:** All six pages (Wishlist modal is always present in the DOM)  
**Source file:** `src/components/WishlistModal.jsx`

#### Affected Element

| Selector | DOM Snippet |
|----------|-------------|
| `div[role="dialog"] > div:nth-child(1) > button` | `<button class="[css-module-hash]"><svg width="20" height="20" … aria-hidden="true">…</svg></button>` |

#### Issue Description

The wishlist modal's close button, like the cart modal's, is an icon-only `<button>` whose SVG content is `aria-hidden="true"`. It has no accessible name. This is the same pattern as CI-5 in a different component.

#### Recommended Fix

Add `aria-label="Close wishlist"` to the wishlist modal close button:

```jsx
<button
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg width="20" height="20" … aria-hidden="true">…</svg>
</button>
```

#### Rationale

Same as CI-5. The distinct label "Close wishlist" (rather than a generic "Close") allows screen reader users to understand which modal is being dismissed, which matters when focus is managed between overlapping modals on a page that has both a cart and a wishlist panel.

---

### CI-7: Cart Modal "Continue Shopping" Is a Non-Interactive `<div>` with Hidden Text

**Evinced rules:** `WRONG_SEMANTIC_ROLE` (Critical) · `NOT_FOCUSABLE` (Critical) · `NO_DESCRIPTIVE_TEXT` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Pages:** Checkout – Basket (cart modal open state)  
**Source file:** `src/components/CartModal.jsx`

#### Affected Element

| Selector | DOM Snippet |
|----------|-------------|
| `div:nth-child(3) > div:nth-child(4)` (CSS module class) | `<div class="[continueBtn]" style="cursor: pointer;"><span aria-hidden="true">Continue Shopping</span></div>` |

#### Issue Description

At the bottom of the cart modal drawer, a "Continue Shopping" control is rendered as a `<div>` with an `onClick` handler. The visible label is wrapped in `<span aria-hidden="true">`, removing it from the accessibility tree entirely. Screen readers cannot find or interact with this control. Keyboard users cannot reach it.

#### Recommended Fix

Replace the `<div>` with a `<button>` and remove `aria-hidden="true"` from the inner `<span>`:

```jsx
<button
  className={styles.continueBtn}
  onClick={closeCart}
>
  Continue Shopping
</button>
```

#### Rationale

"Continue Shopping" closes the cart modal and returns focus to the page — this is a button action, not a navigation. Using `<button>` provides keyboard accessibility, native focus behaviour, and announced role. Removing `aria-hidden="true"` from the text gives the button its accessible name via text content — the simplest and most maintainable accessible name source. No `aria-label` is needed.

---

### CI-8: Cart Item Delete Button Has No Accessible Name

**Evinced rules:** `AXE-BUTTON-NAME` (Critical) · `NO_DESCRIPTIVE_TEXT` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages:** Checkout – Basket (cart modal open state)  
**Source file:** `src/components/CartModal.jsx`

#### Affected Element

| Selector | DOM Snippet |
|----------|-------------|
| `li > button` (delete button on each cart item) | `<button class="[css-module-hash]"><svg width="16" height="16" … aria-hidden="true">…</svg></button>` |

#### Issue Description

Each cart line item has a delete/remove button rendered as an icon-only `<button>` with `aria-hidden="true"` on the SVG. The button's accessible name is empty. When multiple cart items are present, a screen reader user hears multiple identical unlabelled "button" announcements with no way to distinguish which item each removes.

#### Recommended Fix

Add a dynamic `aria-label` that includes the product name:

```jsx
<button
  className={styles.removeBtn}
  onClick={() => removeFromCart(item.id)}
  aria-label={`Remove ${item.name} from cart`}
>
  <svg width="16" height="16" … aria-hidden="true">…</svg>
</button>
```

#### Rationale

A descriptive label that includes the item name ("Remove Chrome Dino Accessory Pack from cart") disambiguates multiple delete buttons in a list — a requirement explicitly highlighted in WCAG 2.4.6 (Headings and Labels) and the ARIA Authoring Practices Guide for list-based widgets. Using a template literal to embed the item name means the label stays accurate when cart contents change without any additional maintenance.

---

### CI-9: Checkout "Back to Cart" Is a Non-Focusable `<div>`

**Evinced rules:** `WRONG_SEMANTIC_ROLE` (Critical) · `NOT_FOCUSABLE` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Pages:** Checkout – Shipping (step 2)  
**Source file:** `src/pages/CheckoutPage.jsx`

#### Affected Element

| Selector | DOM Snippet |
|----------|-------------|
| `.checkout-back-btn` | `<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>` |

#### Issue Description

The "← Back to Cart" control on the checkout Shipping & Payment step is a `<div>`. Keyboard users cannot Tab to it or activate it, effectively trapping them on the form step with no keyboard-accessible way to return to their cart.

#### Recommended Fix

Replace the `<div>` with a `<button>` element:

```jsx
<button className="checkout-back-btn" onClick={handleBackToCart}>
  ← Back to Cart
</button>
```

#### Rationale

"Back to Cart" reverts the checkout step state — it is an action, making `<button>` the appropriate element. The existing class name, text content, and click handler can be retained unchanged. Native `<button>` provides Tab-focusability and Enter/Space activation without any ARIA.

---

### CI-10: Order Confirmation "Back to Shop" Is a Non-Focusable `<div>`

**Evinced rules:** `WRONG_SEMANTIC_ROLE` (Critical) · `NOT_FOCUSABLE` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Pages:** Order Confirmation (/order-confirmation)  
**Source file:** `src/pages/OrderConfirmationPage.jsx`

#### Affected Element

| Selector | DOM Snippet |
|----------|-------------|
| `.confirm-home-link` | `<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>` |

#### Issue Description

The order confirmation page provides a "← Back to Shop" link implemented as a `<div>`. This is the only navigation control on the page (aside from the global header). A keyboard user who has just completed checkout has no accessible way to return to shopping.

#### Recommended Fix

Replace the `<div>` with an `<a>` element pointing to the shop root:

```jsx
<a href="/shop/new" className="confirm-home-link">← Back to Shop</a>
```

Or, if using React Router:

```jsx
<Link to="/shop/new" className="confirm-home-link">← Back to Shop</Link>
```

#### Rationale

"Back to Shop" navigates to a new route — it is a link, not an action. Using `<a>` or `<Link>` is semantically correct and communicates navigation intent to screen readers. Links are announced with their destination context ("link" vs "button"), which helps users understand they are leaving the current page, matching the user's mental model.

---

### CI-11: Images Missing Alt Text

**Evinced rules:** `AXE-IMAGE-ALT` (Critical)  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Pages:** Homepage (/)  
**Source files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`

#### Affected Elements

| Selector | DOM Snippet | Location |
|----------|-------------|----------|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | HeroBanner hero image |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | "The Drop" section image |

#### Issue Description

Both `<img>` elements have no `alt` attribute at all (not even `alt=""`). Without `alt`, screen readers fall back to announcing the image file path (e.g., "New_Tees.png"), which is meaningless to a user. Both images are content images (they depict merchandise being promoted), not decorative images, so they require descriptive alt text.

#### Recommended Fix

Add descriptive `alt` text that conveys the informational content of each image:

```jsx
// HeroBanner.jsx
<img src="/images/home/New_Tees.png" alt="New winter tees collection — warm hues on display" />

// TheDrop.jsx
<img src="/images/home/2bags_charms1.png" alt="Two limited-edition bag charms from the new drop" loading="lazy" />
```

#### Rationale

WCAG 1.1.1 requires that all non-decorative images have a text alternative that serves the equivalent purpose. For promotional hero and feature imagery on a retail site, the alt text should describe what is shown and its purpose (it promotes a collection). If the images were purely decorative (e.g., background texture), `alt=""` would be correct and the scanner finding would be suppressed. These images are informative, so descriptive alt is required.

---

### CI-12: Invalid ARIA Attribute Values

**Evinced rules:** `AXE-ARIA-VALID-ATTR-VALUE` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages:** Homepage (/) · Product Detail · Checkout – Basket  
**Source files:** `src/components/FeaturedPair.jsx`, `src/pages/ProductPage.jsx`

#### Affected Elements

| Selector | Page(s) | Invalid Attribute | Invalid Value | Valid Values |
|----------|---------|-------------------|---------------|--------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | Homepage | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | Homepage | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| `ul[aria-relevant="changes"]` | Product Detail, Checkout – Basket | `aria-relevant` | `"changes"` | Space-separated: `additions`, `removals`, `text`, `all` |

#### Issue Description

**`aria-expanded="yes"` on `<h1>` (FeaturedPair.jsx):** `aria-expanded` is a state attribute whose only valid values are `"true"` or `"false"`. The value `"yes"` is not recognised by any browser or assistive technology, so the attribute has no effect and pollutes the accessibility tree with invalid state data. Additionally, `aria-expanded` is semantically incorrect on a `<h1>` element (headings are not expandable/collapsible widgets). The attribute should be removed entirely, or moved to a controlling `<button>` if an expand/collapse behaviour is intended.

**`aria-relevant="changes"` on `<ul>` (ProductPage.jsx):** The `aria-relevant` attribute accepts only space-separated tokens from the set: `additions`, `removals`, `text`, `all`. The value `"changes"` is not in this set and is silently ignored by screen readers, defeating the intended live-region behaviour.

#### Recommended Fix

**FeaturedPair.jsx:** Remove `aria-expanded` from the `<h1>` elements — headings are not interactive widgets:

```jsx
// Before
<h1 aria-expanded="yes">{item.title}</h1>

// After
<h1>{item.title}</h1>
```

**ProductPage.jsx:** Change `aria-relevant="changes"` to a valid token set. The closest semantic match for "changes" (both additions and removals) is `"additions removals"`:

```jsx
// Before
<ul aria-relevant="changes" aria-live="polite">

// After
<ul aria-relevant="additions removals" aria-live="polite">
```

#### Rationale

Invalid ARIA values cause the attribute to be silently ignored by browsers and screen readers (per the ARIA spec). Using an invalid value is strictly worse than omitting the attribute, because it creates false confidence that the feature is working while the user receives no benefit. Correcting to a valid enumerated value restores intended behaviour. Removing `aria-expanded` from a `<h1>` removes a semantically incorrect attribution entirely; if an expand/collapse feature is desired, the correct pattern is `<button aria-expanded="true/false">` controlling a collapsible region.

---

### CI-13: Popularity Slider Missing Required ARIA Attributes

**Evinced rules:** `AXE-ARIA-REQUIRED-ATTR` (Critical) · `NOT_FOCUSABLE` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Pages:** Homepage (/)  
**Source file:** `src/components/TheDrop.jsx`

#### Affected Element

| Selector | DOM Snippet |
|----------|-------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` |

#### Issue Description

The "Popularity indicator" element declares `role="slider"` but is missing all three attributes that the `slider` role requires:
- `aria-valuenow` (current value — **required**)
- `aria-valuemin` (minimum value — **required**)
- `aria-valuemax` (maximum value — **required**)

Additionally, the element has no `tabindex="0"`, so it is not keyboard reachable. A slider widget without these attributes is an invalid ARIA pattern: screen readers will announce the role but cannot communicate the current value or range, and users cannot interact with it via keyboard.

#### Recommended Fix

Add the required ARIA value attributes and `tabindex`, then bind them to the actual popularity data:

```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}   // e.g., 72
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext={`${popularityValue}% popularity`}
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

If the bar is purely decorative (read-only, no user interaction intended), the slider role should be removed entirely and replaced with `role="presentation"` or a `<meter>` element:

```jsx
<meter
  className="drop-popularity-bar"
  value={popularityValue}
  min={0}
  max={100}
  aria-label="Popularity indicator"
/>
```

#### Rationale

The ARIA Authoring Practices Guide defines `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` as required properties for `role="slider"`. Browsers that compute accessible names and values for sliders use these attributes to compose what is read aloud (e.g., "Popularity indicator, 72 percent, slider"). If interaction is not needed, switching to the `<meter>` element expresses read-only range values natively without any ARIA, is simpler to maintain, and avoids incorrectly communicating that the user can adjust the value.

---

### CI-14: Sort Dropdown Button Has Incorrect Role and Missing ARIA Pattern

**Evinced rules:** `ELEMENT_HAS_INCORRECT_ROLE` (Critical) · `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` (Critical)  
**WCAG:** 4.1.2 Name, Role, Value (Level A) · 2.1.1 Keyboard (Level A)  
**Pages:** Products (/shop/new) only  
**Source file:** `src/pages/NewPage.jsx`

#### Affected Element

| Selector | DOM Snippet |
|----------|-------------|
| `.sort-btn` | `<button class="sort-btn">Sort by Relevance (Default)<svg aria-hidden="true">…</svg></button>` |

#### Issue Description

The sort dropdown is a `<button>` that toggles a `<ul>` of sort options. Several critical ARIA attributes that communicate combobox/listbox semantics to screen readers have been removed from the implementation:
- `aria-expanded` (missing) — screen readers cannot determine if the option list is open or closed.
- `aria-haspopup="listbox"` (missing) — screen readers are not informed that this button controls a popup list.
- `aria-controls` (missing) — screen readers cannot navigate from the trigger to the options list.
- The `<ul>` of options lacks `role="listbox"`.
- Individual `<li>` items lack `role="option"` and `aria-selected`.
- Option items have no `tabIndex` and no keyboard event handlers — they are only mouse-clickable.

Evinced flags `ELEMENT_HAS_INCORRECT_ROLE` because the `<button>` acts as a combobox trigger but lacks combobox semantics. `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` is raised because the button's purpose (controlling a sort options popup) is not communicated to assistive technologies.

#### Recommended Fix

**Option A (Recommended for simplicity): Native `<select>`**

```jsx
<select
  className="sort-select"
  value={sort}
  onChange={(e) => setSort(e.target.value)}
  aria-label="Sort products by"
>
  {SORT_OPTIONS.map((opt) => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>
```

**Option B: Full ARIA combobox pattern (if custom styling is required)**

```jsx
<button
  className="sort-btn"
  aria-haspopup="listbox"
  aria-expanded={sortOpen}
  aria-controls="sort-options-list"
  aria-label={`Sort by: ${currentSortLabel}`}
  onClick={() => setSortOpen((o) => !o)}
>
  Sort by {currentSortLabel} <svg aria-hidden="true">…</svg>
</button>

{sortOpen && (
  <ul
    id="sort-options-list"
    role="listbox"
    aria-label="Sort options"
    tabIndex={-1}
  >
    {SORT_OPTIONS.map((opt) => (
      <li
        key={opt.value}
        role="option"
        aria-selected={sort === opt.value}
        tabIndex={0}
        onClick={() => { setSort(opt.value); setSortOpen(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setSort(opt.value); setSortOpen(false);
          }
        }}
      >
        {opt.label}
      </li>
    ))}
  </ul>
)}
```

#### Rationale

Option A (native `<select>`) is preferred because it satisfies all accessibility requirements automatically across every browser and platform, requires far less code, and is fully keyboard operable out of the box. The ARIA combobox/listbox pattern (Option B) is appropriate only when the `<select>` appearance cannot be sufficiently customised via CSS for the design system. The ARIA Authoring Practices Guide combobox pattern requires careful implementation of keyboard interactions (ArrowUp/Down, Home/End, Escape to close, Enter to select) to match user expectations — Option A provides all of this for free.

---

## 5. Non-Critical Issues (Not Remediated)

The following 26 issues are classified as **Serious**, **Needs Review**, or **Best Practice**. No code changes have been made for these issues. They are documented here for completeness and future sprint planning.

### S-1: Insufficient Color Contrast — `AXE-COLOR-CONTRAST` (Serious)

**WCAG:** 1.4.3 Minimum Contrast (Level AA)  
**Total occurrences:** 17 (across 4 pages)

| Page | Element / Selector | Description |
|------|--------------------|-------------|
| Homepage (/) | `.hero-content > p` ("Warm hues for cooler days") | Hero subtitle text has insufficient contrast against the hero background image |
| Homepage (/) | `.hero-banner` (full banner container) | Multiple text elements within the banner fail contrast requirements |
| Products (/shop/new) | `.products-found` ("16 Products Found") | Low-contrast grey text (`#b0b4b8`) on white (`#ffffff`), ~1.9:1 ratio |
| Products (/shop/new) | `.filter-count` spans (13 occurrences across all filter groups) | Product counts in filter labels (`#c8c8c8` on `#ffffff`), ~1.4:1 ratio |
| Product Detail (/product/:id) | Product description paragraph (`p:nth-child(4)`) | Description text in light grey (`#c0c0c0`) on white fails 4.5:1 minimum |
| Product Detail (/product/:id) | `#main-content > div` (full page container) | Multiple low-contrast text elements inside the product detail view |
| Checkout – Basket | Product description paragraph | Same product detail description visible in cart modal overlay |
| Checkout – Basket | `#main-content > div` | Same product detail view visible behind cart modal |
| Order Confirmation | `.confirm-order-id-label` ("Order ID" label) | Low contrast label text against the confirmation card background |
| Order Confirmation | `.confirm-order-id-box` (full Order ID box) | Compound container with multiple low-contrast elements |

**Required fix (not applied):** Increase text colour contrast to meet the 4.5:1 minimum ratio for normal-size text (WCAG 1.4.3 AA) or 3:1 for large text (≥18pt or ≥14pt bold).

---

### S-2: `<html>` Element Missing `lang` Attribute — `AXE-HTML-HAS-LANG` (Serious)

**WCAG:** 3.1.1 Language of Page (Level A)  
**Total occurrences:** 6 (one per page — same root cause)  
**Source file:** `public/index.html` (the Webpack HTML template)

The application's root `<html>` element has no `lang` attribute. Screen readers use this attribute to select the correct language engine and pronunciation rules. All six pages are affected because they share the same HTML template.

**Affected element (all pages):**
```html
<html style="scroll-behavior: unset;">
<!-- missing: lang="en" -->
```

**Required fix (not applied):** Add `lang="en"` (or the appropriate BCP 47 language tag) to the `<html>` element in `public/index.html`:

```html
<html lang="en">
```

---

### S-3: Invalid `lang` Attribute Value — `AXE-VALID-LANG` (Serious)

**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Total occurrences:** 1 (Homepage only)  
**Source file:** `src/components/TheDrop.jsx` or `HeroBanner.jsx`

One paragraph on the Homepage carries `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers using this attribute to switch pronunciation engines will fail silently or apply incorrect rules.

**Affected element:**
```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms have officially dropped…</p>
```

**Required fix (not applied):** Either remove the `lang` attribute (if the content is in English like the rest of the page) or correct it to a valid tag (`lang="en"`):

```html
<p>Our brand-new, limited-edition plushie bag charms…</p>
```

---

### BP-1: Navigation Submenus Using `role="menu"` Instead of `role="list"` — `MENU_AS_A_NAV_ELEMENT` (Best Practice)

**Total occurrences:** 1 (5 sub-occurrences on Products page, 1 per navigation submenu)  
**Source file:** `src/components/Header.jsx` (navigation submenus)

Five navigation dropdown submenus (`<ul role="menu">`) use ARIA `menu` role semantics within a primary navigation landmark (`<nav>`). The `menu` role is intended for application menus (like a file menu or toolbar menu) that implement the keyboard navigation model defined in the ARIA Authoring Practices Guide Menu pattern (ArrowUp/Down, Home/End, Escape). Navigation submenus that link to pages do not implement this keyboard model and should use `role="list"` (or no role, since `<ul>` is already a list) within `<nav>`.

**Affected elements (Products page — submenu submenus):**
- `.has-submenu:nth-child(2) > .submenu[role="menu"]` (Apparel submenu)
- `.has-submenu:nth-child(3) > .submenu[role="menu"]` (Lifestyle submenu)
- `.has-submenu:nth-child(4) > .submenu[role="menu"]` (Stationery submenu)
- `.has-submenu:nth-child(5) > .submenu[role="menu"]` (Collections submenu)
- `.has-submenu:nth-child(6) > .submenu[role="menu"]` (Shop by Brand submenu)

**Required fix (not applied):** Remove `role="menu"` and `role="menuitem"` / `role="none"` overrides from navigation submenus. Use standard `<ul>` / `<li>` / `<a>` structure within `<nav>`. If disclosure behaviour is needed, use `aria-expanded` on the parent link/button.

---

### NR-1: Combobox Analysis Skipped — `COMBOBOX_ANALYSIS_CANNOT_RUN` (Needs Review)

**Total occurrences:** 1 (Products page, `.sort-btn`)

The Evinced `analyzeCombobox()` targeted scan for `.sort-btn` could not run because the element does not implement a recognisable combobox pattern. This is a corroborating signal for CI-14 (Sort Dropdown missing ARIA combobox attributes). Manual testing confirms the sort dropdown is not operable by keyboard.

---

## 6. Appendix: Issue Counts by Evinced Rule Type

| Evinced Rule ID | Rule Name | Severity | Total Occurrences |
|-----------------|-----------|----------|-------------------|
| `NOT_FOCUSABLE` | Keyboard accessible | Critical | 55 |
| `WRONG_SEMANTIC_ROLE` | Interactable role | Critical | 54 |
| `NO_DESCRIPTIVE_TEXT` | Accessible name | Critical | 24 |
| `AXE-BUTTON-NAME` | Button name | Critical | 9 |
| `AXE-COLOR-CONTRAST` | Color contrast | Serious | 17 |
| `AXE-HTML-HAS-LANG` | HTML has lang | Serious | 6 |
| `AXE-ARIA-VALID-ATTR-VALUE` | ARIA valid attr value | Critical | 4 |
| `AXE-IMAGE-ALT` | Image alt | Critical | 2 |
| `AXE-VALID-LANG` | Valid lang | Serious | 1 |
| `AXE-ARIA-REQUIRED-ATTR` | ARIA required attr | Critical | 1 |
| `ELEMENT_HAS_INCORRECT_ROLE` | Element has incorrect role | Critical | 1 |
| `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` | Missing contextual labeling | Critical | 1 |
| `MENU_AS_A_NAV_ELEMENT` | Menu as a nav element | Best Practice | 1 |
| `COMBOBOX_ANALYSIS_CANNOT_RUN` | Skipped combobox analysis | Needs Review | 1 |
| **Total** | | | **177** |

---

*Report generated by Evinced JS Playwright SDK v2.44.0 — automated accessibility audit, 2026-03-17.*
