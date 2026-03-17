# Accessibility Audit Report — Demo Website

**Date:** 2026-03-17  
**Tool:** Evinced Playwright SDK v2.17.0  
**Branch:** `cursor/repository-accessibility-audit-a3f7`  
**Scope:** Full-site scan covering all 6 application pages  
**Standard:** WCAG 2.0 AA (primary), WCAG 2.1 AA where applicable

---

## Executive Summary

| Metric | Value |
|---|---|
| Pages audited | 6 |
| Total issues detected | 169 |
| **Critical** | **144** |
| Serious | 25 |

All 144 critical issues map to 11 distinct root-cause groups (CI-1 through CI-11). Each group shares the same underlying defect and the same remediation. The 25 serious issues map to 3 root-cause groups.

---

## Page-by-Page Totals

| Page | URL | Critical | Serious | Total |
|---|---|---|---|---|
| Homepage | `/` | 31 | 3 | 34 |
| Products | `/shop/new` | 41 | 14 | 55 |
| Product Detail | `/product/1` | 18 | 2 | 20 |
| Checkout — Basket step | `/checkout` | 18 | 3 | 21 |
| Checkout — Shipping step | `/checkout` (step 2) | 18 | 1 | 19 |
| Order Confirmation | `/order-confirmation` | 18 | 2 | 20 |
| **Total** | | **144** | **25** | **169** |

---

## Part 1 — Critical Issues

### CI-1 · Header Icon Buttons Implemented as `<div>` Elements

**Severity:** Critical  
**WCAG:** 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value), 2.1.1 (Keyboard)  
**Affects:** All 6 pages (header is rendered globally)  
**Evinced issue types:** Interactable Role, Keyboard Accessible, Accessible Name  
**Source file:** `src/components/Header.jsx`

#### Affected Elements

| CSS Selector | HTML Snippet | Issue Types |
|---|---|---|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor:pointer">…</div>` | Interactable Role, Keyboard Accessible |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor:pointer">…</div>` (Search) | Interactable Role, Keyboard Accessible, Accessible Name |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor:pointer">…</div>` (Login) | Interactable Role, Keyboard Accessible, Accessible Name |
| `.flag-group` | `<div class="flag-group" style="cursor:pointer">…</div>` (Language selector) | Interactable Role, Keyboard Accessible |

#### Why This Is Critical

`<div>` elements have no implicit ARIA role. Screen readers do not announce them as interactive controls and keyboard users cannot focus them with Tab or activate them with Enter/Space. These buttons control wishlist, search, login, and language selection — core navigation functions.

#### Recommended Fix

Replace each `<div>` with a `<button>` element (or `<a>` where navigation is the intent). Add `aria-label` attributes for icon-only controls that have no visible text label.

```jsx
// Wishlist (Header.jsx)
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
  <svg aria-hidden="true">…</svg>
</button>

// Search (icon-btn:nth-child(2))
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
</button>

// Login (icon-btn:nth-child(4))
<button className="icon-btn" aria-label="Login">
  <svg aria-hidden="true">…</svg>
</button>

// Language selector
<button className="flag-group" aria-label="Select language" aria-haspopup="listbox">
  <img src="…" alt="United States Flag" width="24" height="24" />
  <img src="…" alt="Canada Flag" width="24" height="24" />
</button>
```

**Remediation rationale:** `<button>` is the semantically correct element for any clickable control that does not navigate to a new URL. It is natively keyboard-focusable, activatable with Enter and Space, and announced as "button" by screen readers. Using `aria-label` on icon-only buttons provides the accessible name that AT users require.

---

### CI-2 · Footer Navigation Items Implemented as `<div>` Elements

**Severity:** Critical  
**WCAG:** 1.3.1, 4.1.2, 2.1.1  
**Affects:** All 6 pages (footer is rendered globally)  
**Evinced issue types:** Interactable Role, Keyboard Accessible, Accessible Name  
**Source file:** `src/components/Footer.jsx`

#### Affected Elements

