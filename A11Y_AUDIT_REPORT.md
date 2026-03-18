# Accessibility Audit Report

**Repository:** Demo E-Commerce Website (Google Merch Store Clone)  
**Audit Date:** 2026-03-18  
**Tool:** Evinced Playwright SDK (`@evinced/js-playwright-sdk` v2.17.0)  
**Branch:** `cursor/accessibility-audit-report-f1e4`

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| Pages audited | 6 (including 2 checkout states) |
| Total issues detected | **218** |
| **Critical** | **187** |
| Serious | 31 |
| Issue types | 10 distinct types |
| WCAG levels affected | A, AA |

The site contains a significant number of accessibility barriers, primarily concentrated in global shared components (Header, Footer) that appear on every page. The most prevalent problems are non-keyboard-accessible interactive elements and missing semantic roles — both originating from `<div>` elements being used in place of semantic HTML controls. These issues directly block keyboard-only users and screen-reader users from core interactions.

---

## 2. Pages Audited

| # | Page | URL | Entry Point |
|---|---|---|---|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` |
| 2 | New Products | `/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `/product/1` | `src/pages/ProductPage.jsx` |
| 4 | Checkout — Basket step | `/checkout` (state 1) | `src/pages/CheckoutPage.jsx` |
| 5 | Checkout — Shipping & Payment step | `/checkout` (state 2) | `src/pages/CheckoutPage.jsx` |
| 6 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

**Routing configuration:** `src/components/App.jsx` (React Router v7, `BrowserRouter`)

---

## 3. Issue Count by Page

