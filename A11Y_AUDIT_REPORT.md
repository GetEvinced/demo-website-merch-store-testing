# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-17  
**Tool:** Evinced JS Playwright SDK v2.43.0  
**Engine:** Playwright (Chromium headless)  
**Branch:** `cursor/repository-accessibility-audit-2286`

---

## 1. Scope & Pages Audited

The repository is a React single-page application (React 18, React Router v7, Webpack 5) served at `http://localhost:3000`. Six distinct page states were audited by navigating through the full user journey:

| # | Page / State | URL / Trigger | Entry Point |
|---|---|---|---|
| 1 | **Homepage** | `/` | Direct navigation |
| 2 | **Products listing** | `/shop/new` | Direct navigation |
| 3 | **Product detail** | `/product/:id` | Click `.product-card-image-link` on Products |
| 4 | **Checkout – Basket** | Cart modal open on Product detail | Click "Add to cart" button |
| 5 | **Checkout – Shipping form** | `/checkout` step 2 | "Proceed to Checkout" → "Continue" |
| 6 | **Order Confirmation** | `/order-confirmation` | Submit shipping & payment form |

---

## 2. Summary of Findings

| Page | Total Issues | Critical | Serious |
|---|---|---|---|
| Homepage | 35 | 32 | 3 |
| Products | 55 | 41 | 14 |
| Product Detail | 20 | 18 | 2 |
| Checkout – Basket | 24 | 22 | 2 |
| Checkout – Shipping | 19 | 18 | 1 |
| Order Confirmation | 20 | 18 | 2 |
| **Total** | **173** | **149** | **24** |

Critical issues are classified as violations of WCAG 2.x Level A/AA success criteria that block access to functionality for keyboard users, screen reader users, or both. Serious issues represent Level AA failures that significantly degrade the experience but do not completely block access. No "Needs Review" or "Best Practice" issues were detected in this run.

---

## 3. Critical Issues

Critical issues are grouped by component/root cause. Each group lists every affected element and page, the recommended fix, and the rationale for that approach.

---

### CI-1 — Header Interactive Divs: Wrong Semantic Role & Not Keyboard Accessible

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 Name, Role, Value (A) · 2.1.1 Keyboard (A) · 1.3.1 Info and Relationships (A)  
**Source file:** `src/components/Header.jsx`

#### Affected Elements

| Element selector | Visual description | Pages affected |
|---|---|---|
| `.wishlist-btn` | Wishlist heart icon | All 6 pages |
| `.icon-btn:nth-child(2)` | Search magnifier icon | All 6 pages |
| `.icon-btn:nth-child(4)` | Login / bag icon | All 6 pages |
| `.flag-group` | Language / country flag | All 6 pages |

**DOM examples:**
```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
</div>

<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
</div>

<div class="flag-group" style="cursor: pointer;">
  <img src="/images/icons/united-…">
</div>
```

**Total raw issue count:** 24 (4 elements × 6 pages, each flagged for WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE; the search and login divs also flagged for NO_DESCRIPTIVE_TEXT because the inner SVGs carry `aria-hidden="true"` and no other label is provided).

#### Recommended Fix

Replace every interactive `<div>` in the header icon row with a native `<button>` element and add an `aria-label` that names the action:

```jsx
// src/components/Header.jsx — icon buttons
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
  <svg aria-hidden="true">…</svg>
</button>

<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
</button>

<button className="icon-btn" aria-label="Sign in">
  <svg aria-hidden="true">…</svg>
</button>

<button className="flag-group" onClick={…} aria-label="Change language">
  <img src="/images/icons/united-…" alt="" />
</button>
```

#### Rationale

A native `<button>` inherently carries `role="button"`, is included in the tab order by default, and fires on both `Enter` and `Space` keypresses — eliminating all three violation types simultaneously. Adding an `aria-label` provides a text alternative that screen readers announce in place of the silent SVG. The `<img>` inside `.flag-group` should use `alt=""` (empty, not absent) because it is a decorative duplicate when the parent button carries its own `aria-label`. This is the minimal-change approach: no visual regression, no extra ARIA attributes beyond the label, and it leverages platform semantics that browsers expose to the accessibility tree natively.