| CSS Selector | HTML Snippet | Issue Types |
|---|---|---|
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer">Sustainability</div>` | Interactable Role, Keyboard Accessible |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer"><span aria-hidden="true">FAQs</span></div>` | Interactable Role, Keyboard Accessible, Accessible Name |

The "FAQs" item compounds the problem: the visible text is wrapped in `<span aria-hidden="true">`, making the element's accessible name completely empty.

#### Recommended Fix

```jsx
// Sustainability (Footer.jsx)
<li><button className="footer-nav-item" onClick={…}>Sustainability</button></li>

// FAQs — remove aria-hidden from the inner span
<li><button className="footer-nav-item" onClick={…}>FAQs</button></li>
```

**Remediation rationale:** Same as CI-1. The `aria-hidden="true"` on the "FAQs" `<span>` compounds the issue by also stripping the accessible name, so it must be removed.

---

### CI-3 · "Shop" Links on Homepage Popular Section Implemented as `<div>` Elements

**Severity:** Critical  
**WCAG:** 1.3.1, 4.1.2, 2.1.1  
**Affects:** Homepage (`/`)  
**Evinced issue types:** Interactable Role, Keyboard Accessible, Accessible Name  
**Source file:** `src/components/PopularSection.jsx`

#### Affected Elements

| CSS Selector | HTML Snippet |
|---|---|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer"><span aria-hidden="true">Shop Drinkware</span></div>` |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer"><span aria-hidden="true">Shop Fun and Games</span></div>` |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer"><span aria-hidden="true">Shop Stationery</span></div>` |

All three shop links have their text wrapped in `<span aria-hidden="true">`, making them unnamed and invisible to assistive technology.

#### Recommended Fix

```jsx
// PopularSection.jsx — replace div.shop-link with an <a> or <button>
<a href="/shop/new" className="shop-link">Shop Drinkware</a>
// Remove the aria-hidden span wrapper; keep visible text directly inside the element.
```

**Remediation rationale:** These controls navigate to the products page, so `<a href="…">` is semantically correct. Removing the `aria-hidden` wrapper restores the accessible name.

---

### CI-4 · Filter Option Items Implemented as `<div>` Elements

**Severity:** Critical  
**WCAG:** 1.3.1, 4.1.2, 2.1.1  
**Affects:** Products page (`/shop/new`)  
**Evinced issue types:** Interactable Role, Keyboard Accessible  
**Source file:** `src/components/FilterSidebar.jsx`

#### Affected Elements

13 filter option `<div>` elements across Price, Size, and Brand filter groups:

| Filter Group | Example HTML Snippet |
|---|---|
| Price (4 options) | `<div class="filter-option"><div class="custom-checkbox"></div><span class="filter-option-label">1.00 - 19.99<span class="filter-count">(8)</span></span></div>` |
| Size (5 options: XS–XL) | `<div class="filter-option"><div class="custom-checkbox"></div><span class="filter-option-label">XS<span class="filter-count">(14)</span></span></div>` |
| Brand (3 options) | `<div class="filter-option"><div class="custom-checkbox"></div><span class="filter-option-label">Android<span class="filter-count">(2)</span></span></div>` |

#### Recommended Fix

```jsx
// FilterSidebar.jsx — change div.filter-option to a <label> wrapping a real <input type="checkbox">
<label className="filter-option">
  <input
    type="checkbox"
    checked={isActive}
    onChange={() => onPriceChange(range)}
    className="filter-checkbox-input"
  />
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

**Remediation rationale:** Replacing the `<div>` + fake checkbox pattern with a native `<input type="checkbox">` inside a `<label>` yields: (a) native keyboard focusability and toggle via Space, (b) automatic checkbox semantics announced by screen readers, (c) a large click target via the label, (d) correct checked/unchecked state communication.

---

### CI-5 · Modal Close Buttons Missing Accessible Name

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value), 1.3.1  
**Affects:** All 6 pages (modals are globally rendered)  
**Evinced issue type:** Button-name  
**Source files:** `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`

#### Affected Elements

| CSS Selector | HTML Snippet |
|---|---|
| `.JjN6AKz7a2PRH2gFKW3v` | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg … aria-hidden="true">…</svg></button>` (Cart modal close) |
| `.WEtKZofboSdJ1n7KLpwd` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg … aria-hidden="true">…</svg></button>` (Wishlist modal close) |

Both buttons contain only an icon SVG that is marked `aria-hidden="true"`. The buttons have no `aria-label`, `aria-labelledby`, or visible text, leaving them completely unnamed for screen reader users.