| Page | Total | Critical | Serious |
|---|---|---|---|
| Homepage (`/`) | 35 | 32 | 3 |
| New Products (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/1`) | 20 | 18 | 2 |
| Checkout — Basket | 54 | 48 | 6 |
| Checkout — Shipping | 19 | 16 | 3 |
| Order Confirmation | 35 | 32 | 3 |
| **Total** | **218** | **187** | **31** |

---

## 4. Issue Type Summary

| Issue Type | Severity | Count | Pages Affected |
|---|---|---|---|
| `NOT_FOCUSABLE` — Non-keyboard-accessible interactive elements | Critical | 66 | All 6 |
| `WRONG_SEMANTIC_ROLE` — Interactive elements with no semantic role | Critical | 63 | All 6 |
| `NO_DESCRIPTIVE_TEXT` — Interactive elements with no accessible name | Critical | 30 | All 6 |
| `AXE-BUTTON-NAME` — Buttons without accessible names | Critical | 12 | All 6 |
| `AXE-ARIA-VALID-ATTR-VALUE` — Invalid ARIA attribute values | Critical | 7 | 4 |
| `AXE-IMAGE-ALT` — Images missing alt text | Critical | 6 | 3 |
| `AXE-ARIA-REQUIRED-ATTR` — Required ARIA attributes missing | Critical | 3 | 3 |
| `AXE-COLOR-CONTRAST` — Insufficient color contrast | Serious | 21 | All 6 |
| `AXE-HTML-HAS-LANG` — `<html>` missing `lang` attribute | Serious | 7 | All 6 |
| `AXE-VALID-LANG` — Invalid `lang` attribute value | Serious | 3 | 3 |

---

## 5. Critical Issues — Detailed Analysis

### CI-1: Non-Keyboard-Accessible Interactive Elements (`NOT_FOCUSABLE`)

**Severity:** Critical  
**WCAG:** 2.1.1 — Keyboard (Level A)  
**Issue count:** 66 occurrences across all 6 pages  
**Evinced type ID:** `NOT_FOCUSABLE`

#### Description

Interactive `<div>` elements with `onClick` handlers and `cursor: pointer` styling are not reachable by keyboard navigation (Tab key). They do not participate in the natural tab order and have no `tabindex` attribute, making them completely inaccessible to users who cannot use a pointing device.

#### Affected Elements

| Element Selector | Source File | Line(s) | Pages Affected |
|---|---|---|---|
| `div.icon-btn.wishlist-btn` | `src/components/Header.jsx` | 131 | All 6 |
| `div.icon-btn:nth-child(2)` (search icon) | `src/components/Header.jsx` | 140 | All 6 |
| `div.icon-btn:nth-child(4)` (user/account icon) | `src/components/Header.jsx` | 156 | All 6 |
| `div.flag-group` (country flag / language selector) | `src/components/Header.jsx` | 161 | All 6 |
| `div.shop-link` ("Shop Drinkware" etc.) | `src/components/PopularSection.jsx` | 55–59 | Homepage, Checkout Basket, Order Confirmation |
| `div.filter-option` (Price/Size/Brand checkboxes) | `src/components/FilterSidebar.jsx` | 74, 116, 156 | New Products |
| `div.footer-nav-item` (Sustainability, FAQs) | `src/components/Footer.jsx` | 13, 18 | All 6 |
| `div.drop-popularity-bar` (slider with `role="slider"`) | `src/components/TheDrop.jsx` | 18–19 | Homepage, Checkout Basket, Order Confirmation |

#### DOM Snippets (Representative)

```html
<!-- Header.jsx — Wishlist button -->
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

<!-- FilterSidebar.jsx — Custom checkbox -->
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">XS<span class="filter-count">(14)</span></span>
</div>

<!-- Footer.jsx — Nav item -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

#### Recommended Fix

Replace `<div>` interactive elements with semantically correct native HTML elements, or add `tabIndex="0"` combined with a keyboard event handler (`onKeyDown` for Enter/Space):

**Option A — Preferred: Replace with native element**
```jsx
// Before (Header.jsx, line 131)
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
```

**Option B — For elements that must remain `<div>`: Add keyboard support**
```jsx
// Before (FilterSidebar.jsx, line 74)
<div key={range.label} className="filter-option" onClick={() => onPriceChange(range)}>

// After
<div
  key={range.label}
  className="filter-option"
  role="checkbox"
  aria-checked={checked}
  tabIndex={0}
  onClick={() => onPriceChange(range)}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPriceChange(range); }}
>
```

#### Rationale

Native HTML elements (`<button>`, `<a>`, `<input type="checkbox">`) provide built-in keyboard accessibility, focus styles, and ARIA semantics at no additional cost. This is the single most impactful fix because it resolves CI-1, CI-2, and partially CI-3 simultaneously — addressing 159 of the 187 critical occurrences.

---

### CI-2: Missing Semantic Roles on Interactive Elements (`WRONG_SEMANTIC_ROLE`)

**Severity:** Critical  
**WCAG:** 4.1.2 — Name, Role, Value (Level A)  
**Issue count:** 63 occurrences across all 6 pages  
**Evinced type ID:** `WRONG_SEMANTIC_ROLE`

#### Description

The same `<div>` elements identified in CI-1 also lack any ARIA role that communicates their interactive purpose. Screen readers announce these elements as generic containers ("group" or nothing), giving users no indication that they can be activated. This is a distinct violation from CI-1: even if a `<div>` had `tabIndex="0"`, without `role="button"` or `role="checkbox"`, assistive technologies do not know how to interact with it.

#### Affected Elements

The affected element set is identical to CI-1 (see table above). The root cause is the same: `<div>` acting as an interactive control without semantic HTML.

#### DOM Snippets (Representative)

```html
<!-- PopularSection.jsx — "Shop Drinkware" link acting as a div -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>

<!-- Header.jsx — Account/user icon button -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
</div>
```

#### Recommended Fix

This is fixed by the same action described in CI-1. Using `<button>` gives `role="button"` implicitly; using `<a href>` gives `role="link"` implicitly; using `<input type="checkbox">` gives `role="checkbox"` implicitly. If `<div>` must be retained, add `role="button"` (or the appropriate role) alongside `tabIndex="0"`.

```jsx
// PopularSection.jsx — replace div with an <a> or <button>
// Before
<div className="shop-link" style={{cursor:'pointer'}} onClick={handleShopClick}>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// After
<a href={product.shopHref} className="shop-link">
  {product.shopLabel}
</a>
```

#### Rationale

The `<a>` element is semantically correct for navigation, announces as "link" to screen readers, and automatically becomes keyboard-focusable. Replacing the `<div>` is always preferred over patching with `role=` because native elements are more robustly supported across AT/browser combinations.

---

### CI-3: Interactive Elements Without Accessible Names (`NO_DESCRIPTIVE_TEXT`)

**Severity:** Critical  
**WCAG:** 4.1.2 — Name, Role, Value (Level A); 1.3.1 — Info and Relationships (Level A)  
**Issue count:** 30 occurrences across all 6 pages  
**Evinced type ID:** `NO_DESCRIPTIVE_TEXT`

#### Description

Interactive elements have no accessible name that a screen reader can announce. This occurs in two patterns:

1. **`aria-hidden="true"` on the only visible text child**, making the text invisible to AT while the container has no other accessible name.
2. **Icon-only `<div>` buttons** containing SVGs that are `aria-hidden`, with no `aria-label`.

#### Affected Elements

| Element Selector | Source File | Pattern | Pages |
|---|---|---|---|
| `div.icon-btn:nth-child(2)` (search icon) | `src/components/Header.jsx` | Icon-only, aria-hidden SVG | All 6 |
| `div.icon-btn:nth-child(4)` (user icon) | `src/components/Header.jsx` | Icon-only, aria-hidden SVG | All 6 |
| `div.shop-link` ("Shop Drinkware" etc.) | `src/components/PopularSection.jsx` | `aria-hidden="true"` on text | Homepage, Checkout Basket, Order Confirmation |
| `div.footer-nav-item` ("FAQs") | `src/components/Footer.jsx` | `aria-hidden="true"` on text | All 6 |

#### DOM Snippets (Representative)

```html
<!-- PopularSection.jsx — visible label hidden from AT -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>

<!-- Footer.jsx — visible text hidden from AT -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>

<!-- Header.jsx — icon-only button, no label -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
</div>
```

#### Recommended Fix

**Pattern 1 — Remove unnecessary `aria-hidden`:**
```jsx
// Footer.jsx — Before
<div className="footer-nav-item" onClick={() => {}}>
  <span aria-hidden="true">FAQs</span>
</div>

// After (also converted to <button> per CI-1/CI-2 fix)
<button className="footer-nav-item">FAQs</button>
```

**Pattern 2 — Add `aria-label` to icon-only buttons:**
```jsx
// Header.jsx — Before
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
</div>

// After
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
</button>
```

#### Rationale

`aria-hidden="true"` on text that is visually rendered hides it from assistive technologies without hiding it visually, creating a disconnect. The correct approach is to remove `aria-hidden` and let the element's text serve as its accessible name naturally. For icon-only controls, `aria-label` is the standard mechanism for naming a control that has no visible text.

---

### CI-4: Buttons Without Accessible Names (`AXE-BUTTON-NAME`)

**Severity:** Critical  
**WCAG:** 4.1.2 — Name, Role, Value (Level A)  
**Issue count:** 12 occurrences across all 6 pages  
**Evinced type ID:** `AXE-BUTTON-NAME` (axe-core rule: `button-name`)

#### Description

Two modal close buttons — in `CartModal` and `WishlistModal` — are `<button>` elements (correct) but contain only icon SVGs marked `aria-hidden="true"`. This produces a button with an empty accessible name. Screen readers announce it as "button" or skip it, giving users no way to identify or activate the close action.

#### Affected Elements

| Element Selector | Source File | Line | Pages |
|---|---|---|---|
| `#cart-modal > div:nth-child(1) > button` | `src/components/CartModal.jsx` | 55–58 | All 6 |
| `div[role="dialog"] > div:nth-child(1) > button` | `src/components/WishlistModal.jsx` | 60–64 | All 6 |

#### DOM Snippets

```html
<!-- CartModal close button -->
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>

<!-- WishlistModal close button -->
<button class="WEtKZofboSdJ1n7KLpwd">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

#### Recommended Fix

Add `aria-label` attributes to both close buttons:

```jsx
// CartModal.jsx — Before (line 57)
<button className={styles.closeBtn} onClick={closeCart}>

// After
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
```

```jsx
// WishlistModal.jsx — Before (line 63)
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist}>

