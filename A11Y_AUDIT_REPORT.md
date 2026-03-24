# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-24  
**Audit Tool:** Evinced Playwright SDK (v2.17.x) — Evinced MCP Server  
**Auditor:** Automated Cloud Agent  
**Repository:** `/workspace` (React 18 SPA, Webpack 5, React Router v7)

---

## 1. Repository Overview & Entry Points

| Route | Page Component | Entry File |
|---|---|---|
| `/` | `HomePage.jsx` | `src/pages/HomePage.jsx` |
| `/shop/new` | `NewPage.jsx` | `src/pages/NewPage.jsx` |
| `/product/:id` | `ProductPage.jsx` | `src/pages/ProductPage.jsx` |
| `/checkout` | `CheckoutPage.jsx` | `src/pages/CheckoutPage.jsx` |
| `/order-confirmation` | `OrderConfirmationPage.jsx` | `src/pages/OrderConfirmationPage.jsx` |

Shared layout components rendered on every page: `Header.jsx`, `Footer.jsx`, `CartModal.jsx`, `WishlistModal.jsx`.  
The app is bootstrapped from `src/index.js` → `src/components/App.jsx` (React Router + context providers).

---

## 2. Audit Methodology

Each page was audited independently using `evStart()` / `evStop()` from the Evinced Playwright SDK. Pages requiring state (checkout, order confirmation) were reached by automating the full user journey. Raw issues were serialised to JSON per page and are stored in `tests/e2e/test-results/page-*.json`.

---

## 3. Aggregate Results

