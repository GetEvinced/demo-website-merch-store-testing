# Accessibility Audit Report — Demo E-Commerce Website

**Date:** 2026-03-26  
**Tool:** Evinced JS Playwright SDK v2.43.0  
**Auditor:** Automated Cloud Agent (Cursor)  
**Methodology:** Playwright-driven Evinced `evAnalyze()` scans on each page at full-desktop viewport (1280×800) using Chromium.

---

## Table of Contents

1. [Repository & Page Inventory](#1-repository--page-inventory)
2. [Audit Summary](#2-audit-summary)
3. [Critical Issues — Detailed Findings & Recommended Fixes](#3-critical-issues--detailed-findings--recommended-fixes)
4. [Remaining Non-Critical Issues](#4-remaining-non-critical-issues)
5. [Appendix — Raw Issue Counts by Page](#5-appendix--raw-issue-counts-by-page)

---

## 1. Repository & Page Inventory

The repository is a React 18 single-page application (SPA) built with Webpack 5 and React Router v7, served from the `/dist` folder. The routing and entry points are:

| Route | Entry Component | Description |
|---|---|---|
| `/` | `src/pages/HomePage.jsx` | Homepage — hero banner, featured pair, popular section, "The Drop" |
| `/shop/new` | `src/pages/NewPage.jsx` | Product listing with filter sidebar and sort dropdown |
| `/product/:id` | `src/pages/ProductPage.jsx` | Individual product detail page |
| *(Cart Modal)* | `src/components/CartModal.jsx` | Cart drawer — opens as an overlay on any page |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout (basket → shipping/payment) |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation page |

Shared components present on all pages: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/WishlistModal.jsx`, `src/components/CartModal.jsx`.

---

## 2. Audit Summary

| Page | Critical | Serious | Total |
|---|---|---|---|
| Homepage (/) | 32 | 3 | **35** |
| Shop/New (/shop/new) | 41 | 14 | **55** |
| Product Detail (/product/:id) | 18 | 2 | **20** |
| Cart Modal | 22 | 2 | **24** |
| Checkout (/checkout) | 18 | 3 | **21** |
| Order Confirmation (/order-confirmation) | 18 | 2 | **20** |
| **Grand Total** | **149** | **26** | **175** |

> **Note on counts:** Many critical issues recur across pages because they originate in shared components (`Header`, `Footer`). The per-page counts reflect all instances Evinced observed, not unique root-cause defects. The 14 unique root-cause issues (CRIT-01 through CRIT-14) listed below account for all 149 critical findings.

### Severity Classification

- **Critical** — Blocks or severely impairs access for users relying on keyboard navigation or assistive technology. Maps to WCAG 2.1 Level A violations.
- **Serious** — Significant barrier for users with disabilities. Maps to WCAG 2.1 Level AA violations.

---

## 3. Critical Issues — Detailed Findings & Recommended Fixes

---

### CRIT-01 — Wishlist Button: `<div>` used as an interactive button (wrong role, not focusable, no accessible name)

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 1.3.1 Info and Relationships (A), 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A)  
**Pages Affected:** All 6 pages (shared `Header.jsx`)  
**Affected Element:**

```html
<div class="icon-btn wishlist-btn" onClick={openWishlist} style="cursor: pointer;">
  <svg ... aria-hidden="true">...</svg>
  <span>Wishlist</span>
  ...
</div>
```

**Source file:** `src/components/Header.jsx` line 131–137

**Problem:** A `<div>` with a click handler acts as a button but has no `role="button"`, no `tabindex`, and is not reachable by keyboard. The `<span>Wishlist</span>` visible text does give some accessible name, but the element's semantic role is incorrect — screen readers do not announce it as an interactive control and keyboard users cannot focus or activate it.

**Recommended Fix:**
Replace the `<div>` with a `<button>` element. Buttons are natively focusable and have an implicit `role="button"`:

```jsx
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} item${wishlistCount > 1 ? 's' : ''}` : ''}`}>
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Wishlist</span>
  {wishlistCount > 0 && (
    <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>
  )}
</button>
```

**Why this approach:** Using a native `<button>` requires zero ARIA overhead to convey interactivity and focusability. The `aria-label` encodes the count so screen readers announce the current state without relying on a visually-hidden badge. The visible span is marked `aria-hidden` to prevent double-announcement.

---

### CRIT-02 — Search Button: `<div>` used as interactive control, no accessible name

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** All 6 pages (shared `Header.jsx`)  
**Affected Element:**

```html
<div class="icon-btn" style="cursor: pointer;">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>
```

**Source file:** `src/components/Header.jsx` line 140–143

**Problem:** The `<div>` is not a button; it is not reachable by keyboard, has no role, and the only text content has `aria-hidden="true"`, making the element completely unnamed for assistive technology.

**Recommended Fix:**
```jsx
<button className="icon-btn" aria-label="Search">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

**Why this approach:** Converting to a `<button>` restores native keyboard focus and role semantics. The `aria-label="Search"` provides the accessible name since the visible span is hidden from AT.

---

### CRIT-03 — Login Button: `<div>` used as interactive control, no accessible name

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** All 6 pages (shared `Header.jsx`)  
**Affected Element:**

```html
<div class="icon-btn" style="cursor: pointer;">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Source file:** `src/components/Header.jsx` line 156–159

**Problem:** Same root cause as CRIT-02 — a `<div>` with `cursor: pointer` and a visible label hidden from AT provides no semantic role, no keyboard access, and no accessible name.

**Recommended Fix:**
```jsx
<button className="icon-btn" aria-label="Login">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</button>
```

**Why this approach:** Native `<button>` is the most robust solution. The `aria-label` is required because the only text child is `aria-hidden`.

---

### CRIT-04 — Region Selector: `<div>` used as interactive control

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** All 6 pages (shared `Header.jsx`)  
**Affected Element:**

```html
<div class="flag-group" onClick={() => {}} style="cursor: pointer;">
  <img src="...united-states-of-america.png" alt="United States Flag" ...>
  <img src="...canada.png" alt="Canada Flag" ...>
</div>
```

**Source file:** `src/components/Header.jsx` line 161–164

**Problem:** The region/language selector is a `<div>` with a click handler. It is not keyboard-reachable and its interactive nature is not communicated to assistive technology. Although the images have `alt` text, the compound element has no accessible name as a button.

**Recommended Fix:**
```jsx
<button className="flag-group" onClick={handleRegionChange} aria-label="Select region or language">
  <img src="/images/icons/united-states-of-america.png" alt="" aria-hidden="true" width="24" height="24" />
  <img src="/images/icons/canada.png" alt="" aria-hidden="true" width="24" height="24" />
</button>
```

**Why this approach:** Using `<button>` gives keyboard access. The images are decorative within the button context (the button label describes the purpose), so making them `aria-hidden` prevents redundant announcements like "United States Flag Canada Flag button".

---

### CRIT-05 — Cart Modal Close Button: no accessible name

**Evinced Rules Triggered:** `AXE-BUTTON-NAME`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages Affected:** Homepage, Shop/New, Product Detail, Cart Modal  
**Affected Element:**

```html
<button class="[hashed-css-module-class]">
  <svg width="20" height="20" ... aria-hidden="true">
    <line .../><line .../>
  </svg>
</button>
```

**Source file:** `src/components/CartModal.jsx` line 56–64  
**CSS Selector:** `#cart-modal > div:nth-child(1) > button`

**Problem:** The close button contains only an SVG icon with `aria-hidden="true"`. With no `aria-label` or visible text, screen readers have no name to announce. The button will be read as an unlabelled button, preventing users from understanding its purpose.

**Recommended Fix:**
```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>
```

**Why this approach:** `aria-label` directly on the button is the simplest and most reliable approach for icon-only buttons. It avoids adding visually-hidden text that could affect layout.

---

### CRIT-06 — Wishlist Modal Close Button: no accessible name

**Evinced Rules Triggered:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (Level A)  
**Pages Affected:** Homepage, Shop/New, Product Detail, Checkout, Order Confirmation  
**Affected Element:**

```html
<button class="[hashed-css-module-class]">
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>
```

**Source file:** `src/components/WishlistModal.jsx` line 61–80  
**CSS Selector:** `div[role="dialog"] > div:nth-child(1) > button`

**Problem:** Identical to CRIT-05 — the WishlistModal close button is icon-only with no `aria-label`.

**Recommended Fix:**
```jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg ... aria-hidden="true">...</svg>
</button>
```

**Why this approach:** Same rationale as CRIT-05. The `aria-label` is the minimal, non-invasive fix.

---

### CRIT-07 — Popular Section Shop Links: `<div>` used as navigation link, hidden name

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** Homepage (/)  
**Affected Elements** (3 instances):

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

**Source file:** `src/components/PopularSection.jsx` lines 54–60

**Problem:** These navigation links are implemented as `<div>` elements with click handlers. The link labels are wrapped in `<span aria-hidden="true">`, making all three elements completely invisible to assistive technology — no role, no focus, no name.

**Recommended Fix:**
```jsx
<Link
  className="shop-link"
  to={product.shopHref}
>
  {product.shopLabel}
</Link>
```

**Why this approach:** Using React Router's `<Link>` (which renders an `<a href>`) gives the correct semantic link role, native focusability, and exposes the label text directly to assistive technology. The `aria-hidden` span wrapper is removed entirely.

---

### CRIT-08 — Footer Navigation Items: `<div>` used as navigation links

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** All 6 pages (shared `Footer.jsx`)  
**Affected Elements** (2 instances):

```html
<!-- "Sustainability" link -->
<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>

<!-- "FAQs" link -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

**Source file:** `src/components/Footer.jsx` lines 13, 18

**Problem:** Both footer navigation items are `<div>` elements. "Sustainability" has visible text that is exposed to AT, but lacks role and keyboard focus. "FAQs" is doubly broken — the text is hidden via `aria-hidden="true"`, leaving the element completely unnamed for assistive technology.

**Recommended Fix:**
```jsx
<li><a href="#sustainability" className="footer-nav-item">Sustainability</a></li>
...
<li><a href="#faqs" className="footer-nav-item">FAQs</a></li>
```

**Why this approach:** Native `<a href>` elements have the correct link role, are keyboard-focusable by default, and their text content becomes the accessible name automatically — no additional ARIA required. The `aria-hidden` span is removed.

---

### CRIT-09 — Slider Element Missing Required ARIA Attributes

**Evinced Rules Triggered:** `AXE-ARIA-REQUIRED-ATTR`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages Affected:** Homepage (/)  
**Affected Element:**

```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Source file:** `src/components/TheDrop.jsx` line 19

**Problem:** An element with `role="slider"` must provide three required ARIA attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). Without these, screen readers cannot convey the slider's current state or range to users. Additionally, the element has no `tabindex` making it unreachable by keyboard.

**Recommended Fix:**
```jsx
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

**Why this approach:** The `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes are mandatory per the WAI-ARIA slider role specification. `tabindex="0"` makes it keyboard-reachable. `aria-valuetext` provides a human-readable description alongside the numeric value. If the slider is decorative (read-only), it should instead be rendered as a `<meter>` element or a visual progress bar with `role="img"` and an `aria-label`.

---

### CRIT-10 — `aria-expanded="yes"` on `<h1>` Elements: Invalid ARIA Attribute Value

**Evinced Rules Triggered:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages Affected:** Homepage (/)  
**Affected Elements** (2 instances):

```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Source file:** `src/components/FeaturedPair.jsx` line 46

**Problem:** `aria-expanded` requires a boolean value — either `"true"` or `"false"`. The value `"yes"` is not a valid token and is treated as an invalid state by assistive technologies and validators, breaking WCAG 4.1.2. Furthermore, `aria-expanded` is not a valid attribute on heading elements — it belongs on disclosure widgets (buttons, links, comboboxes). Its presence on an `<h1>` is semantically incorrect.

**Recommended Fix:**
Remove `aria-expanded` from the heading entirely, as headings are not expandable/collapsible disclosure widgets:

```jsx
<h1>{item.title}</h1>
```

**Why this approach:** The `aria-expanded` attribute has no legitimate use on an `<h1>` element. Removing it eliminates both the invalid value and the inappropriate attribute application. If the heading were intended to toggle a content section, the correct pattern would be a `<button>` with `aria-expanded` controlling a collapsible panel.

---

### CRIT-11 — Images Missing `alt` Text

**Evinced Rules Triggered:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Pages Affected:** Homepage (/)  
**Affected Elements** (2 instances):

```html
<!-- Hero banner image -->
<img src="/images/home/New_Tees.png">

<!-- "The Drop" section image -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**Source files:**  
- `src/components/HeroBanner.jsx` line 18  
- `src/components/TheDrop.jsx` line 13

**Problem:** Both images lack the `alt` attribute entirely. Screen readers will fall back to announcing the filename (`New_Tees.png`, `2bags_charms1.png`), which is meaningless to users. Both images are content images that convey information relevant to their sections.

**Recommended Fix:**
```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="Winter Basics — new tees collection" />

// TheDrop.jsx
<img src={DROP_IMAGE} alt="Limited-edition plushie bag charms: Android bot, YouTube icon, and Super G" loading="lazy" />
```

**Why this approach:** Descriptive `alt` text communicates the content and context of each image to screen reader users. The text is derived from the surrounding copy so it provides meaning without duplicating adjacent visible text verbatim.

---

### CRIT-12 — `aria-relevant="changes"` Invalid Attribute Value

**Evinced Rules Triggered:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages Affected:** Product Detail (/product/:id), Cart Modal  
**Affected Element:**

```html
<ul aria-relevant="changes" aria-live="polite">...</ul>
```

**Source file:** `src/pages/ProductPage.jsx` line 144–148

**Problem:** `aria-relevant` accepts only space-separated values from the set: `additions`, `removals`, `text`, `all`. The value `changes` is not a valid token and browsers/screen readers will ignore or misinterpret it, failing to deliver live-region updates correctly.

**Recommended Fix:**
```jsx
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Why this approach:** `additions text` is the standard combination for a live region that should announce newly added or changed text content — which is the intent here. Alternatively, if the list content is static and does not change dynamically, remove `aria-live` and `aria-relevant` entirely.

---

### CRIT-13 — Filter Sidebar Options: `<div>` Used as Checkboxes (Wrong Semantic Role)

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** Shop/New (/shop/new)  
**Affected Elements:** 12 filter options across Price (4), Size (5), and Brand (3) groups

```html
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">1.00 - 19.99<span class="filter-count">(8)</span></span>
</div>
```

**Source file:** `src/components/FilterSidebar.jsx` lines 74, 116, 156

**Problem:** Each filter option is a `<div>` with an `onClick` handler that visually renders a custom checkbox. There is no `role="checkbox"`, no `aria-checked` state, and no `tabindex`. Keyboard users cannot reach or toggle the filters, and screen reader users have no indication that these are interactive checkboxes.

**Recommended Fix — Option A (native inputs):**
```jsx
<label key={range.label} className="filter-option">
  <input
    type="checkbox"
    checked={checked}
    onChange={() => onPriceChange(range)}
    className="filter-checkbox-input"
  />
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

**Recommended Fix — Option B (ARIA widget):**
```jsx
<div
  key={range.label}
  className="filter-option"
  role="checkbox"
  aria-checked={checked}
  tabIndex={0}
  onClick={() => onPriceChange(range)}
  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onPriceChange(range); }}}
>
  <div className={`custom-checkbox${checked ? ' custom-checkbox--checked' : ''}`}>
    {checked && <div className="custom-checkbox-checkmark" />}
  </div>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</div>
```

**Why these approaches:** Option A (native `<input type="checkbox">`) is strongly preferred because native inputs handle all keyboard interaction, checked state announcement, and focus management without custom JavaScript. Option B is acceptable when pixel-perfect custom styling is required, but demands explicit `role`, `aria-checked`, `tabIndex`, and keyboard event handlers.

---

### CRIT-14 — Sort Indicator: Invalid `aria-sort` Value and Misused `role="columnheader"`

**Evinced Rules Triggered:** `AXE-ARIA-VALID-ATTR-VALUE`, `WRONG_SEMANTIC_ROLE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Pages Affected:** Shop/New (/shop/new)  
**Affected Element:**

```html
<div aria-sort="newest" role="columnheader">Sort indicator</div>
```

**Source file:** `src/pages/NewPage.jsx` line 218 (inside a `display: none` block)

**Problem:** `aria-sort` only accepts values: `ascending`, `descending`, `none`, or `other`. The value `newest` is invalid. Additionally, `role="columnheader"` is semantically appropriate only within a data table context (`role="row"` inside `role="grid"` or `role="table"`), not on a standalone div. Although this element is currently `display: none`, it is still parsed by accessibility trees in some configurations.

**Recommended Fix:**
Remove the element entirely since it is inside a `display: none` block with no functional purpose. If a sort indicator is needed in the future:

```html
<!-- Within a proper table or grid context only -->
<th role="columnheader" aria-sort="ascending">Name</th>
```

Or, for the current sort button pattern, convey sort state via the button's accessible name:

```jsx
<button className="sort-btn" aria-label={`Sort by ${currentSortLabel}, currently selected`}>
  Sort by {currentSortLabel}
</button>
```

**Why this approach:** Eliminating the hidden invalid element removes the violation with no user-facing impact. Valid `aria-sort` values must match the WAI-ARIA specification; `role="columnheader"` outside a table/grid is incorrect and should be avoided.

---

### CRIT-15 — Cart Modal "Continue Shopping" Button: `<div>` used as interactive element, hidden name

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** Cart Modal  
**Affected Element:**

```html
<div class="[hashed-css-module-class]" style="cursor: pointer;">
  <span aria-hidden="true">Continue Shopping</span>
</div>
```

**Source file:** `src/components/CartModal.jsx` lines 128–134  
**CSS Selector:** `div:nth-child(3) > div:nth-child(4)` (inside Cart Modal footer)

**Problem:** The "Continue Shopping" action is a `<div>` with a click handler. Its only text content has `aria-hidden="true"`, rendering it completely invisible to assistive technology with no role, no focus, and no name.

**Recommended Fix:**
```jsx
<button
  className={styles.continueBtn}
  onClick={closeCart}
>
  Continue Shopping
</button>
```

**Why this approach:** Native `<button>` with visible text provides role, focus, and accessible name in one change. The `aria-hidden` span is removed so the text is directly accessible.

---

### CRIT-16 — Checkout "Continue" Button: `<div>` used as interactive element

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** Checkout (/checkout)  
**Affected Element:**

```html
<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```

**Source file:** `src/pages/CheckoutPage.jsx` line 156–162

**Problem:** The primary "Continue" CTA in the basket step of checkout is a `<div>`. Although its text is visible to AT (unlike some other divs-as-buttons in this codebase), it is not keyboard-reachable and conveys no interactive role.

**Recommended Fix:**
```jsx
<button
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
>
  Continue
</button>
```

**Why this approach:** This is the critical path to completing a purchase. Any keyboard user who reaches checkout cannot proceed without a focusable, properly-semanticed button.

---

### CRIT-17 — Order Confirmation "Back to Shop" Link: `<div>` used as navigation link

**Evinced Rules Triggered:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 1.3.1, 2.1.1, 4.1.2 (all Level A)  
**Pages Affected:** Order Confirmation (/order-confirmation)  
**Affected Element:**

```html
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

**Source file:** `src/pages/OrderConfirmationPage.jsx` line 40

**Problem:** The post-purchase navigation link back to the shop is a `<div>`. Keyboard users who have completed checkout cannot navigate back to the shop.

**Recommended Fix:**
```jsx
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Why this approach:** React Router `<Link>` renders a native `<a href>` with the correct link semantics, keyboard focus, and href for browser history navigation. No ARIA is needed.

---

### CRIT-18 — Cart Item Remove Buttons (in Cart Modal): No Accessible Name

**Evinced Rules Triggered:** `NO_DESCRIPTIVE_TEXT`, `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (Level A)  
**Pages Affected:** Cart Modal  
**Affected Element:**

```html
<button class="[hashed-css-module-class]">
  <svg width="16" height="16" ... aria-hidden="true">...</svg>
</button>
```

**Source file:** `src/components/CartModal.jsx` lines 102–110  
**CSS Selector:** `li > button` (remove button on each cart line item)

**Problem:** Each cart line item has an icon-only "remove" button with no accessible name. Screen readers will announce it as an unlabelled button with no indication of which item it removes.

**Recommended Fix:**
```jsx
<button
  className={styles.removeBtn}
  onClick={() => removeFromCart(item.id)}
  aria-label={`Remove ${item.name} from cart`}
>
  <svg ... aria-hidden="true">...</svg>
</button>
```

**Why this approach:** Including the item name in the `aria-label` distinguishes each remove button when multiple are present. This follows the pattern recommended by WCAG technique G91.

---

## 4. Remaining Non-Critical Issues

The following issues have **Serious** severity. They were not remediated per the scope of this audit but are documented for future sprint work.

---

### NC-01 — `<html>` Missing `lang` Attribute

**Evinced Rule:** `AXE-HTML-HAS-LANG`  
**WCAG:** 3.1.1 Language of Page (Level A) — *Note: Evinced classifies this as Serious rather than Critical.*  
**Pages Affected:** All 6 pages  
**Affected Element:**

```html
<html style="scroll-behavior: unset;">
```

**Source file:** `public/index.html`

**Problem:** The root `<html>` element has no `lang` attribute. Screen readers cannot automatically apply the correct language voice or rules for text-to-speech synthesis. This affects pronunciation for all content on every page.

**Recommended Fix:**
```html
<html lang="en">
```

---

### NC-02 — Invalid `lang` Attribute Value on Paragraph

**Evinced Rule:** `AXE-VALID-LANG`  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Pages Affected:** Homepage (/)  
**Affected Element:**

```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms...</p>
```

**Source file:** `src/components/TheDrop.jsx` line 21

**Problem:** `lang="zz"` is not a valid BCP 47 language tag. Screen readers applying language-specific text-to-speech rules will behave unpredictably for this paragraph.

**Recommended Fix:**
```jsx
<p lang="en">Our brand-new, limited-edition plushie bag charms...</p>
```
Or remove the `lang` attribute entirely if the paragraph language matches the page language.

---

### NC-03 — Insufficient Color Contrast Ratio

**Evinced Rule:** `AXE-COLOR-CONTRAST`  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Pages Affected:** All 6 pages  
**Number of Instances:** 19 unique elements across pages

**Description:** Multiple text elements fail the minimum contrast ratio of 4.5:1 for normal text or 3:1 for large text. The affected elements and their locations are:

| Location | Affected Element | Context |
|---|---|---|
| Homepage (/) | `.hero-content > p` | "Warm hues for cooler days" subheading over hero background |
| Homepage (/) | `.hero-banner` section | Multiple text elements within hero banner |
| Shop/New (/shop/new) | `.filter-count` spans (×12 instances) | Filter option count badges (e.g., "(8)", "(4)") within Price, Size, Brand filter groups |
| Shop/New (/shop/new) | `.products-found` paragraph | "16 Products Found" toolbar text |
| Product Detail (/product/:id) | `p:nth-child(4)` (product description) | Product description paragraph |
| Cart Modal | `p:nth-child(4)` (product description) | Same product description, visible behind open cart |
| Checkout (/checkout) | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" inactive step label |
| Checkout (/checkout) | `.summary-tax-note` | "Taxes calculated at next step" note in order summary |
| Order Confirmation (/order-confirmation) | `.confirm-order-id-label` | "Order ID" label text |

**Recommended Fix:**
Increase text color contrast or darken/adjust background colors in the respective CSS files so all text meets the 4.5:1 ratio (WCAG AA). For the filter count badges, consider using `color: #595959` (7:1 ratio on white) instead of a light gray. For hero subheading text, ensure sufficient contrast against the hero image or add a text-shadow/overlay.

---

## 5. Appendix — Raw Issue Counts by Page

### Issue Type Breakdown Across Pages

| Evinced Rule ID | Rule Name | Critical Count | Pages |
|---|---|---|---|
| `WRONG_SEMANTIC_ROLE` | Interactable role | 54 | All 6 |
| `NOT_FOCUSABLE` | Keyboard accessible | 55 | All 6 |
| `NO_DESCRIPTIVE_TEXT` | Accessible name | 24 | All 6 |
| `AXE-BUTTON-NAME` | Button-name | 9 | All 6 |
| `AXE-ARIA-VALID-ATTR-VALUE` | Aria-valid-attr-value | 4 | Homepage, Product Detail, Cart Modal |
| `AXE-IMAGE-ALT` | Image-alt | 2 | Homepage |
| `AXE-ARIA-REQUIRED-ATTR` | Aria-required-attr | 1 | Homepage |
| `AXE-HTML-HAS-LANG` | Html-has-lang | — (Serious) | All 6 |
| `AXE-COLOR-CONTRAST` | Color-contrast | — (Serious) | All 6 |
| `AXE-VALID-LANG` | Valid-lang | — (Serious) | Homepage |

### Per-Page JSON Reports

Raw Evinced JSON results are saved at:

```
tests/e2e/test-results/audit-homepage.json
tests/e2e/test-results/audit-shop-new.json
tests/e2e/test-results/audit-product-detail.json
tests/e2e/test-results/audit-cart-modal.json
tests/e2e/test-results/audit-checkout.json
tests/e2e/test-results/audit-order-confirmation.json
```

---

*Report generated by automated Evinced SDK audit. All critical issues map to WCAG 2.1 Level A violations. Serious issues map to WCAG 2.1 Level AA violations.*