// After
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
```

#### Rationale

`aria-label` is the ARIA-recommended way to provide an accessible name when a button's visual label is an icon. The label text is chosen to be action-oriented ("Close cart" rather than just "Close") so screen reader users understand which modal they are closing, which is especially important when multiple modals can be open or when context is unclear.

---

### CI-5: Invalid ARIA Attribute Values (`AXE-ARIA-VALID-ATTR-VALUE`)

**Severity:** Critical  
**WCAG:** 4.1.2 — Name, Role, Value (Level A)  
**Issue count:** 7 occurrences across 4 pages  
**Evinced type ID:** `AXE-ARIA-VALID-ATTR-VALUE` (axe-core rule: `aria-valid-attr-value`)

#### Description

ARIA attributes are present but contain invalid values, which causes assistive technologies to either ignore the attribute or behave unexpectedly.

Three distinct violations are present:

| Violation | Invalid Value | Valid Values | Source File | Line |
|---|---|---|---|---|
| `aria-expanded="yes"` | `"yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx` | 46 |
| `aria-relevant="changes"` | `"changes"` | space-separated tokens: `additions`, `removals`, `text`, `all` | `src/pages/ProductPage.jsx` | 146 |
| `aria-sort="newest"` | `"newest"` | `"ascending"`, `"descending"`, `"none"`, `"other"` | `src/pages/NewPage.jsx` | 218 |