| Page | Total Issues | Critical | Serious |
|---|---|---|---|
| Homepage (`/`) | 35 | 32 | 3 |
| Products (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/1`) | 20 | 18 | 2 |
| Checkout (`/checkout`) | 37 | 32 | 5 |
| Order Confirmation (`/order-confirmation`) | 61 | 54 | 7 |
| **Totals** | **208** | **177** | **31** |

> **Note on duplication:** Many issues are structural (e.g., a missing `lang` attribute on `<html>`, global modal close buttons) and therefore appear on every page. The unique source-code defects behind all 177 critical instances are catalogued in Section 4.

---

## 4. Critical Issues — Detailed Catalogue

Critical issues are those whose severity was reported as `CRITICAL` by the Evinced SDK. They map directly to WCAG 2.1 Level A/AA failures that block access for screen-reader or keyboard-only users.

---

### CI-1 · `WRONG_SEMANTIC_ROLE` — Interactive `<div>` elements used instead of native controls

**Total instances:** 64 (across all 5 pages)  
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)

#### Description

Multiple interactive elements are implemented as `<div>` (or custom elements) with `onClick` handlers but without the correct ARIA role. Assistive technologies (AT) derive interaction semantics from the element's role. A `<div>` has an implicit role of `generic`, so screen readers never announce these elements as buttons, links, or checkboxes, and the user has no indication they can be activated.

#### Affected Elements & Pages

| Element | Selector | Pages affected |
|---|---|---|
| Wishlist icon button (Header) | `.wishlist-btn` | All 5 pages |
| Search icon (Header) | `.icon-btn:nth-child(2)` | All 5 pages |
| Login icon (Header) | `.icon-btn:nth-child(4)` | All 5 pages |
| Country/language flag selector (Header) | `.flag-group` | All 5 pages |
| "Shop Drinkware/Fun & Games/Stationery" links (PopularSection) | `.product-card:nth-child(N) > .product-card-info > .shop-link` | Homepage |
| Price/Size/Brand filter options (FilterSidebar) | `.filter-group > .filter-options > .filter-option` | Products |
| Footer navigation items ("Sustainability", "FAQs") | `.footer-nav-item` | All 5 pages |
| "Continue Shopping" button (CartModal) | CartModal `div.continueBtn` | All pages with cart |
| "Continue" button (CheckoutPage basket step) | `.checkout-continue-btn` | Checkout |
| "← Back to Cart" button (CheckoutPage shipping step) | `.checkout-back-btn` | Checkout |
| "← Back to Shop" link (OrderConfirmationPage) | `.confirm-home-link` | Order Confirmation |

#### Source Files

- `src/components/Header.jsx` (lines 131–164): `.wishlist-btn`, `.icon-btn`, `.flag-group`
- `src/components/PopularSection.jsx` (lines 54–60): `.shop-link` divs
- `src/components/FilterSidebar.jsx` (lines 74, 116, 156): `.filter-option` divs
- `src/components/Footer.jsx` (lines 11–15): `.footer-nav-item` divs
- `src/components/CartModal.jsx` (lines 128–134): `div.continueBtn`
- `src/pages/CheckoutPage.jsx` (line 156–162 basket, line 297–303 shipping): divs acting as buttons
- `src/pages/OrderConfirmationPage.jsx` (line 40): `.confirm-home-link`

#### DOM Snippets (representative)

```html
<!-- Header wishlist button -->
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

<!-- PopularSection shop link -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>

<!-- Footer nav item -->
<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>
```

#### Recommended Fix

Replace each `<div>` acting as a button with a `<button>` element (for actions) or an `<a>` element (for navigation). Where a `<div>` must be kept for styling reasons, add `role="button"` plus `tabIndex={0}` and keyboard event handlers (`onKeyDown` for Enter/Space). The text inside must be accessible to AT — remove `aria-hidden="true"` from inner spans.

**Example (PopularSection "Shop Drinkware"):**
```jsx
// Before (broken)
<div className="shop-link" onClick={() => navigate(product.shopHref)} style={{ cursor: 'pointer' }}>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// After (fixed)
<Link to={product.shopHref} className="shop-link">
  {product.shopLabel}
</Link>
```

**Why this approach:** Using native HTML elements (`<button>`, `<a>`) is the most robust solution because browsers and AT have built-in support for their keyboard behaviour and semantics. It requires no additional ARIA attributes and degrades gracefully.

---

### CI-2 · `NOT_FOCUSABLE` — Interactive elements not reachable by keyboard

**Total instances:** 65 (across all 5 pages)  
**WCAG criterion:** 2.1.1 Keyboard (Level A)

#### Description

The same `<div>`-based interactive elements identified in CI-1 are also not keyboard-focusable because `<div>` elements are not in the tab order by default. Keyboard-only users (including switch device users and power keyboard users) cannot reach or activate these controls at all.

#### Affected Elements & Pages

Identical to CI-1: all `<div>` onClick elements in Header, PopularSection, FilterSidebar, Footer, CartModal, CheckoutPage, and OrderConfirmationPage. Additionally:

| Element | Selector | Page |
|---|---|---|
| Popularity bar pseudo-slider | `.drop-popularity-bar` | Homepage |

#### Source Files

Same as CI-1 plus `src/components/TheDrop.jsx` (line 19).

#### Recommended Fix

Same as CI-1: replace `<div>` with native interactive elements. For the `.drop-popularity-bar` specifically (currently `role="slider"`), add `tabIndex={0}` and keyboard event handlers for arrow keys, alongside the required ARIA attributes (see CI-7).

**Why this approach:** Native HTML elements receive keyboard focus automatically, eliminating the need for manual `tabIndex` management. Adding `tabIndex={0}` to a `<div role="button">` works but is more fragile and requires explicit Enter/Space key handling.

---

### CI-3 · `NO_DESCRIPTIVE_TEXT` — Interactive elements with no accessible name

**Total instances:** 25 (across all 5 pages)  
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A) and 2.4.6 Headings and Labels (Level AA)

#### Description

Several interactive elements lack an accessible name — either because their text content is hidden from AT via `aria-hidden="true"` on the inner span, or because the element has no text content at all. Screen readers announce the role but not the purpose, making these controls unusable.

#### Affected Elements & Pages

| Element | Selector | Issue | Pages |
|---|---|---|---|
| Search icon button | `.icon-btn:nth-child(2)` | Inner `<span>` has `aria-hidden="true"`, SVG is `aria-hidden="true"` → no name | All 5 pages |
| Login icon button | `.icon-btn:nth-child(4)` | Same pattern | All 5 pages |
| "Shop Drinkware/Fun & Games/Stationery" | `.product-card:nth-child(N) > .shop-link` | Inner `<span>` is `aria-hidden="true"` | Homepage |
| FAQs footer link | `.footer-list:nth-child(2) > li > .footer-nav-item` | Inner `<span>` is `aria-hidden="true"` | All 5 pages |

#### Source Files

- `src/components/Header.jsx` lines 140–159: `<span aria-hidden="true">Search</span>` and `<span aria-hidden="true">Login</span>`
- `src/components/PopularSection.jsx` line 59: `<span aria-hidden="true">{product.shopLabel}</span>`
- `src/components/Footer.jsx` line 12: `<span aria-hidden="true">FAQs</span>`

#### DOM Snippets (representative)

```html
<!-- Search div — no accessible name -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>

<!-- FAQs footer item — no accessible name -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

#### Recommended Fix

Remove `aria-hidden="true"` from the visible text spans, or add `aria-label` to the container element, or (best) convert to a native `<button>`/`<a>` with visible text.

```jsx
// Before (broken) — Search button
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>

// After (fixed)
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** `aria-label` on a native `<button>` provides an accessible name that overrides child text, making it compatible with all AT. Removing `aria-hidden` from visible text is even simpler but requires the text to be styled appropriately (it becomes part of the element's name computation via its text node).

---

### CI-4 · `AXE-BUTTON-NAME` — Modal close buttons and cart item remove buttons have no accessible name

**Total instances:** 15 (all 5 pages × 2–5 buttons each)  
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)

#### Description

The close buttons in `CartModal` and `WishlistModal`, and the "remove item" button inside `CartModal`, contain only an SVG icon with `aria-hidden="true"`. No `aria-label` or visible text provides an accessible name. Screen readers announce these as "button" with no purpose.

#### Affected Elements & Pages

| Element | Selector | Pages |
|---|---|---|
| CartModal close button | `#cart-modal > div:nth-child(1) > button` | All 5 pages (modal rendered globally) |
| WishlistModal close button | `div[role="dialog"] > div:nth-child(1) > button` | All 5 pages |
| CartModal "remove item" buttons (per item in cart) | `li > button` | Checkout, Order Confirmation (when cart has items) |

#### Source Files

- `src/components/CartModal.jsx` line 56–64: close button, line 102–110: remove button
- `src/components/WishlistModal.jsx` line 61–80: close button

#### DOM Snippets

```html
<!-- CartModal close button — no name -->
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg aria-hidden="true">…</svg>
</button>

<!-- WishlistModal close button — no name -->
<button class="WEtKZofboSdJ1n7KLpwd">
  <svg aria-hidden="true">…</svg>
</button>
```

#### Recommended Fix

Add `aria-label` to each icon-only button.

```jsx
// CartModal close button
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>

// WishlistModal close button
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>

// CartModal remove item button
<button
  className={styles.removeBtn}
  onClick={() => removeFromCart(item.id)}
  aria-label={`Remove ${item.name} from cart`}
>
```

**Why this approach:** `aria-label` is the standard, low-footprint mechanism for naming icon-only buttons. It is universally supported by all AT. Including the item name in the remove button's label additionally prevents ambiguity when multiple items are in the cart.

---

### CI-5 · `AXE-ARIA-VALID-ATTR-VALUE` — Invalid ARIA attribute values

**Total instances:** 5 (Homepage ×2, Product Detail ×1, Checkout ×1, Order Confirmation ×1)  
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)

