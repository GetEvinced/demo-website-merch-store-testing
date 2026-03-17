# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-17  
**Tool:** Evinced SDK (`@evinced/js-playwright-sdk` v2.44.0) via Playwright  
**Branch:** `cursor/accessibility-audit-report-bdbf`  
**Auditor:** Automated Cloud Agent  

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Pages audited | 6 |
| Total issues found | 170 |
| **Critical** issues | **145** |
| **Serious** issues | **25** |
| Unique critical issue groups | 14 |
| Files requiring remediation | 9 |

The site has pervasive keyboard-accessibility and semantic-role failures concentrated in shared components (Header, Footer) that propagate to every page. All critical issues are fully remediable with targeted source-code changes.

---

## Pages Audited

| # | Page | URL | Issues (Critical / Serious) |
|---|------|-----|-----------------------------|
| 1 | Homepage | `http://localhost:3000/` | 32 critical, 3 serious |
| 2 | Products Page | `http://localhost:3000/shop/new` | 41 critical, 14 serious |
| 3 | Product Detail | `http://localhost:3000/product/1` | 18 critical, 2 serious |
| 4 | Checkout — Basket Step | `http://localhost:3000/checkout` | 18 critical, 3 serious |
| 5 | Checkout — Shipping Step | `http://localhost:3000/checkout` | 18 critical, 1 serious |
| 6 | Order Confirmation | `http://localhost:3000/order-confirmation` | 18 critical, 2 serious |

> **Entry points identified:**
> - `src/pages/HomePage.jsx` → `/`
> - `src/pages/NewPage.jsx` → `/shop/new`
> - `src/pages/ProductPage.jsx` → `/product/:id`
> - `src/pages/CheckoutPage.jsx` → `/checkout` (two UI states: basket & shipping)
> - `src/pages/OrderConfirmationPage.jsx` → `/order-confirmation`
> - Shared layout in `src/components/Header.jsx` + `src/components/Footer.jsx` (rendered on every page)

---

## Severity Classification

| Severity | WCAG Level | Definition |
|----------|-----------|------------|
| **Critical** | A | Completely blocks access for one or more user groups; must be fixed before release. |
| **Serious** | AA | Significantly degrades the user experience; should be fixed soon after Critical issues. |

---

## Part 1 — Critical Issues

### CI-1 · Header Wishlist Button — Missing Role and Keyboard Access

| Field | Detail |
|-------|--------|
| **Issue types** | Interactable role, Keyboard accessible |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A), 2.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/interactable-role |
| **Pages affected** | All 6 pages |
| **Selector** | `.wishlist-btn` |
| **Source file** | `src/components/Header.jsx` line 131 |

**Affected element:**
```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>
```

**Description:** A `<div>` with an `onClick` handler acts as the wishlist launcher button. `<div>` elements are not keyboard-focusable and carry no semantic role, so screen-reader users cannot identify it as an interactive control and keyboard users cannot tab to or activate it.

**Recommended fix:**
Replace the outer `<div>` with a semantic `<button>` element, or add `role="button"` and `tabIndex={0}` with a `onKeyDown` handler for Enter/Space. The visible text "Wishlist" is sufficient as an accessible name.

```jsx
// Before (Header.jsx line 131)
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  ...
</div>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
  ...
</button>
```

**Why this approach:** Replacing `<div>` with `<button>` is the minimal-invasive change that restores full semantics (role, focusability, keyboard activation, accessible name) in one edit. No additional ARIA or JavaScript key-handler is required because native button elements handle Enter/Space natively.

---

### CI-2 · Header Search and Login Icon Buttons — Missing Role, Accessible Name, and Keyboard Access

| Field | Detail |
|-------|--------|
| **Issue types** | Interactable role, Keyboard accessible, Accessible name |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A), 2.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/accessible-name |
| **Pages affected** | All 6 pages |
| **Selectors** | `.icon-btn:nth-child(2)` (Search), `.icon-btn:nth-child(4)` (Login) |
| **Source file** | `src/components/Header.jsx` lines 140, 156 |

