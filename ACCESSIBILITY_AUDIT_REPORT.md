# Accessibility Audit Report — Demo E-Commerce Website

**Audit Date:** 2026-03-17  
**Tool:** Evinced JS Playwright SDK (`@evinced/js-playwright-sdk`)  
**Engine:** Evinced proprietary engine + axe-core rules (via Evinced integration)  
**Spec file:** `tests/e2e/specs/a11y-full-audit.spec.ts`  
**Reports:** `tests/e2e/test-results/a11y-audit-6df0/`

---

## 1. Repository Overview

This is a React 18 single-page application (SPA) built with Webpack 5 and React Router v7. It simulates a merchandise e-commerce storefront.

### Application Entry Points & Pages Scanned

| # | Route | Page Name | Entry Component | Notes |
|---|-------|-----------|-----------------|-------|
| 1 | `/` | Homepage | `src/pages/HomePage.jsx` | Landing page with hero banner, featured categories, trending collections, "The Drop" section |
| 2 | `/shop/new` | Products Listing | `src/pages/NewPage.jsx` | Product grid with filter sidebar and sort dropdown |
| 3 | `/product/:id` | Product Detail | `src/pages/ProductPage.jsx` | Individual product page (tested with `/product/1`) |
| 4 | `/checkout` (basket step) | Checkout — Basket | `src/pages/CheckoutPage.jsx` | Cart review step |
| 5 | `/checkout` (shipping step) | Checkout — Shipping | `src/pages/CheckoutPage.jsx` | Shipping & payment form step |
| 6 | `/order-confirmation` | Order Confirmation | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation |

**Shared components** present on every page: `Header.jsx` (navigation, icon buttons, cart/wishlist triggers), `Footer.jsx`, `CartModal.jsx` (cart drawer), `WishlistModal.jsx` (wishlist drawer).

---

## 2. Audit Summary