#### Description

Two types of invalid ARIA attribute values are present:

1. **`aria-expanded="yes"`** — The `aria-expanded` attribute only accepts `"true"` or `"false"`. The value `"yes"` is invalid and causes AT to ignore the attribute entirely.
2. **`aria-relevant="changes"`** — The `aria-relevant` attribute must be a space-separated list of tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not one of these tokens.

#### Affected Elements & Pages

| Element | Selector | Invalid Attribute | Pages |
|---|---|---|---|
| Featured card heading 1 | `.featured-card:nth-child(1) > .featured-card-info > h1` | `aria-expanded="yes"` | Homepage |
| Featured card heading 2 | `.featured-card:nth-child(2) > .featured-card-info > h1` | `aria-expanded="yes"` | Homepage |
| Product details list | `ul[aria-relevant="changes"]` | `aria-relevant="changes"` | Product Detail, Checkout, Order Confirmation |

#### Source Files

- `src/components/FeaturedPair.jsx` line 46: `<h1 aria-expanded="yes">`
- `src/pages/ProductPage.jsx` line 144–148: `<ul aria-relevant="changes" aria-live="polite">`

#### DOM Snippets

```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>

<ul aria-relevant="changes" aria-live="polite">…</ul>
```

#### Recommended Fix

```jsx
// FeaturedPair.jsx — aria-expanded does not apply to a static <h1>; remove it entirely
// or if the intent is to show an expandable section, convert to a proper disclosure pattern.
<h1>{item.title}</h1>  // Remove aria-expanded="yes"

// ProductPage.jsx — use a valid aria-relevant value
<ul
  className={styles.detailsList}
  aria-relevant="additions text"  // valid tokens
  aria-live="polite"
>
```