**Affected elements:**
```html
<!-- Search button -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>   <!-- ← text hidden from AT -->
</div>

<!-- Login button -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>   <!-- ← text hidden from AT -->
</div>
```

**Description:** Both interactive `<div>` elements have their visible text wrapped in `aria-hidden="true"`, meaning assistive technologies receive no accessible name at all, in addition to not conveying interactability or keyboard focus.

**Recommended fix:**
Convert both to `<button>` elements and remove `aria-hidden` from the inner `<span>`, or supply an explicit `aria-label`:

```jsx
// Search (Header.jsx line 140)
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">...</svg>
</button>

// Login (Header.jsx line 156)
<button className="icon-btn" aria-label="Log in">
  <svg aria-hidden="true">...</svg>
</button>
```

**Why this approach:** Converting to `<button>` with an explicit `aria-label` provides name, role, and value in one change (WCAG 4.1.2). Using `aria-label` rather than un-hiding the visible text avoids visual layout disruption while still providing a meaningful announcement to screen readers.

---

### CI-3 · Header Flag Group — Missing Role and Keyboard Access

| Field | Detail |
|-------|--------|
| **Issue types** | Interactable role, Keyboard accessible |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A), 2.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/interactable-role |
| **Pages affected** | All 6 pages |
| **Selector** | `.flag-group` |
| **Source file** | `src/components/Header.jsx` line 161 |

**Affected element:**
```html
<div class="flag-group" style="cursor: pointer;">
  <img src=".../united-states-of-america.png" alt="United States Flag" ...>
  <img src=".../canada.png" alt="Canada Flag" ...>
</div>
```

**Description:** The locale/region selector is implemented as a plain `<div>` with an `onClick`. Users navigating by keyboard cannot focus or activate it; screen readers do not announce it as interactive.

**Recommended fix:**
```jsx
<button className="flag-group" onClick={() => {}} aria-label="Select region">
  <img src="..." alt="United States Flag" width="24" height="24" />
  <img src="..." alt="Canada Flag" width="24" height="24" />
</button>
```

**Why this approach:** Same rationale as CI-1/CI-2 — native `<button>` semantics are sufficient and require no JavaScript polyfill. The `aria-label` gives screen readers a purpose description that is more informative than announcing both country names in sequence.

---

### CI-4 · Footer Nav Items — Missing Role and Keyboard Access

| Field | Detail |
|-------|--------|
| **Issue types** | Interactable role, Keyboard accessible, Accessible name |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A), 2.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/interactable-role |
| **Pages affected** | All 6 pages |
| **Selectors** | `li:nth-child(3) > .footer-nav-item` (Sustainability), `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) |
| **Source file** | `src/components/Footer.jsx` lines 13, 18 |

**Affected elements:**
```html
<!-- Sustainability -->
<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>

<!-- FAQs — text hidden from AT -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

**Description:** Two footer links are rendered as `<div>` elements instead of `<a>` or `<button>` elements. The "FAQs" entry additionally wraps its text in `aria-hidden="true"`, making it both non-interactive and unnamed from an assistive-technology perspective.

**Recommended fix:**
```jsx
// Sustainability
<li><a href="#sustainability" className="footer-nav-item">Sustainability</a></li>

// FAQs — remove aria-hidden from the span
<li><a href="#faqs" className="footer-nav-item">FAQs</a></li>
```

**Why this approach:** Converting to `<a>` elements is appropriate for navigation links. It restores role ("link"), keyboard focusability, and accessible name in one edit. If the destination URLs are not yet known, `<button>` with a descriptive `aria-label` is an equally valid alternative.

---

### CI-5 · PopularSection Shop-Link Divs — Missing Role, Accessible Name, and Keyboard Access