---

### CI-2 — Footer Navigation Items: Wrong Semantic Role & Not Keyboard Accessible

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A) · 2.1.1 (A)  
**Source file:** `src/components/Footer.jsx`

#### Affected Elements

| Element selector | Visible text | Pages affected |
|---|---|---|
| `li:nth-child(3) > .footer-nav-item` | "Sustainability" | All 6 pages |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | "FAQs" (text inside `<span aria-hidden="true">`) | All 6 pages |

**DOM examples:**
```html
<li>
  <div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>
</li>
<li>
  <div class="footer-nav-item" style="cursor: pointer;">
    <span aria-hidden="true">FAQs</span>
  </div>
</li>
```

**Total raw issue count:** 12 (2 elements × 6 pages; the "FAQs" item also carries `NO_DESCRIPTIVE_TEXT` because its only label text is wrapped in `aria-hidden="true"`, making it invisible to assistive technology).

#### Recommended Fix

If a footer nav item navigates to another page, use `<a>`:

```jsx
<li><a href="/sustainability" className="footer-nav-item">Sustainability</a></li>
<li><a href="/faq" className="footer-nav-item">FAQs</a></li>
```

If the item triggers in-page behaviour (e.g. an accordion), use `<button>`. Remove `aria-hidden="true"` from any inner `<span>` that contains the visible label — it should never be hidden from assistive technology.

#### Rationale

Native `<a>` elements are announced as "link" by screen readers and belong in the tab order; they also respond to pointer, keyboard, and touch input without custom event handlers. The `aria-hidden="true"` on the FAQs text span actively suppresses the accessible name and must be removed: `aria-hidden` should only be applied to decorative or redundant content, not to the sole text label of an interactive element.

---

### CI-3 — Popular Section "Shop" Links: Wrong Semantic Role, Not Focusable, No Accessible Name

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A) · 2.1.1 (A) · 1.1.1 (A)  
**Source file:** `src/components/PopularSection.jsx`

#### Affected Elements

| Element selector | Visible label (aria-hidden) | Page |
|---|---|---|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | "Shop Dresses" | Homepage |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | "Shop Funnels" | Homepage |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | "Shop Street…" | Homepage |

**DOM example:**
```html
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Dresses</span>
</div>
```

**Total raw issue count:** 9 (3 elements × 3 issue types each: WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE + NO_DESCRIPTIVE_TEXT).

#### Recommended Fix

```jsx
// src/components/PopularSection.jsx
<a href={product.shopUrl} className="shop-link">
  Shop {product.categoryLabel}
</a>
```

Remove `aria-hidden="true"` from the inner `<span>`. The text is the accessible name and must not be hidden.

#### Rationale

Same reasoning as CI-2: a native `<a>` removes the need for `role`, `tabindex`, and keyboard event handlers in one change. The `aria-hidden` on the span is the proximate cause of the `NO_DESCRIPTIVE_TEXT` violation; stripping it restores the accessible name without adding any new ARIA. Moving the label text out of a `<span>` into direct child text of the anchor is the most robust pattern.

---

### CI-4 — Filter Options (Products Page): Wrong Semantic Role & Not Keyboard Accessible

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A) · 2.1.1 (A)  
**Source file:** `src/components/FilterSidebar.jsx`

#### Affected Elements

Fourteen `<div class="filter-option">` elements across four filter groups (Price, Size, Brand, Type). Representative selectors:

| Selector | Label | Page |
|---|---|---|
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1..4)` | Price ranges | Products |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1..4)` | Size options | Products |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1..3)` | Brand options | Products |
| `.filter-option:nth-child(5)` | Additional type option | Products |

**DOM example:**
```html
<div class="filter-option" onClick={…}>
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">S
    <span class="filter-count">(8)</span>
  </span>
</div>
```

**Total raw issue count:** 28 (14 filter options × 2 violation types each).

#### Recommended Fix

Replace the outer `<div>` with a native checkbox pattern:

```jsx
// src/components/FilterSidebar.jsx
<label className="filter-option" key={size}>
  <input
    type="checkbox"
    className="visually-hidden"
    checked={selectedSizes.includes(size)}
    onChange={() => onSizeChange(size)}
  />
  <span className="custom-checkbox" aria-hidden="true" />
  <span className="filter-option-label">
    {size} <span className="filter-count">({count})</span>
  </span>