#### Recommended Fix

```jsx
// CartModal.jsx and WishlistModal.jsx — add aria-label to the close button
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg aria-hidden="true">…</svg>
</button>
```

**Remediation rationale:** Icon-only buttons require an explicit accessible name. `aria-label` is the most direct and widely-supported mechanism. The SVG must remain `aria-hidden="true"` to avoid double-announcing the icon description.

---

### CI-6 · Checkout "Continue" Button Implemented as `<div>`

**Severity:** Critical  
**WCAG:** 1.3.1, 4.1.2, 2.1.1  
**Affects:** Checkout — Basket step (`/checkout`)  
**Evinced issue types:** Interactable Role, Keyboard Accessible  
**Source file:** `src/pages/CheckoutPage.jsx`

#### Affected Element

| CSS Selector | HTML Snippet |
|---|---|
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor:pointer">Continue</div>` |

#### Recommended Fix

```jsx
// CheckoutPage.jsx
<button className="checkout-continue-btn" onClick={handleContinue} type="button">
  Continue
</button>
```

**Remediation rationale:** The "Continue" button advances the checkout flow — a critical user action. A `<div>` is invisible to keyboard and screen-reader users. Converting it to a `<button>` restores native keyboard accessibility.

---

### CI-7 · Checkout "Back" Button Implemented as `<div>`

**Severity:** Critical  
**WCAG:** 1.3.1, 4.1.2, 2.1.1  
**Affects:** Checkout — Shipping step (`/checkout` step 2)  
**Evinced issue types:** Interactable Role, Keyboard Accessible  
**Source file:** `src/pages/CheckoutPage.jsx`

#### Affected Element

| CSS Selector | HTML Snippet |
|---|---|
| `.checkout-back-btn` | `<div class="checkout-back-btn" style="cursor:pointer">← Back to Cart</div>` |

#### Recommended Fix

```jsx
// CheckoutPage.jsx
<button className="checkout-back-btn" onClick={handleBack} type="button">
  ← Back to Cart
</button>
```

**Remediation rationale:** Same as CI-6 — action buttons in a multi-step form must be keyboard-reachable native controls.

---

### CI-8 · Order Confirmation "Back to Shop" Link Implemented as `<div>`

**Severity:** Critical  
**WCAG:** 1.3.1, 4.1.2, 2.1.1  
**Affects:** Order Confirmation (`/order-confirmation`)  
**Evinced issue types:** Interactable Role, Keyboard Accessible  
**Source file:** `src/pages/OrderConfirmationPage.jsx`

#### Affected Element

| CSS Selector | HTML Snippet |
|---|---|
| `.confirm-home-link` | `<div class="confirm-home-link" style="cursor:pointer">← Back to Shop</div>` |

#### Recommended Fix

```jsx
// OrderConfirmationPage.jsx — use <Link> (React Router) or <a> since this navigates to /
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Remediation rationale:** This control navigates to the homepage, so `<a>`/`<Link>` is semantically correct. It is natively keyboard-focusable and announced as "link" by screen readers.

---

### CI-9 · Images Missing Alt Text

**Severity:** Critical  
**WCAG:** 1.1.1 (Non-text Content)  
**Affects:** Homepage (`/`)  
**Evinced issue type:** Image-alt  
**Source files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`

#### Affected Elements

| CSS Selector | HTML Snippet | Context |
|---|---|---|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | Hero banner promotional image (HeroBanner.jsx) |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | The Drop promotional image (TheDrop.jsx) |

#### Recommended Fix

```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="New winter tees collection" />

// TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" alt="Limited-edition plushie bag charms" />
```

**Remediation rationale:** Every meaningful image must have an `alt` attribute that conveys its informational purpose. Without `alt`, screen readers fall back to reading the filename. If an image is purely decorative, use `alt=""`.

---

### CI-10 · Invalid ARIA Attribute Values

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value)  
**Affects:** Homepage (`/`), Product Detail (`/product/1`)  
**Evinced issue type:** Aria-valid-attr-value  
**Source files:** `src/components/FeaturedPair.jsx`, `src/pages/ProductPage.jsx`

#### Affected Elements

