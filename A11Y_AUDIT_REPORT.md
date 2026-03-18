# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-18  
**Tool:** Evinced JS Playwright SDK v2.27.1  
**Scanner Credentials:** EVINCED_SERVICE_ID `922eff48-df42-cd03-0d83-8f1b7efc2f5a`  
**Branch:** `cursor/accessibility-audit-report-b381`  
**Methodology:** Automated full-page scan via `evAnalyze()` on every distinct page/state

---

## Table of Contents

1. [Repository Overview & Entry Points](#1-repository-overview--entry-points)
2. [Audit Summary](#2-audit-summary)
3. [Critical Issues — Detailed Findings & Recommended Remediations](#3-critical-issues--detailed-findings--recommended-remediations)
   - [CI-1: NOT_FOCUSABLE — Non-focusable Interactive Elements](#ci-1-not_focusable--non-focusable-interactive-elements)
   - [CI-2: WRONG_SEMANTIC_ROLE — Missing or Incorrect ARIA Role](#ci-2-wrong_semantic_role--missing-or-incorrect-aria-role)
   - [CI-3: NO_DESCRIPTIVE_TEXT — Missing Accessible Name](#ci-3-no_descriptive_text--missing-accessible-name)
   - [CI-4: AXE-BUTTON-NAME — Icon-only Buttons Without Labels](#ci-4-axe-button-name--icon-only-buttons-without-labels)
   - [CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values](#ci-5-axe-aria-valid-attr-value--invalid-aria-attribute-values)
   - [CI-6: AXE-IMAGE-ALT — Images Missing Alt Text](#ci-6-axe-image-alt--images-missing-alt-text)
   - [CI-7: AXE-ARIA-REQUIRED-ATTR — ARIA Role Missing Required Attributes](#ci-7-axe-aria-required-attr--aria-role-missing-required-attributes)
4. [Non-Critical Issues — Full List](#4-non-critical-issues--full-list)
   - [SI-1: AXE-COLOR-CONTRAST — Insufficient Color Contrast](#si-1-axe-color-contrast--insufficient-color-contrast)
   - [SI-2: AXE-HTML-HAS-LANG — Missing Language on html Element](#si-2-axe-html-has-lang--missing-language-on-html-element)
   - [SI-3: AXE-VALID-LANG — Invalid Language Code](#si-3-axe-valid-lang--invalid-language-code)
5. [Raw JSON Results](#5-raw-json-results)

---

## 1. Repository Overview & Entry Points

The repository is a single-page React 18 application (Webpack 5 bundler, React Router v7) served as a static build. All routes are client-side; the server is configured in SPA mode (`--single` flag) so any URL falls back to `index.html`.

| Page | Route | Source File | Notes |
|------|-------|-------------|-------|
| Homepage | `/` | `src/pages/HomePage.jsx` | HeroBanner, TrendingCollections, PopularSection, FeaturedPair, TheDrop sections |
| New Products | `/shop/new` | `src/pages/NewPage.jsx` | Product grid with filter sidebar and sort control |
| Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` | Product images, add-to-cart, size selector, live region |
| Checkout — Basket | `/checkout` (step 1) | `src/pages/CheckoutPage.jsx` | Cart review step, displays if cart is non-empty |
| Checkout — Shipping | `/checkout` (step 2) | `src/pages/CheckoutPage.jsx` | Triggered by clicking "Continue" in basket step |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Re-renders HeroBanner, TheDrop, FeaturedPair |

**Shared components present on every page:** `Header` (navigation, wishlist/search/cart/login icon buttons), `Footer` (nav links), `CartModal`, `WishlistModal`.

**HTML root:** `public/index.html` — the only HTML file, loaded for all routes.

---

## 2. Audit Summary

| Page | Total Issues | Critical | Serious |
|------|-------------|----------|---------|
| Homepage (`/`) | 34 | 31 | 3 |
| New Products (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/1`) | 20 | 18 | 2 |
| Checkout — Basket | 21 | 18 | 3 |
| Checkout — Shipping | 19 | 18 | 1 |
| Order Confirmation | 34 | 31 | 3 |
| **Total** | **183** | **157** | **26** |

### Issue Classification

| ID | Type | Severity | Count | WCAG Criterion |
|----|------|----------|-------|----------------|
| CI-1 | NOT_FOCUSABLE | **Critical** | 56 | 2.1.1 Keyboard (Level A) |
| CI-2 | WRONG_SEMANTIC_ROLE | **Critical** | 56 | 4.1.2 Name, Role, Value (Level A) |
| CI-3 | NO_DESCRIPTIVE_TEXT | **Critical** | 24 | 4.1.2 Name, Role, Value (Level A) |
| CI-4 | AXE-BUTTON-NAME | **Critical** | 10 | 4.1.2 Name, Role, Value (Level A) |
| CI-5 | AXE-ARIA-VALID-ATTR-VALUE | **Critical** | 5 | 4.1.2 Name, Role, Value (Level A) |
| CI-6 | AXE-IMAGE-ALT | **Critical** | 4 | 1.1.1 Non-text Content (Level A) |
| CI-7 | AXE-ARIA-REQUIRED-ATTR | **Critical** | 2 | 4.1.2 Name, Role, Value (Level A) |
| SI-1 | AXE-COLOR-CONTRAST | Serious | 18 | 1.4.3 Contrast (Minimum) (Level AA) |
| SI-2 | AXE-HTML-HAS-LANG | Serious | 6 | 3.1.1 Language of Page (Level A) |
| SI-3 | AXE-VALID-LANG | Serious | 2 | 3.1.2 Language of Parts (Level AA) |

> **Note:** CI-1 (NOT_FOCUSABLE) and CI-2 (WRONG_SEMANTIC_ROLE) are almost always co-occurring on the same elements: a `<div>` acting as a button inherently has neither a focusable nature nor a semantic role. They are counted separately because they represent distinct WCAG failures.

---

## 3. Critical Issues — Detailed Findings & Recommended Remediations

---

### CI-1: NOT_FOCUSABLE — Non-focusable Interactive Elements

**WCAG:** 2.1.1 Keyboard (Level A) — All functionality must be operable via keyboard.  
**Total occurrences:** 56 (all 6 pages)  
**Evinced type ID:** `NOT_FOCUSABLE`

#### What Was Found

Throughout the site, interactive controls have been implemented as `<div>` elements styled with `cursor: pointer` and JavaScript `onClick` handlers. Because `<div>` is not natively focusable, keyboard users (including users of switch access devices and screen reader users who navigate with Tab/Shift-Tab) cannot reach these controls at all. The following distinct interactive `<div>` elements were identified:

| Selector | DOM Snippet (truncated) | Present On |
|----------|------------------------|------------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor:pointer">…` | All pages (Header) |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor:pointer">…` (Search) | All pages (Header) |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor:pointer">…` (Login) | All pages (Header) |
| `.flag-group` | `<div class="flag-group" style="cursor:pointer">…` (Region selector) | All pages (Header) |
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor:pointer">Continue</div>` | Checkout Basket |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer">Sustainability</div>` | All pages (Footer) |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer"><span aria-hidden="true">FAQs</span></div>` | All pages (Footer) |
| `.product-card > .shop-link` (×3) | `<div class="shop-link" style="cursor:pointer"><span aria-hidden="true">Shop …</span></div>` | Homepage, Order Confirmation |
| `.filter-option` (×14) | `<div class="filter-option">…` (Price/Size/Color checkboxes) | New Products |
| `.cart-modal "Continue Shopping"` | `<div … onClick={closeCart}><span aria-hidden="true">Continue Shopping</span></div>` | CartModal (all pages) |
| Wishlist item remove button | `<div … onClick={removeFromWishlist}>…` | WishlistModal (all pages) |

**Source files affected:**  
- `src/components/Header.jsx` (lines 131, 140, 156, 160+)  
- `src/components/Footer.jsx` (lines 13–18)  
- `src/components/CartModal.jsx` (line 130)  
- `src/components/WishlistModal.jsx` (line 127)  
- `src/pages/CheckoutPage.jsx` (`.checkout-continue-btn`)  
- `src/pages/NewPage.jsx` / `src/components/FilterSidebar.jsx` (filter-option divs)  
- `src/components/TrendingCollections.jsx` / `src/components/PopularSection.jsx` (shop-link divs)

#### Recommended Remediation

Replace each interactive `<div>` with the appropriate semantic HTML element:

- **Buttons** (trigger an action, no navigation): change `<div onClick={…}>` → `<button onClick={…}>`. Remove the `style={{cursor:'pointer'}}` — buttons already receive pointer cursor by default.
- **Links** (navigate to a URL): change `<div onClick={navigate(…)}>` → `<Link to={…}>` (React Router) or `<a href="…">`.
- **Checkboxes** (filter options): replace the custom `<div class="filter-option">` pattern with a real `<input type="checkbox" id="…">` + `<label for="…">` pair.

For the `"Continue Shopping"` and footer nav items that wrap text spans with `aria-hidden="true"`, the text must also be exposed to assistive technology (see CI-3).

#### Why This Approach

The root cause is `<div>` elements being misused as interactive controls. Simply adding `tabindex="0"` would achieve focus but not keyboard activation (Enter/Space). Native HTML elements (`<button>`, `<a>`, `<input>`) provide focus, keyboard activation, and the correct implicit ARIA role in a single, low-risk change. Using semantic HTML is also the WCAG-recommended technique (G202, H91).

---

### CI-2: WRONG_SEMANTIC_ROLE — Missing or Incorrect ARIA Role

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 56 (all 6 pages)  
**Evinced type ID:** `WRONG_SEMANTIC_ROLE`

#### What Was Found

The same `<div>` elements that are not keyboard-focusable (CI-1) also carry no ARIA role. Screen readers therefore announce them as generic regions rather than as buttons or links, preventing users from understanding their purpose. Every occurrence of this issue co-occurs with a CI-1 occurrence on the same element.

Affected elements are identical to those listed in CI-1: Header icon buttons (`.wishlist-btn`, `.icon-btn:nth-child(2)`, `.icon-btn:nth-child(4)`, `.flag-group`), Checkout "Continue" div, Footer nav items, homepage "Shop" links, New Products filter checkboxes, Cart/Wishlist modal interactive divs.

**Source files:** same as CI-1.

#### Recommended Remediation

Replacing `<div>` with semantic `<button>`, `<a>`, or `<input type="checkbox">` (as described in CI-1) inherently provides the correct implicit role. No separate `role="button"` attribute is needed because native elements carry their roles automatically. The ARIA specification notes that using `role="button"` on a `<div>` is an acceptable fallback, but it is more fragile (keyboard behaviour still requires manual `onKeyDown` handling) and therefore the semantic element replacement is preferred.

If a `<div>` absolutely must be retained (e.g., for styling constraints), the minimum safe fix is:
```jsx
<div
  role="button"
  tabIndex={0}
  onClick={handler}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handler()}
>
```
However, the native element approach is strongly preferred.

#### Why This Approach

WCAG technique ARIA4 specifies that when a role is used on a non-native element, all required states, properties, and keyboard interactions for that role must also be provided. Semantic HTML elements satisfy this requirement automatically, making them the lower-risk and lower-maintenance solution.

---

### CI-3: NO_DESCRIPTIVE_TEXT — Missing Accessible Name

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 24 (all 6 pages)  
**Evinced type ID:** `NO_DESCRIPTIVE_TEXT`

#### What Was Found

Even where elements have an implicit or explicit role, their accessible name is absent or suppressed. Two patterns were identified:

**Pattern A — `aria-hidden` on the only text label inside a `<div>` button:**  
The visible text (e.g., "Shop Drinkware", "FAQs", "Continue Shopping") is wrapped in `<span aria-hidden="true">`, which removes it from the accessibility tree. Screen readers then encounter a nameless interactive element.

| Selector | DOM Snippet | Page(s) |
|----------|------------|---------|
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div …><span aria-hidden="true">FAQs</span></div>` | All pages (Footer) |
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div …><span aria-hidden="true">Shop Drinkware</span></div>` | Homepage, Order Confirmation |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div …><span aria-hidden="true">Shop Fun and Games</span></div>` | Homepage, Order Confirmation |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div …><span aria-hidden="true">Shop Stationery</span></div>` | Homepage, Order Confirmation |
| CartModal "Continue Shopping" div | `<div …><span aria-hidden="true">Continue Shopping</span></div>` | All pages (CartModal) |

**Pattern B — Icon-only `<div>` buttons with no accessible text at all:**  
The Search (`icon-btn:nth-child(2)`) and Login (`icon-btn:nth-child(4)`) header icons contain only an `aria-hidden` SVG and either an `aria-hidden` text label or no label at all.

| Selector | Description | Page(s) |
|----------|------------|---------|
| `.icon-btn:nth-child(2)` | Search icon, `<span aria-hidden="true">Search</span>` | All pages (Header) |
| `.icon-btn:nth-child(4)` | Login icon, `<span aria-hidden="true">Login</span>` | All pages (Header) |

**Source files:**  
- `src/components/Header.jsx` (lines 141–143, 156–159)  
- `src/components/Footer.jsx` (lines 15–18)  
- `src/components/CartModal.jsx` (line 128–133)  
- `src/components/TrendingCollections.jsx` / `src/components/PopularSection.jsx`

#### Recommended Remediation

**Pattern A (visible text suppressed via `aria-hidden`):** Remove `aria-hidden="true"` from the text span. The text is meaningful and should be in the accessibility tree.

**Pattern B (icon-only elements without any name):** Add `aria-label` to the interactive element with a concise, action-oriented description:

```jsx
// Search button
<button aria-label="Search" className="icon-btn">
  <svg aria-hidden="true">…</svg>
</button>

// Login button  
<button aria-label="Log in" className="icon-btn">
  <svg aria-hidden="true">…</svg>
</button>
```

Alternatively, keep the text visible but visually hidden using a `.sr-only` CSS class (clip technique), which provides the name without affecting visual layout.

#### Why This Approach

`aria-hidden="true"` should only be applied to content that is purely decorative or redundant with other content in the accessibility tree. Text that is the sole or primary label for an interactive element is never decorative. Removing `aria-hidden` from label spans is the minimal change that restores the accessible name without altering visual presentation. For icon-only controls, `aria-label` provides the accessible name through the standard W3C naming algorithm (Accessible Name Computation, ARIA 1.2 §6.6).

---

### CI-4: AXE-BUTTON-NAME — Icon-only Buttons Without Labels

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 10 (all 6 pages, 2 per page)  
**Evinced type ID:** `AXE-BUTTON-NAME` (axe-core rule: `button-name`)

#### What Was Found

Two modal close buttons — one in `CartModal` and one in `WishlistModal` — are implemented as native `<button>` elements (correct semantics) but contain only an SVG icon with `aria-hidden="true"` and no `aria-label`, `aria-labelledby`, or visible text. This means screen readers announce them as "button" with no name.

| Selector | DOM Snippet | Source File | Page(s) |
|----------|------------|-------------|---------|
| `#cart-modal > div:nth-child(1) > button` | `<button class="JjN6AKz…"><svg … aria-hidden="true">…</svg></button>` | `CartModal.jsx` line 56–64 | All pages |
| `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZof…"><svg … aria-hidden="true">…</svg></button>` | `WishlistModal.jsx` line 61–80 | All pages |

The source comments in both files explicitly document that `aria-label` was removed intentionally as an injected accessibility defect (`A11Y-GEN1 accessible-name`).

**Source files:**  
- `src/components/CartModal.jsx` (lines 55–64)  
- `src/components/WishlistModal.jsx` (lines 60–80)

#### Recommended Remediation

Add `aria-label="Close cart"` (or `aria-label="Close wishlist"`) to each close button:

```jsx
// CartModal.jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg aria-hidden="true" …>…</svg>
</button>

// WishlistModal.jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true" …>…</svg>
</button>
```

#### Why This Approach

The button elements already use the correct native HTML element (`<button>`), so the only gap is the missing accessible name. `aria-label` directly on the `<button>` is the simplest and most reliable approach — it becomes the element's accessible name via the ARIA naming algorithm without changing the DOM structure, visual appearance, or any other behaviours (focus management, keyboard activation). The label text "Close cart" / "Close wishlist" follows WCAG technique ARIA14 (Using aria-label to provide an invisible label) and is preferred over a visually-hidden text node in this context because the button already has `ref` and `onClick` handling that should not be disturbed.

---

### CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 5 (homepage ×2, order-confirmation ×2, product-detail ×1)  
**Evinced type ID:** `AXE-ARIA-VALID-ATTR-VALUE` (axe-core rule: `aria-valid-attr-value`)

#### What Was Found

Two distinct invalid `aria-*` attribute values were detected:

**Issue A — `aria-expanded="yes"` on `<h1>` elements (FeaturedPair component):**

The `aria-expanded` attribute requires a value of `"true"` or `"false"` (boolean string). The value `"yes"` is not a valid ARIA token and is therefore ignored by assistive technologies, which may also flag it as an error. Additionally, `aria-expanded` is semantically inappropriate on a `<h1>` (it applies to expandable controls like disclosure buttons, not headings).

| Selector | DOM Snippet | Page(s) |
|----------|------------|---------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | Homepage, Order Confirmation |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | Homepage, Order Confirmation |

**Source file:** `src/components/FeaturedPair.jsx` (line 46, comment on line 44)

**Issue B — `aria-relevant="changes"` on a live region (ProductPage):**

`aria-relevant` accepts only a space-separated list of tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not in this set and is silently ignored, meaning the live region will not announce updates as intended.

| Selector | DOM Snippet | Page(s) |
|----------|------------|---------|
| `ul[aria-relevant="changes"]` | `<ul … aria-relevant="changes" aria-live="polite">…` | Product Detail |

**Source file:** `src/pages/ProductPage.jsx` (line 146, comment on line 143)

#### Recommended Remediation

**Issue A:** Remove `aria-expanded` from the `<h1>` elements entirely — headings are not expandable controls and should not carry this attribute. If the card is intended to be an expandable/collapsible region in the future, the `aria-expanded` should be placed on the control (e.g., a `<button>`) that toggles it, not on the heading itself.

```jsx
// FeaturedPair.jsx — remove aria-expanded from h1
<h1>{item.title}</h1>
```

**Issue B:** Replace `aria-relevant="changes"` with a valid value. Since the intent is to announce when content changes, use `aria-relevant="additions text"` (announces new nodes and text changes), or simply rely on `aria-live="polite"` alone (which is sufficient for most live region use cases):

```jsx
<ul
  aria-live="polite"
  aria-atomic="true"
  {/* aria-relevant removed or set to a valid value */}
>
```

#### Why This Approach

Invalid ARIA values are no-ops: assistive technologies ignore them, so the declared intent of the attribute is never communicated. Removing `aria-expanded` from a heading restores a correct document structure without any functional regression because the heading was not actually controlling an expandable region. Replacing `"changes"` with a valid `aria-relevant` value (or removing it to rely on the `aria-live` default) ensures the live region behaves as intended without any visual change.

---

### CI-6: AXE-IMAGE-ALT — Images Missing Alt Text

**WCAG:** 1.1.1 Non-text Content (Level A)  
**Total occurrences:** 4 (homepage ×2, order-confirmation ×2)  
**Evinced type ID:** `AXE-IMAGE-ALT` (axe-core rule: `image-alt`)

#### What Was Found

Two `<img>` elements in two shared components lack `alt` attributes entirely. Without `alt`, screen readers read the image file name aloud (e.g., "New underscore Tees dot png"), which is meaningless to users.

| Selector | DOM Snippet | Source File | Page(s) |
|----------|------------|-------------|---------|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `HeroBanner.jsx` line 18 | Homepage, Order Confirmation |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `TheDrop.jsx` line 13 | Homepage, Order Confirmation |

Both source files contain comments confirming the `alt` attribute was deliberately removed as an injected defect.

**Source files:**  
- `src/components/HeroBanner.jsx` (line 17–18)  
- `src/components/TheDrop.jsx` (line 12–13)

#### Recommended Remediation

Add descriptive `alt` text that conveys the same information or context that a sighted user would gain from the image. If the image is purely decorative (no information is lost if it were hidden), use `alt=""` (empty string, not the absence of the attribute).

```jsx
// HeroBanner.jsx — hero banner image is contextual decoration
<img src={HERO_IMAGE} alt="Model wearing a new collection tee shirt" />

// TheDrop.jsx — product drop announcement image
<img src={DROP_IMAGE} loading="lazy" alt="Plushie bag charms collection" />
```

The exact alt text should be confirmed with content/design stakeholders to match the intended message of each image.

#### Why This Approach

WCAG 1.1.1 requires that all non-text content that conveys information has a text alternative. The `alt` attribute is the designated mechanism for `<img>` elements (HTML technique H37). For images that are truly decorative (e.g., purely visual background imagery with no informational value), an empty `alt=""` tells screen readers to skip the image entirely — this is preferable to omitting `alt`, because without `alt` at all, some AT fallback to reading the file path. The fix is a single attribute addition with no functional or visual impact.

---

### CI-7: AXE-ARIA-REQUIRED-ATTR — ARIA Role Missing Required Attributes

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 2 (homepage, order-confirmation)  
**Evinced type ID:** `AXE-ARIA-REQUIRED-ATTR` (axe-core rule: `aria-required-attr`)

#### What Was Found

In `TheDrop.jsx`, a `<div>` is assigned `role="slider"`. The WAI-ARIA specification requires that elements with `role="slider"` always have three additional attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum value), and `aria-valuemax` (maximum value). Without these, assistive technologies cannot communicate the slider's current state or range to the user.

| Selector | DOM Snippet | Page(s) |
|----------|------------|---------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | Homepage, Order Confirmation |

**Source file:** `src/components/TheDrop.jsx` (lines 18–19)

#### Recommended Remediation

**Option A (if the slider is read-only/decorative indicator):** Replace `role="slider"` with `role="meter"`, which is designed for read-only value indicators and requires `aria-valuenow` and `aria-valuemax`:

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

**Option B (if the element is genuinely a user-adjustable slider):** Retain `role="slider"` and add all required attributes, along with keyboard interaction support (arrow keys to change value):

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

#### Why This Approach

The ARIA specification defines required attributes for each role. When required attributes are absent, assistive technologies either ignore the role entirely or produce undefined/broken output. Based on the CSS class name `drop-popularity-bar` and the context (it is inside a product announcement section with no user interaction evident in the source), Option A (`role="meter"`) is the semantically correct choice. `role="meter"` does not imply user editability, accurately reflects a read-only progress/intensity indicator, and has a smaller set of required attributes.

---

## 4. Non-Critical Issues — Full List

The following issues were classified as **Serious** by the Evinced scanner. They have not been remediated in this pass. They represent real accessibility barriers but are less likely to completely prevent access compared to the Critical issues above.

---

### SI-1: AXE-COLOR-CONTRAST — Insufficient Color Contrast

**WCAG:** 1.4.3 Contrast (Minimum), Level AA — normal text requires a 4.5:1 contrast ratio; large text requires 3:1.  
**Total occurrences:** 18  
**Evinced type ID:** `AXE-COLOR-CONTRAST`

The following elements were flagged for insufficient contrast between foreground text and background color:

| Page | Selector | Text Content | Notes |
|------|----------|-------------|-------|
| Checkout Basket | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" | Inactive step label, likely light grey on white |
| Checkout Basket | `.summary-tax-note` | "Taxes calculated at next step" | Secondary/muted text |
| Homepage | `.hero-content > p` | "Warm hues for cooler days" | Hero subtext over image background |
| New Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | "(8)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | "(4)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | "(4)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4) > .filter-option-label > .filter-count` | "(0)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | "(14)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | "(15)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | "(14)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4) > .filter-option-label > .filter-count` | "(12)" | Count badge in filter sidebar |
| New Products | `.filter-option:nth-child(5) > .filter-option-label > .filter-count` | "(11)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | "(2)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | "(13)" | Count badge in filter sidebar |
| New Products | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | "(1)" | Count badge in filter sidebar |
| New Products | `.products-found` | "16 Products Found" | Live region above product grid |
| Order Confirmation | `.hero-content > p` | "Warm hues for cooler days" | Same hero text as homepage |
| Product Detail | `p:nth-child(4)` | Product description paragraph | Body text in product description |

**Root cause:** The `.filter-count` span class in `FilterSidebar.css` uses a light grey color that does not meet the 4.5:1 minimum against the white/near-white background. The hero subtext likely overlays a semi-transparent background on an image. The product description text may use a low-contrast grey.

**Affected source files:** `src/components/FilterSidebar.css`, `src/components/HeroBanner.css`, `src/pages/ProductPage.module.css`, `src/pages/CheckoutPage.css`

---

### SI-2: AXE-HTML-HAS-LANG — Missing Language on html Element

**WCAG:** 3.1.1 Language of Page, Level A — the default human language of the page must be programmatically determinable.  
**Total occurrences:** 6 (all 6 pages — same root cause)  
**Evinced type ID:** `AXE-HTML-HAS-LANG`

The `<html>` element in `public/index.html` has no `lang` attribute:

```html
<!-- current -->
<html>

<!-- required -->
<html lang="en">
```

Without a language declaration, screen readers may use the user's system language setting to determine pronunciation, which can produce incorrect speech synthesis output for users whose system language differs from the page language.

**Affected source file:** `public/index.html` (line 2)  
**Root cause comment in source:** `<!-- A11Y-AXE html-has-lang: <html> element is missing a lang attribute -->`

---

### SI-3: AXE-VALID-LANG — Invalid Language Code

**WCAG:** 3.1.2 Language of Parts, Level AA — the human language of any passage in the content that differs from the default page language must be determinable.  
**Total occurrences:** 2 (homepage, order-confirmation)  
**Evinced type ID:** `AXE-VALID-LANG`

In `TheDrop.jsx`, a paragraph is annotated with `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers that support language switching will fail to apply the correct pronunciation profile, and may produce garbled audio for the affected text.

| Selector | DOM Snippet | Page(s) |
|----------|------------|---------|
| `p[lang="zz"]` | `<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>` | Homepage, Order Confirmation |

**Affected source file:** `src/components/TheDrop.jsx` (line 21)  
**Root cause comment in source:** `<!-- A11Y-AXE valid-lang: lang="zz" is not a valid BCP 47 language tag -->`

The text content of this paragraph appears to be in English. The `lang="zz"` attribute should be removed (if the text is in the same language as the page) or replaced with the correct BCP 47 tag (e.g., `lang="fr"` for French) if the content is intentionally in another language.

---

## 5. Raw JSON Results

The raw Evinced scan output for all pages is stored in the `/workspace/a11y-results/` directory:

| File | Page | Issues |
|------|------|--------|
| `homepage.json` | Homepage (`/`) | 34 |
| `new-products.json` | New Products (`/shop/new`) | 55 |
| `product-detail.json` | Product Detail (`/product/1`) | 20 |
| `checkout-basket.json` | Checkout — Basket step | 21 |
| `checkout-shipping.json` | Checkout — Shipping step | 19 |
| `order-confirmation.json` | Order Confirmation | 34 |

Each JSON file contains the full Evinced `Issue` object array including: `type.id`, `severity`, `elements[].selector`, `elements[].domSnippet`, `tags` (WCAG references), `description`, `summary`, `knowledgeBaseLink`, and `wcagLevels`.

---

*Report generated automatically by the Evinced JS Playwright SDK v2.27.1 via automated Playwright test (`/tmp/a11y-runner/audit.spec.js`) against `http://localhost:3000` (production build of the demo-website repository). No source code modifications were made as part of this audit.*
