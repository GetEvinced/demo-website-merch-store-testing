# Accessibility (A11Y) Audit Report

**Repository:** demo-website (React SPA — Webpack 5, React 18, React Router v7)  
**Audit Tool:** Evinced Web SDK (`@evinced/js-playwright-sdk`) via Playwright  
**Audit Date:** 2026-03-17  
**Branch:** `cursor/repository-accessibility-audit-cd6e`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Pages Scanned](#2-pages-scanned)
3. [Methodology](#3-methodology)
4. [Issue Summary by Severity](#4-issue-summary-by-severity)
5. [Critical Issues — Detailed Findings](#5-critical-issues--detailed-findings)
   - [CI-1: Non-Semantic Interactive Elements (Interactable Role)](#ci-1-non-semantic-interactive-elements-interactable-role)
   - [CI-2: Keyboard Inaccessible Interactive Elements](#ci-2-keyboard-inaccessible-interactive-elements)
   - [CI-3: Interactive Elements Without Accessible Names](#ci-3-interactive-elements-without-accessible-names)
   - [CI-4: Buttons Without Discernible Text (Close Modals)](#ci-4-buttons-without-discernible-text-close-modals)
   - [CI-5: Images Without Alternative Text](#ci-5-images-without-alternative-text)
   - [CI-6: Invalid ARIA Attribute Values](#ci-6-invalid-aria-attribute-values)
   - [CI-7: Missing Required ARIA Attributes (Slider Role)](#ci-7-missing-required-aria-attributes-slider-role)
6. [Non-Critical Issues — Full List](#6-non-critical-issues--full-list)
   - [SI-1: Insufficient Color Contrast](#si-1-insufficient-color-contrast)
   - [SI-2: Missing `lang` Attribute on `<html>`](#si-2-missing-lang-attribute-on-html)
   - [SI-3: Invalid `lang` Attribute Value](#si-3-invalid-lang-attribute-value)
7. [Issue Count by Page](#7-issue-count-by-page)

---

## 1. Executive Summary

A full accessibility audit was performed against all six navigable pages of the demo e-commerce website using the Evinced Web SDK (Playwright integration). The audit detected **170 total issues**:

| Severity | Count |
|----------|-------|
| **Critical** | **145** |
| Serious | 25 |
| **Total** | **170** |

Critical issues directly block assistive-technology users — primarily screen-reader and keyboard-only users — from navigating or operating the site. They map exclusively to WCAG 2.1 Level A criteria, the minimum conformance baseline required for legal and regulatory accessibility compliance.

Seven distinct critical issue categories were identified. The dominant pattern, accounting for over 75 % of all critical findings, is the pervasive use of `<div>` and `<span>` elements as interactive controls without semantic HTML roles, accessible names, or keyboard support. This single architectural pattern simultaneously violates WCAG 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value), and related criteria on every page.

---

## 2. Pages Scanned

| # | Route | Entry Component | Description |
|---|-------|----------------|-------------|
| 1 | `/` | `src/pages/HomePage.jsx` | Homepage — hero, featured pairs, popular categories, "The Drop" section |
| 2 | `/shop/new` | `src/pages/NewPage.jsx` | New products listing with filter sidebar and sort controls |
| 3 | `/product/:id` | `src/pages/ProductPage.jsx` | Product detail page with image, description, add-to-cart |
| 4 | `/checkout` (basket step) | `src/pages/CheckoutPage.jsx` | Checkout — order summary and "Continue" CTA |
| 5 | `/checkout` (shipping step) | `src/pages/CheckoutPage.jsx` | Checkout — shipping and payment form |
| 6 | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Order confirmation with order ID and "Back to Shop" link |

**Shared components present on every page:** `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`

---

## 3. Methodology

1. **Build:** The React SPA was built for production (`npm run build`) and served locally via `npx serve dist -p 3000 --single`.
2. **Scanning:** Six Playwright test cases navigated each route, performed necessary user interactions to reach the target state (e.g. adding a product to cart before scanning checkout), then called `evinced.evAnalyze()` to perform a full-page snapshot analysis.
3. **Data collection:** Raw issue objects were serialised to JSON (`/workspace/a11y-results/*.json`) for post-processing and report generation.
4. **Classification:** Issues were classified into Critical and Serious severity tiers as reported by the Evinced SDK. No manual re-classification was applied.
5. **Scope:** Only `evAnalyze()` (full-page scan) was used. Targeted component-level scans (`analyzeCombobox`, `analyzeSiteNavigation`) and continuous-monitoring mode (`evStart`/`evStop`) were not included in this audit pass.

---

## 4. Issue Summary by Severity

### By Page

| Page | Total | Critical | Serious |
|------|-------|----------|---------|
| Homepage (`/`) | 35 | 32 | 3 |
| New Products (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/:id`) | 20 | 18 | 2 |
| Checkout — Basket | 21 | 18 | 3 |
| Checkout — Shipping | 19 | 18 | 1 |
| Order Confirmation | 20 | 18 | 2 |
| **TOTAL** | **170** | **145** | **25** |

### By Issue Category

| ID | Evinced Rule | Severity | Occurrences | Pages Affected |
|----|-------------|----------|-------------|----------------|
| CI-1 | `WRONG_SEMANTIC_ROLE` — Interactable role | **Critical** | 54 | All 6 |
| CI-2 | `NOT_FOCUSABLE` — Keyboard accessible | **Critical** | 55 | All 6 |
| CI-3 | `NO_DESCRIPTIVE_TEXT` — Accessible name | **Critical** | 21 | All 6 |
| CI-4 | `AXE-BUTTON-NAME` — Button name | **Critical** | 9 | All 6 |
| CI-5 | `AXE-IMAGE-ALT` — Image alt | **Critical** | 2 | Homepage only |
| CI-6 | `AXE-ARIA-VALID-ATTR-VALUE` — Aria valid attr value | **Critical** | 3 | Homepage, Product Detail |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` — Aria required attr | **Critical** | 1 | Homepage only |
| SI-1 | `AXE-COLOR-CONTRAST` — Color contrast | Serious | 18 | 5 of 6 |
| SI-2 | `AXE-HTML-HAS-LANG` — Html has lang | Serious | 6 | All 6 |
| SI-3 | `AXE-VALID-LANG` — Valid lang | Serious | 1 | Homepage only |

---

## 5. Critical Issues — Detailed Findings

---

### CI-1: Non-Semantic Interactive Elements (Interactable Role)

**Evinced Rule:** `WRONG_SEMANTIC_ROLE`  
**WCAG Criterion:** 4.1.2 Name, Role, Value — Level A  
**Total Occurrences:** 54 across all 6 pages  

**Description:**  
Interactive elements — controls that respond to `onClick` handlers — are implemented as `<div>` elements instead of native HTML interactive elements (`<button>`, `<a>`). A `<div>` has no implicit ARIA role; screen readers do not identify it as interactive and will not announce it as a button or link. Users relying on screen readers' "form controls" or "buttons" quick-navigation shortcuts cannot discover these elements at all.

**Affected Elements by Page:**

#### Homepage (`/`)

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor:pointer">` | `src/components/Header.jsx` line 131 |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor:pointer">` (Search icon) | `src/components/Header.jsx` line 140 |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor:pointer">` (Login icon) | `src/components/Header.jsx` line 156 |
| `.flag-group` | `<div class="flag-group" style="cursor:pointer">` (Region selector) | `src/components/Header.jsx` line 161 |
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer"><span aria-hidden="true">Shop Drinkware</span></div>` | `src/components/PopularSection.jsx` line ~38 |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link"…>Shop Fun and Games` | `src/components/PopularSection.jsx` |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link"…>Shop Stationery` | `src/components/PopularSection.jsx` |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer">Sustainability</div>` | `src/components/Footer.jsx` line 12 |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item"…><span aria-hidden="true">FAQs</span></div>` | `src/components/Footer.jsx` line 16 |

#### New Products (`/shop/new`) — additional elements beyond shared header/footer:

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option">` (Price: $1–$19.99) | `src/components/FilterSidebar.jsx` |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | `<div class="filter-option">` (Price: $20–$39.99) | `src/components/FilterSidebar.jsx` |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | `<div class="filter-option">` (Price: $40–$89.99) | `src/components/FilterSidebar.jsx` |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | `<div class="filter-option">` (Price: $100–$149.99) | `src/components/FilterSidebar.jsx` |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1–4)` | `<div class="filter-option">` (Sizes: XS, SM, MD, LG) | `src/components/FilterSidebar.jsx` |
| `.filter-option:nth-child(5)` | `<div class="filter-option">` (Size: XL) | `src/components/FilterSidebar.jsx` |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1–3)` | `<div class="filter-option">` (Brands: Android, Google, YouTube) | `src/components/FilterSidebar.jsx` |

#### Checkout — Basket step:

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor:pointer">Continue</div>` | `src/pages/CheckoutPage.jsx` |

#### Checkout — Shipping step:

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.checkout-back-btn` | `<div class="checkout-back-btn" style="cursor:pointer">← Back to Cart</div>` | `src/pages/CheckoutPage.jsx` |

#### Order Confirmation:

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.confirm-home-link` | `<div class="confirm-home-link" style="cursor:pointer">← Back to Shop</div>` | `src/pages/OrderConfirmationPage.jsx` |

**Recommended Fix:**  
Replace every interactive `<div>` acting as a button or link with the semantically correct native HTML element:

- Elements that trigger actions (open cart, open wishlist, toggle filter, continue checkout, etc.) → replace with `<button>` elements.
- Elements that navigate to a URL or route → replace with `<Link>` (React Router) or `<a>` elements.

For cases where the `<div>` structure cannot be immediately changed (e.g. third-party layout constraints), the minimum viable interim fix is to add `role="button"` (or `role="link"`) to the `<div>`.

**Why this remediation approach:**  
Native HTML elements (`<button>`, `<a>`) carry built-in semantics, keyboard support (`Tab`, `Enter`, `Space`), and browser-default focus styles at zero implementation cost. This is always preferable to synthetic ARIA roles on non-semantic elements. Adding `role="button"` to a `<div>` alone is insufficient — `tabIndex={0}` and a `keydown` handler are also required — making it a more error-prone three-part fix. Replacing with `<button>` resolves CI-1, CI-2, and often CI-3 simultaneously.

---

### CI-2: Keyboard Inaccessible Interactive Elements

**Evinced Rule:** `NOT_FOCUSABLE`  
**WCAG Criterion:** 2.1.1 Keyboard — Level A  
**Total Occurrences:** 55 across all 6 pages  

**Description:**  
The same set of `<div>` elements identified in CI-1 are also not reachable via keyboard navigation (Tab key). A `<div>` without `tabIndex` is excluded from the tab order. Keyboard-only users (who cannot use a mouse) and switch-access users cannot reach or activate these controls at all.

Additionally, the `<div role="slider">` (`.drop-popularity-bar`) on the homepage is explicitly excluded from the tab order by lacking `tabIndex={0}`, and a slider must also support arrow-key interaction to be operable by keyboard.

**Affected Elements:**  
All elements listed under CI-1, plus:

| Selector | DOM Snippet | Source File | Page |
|----------|-------------|-------------|------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` | `src/components/TheDrop.jsx` line ~15 | Homepage |

**Recommended Fix:**  
Resolved automatically by replacing interactive `<div>` elements with `<button>` or `<a>`/`<Link>` elements (the fix for CI-1). Native `<button>` and `<a>` elements are natively focusable and keyboard-operable with no additional attributes required.

For the `.drop-popularity-bar` slider, if the `role="slider"` is kept:
- Add `tabIndex={0}` to make it focusable.
- Add an `onKeyDown` handler that increments/decrements the value on ArrowRight/ArrowLeft/ArrowUp/ArrowDown key presses.
- If the slider is purely decorative (no real state), replace `role="slider"` with `role="presentation"` and remove it from the tab order entirely.

**Why this remediation approach:**  
WCAG 2.1.1 requires that all functionality be operable via keyboard. Native elements satisfy this requirement by default. For custom widgets, the WAI-ARIA Authoring Practices Guide (APG) defines specific keyboard interaction patterns for each widget type; sliders must respond to arrow keys.

---

### CI-3: Interactive Elements Without Accessible Names

**Evinced Rule:** `NO_DESCRIPTIVE_TEXT`  
**WCAG Criterion:** 4.1.2 Name, Role, Value — Level A  
**Total Occurrences:** 21 across all 6 pages  

**Description:**  
Several interactive elements have their visible text hidden from assistive technology via `aria-hidden="true"` on the label text, leaving the control with no accessible name. Screen readers either announce nothing, or read a hashed CSS Module class name.

**Affected Elements:**

| Selector | DOM Snippet | Source File | Pages |
|----------|-------------|-------------|-------|
| `.icon-btn:nth-child(2)` (Search) | `<div class="icon-btn"…><svg…aria-hidden="true"/><span aria-hidden="true">Search</span></div>` | `src/components/Header.jsx` line 141–143 | All 6 |
| `.icon-btn:nth-child(4)` (Login) | `<div class="icon-btn"…><svg…aria-hidden="true"/><span aria-hidden="true">Login</span></div>` | `src/components/Header.jsx` line 156–158 | All 6 |
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link"…><span aria-hidden="true">Shop Drinkware</span></div>` | `src/components/PopularSection.jsx` | Homepage |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link"…><span aria-hidden="true">Shop Fun and Games</span></div>` | `src/components/PopularSection.jsx` | Homepage |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link"…><span aria-hidden="true">Shop Stationery</span></div>` | `src/components/PopularSection.jsx` | Homepage |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item"…><span aria-hidden="true">FAQs</span></div>` | `src/components/Footer.jsx` line 16 | All 6 |
| `.filter-group:nth-child(2–4) > .filter-options > .filter-option` (multiple) | `<div class="filter-option">…<span class="filter-option-label">…</span></div>` (label text not exposed) | `src/components/FilterSidebar.jsx` | New Products |

**Recommended Fix:**  
Remove `aria-hidden="true"` from text that conveys the interactive element's purpose. For icon-only controls where the visual label is hidden intentionally, provide an `aria-label` attribute directly on the control:

```jsx
// Before:
<span aria-hidden="true">Search</span>

// After option A — expose existing text:
<span>Search</span>

// After option B — use aria-label on the control element:
<button aria-label="Search" className="icon-btn">
  <svg aria-hidden="true">{/* ... */}</svg>
</button>
```

For `.shop-link` elements in `PopularSection.jsx`, remove `aria-hidden="true"` from the `<span>` child, or add an `aria-label` to the link `<div>` (or the replacement `<Link>` element).

**Why this remediation approach:**  
`aria-hidden="true"` was applied to text that is the only human-readable label for the control. This is the wrong use of `aria-hidden`; that attribute is for decorative content that should be ignored by screen readers (e.g. decorative icons). Removing it from label text, or providing an equivalent `aria-label`, directly restores the accessible name computation.

---

### CI-4: Buttons Without Discernible Text (Close Modals)

**Evinced Rule:** `AXE-BUTTON-NAME`  
**WCAG Criterion:** 4.1.2 Name, Role, Value — Level A  
**Total Occurrences:** 9 across all 6 pages  

**Description:**  
The close buttons in `CartModal` and `WishlistModal` contain only an SVG icon (`aria-hidden="true"`) with no visible text and no `aria-label`. Screen readers announce these as "button" with no name, giving users no indication of the button's purpose.

**Affected Elements:**

| Selector | DOM Snippet | Source File | Pages |
|----------|-------------|-------------|-------|
| `#cart-modal > div:nth-child(1) > button` | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg…aria-hidden="true">×</svg></button>` | `src/components/CartModal.jsx` line 56 | Homepage, New Products, Product Detail |
| `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg…aria-hidden="true">×</svg></button>` | `src/components/WishlistModal.jsx` | All 6 pages |
| `div:nth-child(1) > button` (Wishlist close on checkout/confirmation) | Same pattern | `src/components/WishlistModal.jsx` | Checkout Basket, Checkout Shipping, Order Confirmation |

Note: On checkout and order-confirmation pages, only the WishlistModal close button is flagged (the cart modal is not rendered on those pages).

**Recommended Fix:**  
Add `aria-label` to each close button:

```jsx
// CartModal.jsx — before:
<button className={styles.closeBtn} onClick={closeCart}>
  <svg aria-hidden="true">…</svg>
</button>

// CartModal.jsx — after:
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
  <svg aria-hidden="true">…</svg>
</button>

// WishlistModal.jsx — after:
<button className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this remediation approach:**  
`aria-label` is the most direct mechanism for providing an accessible name to an element that has no visible text label. It overrides the accessible name computation and is read verbatim by screen readers. The SVG already has `aria-hidden="true"`, which is correct for decorative icons; the `aria-label` on the button itself is sufficient to give the button a meaningful name.

---

### CI-5: Images Without Alternative Text

**Evinced Rule:** `AXE-IMAGE-ALT`  
**WCAG Criterion:** 1.1.1 Non-text Content — Level A  
**Total Occurrences:** 2 on Homepage  

**Description:**  
Two `<img>` elements are missing the `alt` attribute entirely. WCAG 1.1.1 requires all non-decorative images to have a text alternative. When `alt` is absent, screen readers typically read the image file name (e.g., "New underscore Tees dot p n g"), which is meaningless.

**Affected Elements:**

| Selector | DOM Snippet | Source File | Description |
|----------|-------------|-------------|-------------|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `src/components/HeroBanner.jsx` line 18 | Hero banner — promotional image of new t-shirts |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `src/components/TheDrop.jsx` line 13 | "The Drop" section — image of limited-edition bag charms |

**Recommended Fix:**

```jsx
// HeroBanner.jsx — before:
<img src={HERO_IMAGE} />

// HeroBanner.jsx — after:
<img src={HERO_IMAGE} alt="Winter Basics — new t-shirt collection" />

// TheDrop.jsx — before:
<img src={DROP_IMAGE} loading="lazy" />

// TheDrop.jsx — after:
<img src={DROP_IMAGE} loading="lazy" alt="Limited-edition Android, YouTube, and Super G plushie bag charms" />
```

If either image is purely decorative (conveys no additional information beyond the surrounding text), use an empty alt attribute (`alt=""`), which instructs screen readers to skip it entirely.

**Why this remediation approach:**  
The `alt` attribute is the standard, universally supported mechanism for providing a text alternative to an image. Descriptive text directly communicates the image's content to non-sighted users. An empty string `alt=""` is appropriate for purely decorative images because it suppresses the filename announcement without adding noise. Both images in this case accompany promotional sections whose content is not fully described by adjacent text, so descriptive `alt` values are warranted.

---

### CI-6: Invalid ARIA Attribute Values

**Evinced Rule:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG Criterion:** 4.1.2 Name, Role, Value — Level A  
**Total Occurrences:** 3 across Homepage and Product Detail  

**Description:**  
ARIA attributes are present but use values that are outside the defined ARIA specification. Assistive technologies cannot interpret invalid ARIA values and may expose incorrect or undefined behaviour to users.

**Affected Elements:**

**1. `aria-expanded="yes"` on `<h1>` headings (Homepage — FeaturedPair section)**

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `src/components/FeaturedPair.jsx` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | `src/components/FeaturedPair.jsx` |

`aria-expanded` must be `"true"` or `"false"`. The value `"yes"` is not valid. Furthermore, `aria-expanded` is semantically incorrect on a heading element — it is intended for controls that show/hide content (such as accordion headers or disclosure widgets).

**2. `aria-relevant="changes"` on `<ul>` (Product Detail page)**

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `ul[aria-relevant="changes"]` | `<ul class="…" aria-relevant="changes" aria-live="polite">` | `src/pages/ProductPage.jsx` |

`aria-relevant` must be a space-separated list of tokens from the set: `additions`, `removals`, `text`, `all`. The value `"changes"` is not a valid token.

**Recommended Fix:**

```jsx
// FeaturedPair.jsx — remove aria-expanded entirely from the heading,
// or correct the value if the heading genuinely controls a disclosure:

// Before:
<h1 aria-expanded="yes">{item.title}</h1>

// After (if the heading is not a disclosure trigger — most likely):
<h1>{item.title}</h1>

// After (if it must remain a disclosure trigger):
<h1 aria-expanded={isOpen ? "true" : "false"}>{item.title}</h1>
```

```jsx
// ProductPage.jsx — correct aria-relevant value:

// Before:
<ul aria-relevant="changes" aria-live="polite">

// After (announce text additions and removals):
<ul aria-relevant="additions removals" aria-live="polite">

// Or remove if the list is not a live region:
<ul aria-live="polite">
```

**Why this remediation approach:**  
Invalid ARIA attribute values produce undefined behaviour — some screen readers ignore them, others behave erratically. WCAG 4.1.2 requires that ARIA attributes have valid values. Removing `aria-expanded` from a heading element that is not a disclosure control is correct because `aria-expanded` implies the element controls a collapsible region; adding it incorrectly misrepresents the element's role to assistive technology. For `aria-relevant`, the tokens `additions removals` are the closest equivalent to the intended "changes" meaning.

---

### CI-7: Missing Required ARIA Attributes (Slider Role)

**Evinced Rule:** `AXE-ARIA-REQUIRED-ATTR`  
**WCAG Criterion:** 4.1.2 Name, Role, Value — Level A  
**Total Occurrences:** 1 on Homepage  

**Description:**  
An element is given `role="slider"` but is missing the three ARIA attributes that the slider role unconditionally requires: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, the slider is meaningless to assistive technology — screen readers cannot announce the current value, minimum, or maximum of the control.

**Affected Element:**

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `src/components/TheDrop.jsx` line ~15 |

**Recommended Fix:**  
Either provide the required ARIA state attributes, or — if the element is decorative and does not represent a real interactive slider — remove `role="slider"` entirely and mark the element as presentational:

```jsx
// Option A — if it is a real interactive slider:
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
  onKeyDown={handleSliderKeyDown}
/>

// Option B — if it is a decorative progress/bar indicator:
<div
  role="presentation"
  aria-hidden="true"
  className="drop-popularity-bar"
/>
```

**Why this remediation approach:**  
The WAI-ARIA specification defines `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` as required properties for `role="slider"`. The element appears to be a visual indicator (a styled bar), not a true user-input slider, so Option B (removing the incorrect role and hiding it from the accessibility tree) is the most appropriate correction. If it were a genuine interactive slider, WCAG 2.1.1 would additionally require keyboard arrow-key handlers. Using `role="presentation"` on a non-interactive decorative element is the canonical solution.

---

## 6. Non-Critical Issues — Full List

The following **25 issues** were classified as **Serious** severity by the Evinced SDK. They do not block functionality outright but create significant barriers for users with visual impairments and should be addressed in subsequent remediation passes to achieve WCAG 2.1 AA conformance.

---

### SI-1: Insufficient Color Contrast

**Evinced Rule:** `AXE-COLOR-CONTRAST`  
**WCAG Criterion:** 1.4.3 Contrast (Minimum) — Level AA  
**Total Occurrences:** 18 across 5 pages  

WCAG 1.4.3 requires a contrast ratio of at least 4.5:1 for normal-weight text under 18pt. The following elements fail this threshold.

#### Homepage (`/`) — 1 occurrence

| Element | Selector | Approximate Contrast | Source File |
|---------|----------|---------------------|-------------|
| Hero subtitle "Warm hues for cooler days" | `.hero-content > p` | ~1.3:1 (light text on light background) | `src/components/HeroBanner.css` |

#### New Products (`/shop/new`) — 13 occurrences

| Element | Selector | Notes |
|---------|----------|-------|
| Filter count badge "(8)" | `.filter-group:nth-child(2) > … > .filter-count` | Light grey text on white — `src/components/FilterSidebar.css` |
| Filter count badge "(4)" | `.filter-group:nth-child(2) > … :nth-child(2) > … > .filter-count` | Same pattern |
| Filter count badge "(4)" | `.filter-group:nth-child(2) > … :nth-child(3) > … > .filter-count` | Same pattern |
| Filter count badge "(0)" | `.filter-group:nth-child(2) > … :nth-child(4) > … > .filter-count` | Same pattern |
| Filter count badge "(14)" | Size filter XS | Same pattern |
| Filter count badge "(15)" | Size filter SM | Same pattern |
| Filter count badge "(14)" | Size filter MD | Same pattern |
| Filter count badge "(12)" | Size filter LG | Same pattern |
| Filter count badge "(11)" | Size filter XL | `.filter-option:nth-child(5) > … > .filter-count` |
| Filter count badge "(2)" | Brand filter Android | Same pattern |
| Filter count badge "(13)" | Brand filter Google | Same pattern |
| Filter count badge "(1)" | Brand filter YouTube | Same pattern |
| "16 Products Found" text | `.products-found` | Light grey on white — `src/pages/NewPage.css` |

#### Product Detail (`/product/:id`) — 1 occurrence

| Element | Selector | Notes |
|---------|----------|-------|
| Product description paragraph | `p:nth-child(4)` (hashed CSS Modules selector) | Low-contrast grey text on white — `src/pages/ProductPage.module.css` |

#### Checkout — Basket (`/checkout` step 1) — 2 occurrences

| Element | Selector | Notes |
|---------|----------|-------|
| Step indicator label "Shipping & Payment" | `.checkout-step:nth-child(3) > .step-label` | Inactive step label — low contrast |
| Helper note "Taxes calculated at next step" | `.summary-tax-note` | Light grey helper text |

#### Order Confirmation (`/order-confirmation`) — 1 occurrence

| Element | Selector | Notes |
|---------|----------|-------|
| "Order ID" label | `.confirm-order-id-label` | Low-contrast label text |

**Recommended Fix (not applied):**  
Increase the foreground text colour or darken the background to achieve a minimum 4.5:1 contrast ratio. For `.filter-count` badges, using a darker grey (e.g. `#767676` on white meets 4.54:1 exactly) or reducing the background opacity is sufficient. Online tools such as the WebAIM Contrast Checker can validate the updated values.

---

### SI-2: Missing `lang` Attribute on `<html>`

**Evinced Rule:** `AXE-HTML-HAS-LANG`  
**WCAG Criterion:** 3.1.1 Language of Page — Level A  
**Total Occurrences:** 6 (one per page, as the `<html>` element is shared)  

The root `<html>` element lacks a `lang` attribute. Screen readers use the page language to select the correct speech synthesiser voice and to apply correct pronunciation rules. Without it, content may be read in the operating-system default language, causing mispronunciation for non-English users.

**Affected Element:** `<html>` (global — `public/index.html`)

**Recommended Fix (not applied):**

```html
<!-- public/index.html -->
<html lang="en">
```

---

### SI-3: Invalid `lang` Attribute Value

**Evinced Rule:** `AXE-VALID-LANG`  
**WCAG Criterion:** 3.1.2 Language of Parts — Level AA  
**Total Occurrences:** 1 on Homepage  

A `<p>` element uses `lang="zz"`, which is not a valid BCP 47 language subtag. Screen readers cannot apply the correct pronunciation rules for text marked with an unrecognised language code.

**Affected Element:**

| Selector | DOM Snippet | Source File |
|----------|-------------|-------------|
| `p[lang="zz"]` | `<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>` | `src/components/TheDrop.jsx` line ~21 |

**Recommended Fix (not applied):**  
Either remove the `lang` attribute if the text is in the same language as the page, or replace `"zz"` with a valid BCP 47 tag (e.g. `lang="en"` for English):

```jsx
// Before:
<p lang="zz">Our brand-new…</p>

// After:
<p>Our brand-new…</p>
```

---

## 7. Issue Count by Page

### Homepage (`/`) — 35 total (32 critical, 3 serious)

| Rule | Severity | Occurrences |
|------|----------|-------------|
| WRONG_SEMANTIC_ROLE | Critical | 9 |
| NOT_FOCUSABLE | Critical | 10 |
| NO_DESCRIPTIVE_TEXT | Critical | 5 |
| AXE-BUTTON-NAME | Critical | 2 |
| AXE-IMAGE-ALT | Critical | 2 |
| AXE-ARIA-VALID-ATTR-VALUE | Critical | 2 |
| AXE-ARIA-REQUIRED-ATTR | Critical | 1 |
| NOT_FOCUSABLE (slider) | Critical | 1 |
| AXE-COLOR-CONTRAST | Serious | 1 |
| AXE-HTML-HAS-LANG | Serious | 1 |
| AXE-VALID-LANG | Serious | 1 |

### New Products (`/shop/new`) — 55 total (41 critical, 14 serious)

| Rule | Severity | Occurrences |
|------|----------|-------------|
| WRONG_SEMANTIC_ROLE | Critical | 14 |
| NOT_FOCUSABLE | Critical | 14 |
| NO_DESCRIPTIVE_TEXT | Critical | 5 |
| AXE-BUTTON-NAME | Critical | 2 |
| AXE-COLOR-CONTRAST | Serious | 13 |
| AXE-HTML-HAS-LANG | Serious | 1 |

### Product Detail (`/product/:id`) — 20 total (18 critical, 2 serious)

| Rule | Severity | Occurrences |
|------|----------|-------------|
| WRONG_SEMANTIC_ROLE | Critical | 6 |
| NOT_FOCUSABLE | Critical | 6 |
| NO_DESCRIPTIVE_TEXT | Critical | 3 |
| AXE-BUTTON-NAME | Critical | 2 |
| AXE-ARIA-VALID-ATTR-VALUE | Critical | 1 |
| AXE-COLOR-CONTRAST | Serious | 1 |
| AXE-HTML-HAS-LANG | Serious | 1 |

### Checkout — Basket (`/checkout` step 1) — 21 total (18 critical, 3 serious)

| Rule | Severity | Occurrences |
|------|----------|-------------|
| WRONG_SEMANTIC_ROLE | Critical | 7 |
| NOT_FOCUSABLE | Critical | 7 |
| NO_DESCRIPTIVE_TEXT | Critical | 3 |
| AXE-BUTTON-NAME | Critical | 1 |
| AXE-COLOR-CONTRAST | Serious | 2 |
| AXE-HTML-HAS-LANG | Serious | 1 |

### Checkout — Shipping (`/checkout` step 2) — 19 total (18 critical, 1 serious)

| Rule | Severity | Occurrences |
|------|----------|-------------|
| WRONG_SEMANTIC_ROLE | Critical | 7 |
| NOT_FOCUSABLE | Critical | 7 |
| NO_DESCRIPTIVE_TEXT | Critical | 3 |
| AXE-BUTTON-NAME | Critical | 1 |
| AXE-HTML-HAS-LANG | Serious | 1 |

### Order Confirmation (`/order-confirmation`) — 20 total (18 critical, 2 serious)

| Rule | Severity | Occurrences |
|------|----------|-------------|
| WRONG_SEMANTIC_ROLE | Critical | 7 |
| NOT_FOCUSABLE | Critical | 7 |
| NO_DESCRIPTIVE_TEXT | Critical | 3 |
| AXE-BUTTON-NAME | Critical | 1 |
| AXE-COLOR-CONTRAST | Serious | 1 |
| AXE-HTML-HAS-LANG | Serious | 1 |

---

*Report generated by Evinced Web SDK via Playwright. Raw issue data is available in `/workspace/a11y-results/*.json`.*