**Why this approach:** Invalid ARIA values are treated as absent by browsers, defeating the intent of the attribute. For `aria-expanded`, `<h1>` is a static element and does not need or benefit from `aria-expanded`; removing it is the correct fix. For `aria-relevant`, `"additions text"` is the closest valid equivalent to the intended meaning "changes to text/additions".

---

### CI-6 · `AXE-IMAGE-ALT` — Images missing alternative text

**Total instances:** 2 (Homepage only)  
**WCAG criterion:** 1.1.1 Non-text Content (Level A)

#### Description

Two `<img>` elements have no `alt` attribute. Screen readers will fall back to announcing the filename (e.g., "New_Tees.png") which is meaningless to users.

#### Affected Elements & Pages

| Element | Selector | Source | Page |
|---|---|---|---|
| Hero banner image | `img[src$="New_Tees.png"]` | `HeroBanner.jsx` line 18 | Homepage |
| The Drop section image | `img[src$="2bags_charms1.png"]` | `TheDrop.jsx` line 13 | Homepage |

#### DOM Snippets

```html
<img src="/images/home/New_Tees.png">
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

#### Recommended Fix

```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="New winter basics collection — warm-toned apparel" />

// TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" alt="Limited-edition Android, YouTube, and Super G plushie bag charms" />
```

**Why this approach:** Descriptive `alt` text is required for informative images. The text should convey the same information a sighted user would gain from the image. Pure decorative images should have `alt=""` (empty), but these hero/feature images carry meaningful promotional content.

---

### CI-7 · `AXE-ARIA-REQUIRED-ATTR` — `role="slider"` missing required ARIA attributes

**Total instances:** 1 (Homepage only)  
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)

#### Description

The `.drop-popularity-bar` element in `TheDrop.jsx` has `role="slider"` but is missing the three required attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, AT cannot report the current or valid range of values to the user, making the widget meaningless.

#### Affected Element

| Selector | Page | Source |
|---|---|---|
| `.drop-popularity-bar` | Homepage | `src/components/TheDrop.jsx` line 19 |

#### DOM Snippet

```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

#### Recommended Fix

```jsx
// TheDrop.jsx — add required slider attributes (or remove role="slider" if purely decorative)
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

If the bar is purely visual and conveys no interactive meaning, the correct fix is to remove `role="slider"` entirely and add `aria-hidden="true"`:

```jsx
<div className="drop-popularity-bar" aria-hidden="true" />
```

**Why this approach:** ARIA's authoring practices require that `role="slider"` always include `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. If those values are unavailable or the widget is not interactive, the role must be removed to avoid misleading AT. Making it `aria-hidden="true"` is appropriate for a purely decorative progress indicator.

---

## 5. Recommended Fixes Summary

> Per the user's instruction, **no remediations were applied to the source code**. The fixes described below are recommendations only.