| Page | Total Issues | Critical | Serious |
|------|-------------|----------|---------|
| Homepage (`/`) | 35 | 32 | 3 |
| Products Page (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/1`) | 20 | 18 | 2 |
| Checkout — Basket (`/checkout`) | 21 | 18 | 3 |
| Checkout — Shipping (`/checkout`) | 19 | 18 | 1 |
| Order Confirmation (`/order-confirmation`) | 20 | 18 | 2 |
| **TOTAL** | **170** | **145** | **25** |

> **Note:** Many issues are shared components (Header, Footer, CartModal, WishlistModal) that appear on every page. The per-page counts therefore overlap — the same underlying defect is counted once per page state where it appears.

---

## 3. Critical Issues

Critical issues violate WCAG Level A requirements (the minimum conformance level). They directly prevent users of assistive technology — screen readers, keyboard-only users, switch-access users — from perceiving, understanding, or operating core UI functionality.

The 145 individual critical findings cluster into **7 issue groups** (CI-1 through CI-7) based on the underlying defect.

---

### CI-1 — Interactable Role: `<div>` Elements Used as Interactive Controls

**Evinced Rule:** Interactable role  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Severity:** Critical  
**Total occurrences:** 54 (across all 6 page states)

**Description:** A screen reader identifies interactive elements through their semantic role. Native HTML elements (`<button>`, `<a>`, `<input>`) expose the correct role automatically. When a `<div>` with an `onClick` handler is used instead, the element has no role — the screen reader announces it as generic text, not as something the user can activate. The user has no way to know the element is interactive.

#### Affected Elements and Pages

| Element (CSS selector / DOM) | Source File | Pages Affected |
|------------------------------|-------------|----------------|
| `<div class="icon-btn wishlist-btn">` — wishlist open button | `src/components/Header.jsx:131` | All 6 pages |
| `<div class="icon-btn">` — search button (no role, no accessible name) | `src/components/Header.jsx:140` | All 6 pages |
| `<div class="icon-btn">` — login button (no role, no accessible name) | `src/components/Header.jsx:156` | All 6 pages |
| `<div class="flag-group">` — region/language selector | `src/components/Header.jsx:161` | All 6 pages |
| `<div class="footer-nav-item">Sustainability</div>` | `src/components/Footer.jsx:12` | All 6 pages |
| `<div class="footer-nav-item"><span aria-hidden>FAQs</span></div>` | `src/components/Footer.jsx:16` | All 6 pages |
| `<div class="shop-link"><span aria-hidden>Shop Drinkware</span></div>` | `src/components/PopularSection.jsx` | Homepage only |
| `<div class="shop-link"><span aria-hidden>Shop Fun and Games</span></div>` | `src/components/PopularSection.jsx` | Homepage only |
| `<div class="shop-link"><span aria-hidden>Shop Stationery</span></div>` | `src/components/PopularSection.jsx` | Homepage only |
| `<div class="checkout-continue-btn">Continue</div>` | `src/pages/CheckoutPage.jsx:157` | Checkout — Basket |
| `<div class="checkout-back-btn">← Back to Cart</div>` | `src/pages/CheckoutPage.jsx` | Checkout — Shipping |
| `<div class="confirm-home-link">← Back to Shop</div>` | `src/pages/OrderConfirmationPage.jsx:40` | Order Confirmation |
| Filter option `<div class="filter-option">` (×12 price/size/brand options) | `src/components/FilterSidebar.jsx:74,116,156` | Products Page only |

#### Recommended Fix

Replace each non-semantic `<div>` with the appropriate native HTML element:

- Interactive controls that trigger an action → replace with `<button>` (automatically gets `role="button"`, keyboard focusability, and `click` on Enter/Space).
- Navigation items that link to a URL → replace with `<a href="...">` (automatically gets `role="link"`).
- Filter checkboxes → replace with `<input type="checkbox">` wrapped in `<label>`, or use a `<div role="checkbox" tabindex="0" aria-checked="...">` pattern with a full keyboard handler.

**Why this approach:** Native HTML elements expose the correct accessibility semantics without any additional ARIA. Using `role="button"` + `tabIndex={0}` on a `<div>` is a valid but secondary approach; it still requires manually adding `onKeyDown` (Enter/Space) handlers. Replacing with `<button>` is simpler, less error-prone, and produces a smaller diff.

---

### CI-2 — Keyboard Accessible: Interactive Elements Not Reachable by Keyboard

**Evinced Rule:** Keyboard accessible  
**WCAG:** 2.1.1 (A) — Keyboard  
**Severity:** Critical  
**Total occurrences:** 55 (across all 6 page states)

**Description:** All functionality must be operable via keyboard alone. A `<div>` with `onClick` is not natively focusable — it does not appear in the Tab sequence unless `tabIndex` is explicitly set. Keyboard-only users (and switch-access users) therefore cannot reach or activate these controls.

#### Affected Elements and Pages

The exact same elements as CI-1 (the `<div>` interactive controls) are also the source of the keyboard-accessible failures. Additionally, the TheDrop slider is keyboard-inaccessible:

| Element | Source File | Pages Affected |
|---------|-------------|----------------|
| All elements listed in CI-1 above | (same as CI-1) | (same as CI-1) |
| `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` | `src/components/TheDrop.jsx:14` | Homepage only |

#### Recommended Fix

The fix for the `<div>` controls is identical to CI-1 (replace with native elements). For the slider specifically:

- Replace the `<div role="slider">` with a native `<input type="range">`, which is keyboard-focusable and operable out of the box.
- Or, if the custom slider must be kept, add `tabIndex={0}` and implement `onKeyDown` handlers for Arrow keys (increment/decrement), Home/End (min/max), and announce value changes.

**Why this approach:** An `<input type="range">` provides all required ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) automatically and is keyboard-accessible without extra JavaScript. The ARIA custom-widget pattern requires significantly more boilerplate and is more fragile.

---

### CI-3 — Accessible Name: Interactive Elements With No Name

**Evinced Rule:** Accessible name  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Severity:** Critical  
**Total occurrences:** 21 (across all 6 page states)

**Description:** Screen readers and voice-control software (e.g. Dragon NaturallySpeaking) identify controls by their accessible name. When an interactive element has no accessible name, the screen reader either skips it or reads a meaningless string (e.g. the filename of an image, or a random CSS class name). Voice-control users cannot activate it by speaking its label.

#### Affected Elements and Pages

| Element | DOM Snippet | Source File | Pages Affected | Reason No Name |
|---------|-------------|-------------|----------------|----------------|
| Search icon button | `<div class="icon-btn">` + SVG `aria-hidden` + `<span aria-hidden>Search</span>` | `src/components/Header.jsx:140` | All 6 pages | Both the SVG icon and the visible "Search" text have `aria-hidden="true"`; nothing is exposed to the accessibility tree |
| Login icon button | `<div class="icon-btn">` + SVG `aria-hidden` + `<span aria-hidden>Login</span>` | `src/components/Header.jsx:156` | All 6 pages | Same pattern — visible text is hidden from AT |
| FAQs footer link | `<div class="footer-nav-item"><span aria-hidden>FAQs</span></div>` | `src/components/Footer.jsx:16` | All 6 pages | The only text content is wrapped in `aria-hidden="true"` |
| Shop Drinkware link | `<div class="shop-link"><span aria-hidden>Shop Drinkware</span></div>` | `src/components/PopularSection.jsx` | Homepage | Label text is `aria-hidden` |
| Shop Fun and Games link | `<div class="shop-link"><span aria-hidden>Shop Fun and Games</span></div>` | `src/components/PopularSection.jsx` | Homepage | Label text is `aria-hidden` |
| Shop Stationery link | `<div class="shop-link"><span aria-hidden>Shop Stationery</span></div>` | `src/components/PopularSection.jsx` | Homepage | Label text is `aria-hidden` |

#### Recommended Fix

Two complementary approaches (apply both):

1. **Remove the unnecessary `aria-hidden`** from the text-content `<span>` elements. The `aria-hidden` was placed on them to suppress visual text from being read redundantly — but if the element has no other name source, hiding the text leaves it nameless. The solution is to remove `aria-hidden` from the text spans so the text becomes the accessible name naturally.

2. **On icon-only buttons**, add an explicit `aria-label` (e.g. `aria-label="Search"`, `aria-label="Login"`) to the button element. Keep `aria-hidden="true"` on the SVG icon (to prevent it from being read redundantly) and keep any visible `<span>` text either visually hidden via a `.sr-only` class or simply visible with no `aria-hidden`.

**Why this approach:** The WCAG accessible-name algorithm checks, in order: `aria-labelledby`, `aria-label`, then the element's subtree text content. When all subtree text is `aria-hidden`, no name is computed. Adding `aria-label` directly to the control is the simplest reliable fix for icon buttons.

---

### CI-4 — Button Name: Buttons With No Discernible Text

**Evinced Rule / axe rule:** Button-name  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Severity:** Critical  
**Total occurrences:** 9 (across all 6 page states)

**Description:** `<button>` elements that contain only an SVG icon (with the icon marked `aria-hidden`) have no accessible name. The screen reader announces the button but cannot say what it does.

#### Affected Elements and Pages

| Element | DOM Snippet | Source File | Pages Affected |
|---------|-------------|-------------|----------------|
| Cart modal close button | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg aria-hidden...></svg></button>` | `src/components/CartModal.jsx:56` | Homepage, Products, Product Detail (when cart is present in DOM) |
| Wishlist modal close button | `<button class="WEtKZofboSdJ1n7KLpwd"><svg aria-hidden...></svg></button>` | `src/components/WishlistModal.jsx:61` | All 6 pages (wishlist modal is always in DOM) |

Evinced detected 2 button-name issues per page state (cart + wishlist), and an additional instance on pages where the cart modal drawer was open/rendered.

#### Recommended Fix

Add `aria-label="Close"` (or more specific: `aria-label="Close cart"` / `aria-label="Close wishlist"`) to each close button.

```jsx
// CartModal.jsx — close button
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg aria-hidden="true" ...>...</svg>
</button>

// WishlistModal.jsx — close button
<button
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true" ...>...</svg>
</button>
```

**Why this approach:** `aria-label` on the `<button>` element directly sets the accessible name at the highest specificity in the WCAG name computation algorithm and is the standard pattern for icon-only buttons. Keeping `aria-hidden="true"` on the SVG prevents the icon paths from being announced. The result is a clean "Close cart" announcement from screen readers.

---

### CI-5 — Image Alt: Images Missing Alternative Text

**axe Rule:** image-alt  
**WCAG:** 1.1.1 (A) — Non-text Content  
**Severity:** Critical  
**Total occurrences:** 2 (Homepage only)

**Description:** `<img>` elements without an `alt` attribute force screen readers to read the image filename (e.g. "New underscore Tees dot PNG") as the image description. This is both confusing and unhelpful.

#### Affected Elements and Pages

| Element | DOM Snippet | Source File | Page |
|---------|-------------|-------------|------|
| Hero banner product image | `<img src="/images/home/New_Tees.png">` | `src/components/HeroBanner.jsx:18` | Homepage |
| "The Drop" section promo image | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `src/components/TheDrop.jsx:13` | Homepage |

#### Recommended Fix

Add descriptive `alt` text to each image:

```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="New winter basics — a collection of t-shirts in warm tones" />

// TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" alt="Limited-edition Android, YouTube, and Super G plushie bag charms" />
```

For purely decorative images, use `alt=""` (empty string) — this tells screen readers to skip the image entirely. For informational images like these (they communicate a product promotion), a descriptive `alt` is required.

**Why this approach:** The `alt` attribute is the primary mechanism for providing a text alternative. An empty `alt=""` would be incorrect here because the images convey meaningful content (the promotional item and section context). The description should convey the image's purpose from a user perspective, not merely describe what is visually depicted.

---

### CI-6 — Aria-Valid-Attr-Value: Invalid ARIA Attribute Values

**axe Rule:** aria-valid-attr-value  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Severity:** Critical  
**Total occurrences:** 3 (Homepage ×2, Product Detail ×1)

**Description:** ARIA attribute values must conform to the allowed values defined in the ARIA specification. An invalid value causes the attribute to be ignored by the browser's accessibility tree, as if it were not present at all.

#### Affected Elements and Pages

| Element | Invalid Attribute & Value | Valid Values | Source File | Page |
|---------|--------------------------|--------------|-------------|------|
| `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `aria-expanded="yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx` | Homepage |
| `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | `aria-expanded="yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx` | Homepage |
| `<ul aria-relevant="changes" aria-live="polite">` | `aria-relevant="changes"` | Space-separated tokens: `additions`, `removals`, `text`, `all` | `src/pages/ProductPage.jsx:146` | Product Detail |

#### Recommended Fix

**FeaturedPair.jsx — `aria-expanded` on `<h1>` headings:**

`aria-expanded` should not be on a heading element at all — it is a state attribute intended for disclosure buttons or widgets, not static headings. The correct fix is to **remove `aria-expanded` entirely** from the `<h1>` elements:

```jsx
// Remove aria-expanded="yes" from both card headings
<h1>{item.title}</h1>
```

**ProductPage.jsx — `aria-relevant="changes"` on the stock level live region:**

The value `"changes"` is not a valid `aria-relevant` token. The valid tokens are `additions`, `removals`, `text`, and `all`. The intent of `aria-relevant` is typically to announce additions of new text. The fix is to use valid tokens:

```jsx
// Use valid aria-relevant value
<ul aria-relevant="additions text" aria-live="polite">
```

**Why this approach:** Invalid ARIA attribute values are completely ignored by browsers — they do not fall back gracefully. Removing `aria-expanded` from headings removes a meaningless attribute. Correcting `aria-relevant` to valid tokens ensures the live-region behavior works as intended, announcing stock-level changes to screen reader users.

---

### CI-7 — Aria-Required-Attr: Slider Missing Required ARIA Attributes

**axe Rule:** aria-required-attr  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Severity:** Critical  
**Total occurrences:** 1 (Homepage only)

**Description:** When `role="slider"` is applied to an element, the ARIA specification requires that `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` also be present. Without these, the screen reader cannot announce the current value or the range of the slider to the user.

#### Affected Element and Page

| Element | DOM Snippet | Source File | Page |
|---------|-------------|-------------|------|
| Popularity indicator slider | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` | `src/components/TheDrop.jsx:14` | Homepage |

#### Recommended Fix

The element is used as a decorative "popularity bar" and is not actually interactive (it has no value the user can change). Two approaches are appropriate:

**Option A (recommended) — Make it a non-interactive visual indicator using `role="meter"`:**

```jsx
<div
  role="meter"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

**Option B — Make it a purely decorative element with `aria-hidden`:**

```jsx
<div className="drop-popularity-bar" aria-hidden="true" />
```

**Why this approach:** If the bar is decorative (it does not communicate a precise value to the user), Option B is the simplest correct fix. If it does communicate information (e.g. 75% popularity), Option A with `role="meter"` and proper `aria-value*` attributes gives screen readers both the role and the value. `role="meter"` is appropriate for read-only gauges. `role="slider"` implies the value is user-adjustable, which this element is not.

---

## 4. Recommended Fixes Summary Table

| ID | Issue Type | Affected Elements (root cause) | Source Files | Recommended Fix |
|----|-----------|-------------------------------|--------------|-----------------|
| CI-1 | Interactable role | 13 unique `<div onClick>` controls | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx`, `FilterSidebar.jsx` | Replace with `<button>` or `<a>` (native semantics); add `role="checkbox" tabIndex={0}` for filter items |
| CI-2 | Keyboard accessible | Same 13 `<div>` controls + slider | Same as CI-1; `TheDrop.jsx` | Replace with native elements; replace slider with `<input type="range">` |
| CI-3 | Accessible name | 6 icon/text controls with `aria-hidden` on label text | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx` | Add `aria-label` to controls; remove `aria-hidden` from text spans |
| CI-4 | Button name | 2 icon-only close buttons (cart + wishlist) | `CartModal.jsx`, `WishlistModal.jsx` | Add `aria-label="Close cart"` / `aria-label="Close wishlist"` |
| CI-5 | Image alt | 2 `<img>` elements missing `alt` | `HeroBanner.jsx`, `TheDrop.jsx` | Add descriptive `alt` attribute to each image |
| CI-6 | Aria-valid-attr-value | 2 headings with `aria-expanded="yes"`; 1 list with `aria-relevant="changes"` | `FeaturedPair.jsx`, `ProductPage.jsx` | Remove `aria-expanded` from headings; change `aria-relevant="changes"` to `aria-relevant="additions text"` |
| CI-7 | Aria-required-attr | 1 `<div role="slider">` missing value attrs | `TheDrop.jsx` | Convert to `role="meter"` with `aria-valuenow/min/max`, or add `aria-hidden="true"` if decorative |

---

## 5. Non-Critical Issues (Serious — Not Remediated)

The following 25 issues are classified as **Serious** (WCAG Level AA violations or Level A issues with a mitigated user impact). They were detected but are not being remediated in this pass.

### SI-1 — Missing `lang` Attribute on `<html>` Element

**axe Rule:** html-has-lang  
**WCAG:** 3.1.1 (A) — Language of Page  
**Severity:** Serious  
**Occurrences:** 6 (one per page state — same root cause)  
**Source:** `public/index.html:3` — `<html>` has no `lang` attribute

**Issue:** Without a `lang` attribute, screen readers use the operating system's default language to pronounce page content. If the user's OS language differs from the page language, text may be mispronounced.

**Recommended Fix (not applied):** Add `lang="en"` to the `<html>` element in `public/index.html`:
```html
<html lang="en">
```

---

### SI-2 — Insufficient Color Contrast

**axe Rule:** color-contrast  
**WCAG:** 1.4.3 (AA) — Contrast (Minimum) — requires 4.5:1 for normal text  
**Severity:** Serious  
**Occurrences:** 18 individual instances (across 5 page states)

| # | Element | Selector | Contrast Ratio | Required | Page |
|---|---------|----------|----------------|----------|------|
| 1 | Hero subtitle text "Warm hues for cooler days" | `.hero-content > p` | 1.37:1 | 4.5:1 | Homepage |
| 2 | Filter count "(8)" | `.filter-count` (price option 1) | 1.67:1 | 4.5:1 | Products |
| 3 | Filter count "(4)" | `.filter-count` (price option 2) | 1.67:1 | 4.5:1 | Products |
| 4 | Filter count "(4)" | `.filter-count` (price option 3) | 1.67:1 | 4.5:1 | Products |
| 5 | Filter count "(0)" | `.filter-count` (price option 4) | 1.67:1 | 4.5:1 | Products |
| 6 | Filter count "(14)" | `.filter-count` (size XS) | 1.67:1 | 4.5:1 | Products |
| 7 | Filter count "(15)" | `.filter-count` (size SM) | 1.67:1 | 4.5:1 | Products |
| 8 | Filter count "(14)" | `.filter-count` (size MD) | 1.67:1 | 4.5:1 | Products |
| 9 | Filter count "(12)" | `.filter-count` (size LG) | 1.67:1 | 4.5:1 | Products |
| 10 | Filter count "(11)" | `.filter-count` (size XL) | 1.67:1 | 4.5:1 | Products |
| 11 | Filter count "(2)" | `.filter-count` (brand Android) | 1.67:1 | 4.5:1 | Products |
| 12 | Filter count "(13)" | `.filter-count` (brand Google) | 1.67:1 | 4.5:1 | Products |
| 13 | Filter count "(1)" | `.filter-count` (brand YouTube) | 1.67:1 | 4.5:1 | Products |
| 14 | "X Products Found" count text | `.products-found` | 2.08:1 | 4.5:1 | Products |
| 15 | Product description text | `p.productDescription` | 1.81:1 | 4.5:1 | Product Detail |
| 16 | "Shipping & Payment" step label | `.checkout-step:nth-child(3) > .step-label` | 1.91:1 | 4.5:1 | Checkout — Basket |
| 17 | "Taxes calculated at next step" note | `.summary-tax-note` | 3.36:1 | 4.5:1 | Checkout — Basket |
| 18 | "Order ID" label | `.confirm-order-id-label` | 3.49:1 | 4.5:1 | Order Confirmation |

**Recommended Fix (not applied):** Darken the foreground color of each affected text element in its corresponding CSS file (`HeroBanner.css`, `FilterSidebar.css`, `NewPage.css`, `ProductPage.module.css`, `CheckoutPage.css`, `OrderConfirmationPage.css`) to achieve a minimum 4.5:1 contrast ratio against its background.

---

### SI-3 — Invalid `lang` Attribute Value

**axe Rule:** valid-lang  
**WCAG:** 3.1.2 (AA) — Language of Parts  
**Severity:** Serious  
**Occurrences:** 1 (Homepage only)  
**Source:** `src/components/TheDrop.jsx:21` — `<p lang="zz">`

**Issue:** `"zz"` is not a valid BCP 47 language tag. Screen readers rely on valid language tags to switch their text-to-speech voice and pronunciation. An invalid tag is ignored, causing the contained text to be announced using the page's default language (which, due to SI-1, is also not declared).

**Recommended Fix (not applied):** Change `lang="zz"` to `lang="en"` (or the correct language of the content):
```jsx
<p lang="en">Our brand-new, limited-edition plushie bag charms...</p>
```

---

## 6. Complete Per-Page Issue Inventory

### 6.1 Homepage (`/`)

| # | Type | Severity | Element | WCAG |
|---|------|----------|---------|------|
| 1 | Interactable role | Critical | `.wishlist-btn` (`<div>`) | 4.1.2 A |
| 2 | Keyboard accessible | Critical | `.wishlist-btn` (`<div>`) | 2.1.1 A |
| 3 | Interactable role | Critical | `.icon-btn:nth-child(2)` (Search `<div>`) | 4.1.2 A |
| 4 | Accessible name | Critical | `.icon-btn:nth-child(2)` (Search `<div>`) | 4.1.2 A |
| 5 | Keyboard accessible | Critical | `.icon-btn:nth-child(2)` (Search `<div>`) | 2.1.1 A |
| 6 | Interactable role | Critical | `.icon-btn:nth-child(4)` (Login `<div>`) | 4.1.2 A |
| 7 | Accessible name | Critical | `.icon-btn:nth-child(4)` (Login `<div>`) | 4.1.2 A |
| 8 | Keyboard accessible | Critical | `.icon-btn:nth-child(4)` (Login `<div>`) | 2.1.1 A |
| 9 | Interactable role | Critical | `.flag-group` (`<div>`) | 4.1.2 A |
| 10 | Keyboard accessible | Critical | `.flag-group` (`<div>`) | 2.1.1 A |
| 11 | Interactable role | Critical | `.product-card:nth-child(1) > .shop-link` | 4.1.2 A |
| 12 | Accessible name | Critical | `.product-card:nth-child(1) > .shop-link` | 4.1.2 A |
| 13 | Keyboard accessible | Critical | `.product-card:nth-child(1) > .shop-link` | 2.1.1 A |
| 14 | Interactable role | Critical | `.product-card:nth-child(2) > .shop-link` | 4.1.2 A |
| 15 | Accessible name | Critical | `.product-card:nth-child(2) > .shop-link` | 4.1.2 A |
| 16 | Keyboard accessible | Critical | `.product-card:nth-child(2) > .shop-link` | 2.1.1 A |
| 17 | Interactable role | Critical | `.product-card:nth-child(3) > .shop-link` | 4.1.2 A |
| 18 | Accessible name | Critical | `.product-card:nth-child(3) > .shop-link` | 4.1.2 A |
| 19 | Keyboard accessible | Critical | `.product-card:nth-child(3) > .shop-link` | 2.1.1 A |
| 20 | Interactable role | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 4.1.2 A |
| 21 | Keyboard accessible | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 2.1.1 A |
| 22 | Interactable role | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 23 | Accessible name | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 24 | Keyboard accessible | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 2.1.1 A |
| 25 | Keyboard accessible | Critical | `.drop-popularity-bar` (slider, no keyboard handler) | 2.1.1 A |
| 26 | Aria-required-attr | Critical | `.drop-popularity-bar` (`role="slider"` missing value attrs) | 4.1.2 A |
| 27 | Aria-valid-attr-value | Critical | `.featured-card:nth-child(1) h1` (`aria-expanded="yes"`) | 4.1.2 A |
| 28 | Aria-valid-attr-value | Critical | `.featured-card:nth-child(2) h1` (`aria-expanded="yes"`) | 4.1.2 A |
| 29 | Button-name | Critical | `#cart-modal > div:nth-child(1) > button` (cart close) | 4.1.2 A |
| 30 | Button-name | Critical | `div[role="dialog"] > div:nth-child(1) > button` (wishlist close) | 4.1.2 A |
| 31 | Image-alt | Critical | `img[src$="New_Tees.png"]` | 1.1.1 A |
| 32 | Image-alt | Critical | `img[src$="2bags_charms1.png"]` | 1.1.1 A |
| 33 | Color-contrast | Serious | `.hero-content > p` (1.37:1 ratio) | 1.4.3 AA |
| 34 | Html-has-lang | Serious | `<html>` (missing lang attribute) | 3.1.1 A |
| 35 | Valid-lang | Serious | `p[lang="zz"]` (invalid language code) | 3.1.2 AA |

### 6.2 Products Page (`/shop/new`)

| # | Type | Severity | Element | WCAG |
|---|------|----------|---------|------|
| 1 | Interactable role | Critical | `.wishlist-btn` | 4.1.2 A |
| 2 | Keyboard accessible | Critical | `.wishlist-btn` | 2.1.1 A |
| 3 | Interactable role | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 4 | Accessible name | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 5 | Keyboard accessible | Critical | `.icon-btn:nth-child(2)` (Search) | 2.1.1 A |
| 6 | Interactable role | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 7 | Accessible name | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 8 | Keyboard accessible | Critical | `.icon-btn:nth-child(4)` (Login) | 2.1.1 A |
| 9 | Interactable role | Critical | `.flag-group` | 4.1.2 A |
| 10 | Keyboard accessible | Critical | `.flag-group` | 2.1.1 A |
| 11–28 | Interactable role × 9 | Critical | `.filter-option` divs (Price ×4, Size ×5) | 4.1.2 A |
| 29–37 | Keyboard accessible × 9 | Critical | `.filter-option` divs (same) | 2.1.1 A |
| 38 | Interactable role | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 4.1.2 A |
| 39 | Keyboard accessible | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 2.1.1 A |
| 40 | Interactable role | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 41 | Accessible name | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 42–54 | Keyboard accessible + Accessible name | Critical | Filter brand options ×3 + footer-nav-item | 2.1.1/4.1.2 A |
| 41 | Button-name | Critical | `#cart-modal > div:nth-child(1) > button` (cart close) | 4.1.2 A |
| 42 | Button-name | Critical | `div[role="dialog"] > div:nth-child(1) > button` (wishlist close) | 4.1.2 A |
| 43–55 | Color-contrast ×13 | Serious | `.filter-count` spans (×12) + `.products-found` (×1) | 1.4.3 AA |
| 56 | Html-has-lang | Serious | `<html>` | 3.1.1 A |

### 6.3 Product Detail (`/product/1`)

| # | Type | Severity | Element | WCAG |
|---|------|----------|---------|------|
| 1 | Interactable role | Critical | `.wishlist-btn` | 4.1.2 A |
| 2 | Keyboard accessible | Critical | `.wishlist-btn` | 2.1.1 A |
| 3 | Interactable role | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 4 | Accessible name | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 5 | Keyboard accessible | Critical | `.icon-btn:nth-child(2)` (Search) | 2.1.1 A |
| 6 | Interactable role | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 7 | Accessible name | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 8 | Keyboard accessible | Critical | `.icon-btn:nth-child(4)` (Login) | 2.1.1 A |
| 9 | Interactable role | Critical | `.flag-group` | 4.1.2 A |
| 10 | Keyboard accessible | Critical | `.flag-group` | 2.1.1 A |
| 11 | Interactable role | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 4.1.2 A |
| 12 | Keyboard accessible | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 2.1.1 A |
| 13 | Interactable role | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 14 | Accessible name | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 15 | Keyboard accessible | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 2.1.1 A |
| 16 | Aria-valid-attr-value | Critical | `ul[aria-relevant="changes"]` (stock level live region) | 4.1.2 A |
| 17 | Button-name | Critical | `#cart-modal > div:nth-child(1) > button` (cart close) | 4.1.2 A |
| 18 | Button-name | Critical | `div[role="dialog"] > div:nth-child(1) > button` (wishlist close) | 4.1.2 A |
| 19 | Color-contrast | Serious | `p.productDescription` (1.81:1 ratio) | 1.4.3 AA |
| 20 | Html-has-lang | Serious | `<html>` | 3.1.1 A |

### 6.4 Checkout — Basket Step (`/checkout`)

| # | Type | Severity | Element | WCAG |
|---|------|----------|---------|------|
| 1 | Interactable role | Critical | `.wishlist-btn` | 4.1.2 A |
| 2 | Keyboard accessible | Critical | `.wishlist-btn` | 2.1.1 A |
| 3 | Interactable role | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 4 | Accessible name | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 5 | Keyboard accessible | Critical | `.icon-btn:nth-child(2)` (Search) | 2.1.1 A |
| 6 | Interactable role | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 7 | Accessible name | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 8 | Keyboard accessible | Critical | `.icon-btn:nth-child(4)` (Login) | 2.1.1 A |
| 9 | Interactable role | Critical | `.flag-group` | 4.1.2 A |
| 10 | Keyboard accessible | Critical | `.flag-group` | 2.1.1 A |
| 11 | Interactable role | Critical | `.checkout-continue-btn` (`<div>Continue</div>`) | 4.1.2 A |
| 12 | Keyboard accessible | Critical | `.checkout-continue-btn` | 2.1.1 A |
| 13 | Interactable role | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 4.1.2 A |
| 14 | Keyboard accessible | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 2.1.1 A |
| 15 | Interactable role | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 16 | Accessible name | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 17 | Keyboard accessible | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 2.1.1 A |
| 18 | Button-name | Critical | `div:nth-child(1) > button` (wishlist close) | 4.1.2 A |
| 19 | Color-contrast | Serious | `.checkout-step .step-label` "Shipping & Payment" (1.91:1) | 1.4.3 AA |
| 20 | Color-contrast | Serious | `.summary-tax-note` (3.36:1) | 1.4.3 AA |
| 21 | Html-has-lang | Serious | `<html>` | 3.1.1 A |

### 6.5 Checkout — Shipping Step (`/checkout`)

| # | Type | Severity | Element | WCAG |
|---|------|----------|---------|------|
| 1 | Interactable role | Critical | `.wishlist-btn` | 4.1.2 A |
| 2 | Keyboard accessible | Critical | `.wishlist-btn` | 2.1.1 A |
| 3 | Interactable role | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 4 | Accessible name | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 5 | Keyboard accessible | Critical | `.icon-btn:nth-child(2)` (Search) | 2.1.1 A |
| 6 | Interactable role | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 7 | Accessible name | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 8 | Keyboard accessible | Critical | `.icon-btn:nth-child(4)` (Login) | 2.1.1 A |
| 9 | Interactable role | Critical | `.flag-group` | 4.1.2 A |
| 10 | Keyboard accessible | Critical | `.flag-group` | 2.1.1 A |
| 11 | Interactable role | Critical | `.checkout-back-btn` (`<div>← Back to Cart</div>`) | 4.1.2 A |
| 12 | Keyboard accessible | Critical | `.checkout-back-btn` | 2.1.1 A |
| 13 | Interactable role | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 4.1.2 A |
| 14 | Keyboard accessible | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 2.1.1 A |
| 15 | Interactable role | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 16 | Accessible name | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 17 | Keyboard accessible | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 2.1.1 A |
| 18 | Button-name | Critical | `div:nth-child(1) > button` (wishlist close) | 4.1.2 A |
| 19 | Html-has-lang | Serious | `<html>` | 3.1.1 A |

### 6.6 Order Confirmation (`/order-confirmation`)

| # | Type | Severity | Element | WCAG |
|---|------|----------|---------|------|
| 1 | Interactable role | Critical | `.wishlist-btn` | 4.1.2 A |
| 2 | Keyboard accessible | Critical | `.wishlist-btn` | 2.1.1 A |
| 3 | Interactable role | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 4 | Accessible name | Critical | `.icon-btn:nth-child(2)` (Search) | 4.1.2 A |
| 5 | Keyboard accessible | Critical | `.icon-btn:nth-child(2)` (Search) | 2.1.1 A |
| 6 | Interactable role | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 7 | Accessible name | Critical | `.icon-btn:nth-child(4)` (Login) | 4.1.2 A |
| 8 | Keyboard accessible | Critical | `.icon-btn:nth-child(4)` (Login) | 2.1.1 A |
| 9 | Interactable role | Critical | `.flag-group` | 4.1.2 A |
| 10 | Keyboard accessible | Critical | `.flag-group` | 2.1.1 A |
| 11 | Interactable role | Critical | `.confirm-home-link` (`<div>← Back to Shop</div>`) | 4.1.2 A |
| 12 | Keyboard accessible | Critical | `.confirm-home-link` | 2.1.1 A |
| 13 | Interactable role | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 4.1.2 A |
| 14 | Keyboard accessible | Critical | `li:nth-child(3) > .footer-nav-item` (Sustainability) | 2.1.1 A |
| 15 | Interactable role | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 16 | Accessible name | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 4.1.2 A |
| 17 | Keyboard accessible | Critical | `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | 2.1.1 A |
| 18 | Button-name | Critical | `div:nth-child(1) > button` (wishlist close) | 4.1.2 A |
| 19 | Color-contrast | Serious | `.confirm-order-id-label` "Order ID" (3.49:1) | 1.4.3 AA |
| 20 | Html-has-lang | Serious | `<html>` | 3.1.1 A |

---

## 7. Audit Methodology

1. **Environment:** React SPA built with `npm run build` (Webpack 5 production build), served via `npx serve dist -p 3000 --single`.

2. **Browser:** Chromium headless (Playwright Chromium `v1208`, Chrome 145), viewport `1280×800`.

3. **Authentication:** Evinced SDK authenticated via `EVINCED_SERVICE_ID` + `EVINCED_API_KEY` in global setup (`tests/e2e/global-setup.ts`).

4. **Scan method:** `evAnalyze()` — a full-page static scan executed after each page had fully rendered and a 2-second idle period elapsed to allow any deferred rendering to complete.

5. **Checkout and Order Confirmation access:** Cart state was seeded via `localStorage.setItem('cart-items', [...])` before navigating to `/checkout`. The order confirmation page was reached by completing the full checkout form programmatically.

6. **Report output:** Each page produced an Evinced HTML report and CSV file in `tests/e2e/test-results/a11y-audit-6df0/`. Issue data was extracted from the embedded JSON in the HTML reports for this analysis.

7. **Deduplication:** Each entry in this report represents a unique Evinced issue record (unique `issueIndex` within a page scan). Issues that appear on multiple pages (e.g. Header issues) are counted separately per page state, since each page is an independent scan context.

---

## 8. Issue Count Cross-Reference

| Evinced Issue Type | Total Found | Critical | Serious | Root Cause Files |
|-------------------|-------------|----------|---------|-----------------|
| Interactable role | 54 | 54 | 0 | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx`, `FilterSidebar.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx` |
| Keyboard accessible | 55 | 55 | 0 | Same as above + `TheDrop.jsx` |
| Accessible name | 21 | 21 | 0 | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx` |
| Button-name | 9 | 9 | 0 | `CartModal.jsx`, `WishlistModal.jsx` |
| Image-alt | 2 | 2 | 0 | `HeroBanner.jsx`, `TheDrop.jsx` |
| Aria-valid-attr-value | 3 | 3 | 0 | `FeaturedPair.jsx`, `ProductPage.jsx` |
| Aria-required-attr | 1 | 1 | 0 | `TheDrop.jsx` |
| Color-contrast | 18 | 0 | 18 | `HeroBanner.css`, `FilterSidebar.css`, `NewPage.css`, `ProductPage.module.css`, `CheckoutPage.css`, `OrderConfirmationPage.css` |
| Html-has-lang | 6 | 0 | 6 | `public/index.html` |
| Valid-lang | 1 | 0 | 1 | `TheDrop.jsx` |
| **TOTAL** | **170** | **145** | **25** | |