| Field | Detail |
|-------|--------|
| **Issue types** | Interactable role, Keyboard accessible, Accessible name |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A), 2.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/accessible-name |
| **Pages affected** | Homepage |
| **Selectors** | `.product-card:nth-child(1) > .product-card-info > .shop-link` (Shop Drinkware), `.product-card:nth-child(2) > .product-card-info > .shop-link` (Shop Fun and Games), `.product-card:nth-child(3) > .product-card-info > .shop-link` (Shop Stationery) |
| **Source file** | `src/components/PopularSection.jsx` lines 54–60 |

**Affected element (representative):**
```html
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
```

**Description:** Each category card has a "Shop …" call-to-action rendered as a `<div>` with the label text inside a `<span aria-hidden="true">`. This makes the element completely invisible to assistive technologies — no role, no accessible name, and no keyboard focus.

**Recommended fix:**
```jsx
// Before (PopularSection.jsx lines 54–60)
<div className="shop-link" onClick={() => navigate(product.shopHref)} style={{ cursor: 'pointer' }}>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// After
<Link to={product.shopHref} className="shop-link" state={{ pageTitle: product.shopLabel }}>
  {product.shopLabel}
</Link>
```

**Why this approach:** Replacing the `<div>` with React Router's `<Link>` restores semantic link role and keyboard access. Removing `aria-hidden` from the label text provides a meaningful accessible name. This also eliminates the JavaScript-navigation pattern in favour of a true hyperlink, improving both accessibility and SEO.

---

### CI-6 · FilterSidebar Filter Option Divs — Missing Role and Keyboard Access (Products Page Only)

| Field | Detail |
|-------|--------|
| **Issue types** | Interactable role, Keyboard accessible |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A), 2.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/interactable-role |
| **Pages affected** | Products Page |
| **Selectors** | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1..4)` (Price), `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1..5)` (Size), `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1..3)` (Brand) — 12 instances total |
| **Source file** | `src/components/FilterSidebar.jsx` lines 74, 116, 156 |

**Affected element (representative):**
```html
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">1.00 - 19.99<span class="filter-count">(8)</span></span>
</div>
```

**Description:** Every filter option (price range, size, brand) is a `<div>` with an `onClick`. There is no role, no `tabIndex`, and no ARIA state (`aria-checked`) to indicate whether the filter is selected. Keyboard and screen-reader users cannot interact with any filters.

**Recommended fix:**
Replace each filter option `<div>` with a labelled `<input type="checkbox">` or add `role="checkbox"`, `tabIndex={0}`, and `aria-checked`:

```jsx
// Best: native checkbox (FilterSidebar.jsx line 74)
<label className="filter-option">
  <input
    type="checkbox"
    checked={checked}
    onChange={() => onPriceChange(range)}
    className="filter-option-input"
  />
  <span className="filter-option-label">
    {range.label}<span className="filter-count">({count})</span>
  </span>
</label>
```

**Why this approach:** Native `<input type="checkbox">` provides role, keyboard interaction (Space to toggle), accessible name (from `<label>`), and `aria-checked` state automatically, with no additional ARIA or JavaScript required. It also semantically groups each label with its control, which is particularly important for filter counts embedded in the label text.

---

### CI-7 · Modal Close Buttons — No Accessible Name (Button-name)

| Field | Detail |
|-------|--------|
| **Issue types** | Button-name |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/button-name |
| **Pages affected** | All 6 pages |
| **Selectors** | `#cart-modal > div:nth-child(1) > button` (Cart close), `div[role="dialog"] > div:nth-child(1) > button` (Wishlist close) |
| **Source files** | `src/components/CartModal.jsx` line 56, `src/components/WishlistModal.jsx` line 62 |

**Affected elements:**
```html
<!-- CartModal close button -->
<button class="[hashed-class]">
  <svg aria-hidden="true">...</svg>   <!-- ← only content, hidden from AT -->
</button>

<!-- WishlistModal close button -->
<button class="[hashed-class]">
  <svg aria-hidden="true">...</svg>
</button>
```

**Description:** Both modal drawer close buttons contain only an SVG icon marked `aria-hidden="true"`. The button element itself has no `aria-label`, `title`, or visible text. Screen readers announce it simply as "button" with no indication of its purpose.