| CSS Selector | HTML Snippet | Invalid Value | Valid Replacement |
|---|---|---|---|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `aria-expanded="yes"` | `aria-expanded="true"` or remove |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | `aria-expanded="yes"` | `aria-expanded="true"` or remove |
| `.PZdSKB1ULfufQL0NRQ7a` | `<ul … aria-relevant="changes" aria-live="polite">` | `aria-relevant="changes"` | `aria-relevant="additions"` or remove |

The ARIA spec defines `aria-expanded` as accepting only `"true"` or `"false"`. `"yes"` is not a valid token. Similarly, `aria-relevant` accepts the tokens `"additions"`, `"removals"`, `"text"`, and `"all"` — `"changes"` is not a valid value.

#### Recommended Fix

```jsx
// FeaturedPair.jsx — remove aria-expanded entirely (h1 is not a disclosure widget)
<h1>{item.title}</h1>

// ProductPage.jsx — correct aria-relevant to a valid value
// Use "additions text" (most common live-region configuration) or simply remove aria-relevant
<ul className={styles.accessibilityAnnouncer} aria-live="polite" aria-relevant="additions text">
```

**Remediation rationale:** An invalid ARIA attribute value is treated by browsers as if the attribute is absent, but it also signals a defect to validation tools and can confuse AT. `<h1>` has no expandable semantics, so `aria-expanded` must be removed entirely. The `aria-relevant` on a live region should use the valid token `"additions"` (the default) unless removal announcements are specifically needed.

---

### CI-11 · Slider Element Missing Required ARIA Attributes

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value)  
**Affects:** Homepage (`/`)  
**Evinced issue type:** Aria-required-attr  
**Source file:** `src/components/TheDrop.jsx`

#### Affected Element

| CSS Selector | HTML Snippet |
|---|---|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` |

The `slider` role **requires** three attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without them the element is malformed and will be incorrectly interpreted or ignored by screen readers.

#### Recommended Fix

```jsx
// TheDrop.jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-readonly="true"
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Remediation rationale:** ARIA role requirements are non-negotiable; an element using `role="slider"` without the required state attributes is invalid. `aria-valuemin`/`aria-valuemax` define the range, and `aria-valuenow` provides the current position. If the slider is display-only, `aria-readonly="true"` communicates that. If the element has no interactive meaning at all, replacing `role="slider"` with `role="img"` and a descriptive `aria-label` is the simpler alternative.

---

## Part 2 — Non-Critical Issues (Not Remediated)

### S-1 · `<html>` Element Missing `lang` Attribute

**Severity:** Serious  
**WCAG:** 3.1.1 (Language of Page) — WCAG 2.0 Level A  
**Evinced issue type:** Html-has-lang  
**Affects:** All 6 pages (the document shell is shared)  
**Selector:** `html`  
**Issue count:** 6 (one per page, same root cause)

The root `<html>` element has no `lang` attribute. Screen readers rely on this attribute to select the correct language engine and pronunciation rules. Without it, content may be mispronounced.

**Suggested fix:** Add `lang="en"` to the `<html>` element in `public/index.html`:
```html
<html lang="en">
```

---

### S-2 · Insufficient Color Contrast

**Severity:** Serious  
**WCAG:** 1.4.3 (Contrast Minimum) — WCAG 2.0 Level AA  
**Evinced issue type:** Color-contrast  
**Affects:** Homepage, Products, Product Detail, Checkout (Basket), Order Confirmation  
**Issue count:** 18 instances

| Page | Selector | Context |
|---|---|---|
| Homepage | `.hero-content > p` | Hero banner subtitle text |
| Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | Filter count label (price, × 4 options) |
| Products | `.filter-group:nth-child(3) > … > .filter-count` | Filter count label (size, × 4 options) |
| Products | `.filter-option:nth-child(5) > .filter-option-label > .filter-count` | Filter count label (XL size) |
| Products | `.filter-group:nth-child(4) > … > .filter-count` | Filter count label (brand, × 3 options) |
| Products | `.products-found` | "X products found" count text |
| Product Detail | `.tE3CCfWiGRrHgQcKaAUa` | Breadcrumb / secondary text (CSS module class) |
| Checkout (Basket) | `.checkout-step:nth-child(3) > .step-label` | "Review" step label in stepper |
| Checkout (Basket) | `.summary-tax-note` | "Taxes calculated at checkout" note |
| Order Confirmation | `.confirm-order-id-label` | "Order ID" label text |