</label>
```

Apply the same pattern to all four filter groups (Price, Size, Brand, Type).

#### Rationale

Filter options behave as checkboxes — they can be toggled on/off independently. A native `<input type="checkbox">` inside a `<label>` is the most accessible pattern: it is keyboard-focusable, announces its checked state, and responds to `Space` without custom handlers. Visually hiding the real input (`.visually-hidden` moves it off-screen while keeping it in the accessibility tree) allows the custom `.custom-checkbox` div to serve as the visual indicator driven by CSS `:checked`. This is the established pattern recommended by WCAG Technique H44 and avoids the need for `role="checkbox"` + `aria-checked` + `tabindex="0"` on a `<div>`, which requires more manual ARIA maintenance.

---

### CI-5 — Cart Modal Close Button: Missing Accessible Name

**Evinced Rule ID:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (A)  
**Source file:** `src/components/CartModal.jsx`

#### Affected Element

| Selector | Pages |
|---|---|
| `#cart-modal > div:nth-child(1) > button` (CSS module class `JjN6AKz7a2PRH2gFKW3v`) | Homepage, Products, Product Detail, Checkout Basket |

**DOM:**
```html
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

**Total raw issue count:** 4 (one per page where the cart modal DOM is present).

The comment in the source (`// A11Y-GEN1 accessible-name: close button has no accessible name — aria-label removed`) confirms the label was intentionally removed to introduce this defect.

#### Recommended Fix

```jsx
// src/components/CartModal.jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

#### Rationale

The button contains only a decorative SVG icon (correctly marked `aria-hidden="true"`), so it has no programmatic accessible name. Adding `aria-label="Close cart"` directly on the button is the canonical fix per WCAG Technique ARIA14 and does not affect visual appearance. The label "Close cart" is preferred over just "Close" because it provides context for users with multiple modals or drawers on the page.

---

### CI-6 — Wishlist Modal Close Button: Missing Accessible Name

**Evinced Rule ID:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (A)  
**Source file:** `src/components/WishlistModal.jsx`

#### Affected Element

| Selector | Pages |
|---|---|
| `div[role="dialog"] > div:nth-child(1) > button` (CSS module class `WEtKZofboSdJ1n7KLpwd`) | All 6 pages (modal is in DOM globally) |

**DOM:**
```html
<button class="WEtKZofboSdJ1n7KLpwd">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

**Total raw issue count:** 6 (one per page).

#### Recommended Fix

```jsx
// src/components/WishlistModal.jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

#### Rationale

Identical root cause and fix as CI-5. The `aria-label` on the `<button>` overrides any implicit name computation and gives screen readers a clear, context-specific announcement ("Close wishlist button").

---

### CI-7 — Cart Modal "Continue Shopping" Div: Wrong Semantic Role, Not Focusable, No Accessible Name

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A) · 2.1.1 (A)  
**Source file:** `src/components/CartModal.jsx`

#### Affected Element

| Selector | Page |
|---|---|
| `div:nth-child(3) > div:nth-child(4)` (CSS module class `LyRwH_O98exnbxqcHBsD`) | Checkout Basket |

**DOM:**
```html
<div class="LyRwH_O98exnbxqcHBsD" style="cursor: pointer;">
  <span aria-hidden="true">Continue Shopping</span>
</div>
```

**Total raw issue count:** 3 (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE + NO_DESCRIPTIVE_TEXT).

The source comments (`// A11Y-GEN1 interactable-role + keyboard-accessible`, `// A11Y-GEN1 accessible-name`) confirm this is a deliberately introduced defect.

#### Recommended Fix

```jsx
// src/components/CartModal.jsx
<button className={styles.continueShoppingBtn} onClick={closeCart}>
  Continue Shopping
</button>
```

Remove `aria-hidden="true"` from the inner span (or move the text directly into the button).

#### Rationale