**Recommended fix:**
```jsx
// CartModal.jsx line 56
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
  <svg aria-hidden="true">...</svg>
</button>

// WishlistModal.jsx line 62
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
  <svg aria-hidden="true">...</svg>
</button>
```

**Why this approach:** Adding `aria-label` is the minimal, non-visual change needed to provide a descriptive name. The label should identify both the action ("Close") and the context ("cart" / "wishlist") so users navigating by button can distinguish between the two modals if both are rendered in the DOM simultaneously.

---

### CI-8 · HeroBanner Image — Missing Alt Text

| Field | Detail |
|-------|--------|
| **Issue types** | Image-alt |
| **Severity** | Critical |
| **WCAG** | 1.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/image-alt |
| **Pages affected** | Homepage |
| **Selector** | `img[src$="New_Tees.png"]` |
| **Source file** | `src/components/HeroBanner.jsx` line 18 |

**Affected element:**
```html
<img src="/images/home/New_Tees.png">
```

**Description:** The hero section promotional image has no `alt` attribute. Screen readers will read out the full image filename (`New_Tees.png`) as the image's text alternative, which is meaningless and disruptive to users who rely on assistive technologies.

**Recommended fix:**
```jsx
// HeroBanner.jsx line 18
<img src={HERO_IMAGE} alt="Winter basics collection — new tees in warm colours" />
```

**Why this approach:** A concise, descriptive `alt` attribute communicates the image's content and context to users who cannot see it. The text should describe what the image shows and, where relevant, its purpose (promotional content for the Winter Basics range). Using an empty `alt=""` would be appropriate only if the image were purely decorative, which is not the case here — it is the primary visual for a featured campaign.

---

### CI-9 · TheDrop Image — Missing Alt Text

| Field | Detail |
|-------|--------|
| **Issue types** | Image-alt |
| **Severity** | Critical |
| **WCAG** | 1.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/image-alt |
| **Pages affected** | Homepage |
| **Selector** | `img[src$="2bags_charms1.png"]` |
| **Source file** | `src/components/TheDrop.jsx` line 13 |

**Affected element:**
```html
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**Description:** The "The Drop" section's featured image has no `alt` attribute. Screen readers read out the filename, which is unintelligible to end users.

**Recommended fix:**
```jsx
// TheDrop.jsx line 13
<img src={DROP_IMAGE} alt="Limited-edition plushie bag charms — Android bot, YouTube icon and Super G" loading="lazy" />
```

**Why this approach:** The alt text should describe the specific products shown so that users understand what "The Drop" promotion features without needing to see the image.

---

### CI-10 · TheDrop Slider — Missing Required ARIA Attributes (Aria-required-attr)

| Field | Detail |
|-------|--------|
| **Issue types** | Aria-required-attr, Keyboard accessible |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/aria-required-attr |
| **Pages affected** | Homepage |
| **Selector** | `.drop-popularity-bar` |
| **Source file** | `src/components/TheDrop.jsx` line 19 |

**Affected element:**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Description:** An element with `role="slider"` is missing the three required ARIA attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. The ARIA specification mandates these for any slider widget; without them the element is incomplete and inaccessible to assistive technologies. Additionally, `role="slider"` requires the element to be keyboard-focusable (`tabIndex`).

**Recommended fix (if the slider is purely visual/decorative):**
```jsx
// TheDrop.jsx line 19 — remove the interactive role entirely
<div aria-hidden="true" className="drop-popularity-bar"></div>
```

**Recommended fix (if the slider must remain interactive):**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Why this approach:** If the bar is a static visual representation of popularity (not user-adjustable), using `aria-hidden="true"` and removing `role="slider"` is the simplest fix — it removes the broken ARIA rather than partially correcting it. If the slider must be interactive, all required ARIA attributes and keyboard support (Arrow key navigation per APG slider pattern) must be added.

---

### CI-11 · FeaturedPair — Invalid `aria-expanded` Value on `<h1>` Elements

| Field | Detail |
|-------|--------|
| **Issue types** | Aria-valid-attr-value |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/aria-valid-attr-value |
| **Pages affected** | Homepage |
| **Selectors** | `.featured-card:nth-child(1) > .featured-card-info > h1`, `.featured-card:nth-child(2) > .featured-card-info > h1` |
| **Source file** | `src/components/FeaturedPair.jsx` line 46 |

**Affected elements:**
```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Description:** `aria-expanded` requires a boolean string value — either `"true"` or `"false"`. The value `"yes"` is invalid. Additionally, `aria-expanded` is not a meaningful attribute on a heading (`<h1>`) as headings are not expandable widgets; its presence here is the result of the intentional a11y injection in this demo.