#### Affected Elements

**`aria-expanded="yes"` — FeaturedPair.jsx**
```html
<!-- Appears on 2 cards; shown on Homepage, Checkout Basket, Order Confirmation -->
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**`aria-relevant="changes"` — ProductPage.jsx**
```html
<!-- Product Detail page only -->
<ul aria-relevant="changes" aria-live="polite">…</ul>
```

**`aria-sort="newest"` — NewPage.jsx**
```html
<!-- New Products page only -->
<div aria-sort="newest" role="columnheader">Sort indicator</div>
```

#### Recommended Fixes

**Fix 1 — `FeaturedPair.jsx` line 46:**
The `aria-expanded` attribute is semantically meaningless on a static `<h1>` heading. Remove it entirely:
```jsx
// Before
<h1 aria-expanded="yes">{item.title}</h1>

// After
<h1>{item.title}</h1>
```

**Fix 2 — `ProductPage.jsx` line 146:**
Change `aria-relevant` to a valid token set. Since the live region announces product list additions, the appropriate value is `"additions text"`:
```jsx
// Before
<ul aria-relevant="changes" aria-live="polite">

// After
<ul aria-relevant="additions text" aria-live="polite">
```

**Fix 3 — `NewPage.jsx` line 218:**
Change `aria-sort` to the closest valid value. Since "newest" implies descending chronological order:
```jsx
// Before
<div aria-sort="newest" role="columnheader">Sort indicator</div>

// After
<div aria-sort="descending" role="columnheader">Sort indicator</div>
```

#### Rationale

ARIA attribute values are strictly enumerated. Screen readers implement the specification literally — a value not in the allowed set is treated as if the attribute were absent or may trigger unexpected behavior. Each fix uses the nearest semantically correct valid value. For `aria-expanded` on a heading, removal is correct because `aria-expanded` should only be applied to expandable/collapsible widgets; applying it to a static heading is a semantic error.

---

### CI-6: Images Missing Alternative Text (`AXE-IMAGE-ALT`)

**Severity:** Critical  
**WCAG:** 1.1.1 — Non-text Content (Level A)  
**Issue count:** 6 occurrences across 3 pages  
**Evinced type ID:** `AXE-IMAGE-ALT` (axe-core rule: `image-alt`)

#### Description

Two content images have no `alt` attribute. Screen readers will either read the image filename as content (e.g., "slash images slash home slash New underscore Tees dot P N G") or skip the image entirely, depending on the AT. Both images convey meaningful product/promotional content.

#### Affected Elements

| Image Selector | Source File | Line | Pages Affected |
|---|---|---|---|
| `img[src$="New_Tees.png"]` | `src/components/HeroBanner.jsx` | 17–18 | Homepage, Checkout Basket, Order Confirmation |
| `img[src$="2bags_charms1.png"]` | `src/components/TheDrop.jsx` | 12–13 | Homepage, Checkout Basket, Order Confirmation |

#### DOM Snippets

```html
<!-- HeroBanner.jsx -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop.jsx -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