The element's only purpose is to close the cart — it is a button. Using a native `<button>` fixes all three violations simultaneously. The `aria-hidden="true"` on the span is what causes `NO_DESCRIPTIVE_TEXT`; removing it restores the accessible name. CSS already handles visual styling via the class; switching the tag has no visual side-effect.

---

### CI-8 — Cart Item Delete Buttons: Missing Accessible Name

**Evinced Rule ID:** `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A) · 1.1.1 (A)  
**Source file:** `src/components/CartModal.jsx`

#### Affected Element

| Selector | Page |
|---|---|
| `li > button` (CSS module class `cxg80OkqBVvKnUqn73Qw`, per-item delete button) | Checkout Basket |

**DOM:**
```html
<button class="cxg80OkqBVvKnUqn73Qw">
  <svg width="16" height="16" aria-hidden="true">…</svg>
</button>
```

**Total raw issue count:** 1 (issue reported once per page scan regardless of item count, because Evinced deduplicates by signature; actual affected elements equal the number of items in the cart).

The source comment (`// A11Y-GEN2 no-aria-label: aria-label removed from remove item button`) confirms intent.

#### Recommended Fix

```jsx
// src/components/CartModal.jsx — inside the cart item map
<button
  className={styles.removeBtn}
  onClick={() => removeFromCart(item.id)}
  aria-label={`Remove ${item.name} from cart`}
>
  <svg width="16" height="16" aria-hidden="true">…</svg>
</button>
```

#### Rationale

An icon-only button that acts on a specific list item needs an accessible name that identifies both the action ("Remove") and the target ("${item.name}") so that a screen reader user can distinguish multiple delete buttons without reading surrounding context. `aria-label` that includes the product name is the recommended approach per WCAG Technique ARIA6. Generic labels like "Delete" or "Remove" are insufficient when the button appears multiple times in a list.

---

### CI-9 — Checkout "← Back to Cart" Button: Wrong Semantic Role & Not Keyboard Accessible

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A) · 2.1.1 (A)  
**Source file:** `src/pages/CheckoutPage.jsx`

#### Affected Element

| Selector | Page |
|---|---|
| `.checkout-back-btn` (`<div>` at line 298) | Checkout Shipping (step 2) |

**DOM:**
```html
<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>
```

**Total raw issue count:** 2 (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE).

#### Recommended Fix

```jsx
// src/pages/CheckoutPage.jsx
<button
  className="checkout-back-btn"
  onClick={() => setStep('basket')}
>
  ← Back to Cart
</button>
```

#### Rationale

The element navigates back to a previous step — it is a button. Replacing the `<div>` with a `<button>` adds it to the tab order, exposes `role="button"` to the accessibility tree, and enables keyboard activation with `Enter` and `Space`. The visible text "← Back to Cart" is already a descriptive label, so no additional `aria-label` is needed. The left-arrow glyph (`←`) is a Unicode character and not a decorative image, so it does not require an `alt` attribute.

---

### CI-10 — Order Confirmation "← Back to Shop" Link: Wrong Semantic Role & Not Keyboard Accessible

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A) · 2.1.1 (A)  
**Source file:** `src/pages/OrderConfirmationPage.jsx`

#### Affected Element

| Selector | Page |
|---|---|
| `.confirm-home-link` (`<div>` at line 40) | Order Confirmation |

**DOM:**
```html
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

**Total raw issue count:** 2 (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE).

#### Recommended Fix

```jsx
// src/pages/OrderConfirmationPage.jsx
import { Link } from 'react-router-dom';

<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

#### Rationale

The element navigates to the homepage — it should be a link, not a button. Using React Router's `<Link>` component renders a native `<a>` element, which is in the tab order, announced as "link" by screen readers, and correctly communicates the destination. A link (not a button) is semantically correct here because the interaction changes the URL. This also means users can right-click to open in a new tab, which is expected behaviour for navigation elements.

---

### CI-11 — Images Missing Alternative Text

**Evinced Rule ID:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 Non-text Content (A)  
**Source files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`

#### Affected Elements

| Selector | Page | Source |
|---|---|---|
| `img[src$="New_Tees.png"]` | Homepage | `HeroBanner.jsx` |
| `img[src$="2bags_charms1.png"]` | Homepage | `TheDrop.jsx` |

**DOM examples:**
```html
<!-- HeroBanner.jsx -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop.jsx -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