| Issue ID | Type | WCAG | Root Cause File(s) | Recommended Change |
|---|---|---|---|---|
| CI-1 | `WRONG_SEMANTIC_ROLE` | 4.1.2 (A) | `Header.jsx`, `PopularSection.jsx`, `FilterSidebar.jsx`, `Footer.jsx`, `CartModal.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx` | Replace `<div onClick>` with `<button>` or `<a>` |
| CI-2 | `NOT_FOCUSABLE` | 2.1.1 (A) | Same as CI-1 + `TheDrop.jsx` | Same as CI-1; add `tabIndex={0}` + keyboard handlers to any remaining `role="button"` divs |
| CI-3 | `NO_DESCRIPTIVE_TEXT` | 4.1.2 (A) | `Header.jsx`, `PopularSection.jsx`, `Footer.jsx` | Remove `aria-hidden="true"` from inner text spans or add `aria-label` to container |
| CI-4 | `AXE-BUTTON-NAME` | 4.1.2 (A) | `CartModal.jsx`, `WishlistModal.jsx` | Add `aria-label="Close shopping cart"` / `"Close wishlist"` / `"Remove {item.name} from cart"` |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` | 4.1.2 (A) | `FeaturedPair.jsx`, `ProductPage.jsx` | Remove `aria-expanded="yes"` from `<h1>`; change `aria-relevant="changes"` to `"additions text"` |
| CI-6 | `AXE-IMAGE-ALT` | 1.1.1 (A) | `HeroBanner.jsx`, `TheDrop.jsx` | Add descriptive `alt` text to both `<img>` elements |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` | 4.1.2 (A) | `TheDrop.jsx` | Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` to slider, or remove `role="slider"` if decorative |

---

## 6. Non-Critical Issues (Not Remediated)

The following issues were detected at **Serious** severity. They were not remediated per project scope, but they represent meaningful accessibility barriers that should be addressed in a subsequent pass.

---

### NC-1 · `AXE-COLOR-CONTRAST` (SERIOUS) — Insufficient colour contrast ratio

**Total instances:** 22 (across all pages)  
**WCAG criterion:** 1.4.3 Contrast (Minimum) (Level AA)

| Affected Element | Selector | Page(s) |
|---|---|---|
| Hero subtitle text | `.hero-content > p` ("Warm hues for cooler days") | Homepage |
| Filter count badges | `.filter-count` spans (×13 instances, all filter groups) | Products |
| Products found count | `.products-found` | Products |
| Product description text | `p.tE3CCfWiGRrHgQcKaAUa` | Product Detail, Checkout, Order Confirmation |
| Checkout step label | `span.step-label` ("Shipping & Payment") | Checkout, Order Confirmation |
| Order summary tax note | `aside > p.summary-tax-note` | Checkout, Order Confirmation |
| Order ID label | `span.confirm-order-id-label` | Order Confirmation |

**Recommended fix:** Increase the text colour or background colour on all affected elements to achieve a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt / 14pt bold). Specific CSS property changes are needed in `HeroBanner.css`, `FilterSidebar.css`, `NewPage.css`, `ProductPage.module.css`, and `CheckoutPage.css`.

---

### NC-2 · `AXE-HTML-HAS-LANG` (SERIOUS) — `<html>` element missing `lang` attribute

**Total instances:** 8 (all pages, appears multiple times in checkout/confirmation flows)  
**WCAG criterion:** 3.1.1 Language of Page (Level A)

| Selector | Page(s) |
|---|---|
| `html` | All 5 pages |

**Root cause:** `public/index.html` line 3 — `<html>` has no `lang` attribute.

**Recommended fix:**
```html
<!-- public/index.html -->
<html lang="en">
```

One-line change in `public/index.html` eliminates all 8 instances of this issue.

---

### NC-3 · `AXE-VALID-LANG` (SERIOUS) — Invalid `lang` attribute value

**Total instances:** 1 (Homepage only)  
**WCAG criterion:** 3.1.2 Language of Parts (Level AA)

| Selector | Page |
|---|---|
| `p[lang="zz"]` | Homepage |

**Root cause:** `src/components/TheDrop.jsx` line 21 — `<p lang="zz">` uses a fictitious BCP 47 language tag.

**DOM Snippet:**
```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>
```

**Recommended fix:** Remove the `lang="zz"` attribute (the paragraph is in English and inherits `lang="en"` from the document root once NC-2 is fixed), or use `lang="en"` explicitly.

---

## 7. Issues Catalogue by Page

### Homepage (`/`) — 35 total (32 critical, 3 serious)

| Severity | Type | Count | Affected Elements |
|---|---|---|---|
| CRITICAL | `WRONG_SEMANTIC_ROLE` | 9 | `.wishlist-btn`, `.icon-btn×2`, `.flag-group`, `.shop-link×3`, `.footer-nav-item×2` |
| CRITICAL | `NOT_FOCUSABLE` | 10 | Same + `.drop-popularity-bar` |
| CRITICAL | `NO_DESCRIPTIVE_TEXT` | 6 | `.icon-btn×2`, `.shop-link×3`, `.footer-nav-item (FAQs)` |
| CRITICAL | `AXE-BUTTON-NAME` | 2 | CartModal close, WishlistModal close |
| CRITICAL | `AXE-ARIA-VALID-ATTR-VALUE` | 2 | FeaturedPair `<h1 aria-expanded="yes">×2` |
| CRITICAL | `AXE-IMAGE-ALT` | 2 | `img[New_Tees.png]`, `img[2bags_charms1.png]` |
| CRITICAL | `AXE-ARIA-REQUIRED-ATTR` | 1 | `.drop-popularity-bar` (slider missing valuenow/min/max) |
| SERIOUS | `AXE-COLOR-CONTRAST` | 1 | `.hero-content > p` |
| SERIOUS | `AXE-HTML-HAS-LANG` | 1 | `<html>` |
| SERIOUS | `AXE-VALID-LANG` | 1 | `p[lang="zz"]` |

### Products (`/shop/new`) — 55 total (41 critical, 14 serious)

| Severity | Type | Count | Affected Elements |
|---|---|---|---|
| CRITICAL | `WRONG_SEMANTIC_ROLE` | 18 | `.wishlist-btn`, `.icon-btn×2`, `.flag-group`, `.filter-option×14` (price/size/brand filters) |
| CRITICAL | `NOT_FOCUSABLE` | 18 | Same as above |
| CRITICAL | `NO_DESCRIPTIVE_TEXT` | 3 | `.icon-btn×2`, `.footer-nav-item (FAQs)` |
| CRITICAL | `AXE-BUTTON-NAME` | 2 | CartModal close, WishlistModal close |
| SERIOUS | `AXE-COLOR-CONTRAST` | 13 | `.filter-count×12`, `.products-found` |
| SERIOUS | `AXE-HTML-HAS-LANG` | 1 | `<html>` |

### Product Detail (`/product/1`) — 20 total (18 critical, 2 serious)

| Severity | Type | Count | Affected Elements |
|---|---|---|---|
| CRITICAL | `WRONG_SEMANTIC_ROLE` | 6 | `.wishlist-btn`, `.icon-btn×2`, `.flag-group`, `.footer-nav-item×2` |
| CRITICAL | `NOT_FOCUSABLE` | 6 | Same as above |
| CRITICAL | `NO_DESCRIPTIVE_TEXT` | 3 | `.icon-btn×2`, `.footer-nav-item (FAQs)` |
| CRITICAL | `AXE-BUTTON-NAME` | 2 | CartModal close, WishlistModal close |
| CRITICAL | `AXE-ARIA-VALID-ATTR-VALUE` | 1 | `ul[aria-relevant="changes"]` |
| SERIOUS | `AXE-COLOR-CONTRAST` | 1 | Product description paragraph |
| SERIOUS | `AXE-HTML-HAS-LANG` | 1 | `<html>` |

### Checkout (`/checkout`) — 37 total (32 critical, 5 serious)

| Severity | Type | Count | Affected Elements |
|---|---|---|---|
| CRITICAL | `WRONG_SEMANTIC_ROLE` | 11 | `.wishlist-btn`, `.icon-btn×2`, `.flag-group`, `.checkout-continue-btn`, `.checkout-back-btn`, `.footer-nav-item×2`, CartModal `div.continueBtn` |
| CRITICAL | `NOT_FOCUSABLE` | 11 | Same as above |
| CRITICAL | `NO_DESCRIPTIVE_TEXT` | 5 | `.icon-btn×2`, `.footer-nav-item (FAQs)`, and checkout-specific interactive divs |
| CRITICAL | `AXE-BUTTON-NAME` | 4 | CartModal close, WishlistModal close, CartModal remove item, CartModal checkout-step close |
| CRITICAL | `AXE-ARIA-VALID-ATTR-VALUE` | 1 | `ul[aria-relevant="changes"]` (ProductPage component embedded in checkout) |
| SERIOUS | `AXE-COLOR-CONTRAST` | 3 | Product description, `.step-label`, `.summary-tax-note` |
| SERIOUS | `AXE-HTML-HAS-LANG` | 2 | `<html>` (appears twice due to navigation within test) |

### Order Confirmation (`/order-confirmation`) — 61 total (54 critical, 7 serious)

| Severity | Type | Count | Affected Elements |
|---|---|---|---|
| CRITICAL | `WRONG_SEMANTIC_ROLE` | 20 | `.wishlist-btn`, `.icon-btn×2`, `.flag-group`, `.confirm-home-link`, `.footer-nav-item×2`, plus CartModal/WishlistModal interactive divs |
| CRITICAL | `NOT_FOCUSABLE` | 20 | Same as above |
| CRITICAL | `NO_DESCRIPTIVE_TEXT` | 8 | `.icon-btn×2`, `.footer-nav-item (FAQs)`, confirmation-page interactive elements |
| CRITICAL | `AXE-BUTTON-NAME` | 5 | CartModal close, WishlistModal close, remove item button ×2, additional close button |
| CRITICAL | `AXE-ARIA-VALID-ATTR-VALUE` | 1 | `ul[aria-relevant="changes"]` |
| SERIOUS | `AXE-COLOR-CONTRAST` | 4 | Product description, `.step-label`, `.summary-tax-note`, `.confirm-order-id-label` |
| SERIOUS | `AXE-HTML-HAS-LANG` | 3 | `<html>` (appears multiple times in multi-step flow) |

---

## 8. Root Cause Analysis

The critical issues share a common root cause: **the intentional use of non-semantic HTML elements (`<div>`, `<span>`) as interactive controls**. The source comments in the codebase (e.g., `// A11Y-GEN1 interactable-role`) indicate these are deliberately introduced accessibility defects for demonstration/testing purposes.