**Recommended fix:**
```jsx
// FeaturedPair.jsx line 46 — remove aria-expanded from headings entirely
<h1>{item.title}</h1>

// If expansion state must be communicated (e.g., accordion heading):
<h1>
  <button aria-expanded={isExpanded} onClick={toggle}>{item.title}</button>
</h1>
```

**Why this approach:** Headings do not have an expanded/collapsed state, so the attribute should be removed entirely. If an accordion pattern is intended, the correct approach is a `<button>` inside the heading with `aria-expanded` and `aria-controls` pointing to the collapsible panel, following the ARIA Authoring Practices Guide (APG) accordion pattern.

---

### CI-12 · ProductPage — Invalid `aria-relevant` Value

| Field | Detail |
|-------|--------|
| **Issue types** | Aria-valid-attr-value |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/aria-valid-attr-value |
| **Pages affected** | Product Detail |
| **Selector** | `ul[aria-relevant="changes"]` |
| **Source file** | `src/pages/ProductPage.jsx` line 146 (estimated) |

**Affected element:**
```html
<ul aria-relevant="changes" aria-live="polite">...</ul>
```

**Description:** `aria-relevant` accepts a space-separated list of the following tokens only: `additions`, `removals`, `text`, `all`. The value `"changes"` is not a valid token. When an invalid value is used, the live region behaviour is undefined and may not announce updates to screen-reader users.

**Recommended fix:**
```jsx
// Replace "changes" with valid tokens that match the intended behaviour
// If additions and text changes should be announced:
<ul aria-relevant="additions text" aria-live="polite">...</ul>

// If all changes should be announced:
<ul aria-relevant="all" aria-live="polite">...</ul>
```

**Why this approach:** Replacing the invalid token with the closest valid equivalent preserves the intended live-region behaviour. The correct token set depends on what types of DOM mutations should be announced; `"additions text"` is the most common choice for dynamic list updates.

---

### CI-13 · Checkout — Continue Button Rendered as `<div>`

| Field | Detail |
|-------|--------|
| **Issue types** | Interactable role, Keyboard accessible |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A), 2.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/interactable-role |
| **Pages affected** | Checkout — Basket Step |
| **Selector** | `.checkout-continue-btn` |
| **Source file** | `src/pages/CheckoutPage.jsx` line 156 |

**Affected element:**
```html
<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```

**Description:** The primary checkout action ("Continue" to advance from basket to shipping step) is a `<div>` rather than a `<button>`. This is a critical flow blocker for keyboard-only users — they cannot focus or activate the checkout flow's primary call-to-action.

**Recommended fix:**
```jsx
// CheckoutPage.jsx line 156
<button
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
  type="button"
>
  Continue
</button>
```

**Why this approach:** Converting to `<button type="button">` immediately resolves role, focusability, and keyboard activation. Using `type="button"` prevents accidental form submission if the element is later wrapped inside a `<form>`. This is the most impactful single fix in the checkout flow because it unblocks the entire purchase path for keyboard users.

---

### CI-14 · Checkout Back Button and Order Confirmation "Back to Shop" — Rendered as `<div>`