All instances fail the WCAG 1.4.3 minimum contrast ratio of 4.5:1 for normal text. The subdued gray palette used for secondary/helper text is the common cause.

**Suggested fix:** Increase text color values to meet or exceed 4.5:1 against their background. For example, raise `color: #999` or `color: #aaa` to at least `color: #767676` (which achieves 4.54:1 on white).

---

### S-3 · Invalid Language Code on `<p>` Element

**Severity:** Serious  
**WCAG:** 3.1.2 (Language of Parts) — WCAG 2.0 Level AA  
**Evinced issue type:** Valid-lang  
**Affects:** Homepage (`/`) only  
**Selector:** `p[lang="zz"]`  
**Issue count:** 1

A `<p>` element in `src/components/TheDrop.jsx` carries `lang="zz"`. `zz` is not a valid BCP 47 language tag. Screen readers that encounter an invalid language code may fall back to the document language or apply an incorrect language engine.

**Suggested fix:** Remove the `lang="zz"` attribute if it was added for testing purposes, or replace it with a valid language tag (e.g., `lang="en"` for English content):

```jsx
// TheDrop.jsx — remove invalid lang attribute
<p>{dropText}</p>
```

---

## Appendix A — Issue Count by Type Across All Pages

| Issue Type | Severity | Total Instances |
|---|---|---|
| Interactable Role | Critical | 57 |
| Keyboard Accessible | Critical | 57 |
| Accessible Name | Critical | 14 |
| Button-name | Critical | 11 |
| Aria-valid-attr-value | Critical | 3 |
| Aria-required-attr | Critical | 1 |
| Image-alt | Critical | 2 |
| Color-contrast | Serious | 18 |
| Html-has-lang | Serious | 6 |
| Valid-lang | Serious | 1 |
| **Total** | | **170*** |

> \* The figure 170 represents the raw Evinced issue count before cross-page deduplication. The net distinct-instance total across the 6 CSVs is 169 (the Homepage scan reports 34, not 35, due to one deduplication).

---

## Appendix B — Audit Methodology

1. **Repository scan** — All route definitions were extracted from `src/components/App.jsx`. Five distinct route paths were identified: `/`, `/shop/new`, `/product/:id`, `/checkout`, `/order-confirmation`.

2. **Build and serve** — The React application was built with Webpack production mode (`npm run build`) and served locally via `npx serve dist -p 3000 --single`.

3. **Evinced SDK scan** — Each page was instrumented with the Evinced Playwright SDK (`@evinced/js-playwright-sdk@2.17.0`) using `evAnalyze()`. The checkout and order-confirmation pages required state injection (localStorage cart seed and form interaction) to reach non-trivial UI states.

4. **Result classification** — Issues were classified using Evinced's built-in severity levels. Only "Critical" issues are targeted for remediation in this report; "Serious" issues are documented but deferred.

5. **Raw data** — Per-page CSV reports are stored in `tests/e2e/test-results/a11y-audit/`.

---

## Appendix C — Files Requiring Remediation by Critical Group

| Critical Group | Source File(s) |
|---|---|
| CI-1 (Header icon buttons) | `src/components/Header.jsx` |
| CI-2 (Footer nav divs) | `src/components/Footer.jsx` |
| CI-3 (Popular shop-link divs) | `src/components/PopularSection.jsx` |
| CI-4 (Filter option divs) | `src/components/FilterSidebar.jsx` |
| CI-5 (Modal close button names) | `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx` |
| CI-6 (Checkout continue div) | `src/pages/CheckoutPage.jsx` |
| CI-7 (Checkout back div) | `src/pages/CheckoutPage.jsx` |
| CI-8 (Order confirm home-link div) | `src/pages/OrderConfirmationPage.jsx` |
| CI-9 (Images missing alt) | `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx` |
| CI-10 (Invalid ARIA values) | `src/components/FeaturedPair.jsx`, `src/pages/ProductPage.jsx` |
| CI-11 (Slider missing ARIA attrs) | `src/components/TheDrop.jsx` |