The non-critical issues stem from:
1. A missing `lang` attribute in `public/index.html` — a single-token fix that resolves all 8 `AXE-HTML-HAS-LANG` instances.
2. Colour palette choices in CSS files that produce insufficient contrast for text elements.
3. A hardcoded invalid language tag `lang="zz"` in `TheDrop.jsx`.

---

## 9. Prioritisation Recommendation

| Priority | Issue ID | Effort | Impact |
|---|---|---|---|
| P0 (Immediate) | NC-2: `AXE-HTML-HAS-LANG` | 1 line, `public/index.html` | Resolves 8 instances across all pages; WCAG 3.1.1 Level A |
| P0 (Immediate) | CI-6: `AXE-IMAGE-ALT` | 2 lines across 2 files | Resolves complete blindness to hero content; WCAG 1.1.1 Level A |
| P0 (Immediate) | CI-4: `AXE-BUTTON-NAME` | `aria-label` on 3 buttons | Modals entirely unusable by screen readers without this |
| P1 (High) | CI-1 + CI-2: Semantic role + focus | Refactor 8 files, ~30 elements | Enables keyboard navigation across entire site |
| P1 (High) | CI-3: No descriptive text | Remove `aria-hidden` / add `aria-label` | Screen reader users can identify navigation controls |
| P2 (Medium) | CI-5: Invalid ARIA values | 2 attribute corrections | Prevents AT from silently ignoring ARIA intent |
| P2 (Medium) | CI-7: Slider missing attrs | 3 attrs or `aria-hidden` | Prevents misleading slider widget from confusing AT |
| P3 (Lower) | NC-1: Colour contrast | CSS colour updates across 5 files | Improves readability for low-vision users |
| P3 (Lower) | NC-3: Invalid lang tag | Remove `lang="zz"` | Prevents incorrect TTS language detection |

---

## 10. Raw Data

Full issue JSON files are saved at:
- `tests/e2e/test-results/page-homepage.json` (35 issues)
- `tests/e2e/test-results/page-products.json` (55 issues)
- `tests/e2e/test-results/page-product-detail.json` (20 issues)
- `tests/e2e/test-results/page-checkout.json` (37 issues)
- `tests/e2e/test-results/page-order-confirmation.json` (61 issues)

Audit spec: `tests/e2e/specs/per-page-a11y-audit.spec.ts`