#### Recommended Fixes

```jsx
// HeroBanner.jsx — Before (line ~18)
<img src={HERO_IMAGE} />

// After
<img src={HERO_IMAGE} alt="New Tees collection — warm hues for cooler days" />
```

```jsx
// TheDrop.jsx — Before (line ~13)
<img src={DROP_IMAGE} loading="lazy" />

// After
<img src={DROP_IMAGE} loading="lazy" alt="Limited edition plushie bag charms — Android bot, Google logo characters, and accessories" />
```

#### Rationale

`alt` text should be descriptive of the image content and its purpose in context. For a hero banner promoting a product line, the alt text should identify the product and convey the promotional message. For "The Drop" section showing new limited-edition items, the alt text describes what is shown. Alt text is not a caption — it substitutes for the image for users who cannot see it.

---

### CI-7: Missing Required ARIA Attributes (`AXE-ARIA-REQUIRED-ATTR`)

**Severity:** Critical  
**WCAG:** 4.1.2 — Name, Role, Value (Level A)  
**Issue count:** 3 occurrences across 3 pages  
**Evinced type ID:** `AXE-ARIA-REQUIRED-ATTR` (axe-core rule: `aria-required-attr`)

#### Description

An element has `role="slider"` but is missing the required ARIA attributes `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. A `slider` role without these attributes is meaningless to assistive technologies — they cannot communicate the control's current value or its valid range.

#### Affected Element

| Selector | Source File | Line | Pages |
|---|---|---|---|
| `div.drop-popularity-bar` | `src/components/TheDrop.jsx` | 18–19 | Homepage, Checkout Basket, Order Confirmation |

#### DOM Snippet

```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

#### Recommended Fix

**Option A — Fix the slider role (add required attributes):**
```jsx
// TheDrop.jsx — Before (line 18)
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// After
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-readonly="true"
  className="drop-popularity-bar"
></div>
```

**Option B — Change to a more semantically appropriate element (preferred if the element is read-only):**
```jsx
// After (using progressbar, which does not require aria-valuemin/max)
<div
  role="progressbar"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
></div>
```

#### Rationale

If the element is truly a read-only indicator (visual only, not user-adjustable), `role="progressbar"` or `role="meter"` is more semantically accurate than `role="slider"` — sliders are interactive input controls. Using the correct role reduces the cognitive burden on screen-reader users. If `role="slider"` is intentional (e.g., future interactivity), all three required attributes must be present with meaningful numeric values, and `aria-readonly="true"` should be added for the current read-only state.

---

## 6. Recommended Fix Summary for Critical Issues

| ID | Issue Type | Root Cause Files | Fix Action | Issues Resolved |
|---|---|---|---|---|
| CI-1 | `NOT_FOCUSABLE` | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx`, `FilterSidebar.jsx`, `TheDrop.jsx` | Replace `<div onClick>` with `<button>` or `<a>`, or add `tabIndex="0"` + `onKeyDown` | 66 |
| CI-2 | `WRONG_SEMANTIC_ROLE` | Same as CI-1 | Same action as CI-1 (native elements carry implicit roles) | 63 |
| CI-3 | `NO_DESCRIPTIVE_TEXT` | `Header.jsx`, `PopularSection.jsx`, `Footer.jsx` | Remove `aria-hidden="true"` from visible text; add `aria-label` to icon buttons | 30 |
| CI-4 | `AXE-BUTTON-NAME` | `CartModal.jsx`, `WishlistModal.jsx` | Add `aria-label="Close cart"` / `aria-label="Close wishlist"` | 12 |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` | `FeaturedPair.jsx`, `ProductPage.jsx`, `NewPage.jsx` | Remove or correct invalid ARIA values | 7 |
| CI-6 | `AXE-IMAGE-ALT` | `HeroBanner.jsx`, `TheDrop.jsx` | Add descriptive `alt` attributes | 6 |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` | `TheDrop.jsx` | Add `aria-valuenow/min/max` or change to `role="progressbar"` | 3 |
| **Total** | | | | **187** |

---

## 7. Non-Critical Issues (Serious Severity)

These issues were detected but are classified as **Serious** (not Critical) by the Evinced engine. They impact usability for users with disabilities but do not completely block access.

---

### SI-1: Insufficient Color Contrast (`AXE-COLOR-CONTRAST`)

**Severity:** Serious  
**WCAG:** 1.4.3 — Contrast (Minimum) (Level AA) — minimum ratio 4.5:1 for normal text  
**Issue count:** 21 occurrences across all 6 pages  
**Evinced type ID:** `AXE-COLOR-CONTRAST`

#### Affected Elements (Unique)

| Element | Page | Approximate Contrast | Notes |
|---|---|---|---|
| `.hero-content > p` ("Warm hues for cooler days") | Homepage, Checkout Basket, Order Confirmation | ~1.3:1 | Light text on near-white hero background |
| `.filter-count` spans (`(8)`, `(4)`, etc.) | New Products | ~1.4:1 | `#c8c8c8` on `#ffffff` |
| `.products-found` ("16 Products Found") | New Products | ~1.9:1 | `#b0b4b8` on `#ffffff` |
| Product description text (`.productDescription`) | Product Detail | ~1.6:1 | `#c0c0c0` on `#ffffff` |
| `.checkout-step:nth-child(3) > .step-label` ("Shipping & Payment") | Checkout Basket, Checkout Shipping | insufficient | Inactive step label in low-contrast grey |
| `.checkout-empty > p` ("There are no items...") | Checkout Basket, Checkout Shipping | insufficient | Empty cart message |