Both comments in source confirm intent: `// A11Y-AXE image-alt: <img> is missing an alt attribute`.

**Total raw issue count:** 2.

#### Recommended Fix

```jsx
// src/components/HeroBanner.jsx
<img src={HERO_IMAGE} alt="New tees collection — warm hues for cooler days" />

// src/components/TheDrop.jsx
<img src={DROP_IMAGE} alt="Limited-edition plushie bag charms" loading="lazy" />
```

If either image is purely decorative (i.e. the surrounding text already describes it fully), use an empty alt:

```jsx
<img src={DROP_IMAGE} alt="" loading="lazy" />
```

#### Rationale

WCAG 1.1.1 requires all non-decorative images to have a text alternative. A missing `alt` attribute (as opposed to `alt=""`) causes screen readers to fall back to announcing the filename ("New underscore Tees dot png"), which is uninformative and disruptive. The fix depends on editorial judgement: if the image communicates information not present in surrounding text, it requires descriptive `alt` text; if the text fully covers the information, `alt=""` is correct (it tells screen readers to skip the image entirely). Either option is preferable to a missing attribute.

---

### CI-12 — Invalid ARIA Attribute Values

**Evinced Rule ID:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 (A)  
**Source files:** `src/components/FeaturedPair.jsx`, `src/pages/ProductPage.jsx`

#### Affected Elements

**A) `aria-expanded="yes"` on `<h1>` elements (FeaturedPair.jsx)**

| Selector | Page |
|---|---|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | Homepage |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | Homepage |

**DOM:**
```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

Source comment: `// A11Y-AXE aria-valid-attr-value: aria-expanded must be "true" or "false", not "yes"`.

**B) `aria-relevant="changes"` on a live region `<ul>` (ProductPage.jsx)**

| Selector | Pages |
|---|---|
| `ul[aria-relevant="changes"]` | Product Detail, Checkout Basket |

**DOM:**
```html
<ul aria-relevant="changes" aria-live="polite">…</ul>
```

Source comment: `// A11Y-AXE aria-valid-attr-value: aria-relevant="changes" is invalid — must be space-separated tokens from: additions, removals, text, all`.

**Total raw issue count:** 4 (2 × `h1` on Homepage + 2 × `ul` on Product Detail and Checkout Basket).

#### Recommended Fix

**For the `<h1>` elements:** remove `aria-expanded` entirely. `aria-expanded` is not a valid attribute for heading roles and its value "yes" is outside the allowed token set (`"true"` / `"false"`). If the intent is to indicate that an expandable section is open, use `aria-expanded` on the trigger button that controls the section — not on the heading.

```jsx
// src/components/FeaturedPair.jsx
<h1>{item.title}</h1>
```

**For the `<ul>`:** either remove `aria-relevant` or correct the value to a valid token combination. The only valid values for `aria-relevant` are `additions`, `removals`, `text`, `all`, and space-separated combinations thereof:

```jsx
// src/pages/ProductPage.jsx
<ul aria-live="polite" aria-relevant="additions text">…</ul>
// or simply remove aria-relevant to use the default ("additions text")
<ul aria-live="polite">…</ul>
```

#### Rationale

Browsers and assistive technologies ignore or misinterpret ARIA attributes with invalid values, making them worse than useless: they pollute the accessibility tree without providing benefit. For the `<h1>` case, `aria-expanded` is semantically meaningless on a heading and was likely added in error. For `aria-relevant="changes"`, "changes" is not a valid token; the intended meaning (announce both additions and text changes) is expressed as `"additions text"` per the ARIA specification. Removing the invalid value restores predictable AT behaviour.

---

### CI-13 — Popularity Slider Missing Required ARIA Attributes

**Evinced Rule IDs:** `AXE-ARIA-REQUIRED-ATTR`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A) · 2.1.1 (A)  
**Source file:** `src/components/TheDrop.jsx`

#### Affected Element

| Selector | Page |
|---|---|
| `.drop-popularity-bar` | Homepage |

**DOM:**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Total raw issue count:** 2 (AXE-ARIA-REQUIRED-ATTR + NOT_FOCUSABLE).