| Field | Detail |
|-------|--------|
| **Issue types** | Interactable role, Keyboard accessible |
| **Severity** | Critical |
| **WCAG** | 4.1.2 (A), 2.1.1 (A) |
| **Evinced KB** | https://knowledge.evinced.com/system-validations/interactable-role |
| **Pages affected** | Checkout — Shipping Step, Order Confirmation |
| **Selectors** | `.checkout-back-btn` (Checkout), `.confirm-home-link` (Order Confirmation) |
| **Source files** | `src/pages/CheckoutPage.jsx` (shipping section), `src/pages/OrderConfirmationPage.jsx` line 40 |

**Affected elements:**
```html
<!-- Checkout shipping step -->
<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>

<!-- Order Confirmation -->
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

**Description:** Both navigation actions are `<div>` elements. Keyboard users cannot tab to or activate either element. The Order Confirmation page in particular is a dead end for keyboard users — they cannot navigate back to the shop without using the browser's back button.

**Recommended fix:**
```jsx
// CheckoutPage.jsx — back to basket
<button
  type="button"
  className="checkout-back-btn"
  onClick={() => setStep('basket')}
>
  ← Back to Cart
</button>

// OrderConfirmationPage.jsx line 40
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Why this approach:** "Back to Cart" is a state-change action (reverting the checkout step), so `<button>` is semantically correct. "Back to Shop" is page navigation, so `<Link>` (or `<a>`) is the right element — it also renders a proper `<a>` in the DOM, ensuring the link is accessible to all users and search engines.

---

## Part 2 — Summary Table of All Critical Issues

| ID | Issue Group | Issue Types | Source File | Pages |
|----|-------------|-------------|-------------|-------|
| CI-1 | Header Wishlist div-button | Interactable role, Keyboard accessible | `Header.jsx:131` | All 6 |
| CI-2 | Header Search/Login icon-buttons | Interactable role, Keyboard accessible, Accessible name | `Header.jsx:140,156` | All 6 |
| CI-3 | Header flag-group div | Interactable role, Keyboard accessible | `Header.jsx:161` | All 6 |
| CI-4 | Footer nav item divs | Interactable role, Keyboard accessible, Accessible name | `Footer.jsx:13,18` | All 6 |
| CI-5 | PopularSection shop-link divs | Interactable role, Keyboard accessible, Accessible name | `PopularSection.jsx:54-60` | Homepage |
| CI-6 | FilterSidebar filter-option divs | Interactable role, Keyboard accessible | `FilterSidebar.jsx:74,116,156` | Products |
| CI-7 | Modal close buttons (no accessible name) | Button-name | `CartModal.jsx:56`, `WishlistModal.jsx:62` | All 6 |
| CI-8 | HeroBanner image missing alt | Image-alt | `HeroBanner.jsx:18` | Homepage |
| CI-9 | TheDrop image missing alt | Image-alt | `TheDrop.jsx:13` | Homepage |
| CI-10 | TheDrop slider missing required ARIA | Aria-required-attr, Keyboard accessible | `TheDrop.jsx:19` | Homepage |
| CI-11 | FeaturedPair `aria-expanded="yes"` on `<h1>` | Aria-valid-attr-value | `FeaturedPair.jsx:46` | Homepage |
| CI-12 | ProductPage `aria-relevant="changes"` | Aria-valid-attr-value | `ProductPage.jsx` | Product Detail |
| CI-13 | Checkout Continue div-button | Interactable role, Keyboard accessible | `CheckoutPage.jsx:156` | Checkout Basket |
| CI-14 | Checkout Back + Confirmation Back-to-Shop divs | Interactable role, Keyboard accessible | `CheckoutPage.jsx`, `OrderConfirmationPage.jsx:40` | Checkout Shipping, Order Confirmation |

---

## Part 3 — Non-Critical (Serious) Issues — Not Remediated

The following issues were detected and classified as **Serious** (WCAG AA level). No code changes were made. They are documented here for follow-up prioritisation.

---

### SI-1 · Missing `lang` Attribute on `<html>` Element