**Source files:** `src/components/HeroBanner.css`, `src/components/FilterSidebar.css`, `src/pages/NewPage.css`, `src/pages/ProductPage.module.css`, `src/pages/CheckoutPage.css`

---

### SI-2: `<html>` Element Missing `lang` Attribute (`AXE-HTML-HAS-LANG`)

**Severity:** Serious  
**WCAG:** 3.1.1 — Language of Page (Level A)  
**Issue count:** 7 (1 unique element, appears on all 6 pages because it is global)  
**Evinced type ID:** `AXE-HTML-HAS-LANG`

#### Affected Element

| File | Element | Issue |
|---|---|---|
| `public/index.html` | `<html>` | Missing `lang` attribute entirely |

#### DOM Snippet

```html
<!-- public/index.html line 3 -->
<html>
```

**Note:** The source file contains a comment explicitly marking this as an intentional issue:
```html
<!-- A11Y-AXE html-has-lang: <html> element is missing a lang attribute -->
<html>
```

#### Recommended Fix

```html
<html lang="en">
```

---

### SI-3: Invalid `lang` Attribute Value (`AXE-VALID-LANG`)

**Severity:** Serious  
**WCAG:** 3.1.2 — Language of Parts (Level AA)  
**Issue count:** 3 occurrences (Homepage, Checkout Basket, Order Confirmation)  
**Evinced type ID:** `AXE-VALID-LANG`

#### Affected Element

| Selector | Source File | Invalid Value | Pages |
|---|---|---|---|
| `p[lang="zz"]` | `src/components/TheDrop.jsx` | `"zz"` — not a valid BCP 47 language tag | Homepage, Checkout Basket, Order Confirmation |

#### DOM Snippet

```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms have officially dropped…</p>
```

#### Recommended Fix

```jsx
// TheDrop.jsx — Before
<p lang="zz">…</p>

// After (if text is in English)
<p>…</p>
// Or if it is in a specific language, use a valid BCP 47 tag, e.g.:
<p lang="en">…</p>
```

---

## 8. Issue Distribution Across Components

This table maps each issue type to the shared components that must be changed to resolve all occurrences:

| Component / File | Issues Present | Pages Where Visible |
|---|---|---|
| `src/components/Header.jsx` | CI-1, CI-2, CI-3 | All 6 |
| `src/components/Footer.jsx` | CI-1, CI-2, CI-3 | All 6 |
| `src/components/CartModal.jsx` | CI-4 | All 6 (global) |
| `src/components/WishlistModal.jsx` | CI-4 | All 6 (global) |
| `src/components/PopularSection.jsx` | CI-1, CI-2, CI-3 | Homepage, Checkout Basket, Order Confirmation |
| `src/components/FeaturedPair.jsx` | CI-5 | Homepage, Checkout Basket, Order Confirmation |
| `src/components/HeroBanner.jsx` | CI-6, SI-1 | Homepage, Checkout Basket, Order Confirmation |
| `src/components/TheDrop.jsx` | CI-6, CI-7, SI-3 | Homepage, Checkout Basket, Order Confirmation |
| `src/components/FilterSidebar.jsx` | CI-1, CI-2, SI-1 | New Products |
| `src/pages/ProductPage.jsx` | CI-5 | Product Detail |
| `src/pages/NewPage.jsx` | CI-5, SI-1 | New Products |
| `src/pages/CheckoutPage.jsx` | SI-1 | Checkout Basket, Checkout Shipping |
| `public/index.html` | SI-2 | All 6 (global) |

---

## 9. Prioritised Remediation Plan

The following order of changes would resolve the maximum number of issues with the fewest file edits:

1. **`Header.jsx`** — Convert icon `<div>` buttons to `<button>` with `aria-label`; resolves CI-1, CI-2, CI-3 occurrences on all 6 pages (~60 issues)
2. **`Footer.jsx`** — Convert `<div>` nav items to `<button>` or `<a>`; remove unnecessary `aria-hidden`; resolves CI-1, CI-2, CI-3 on all 6 pages (~18 issues)
3. **`CartModal.jsx` + `WishlistModal.jsx`** — Add `aria-label` to close buttons; resolves CI-4 on all 6 pages (12 issues)
4. **`FilterSidebar.jsx`** — Convert filter options to `<input type="checkbox">` + `<label>`; resolves CI-1, CI-2 on New Products page (~27 issues)
5. **`PopularSection.jsx`** — Replace `<div className="shop-link">` with `<a href>` links; remove `aria-hidden` from labels; resolves CI-1, CI-2, CI-3 on 3 pages (9 issues)
6. **`HeroBanner.jsx` + `TheDrop.jsx`** — Add `alt` attributes to images; resolves CI-6 (6 issues)
7. **`TheDrop.jsx`** — Fix `role="slider"` missing required attributes; resolves CI-7 (3 issues)
8. **`FeaturedPair.jsx`** — Remove `aria-expanded="yes"` from `<h1>`; resolves CI-5 (4 issues)
9. **`ProductPage.jsx`** — Fix `aria-relevant="changes"` → `"additions text"`; resolves CI-5 (1 issue)
10. **`NewPage.jsx`** — Fix `aria-sort="newest"` → `"descending"`; resolves CI-5 (1 issue)
11. **`public/index.html`** — Add `lang="en"` to `<html>`; resolves SI-2 (7 issues)
12. **`TheDrop.jsx`** — Remove `lang="zz"` from `<p>`; resolves SI-3 (3 issues)
13. **CSS files** — Increase color contrast ratios to ≥4.5:1; resolves SI-1 (21 issues)

---

## 10. Audit Methodology

**Tool:** Evinced Playwright SDK (`@evinced/js-playwright-sdk` v2.17.0) in online mode, authenticated via `EVINCED_SERVICE_ID` and `EVINCED_API_KEY`.

**Test approach:**
- Each page was loaded in a Chromium browser (headless) via Playwright
- `evStart()` was called before navigation; `evStop()` was called after a 2-second stabilisation wait to allow React to finish rendering
- Issues were saved as JSON to `/workspace/a11y-results/`
- For Checkout, two separate test runs captured the basket step and the shipping step independently
- Server: `npx serve dist -p 3000 --single` serving the production Webpack build

**Issue deduplication:**
The Evinced SDK returns one issue per unique element/rule combination per test run. Because the Header and Footer are shared components present on every page, global issues (e.g., Header icon buttons, Footer nav items) are counted once per page. The totals above reflect raw Evinced output counts; the source-level fix count is lower.

**Severity definitions (Evinced):**
- **Critical:** Completely blocks access for users of assistive technology — the content or function is inaccessible
- **Serious:** Significantly impairs access but a workaround may exist
- **Moderate / Best Practice / Needs Review:** Noted but not present in this audit's results

---

*Report generated by Evinced Playwright SDK + automated analysis. No source code was modified.*