The `role="slider"` requires three ARIA attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. All three are missing. Additionally, a slider must be keyboard-focusable (`tabindex="0"`) so users can adjust it with arrow keys.

#### Recommended Fix

**Option A — Fix as a functional slider** (if users are expected to interact with it):

```jsx
// src/components/TheDrop.jsx
<div
  role="slider"
  className="drop-popularity-bar"
  aria-label="Popularity indicator"
  aria-valuenow={popularityScore}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  onKeyDown={handleSliderKeyDown}
/>
```

**Option B — Convert to a read-only progress indicator** (if it is display-only):

```jsx
<div
  role="meter"
  className="drop-popularity-bar"
  aria-label="Popularity"
  aria-valuenow={popularityScore}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

**Option C — Mark as decorative** (if the value is not meaningful to the user):

```jsx
<div className="drop-popularity-bar" aria-hidden="true" />
```

#### Rationale

`role="slider"` without its required owned attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) is invalid per the ARIA specification; assistive technologies will either fail to expose it or announce it incorrectly. The correct approach depends on intent: if the bar is purely decorative, Option C eliminates the issue entirely and is the least intrusive change. If it communicates a read-only value, `role="meter"` (Option B) is semantically accurate. A fully interactive slider (Option A) additionally requires keyboard event handling to be usable per WCAG 2.1.1.

---

## 4. Remaining Non-Critical Issues (Serious)

These 24 issues were detected with **Serious** severity. They represent WCAG Level AA failures that significantly degrade the experience but do not completely prevent access. They are listed here for prioritisation and future remediation.

---

### S-1 — Missing `lang` Attribute on `<html>` Element

**Evinced Rule ID:** `AXE-HTML-HAS-LANG`  
**WCAG:** 3.1.1 Language of Page (A)  
**Source file:** `public/index.html`  
**Pages affected:** All 6 pages  
**Raw issue count:** 6

**DOM:**
```html
<!-- public/index.html line 2-3 -->
<!-- A11Y-AXE html-has-lang: <html> element is missing a lang attribute -->
<html>
```

**Recommended fix:** Add `lang="en"` (or the appropriate BCP 47 language tag) to the `<html>` element:
```html
<html lang="en">
```

**Why not remediated in this sprint:** This is technically a Level A failure (which would typically elevate it to Critical), but Evinced classified it as Serious. It affects the entire application equally and is a single-file, single-line fix. It was not grouped into the Critical section because Evinced's own classification system placed it at Serious severity.

---

### S-2 — Invalid `lang` Attribute Value

**Evinced Rule ID:** `AXE-VALID-LANG`  
**WCAG:** 3.1.2 Language of Parts (AA)  
**Source file:** `src/components/TheDrop.jsx`  
**Pages affected:** Homepage  
**Raw issue count:** 1

**DOM:**
```html
<!-- TheDrop.jsx lines 20-21 -->
<!-- A11Y-AXE valid-lang: lang="zz" is not a valid BCP 47 language tag -->
<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>
```

**Recommended fix:** Remove the invalid `lang` attribute or replace it with the correct BCP 47 code. If the paragraph is in English (same as the page language), remove `lang` entirely. If it is genuinely in a different language, use the correct tag (e.g. `lang="fr"` for French).

---

### S-3 — Insufficient Color Contrast

**Evinced Rule ID:** `AXE-COLOR-CONTRAST`  
**WCAG:** 1.4.3 Contrast (Minimum) (AA)  
**Pages affected:** Homepage, Products, Product Detail, Checkout Basket, Order Confirmation  
**Raw issue count:** 17

The following text/background combinations fail the minimum 4.5:1 contrast ratio for normal text (or 3:1 for large text):

| Element | Page(s) | Description |
|---|---|---|
| `.hero-content > p` | Homepage | Hero subtitle on light background |
| `.filter-count` spans (×11 instances) | Products | Item count numbers in filter sidebar |
| `.products-found` | Products | "N Products Found" result count |
| Product description paragraph (CSS module class) | Product Detail, Checkout Basket | Product body text |
| `.confirm-order-id-label` | Order Confirmation | "Order ID" label text |

**Recommended fix:** Increase the foreground text colour or darken/lighten the background in the relevant CSS rules until the contrast ratio meets 4.5:1 (WCAG AA). The exact hex values depend on the current colour palette; use a contrast checker (e.g. WebAIM Contrast Checker) to determine compliant alternatives.

---

## 5. Consolidated Issue Inventory

| ID | Rule | Severity | Element(s) | Pages | Issue Count |
|---|---|---|---|---|---|
| CI-1 | WRONG_SEMANTIC_ROLE / NOT_FOCUSABLE / NO_DESCRIPTIVE_TEXT | Critical | Header icon divs (wishlist, search, login, flag) | All 6 | 24 |
| CI-2 | WRONG_SEMANTIC_ROLE / NOT_FOCUSABLE / NO_DESCRIPTIVE_TEXT | Critical | Footer nav item divs | All 6 | 12 |
| CI-3 | WRONG_SEMANTIC_ROLE / NOT_FOCUSABLE / NO_DESCRIPTIVE_TEXT | Critical | Homepage "Shop" link divs (Popular section) | Homepage | 9 |
| CI-4 | WRONG_SEMANTIC_ROLE / NOT_FOCUSABLE | Critical | Filter option divs (14 options) | Products | 28 |
| CI-5 | AXE-BUTTON-NAME | Critical | Cart modal close button | Homepage, Products, Product Detail, Checkout Basket | 4 |
| CI-6 | AXE-BUTTON-NAME | Critical | Wishlist modal close button | All 6 | 6 |
| CI-7 | WRONG_SEMANTIC_ROLE / NOT_FOCUSABLE / NO_DESCRIPTIVE_TEXT | Critical | "Continue Shopping" div in cart modal | Checkout Basket | 3 |
| CI-8 | NO_DESCRIPTIVE_TEXT | Critical | Cart item delete buttons | Checkout Basket | 1 |
| CI-9 | WRONG_SEMANTIC_ROLE / NOT_FOCUSABLE | Critical | Checkout "← Back to Cart" div | Checkout Shipping | 2 |
| CI-10 | WRONG_SEMANTIC_ROLE / NOT_FOCUSABLE | Critical | Order Confirmation "← Back to Shop" div | Order Confirmation | 2 |
| CI-11 | AXE-IMAGE-ALT | Critical | Hero banner image, The Drop image | Homepage | 2 |
| CI-12 | AXE-ARIA-VALID-ATTR-VALUE | Critical | `aria-expanded="yes"` on `<h1>`, `aria-relevant="changes"` on `<ul>` | Homepage, Product Detail, Checkout Basket | 4 |
| CI-13 | AXE-ARIA-REQUIRED-ATTR / NOT_FOCUSABLE | Critical | Popularity slider | Homepage | 2 |
| S-1 | AXE-HTML-HAS-LANG | Serious | `<html>` element | All 6 | 6 |
| S-2 | AXE-VALID-LANG | Serious | `<p lang="zz">` | Homepage | 1 |
| S-3 | AXE-COLOR-CONTRAST | Serious | Various text elements | 5 of 6 | 17 |
| **Total** | | | | | **173** |

---

## 6. Methodology Notes

- **Tool:** Evinced JS Playwright SDK v2.43.0 was used for all scans via `evAnalyze()` full-page analysis. No Axe configurations were used.
- **Browser:** Chromium headless (Playwright 1.44.1, Chrome Headless Shell 145).
- **De-duplication:** Issues are deduplicated by `canonicalSignature` across pages. The raw count (173) reflects all individual issue-element-page combinations reported; the grouped counts above reflect unique element+issue type combinations.
- **Authentication:** Evinced SDK authenticated in offline mode using a pre-issued JWT (`PLAYWRIGHT_SDK_OFFLINE_TOKEN`).
- **Raw results:** Full JSON results are saved per-page in `tests/e2e/test-results/` (homepage.json, products.json, product-detail.json, checkout-basket.json, checkout-shipping.json, order-confirmation.json).
- **Test spec:** `tests/e2e/specs/a11y-audit-all-pages.spec.ts` — all 6 tests pass.