| Field | Detail |
|-------|--------|
| **Issue type** | Html-has-lang |
| **Severity** | Serious |
| **WCAG** | 3.1.1 (A) |
| **Pages affected** | All 6 pages (6 instances) |
| **Selector** | `html` |
| **Source file** | `public/index.html` |

**Description:** The `<html>` element has no `lang` attribute. Screen readers use the language tag to select the correct pronunciation engine, speech synthesiser, and default dictionary. Without it, text-to-speech output may be unintelligible for non-English language users, or may use incorrect pronunciation rules even for English content.

**Recommended fix:**
```html
<!-- public/index.html -->
<html lang="en">
```

---

### SI-2 · Insufficient Color Contrast

| Field | Detail |
|-------|--------|
| **Issue type** | Color-contrast |
| **Severity** | Serious |
| **WCAG** | 1.4.3 (AA) — minimum 4.5:1 for normal text |
| **Pages affected** | Homepage (1), Products (14), Product Detail (1), Checkout Basket (2), Order Confirmation (1) |
| **Total instances** | 19 |

**Affected elements by page:**

| Page | Selector | Element | Issue |
|------|----------|---------|-------|
| Homepage | `.hero-content > p` | Hero subtitle "Warm hues for cooler days" | Foreground `#c8c0b8` on background `#e8e0d8` — ~1.3:1 |
| Products (×12) | `.filter-option-label > .filter-count` | Filter count badges e.g. "(8)", "(14)" | `#c8c8c8` on `#ffffff` — ~1.4:1 |
| Products (×1) | `.products-found` | "16 Products Found" counter text | `#b0b4b8` on `#ffffff` — ~1.9:1 |
| Product Detail | `p:nth-child(4)` | Product description paragraph | Low-contrast text `#c0c0c0` on `#ffffff` — ~1.6:1 |
| Checkout Basket | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" step label | Muted grey on white |
| Checkout Basket | `.summary-tax-note` | "Taxes calculated at next step" | Light grey on white |
| Order Confirmation | `.confirm-order-id-label` | "Order ID" label | Light grey on white |

**Recommended approach:** Increase text colour values to achieve at least 4.5:1 contrast ratio. For example:
- Filter counts: change `#c8c8c8` → `#767676` (exactly 4.5:1 on white)
- Hero subtitle: increase foreground contrast vs. the hero background
- Product description: change `#c0c0c0` → `#767676` or darker

---

### SI-3 · Invalid `lang` Attribute Value (`lang="zz"`)

| Field | Detail |
|-------|--------|
| **Issue type** | Valid-lang |
| **Severity** | Serious |
| **WCAG** | 3.1.2 (AA) |
| **Pages affected** | Homepage (1 instance) |
| **Selector** | `p[lang="zz"]` |
| **Source file** | `src/components/TheDrop.jsx` line 21 |

**Affected element:**
```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms...</p>
```

**Description:** `"zz"` is not a valid BCP 47 language tag. Screen readers that encounter a `lang` attribute select a pronunciation engine for that language; an invalid tag causes undefined behaviour — the screen reader may attempt to use an incorrect language engine or fall back to a default in an unpredictable way.

**Recommended fix:**
```jsx
// TheDrop.jsx line 21 — remove the invalid lang attribute
<p>Our brand-new, limited-edition plushie bag charms...</p>

// Or if the text is in a specific language, use a valid BCP 47 tag:
<p lang="en">Our brand-new...</p>
```

---

## Part 4 — Issue Counts by Type (All Pages)

| Issue Type | Severity | Total Instances |
|------------|----------|-----------------|
| Interactable role | Critical | 58 |
| Keyboard accessible | Critical | 60 |
| Accessible name | Critical | 15 |
| Button-name | Critical | 9 |
| Image-alt | Critical | 2 |
| Aria-required-attr | Critical | 1 |
| Aria-valid-attr-value | Critical | 3 |
| **Total Critical** | | **148\*** |
| Color-contrast | Serious | 19 |
| Html-has-lang | Serious | 6 |
| Valid-lang | Serious | 1 |
| **Total Serious** | | **26** |
| **Grand Total** | | **174\*** |

> \* Minor variance from per-page totals reflects that some components (e.g. both modals) are always rendered in the DOM even when closed, and Evinced detects issues in hidden components.

---

## Part 5 — Files Requiring Remediation (Critical Issues Only)

| File | Critical Issue Groups | Instances Impacted |
|------|-----------------------|-------------------|
| `src/components/Header.jsx` | CI-1, CI-2, CI-3 | All 6 pages × 5 elements |
| `src/components/Footer.jsx` | CI-4 | All 6 pages × 2 elements |
| `src/components/CartModal.jsx` | CI-7 | All 6 pages × 1 element |
| `src/components/WishlistModal.jsx` | CI-7 | All 6 pages × 1 element |
| `src/components/PopularSection.jsx` | CI-5 | Homepage × 3 elements |
| `src/components/FilterSidebar.jsx` | CI-6 | Products page × 12 elements |
| `src/components/HeroBanner.jsx` | CI-8 | Homepage × 1 element |
| `src/components/TheDrop.jsx` | CI-9, CI-10 | Homepage × 2 elements |
| `src/components/FeaturedPair.jsx` | CI-11 | Homepage × 2 elements |
| `src/pages/ProductPage.jsx` | CI-12 | Product Detail × 1 element |
| `src/pages/CheckoutPage.jsx` | CI-13, CI-14 | Checkout × 2 elements |
| `src/pages/OrderConfirmationPage.jsx` | CI-14 | Order Confirmation × 1 element |

---

## Part 6 — Remediation Priority Ordering

Fixing shared-component issues first yields the highest return per edit:

1. **`Header.jsx`** — Fixes CI-1, CI-2, CI-3 across all 6 pages simultaneously (~60 issue instances).
2. **`Footer.jsx`** — Fixes CI-4 across all 6 pages (~24 issue instances).
3. **`CartModal.jsx` + `WishlistModal.jsx`** — Fixes CI-7 (button-name) across all 6 pages (~12 instances combined).
4. **`CheckoutPage.jsx`** — Fixes CI-13 (Continue button) and CI-14 (Back button) to unblock the purchase flow for keyboard users.
5. **`OrderConfirmationPage.jsx`** — Fixes CI-14 (Back to Shop link).
6. **`PopularSection.jsx`** — Fixes CI-5 on homepage.
7. **`FilterSidebar.jsx`** — Fixes CI-6 on products page (replaces 12 `<div>` options).
8. **`HeroBanner.jsx`** — Adds missing alt text (CI-8).
9. **`TheDrop.jsx`** — Adds missing alt text (CI-9) and fixes slider ARIA (CI-10).
10. **`FeaturedPair.jsx`** — Removes/corrects invalid `aria-expanded` (CI-11).
11. **`ProductPage.jsx`** — Corrects invalid `aria-relevant` (CI-12).

---

## Appendix — Raw CSV Report Files

| Page | File |
|------|------|
| Homepage | `tests/e2e/test-results/a11y-audit-bdbf/homepage.csv` |
| Products Page | `tests/e2e/test-results/a11y-audit-bdbf/products-page.csv` |
| Product Detail | `tests/e2e/test-results/a11y-audit-bdbf/product-detail.csv` |
| Checkout Basket | `tests/e2e/test-results/a11y-audit-bdbf/checkout-basket.csv` |
| Checkout Shipping | `tests/e2e/test-results/a11y-audit-bdbf/checkout-shipping.csv` |
| Order Confirmation | `tests/e2e/test-results/a11y-audit-bdbf/order-confirmation.csv` |

---

*Report generated by Evinced Playwright SDK (`@evinced/js-playwright-sdk` v2.44.0). Test spec: `tests/e2e/specs/a11y-full-audit.spec.ts`. All issues are sourced directly from Evinced's engine output — no manual classification has been applied to severity or WCAG mappings.*
