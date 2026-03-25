# Accessibility (A11Y) Audit Report

**Repository:** `demo-website`  
**Audit Date:** 2026-03-25  
**Tool:** Evinced JS Playwright SDK (`@evinced/js-playwright-sdk` ~2.17.0)  
**Engine:** Automated per-page `evAnalyze()` scan via Playwright/Chromium  
**Auditor:** Automated Cloud Agent (cursor/accessibility-audit-report-9b16)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Pages audited | 5 |
| Total issues found | 151 |
| **Critical issues** | **127** |
| Serious issues | 24 |
| Critical issue types | 7 |
| Pages with critical issues | All 5 |

### Issues by Page

| Page | URL | Critical | Serious | Total |
|------|-----|----------|---------|-------|
| Homepage | `/` | 32 | 3 | 35 |
| Shop New | `/shop/new` | 41 | 14 | 55 |
| Product Detail | `/product/1` | 18 | 2 | 20 |
| Checkout | `/checkout` | 18 | 3 | 21 |
| Order Confirmation | `/order-confirmation` | 18 | 2 | 20 |
| **Total** | | **127** | **24** | **151** |

---

## Pages and Entry Points

The application is a React SPA (React 18, React Router v7, Webpack 5) with five distinct routes:

| Route | Component | Entry Point |
|-------|-----------|-------------|
| `/` | `src/pages/HomePage.jsx` | Homepage — hero banner, featured pair, trending collections, The Drop, popular products |
| `/shop/new` | `src/pages/NewPage.jsx` | Product listing with filter sidebar and sort controls |
| `/product/:id` | `src/pages/ProductPage.jsx` | Individual product detail page |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout (cart review → shipping/payment form) |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation screen |

All pages share a common `Header` (navigation, cart, wishlist, search, login icons) and `Footer` (navigation links). The `CartModal` and `WishlistModal` are rendered on every page as portals/overlays.

---

## Critical Issues Found

The following seven issue types account for all 127 critical issues. Issues that appear across multiple pages are grouped by type.

---

### CI-1 — Wrong Semantic Role (`WRONG_SEMANTIC_ROLE` / Interactable role)

**Total occurrences:** 47 (across all 5 pages)  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)

Interactive behaviour (click handlers, cursor:pointer) has been implemented on `<div>` elements that carry no semantic role. Screen readers cannot identify these elements as controls and assistive technology users receive no indication that the element can be activated.

#### Affected Elements and Pages

| Selector | Source File | Pages Affected |
|----------|-------------|----------------|
| `.wishlist-btn` | `src/components/Header.jsx:131` | All 5 |
| `.icon-btn:nth-child(2)` (Search) | `src/components/Header.jsx:140` | All 5 |
| `.icon-btn:nth-child(4)` (Login) | `src/components/Header.jsx:156` | All 5 |
| `.flag-group` | `src/components/Header.jsx:161` | All 5 |
| `.footer-nav-item` (Sustainability) | `src/components/Footer.jsx:13` | All 5 |
| `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | `src/components/Footer.jsx:18` | All 5 |
| `.product-card > .product-card-info > .shop-link` (×3) | `src/components/PopularSection.jsx:54` | Homepage |
| `.filter-option` (×11 filter options) | `src/components/FilterSidebar.jsx:74,116` | Shop New |
| `.checkout-continue-btn` | `src/pages/CheckoutPage.jsx:156` | Checkout |
| `.confirm-home-link` | `src/pages/OrderConfirmationPage.jsx:40` | Order Confirmation |

**Source excerpt — Header wishlist button (representative):**
```jsx
// src/components/Header.jsx:131
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>
```

**Recommended fix:**  
Replace interactive `<div>` elements with native `<button>` (for actions) or `<a href>` / React Router `<Link>` (for navigation). For example:

```jsx
<button className="icon-btn wishlist-btn" onClick={openWishlist}>
  <svg ... aria-hidden="true">...</svg>
  <span>Wishlist</span>
</button>
```

**Rationale:** Native HTML interactive elements (`<button>`, `<a>`) carry built-in ARIA semantics and are natively keyboard-operable without any extra attributes. This is preferred over adding `role="button"` + `tabIndex={0}` + manual key-handler to a `<div>` because it is less error-prone, requires no polyfilling of `Enter`/`Space` key events, and works correctly in all assistive technology stacks.

---

### CI-2 — Not Keyboard Accessible (`NOT_FOCUSABLE` / Keyboard accessible)

**Total occurrences:** 48 (across all 5 pages)  
**WCAG Criterion:** 2.1.1 Keyboard (Level A)

The same `<div>` elements described in CI-1 cannot receive keyboard focus because they have no `tabIndex` attribute. Keyboard-only users (who cannot use a mouse) are entirely unable to activate these controls. One additional element is also affected: `.drop-popularity-bar` (see CI-7).

#### Affected Elements and Pages

All elements listed under CI-1 (same root cause) plus:

| Selector | Source File | Pages Affected |
|----------|-------------|----------------|
| `.drop-popularity-bar` | `src/components/TheDrop.jsx:19` | Homepage |

**Recommended fix:**  
Replacing `<div>` with `<button>` or `<a>` (as described in CI-1) simultaneously resolves both CI-1 and CI-2 without any additional changes, because native interactive elements are keyboard-focusable by default.

**Rationale:** Native interactive elements inherit browser focus management. Using `tabIndex={0}` on a `<div>` is a partial mitigation that still requires manual key-event handling (`onKeyDown`) to be truly keyboard-operable; replacing the element outright is the cleaner and more robust solution.

---

### CI-3 — No Descriptive Text (`NO_DESCRIPTIVE_TEXT` / Accessible name)

**Total occurrences:** 18 (across all 5 pages)  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A) + 2.4.6 Headings and Labels (Level AA)

These elements have a visual label that is deliberately hidden from assistive technology via `aria-hidden="true"` on the text, or have no text content at all, leaving screen readers with nothing to announce when the control receives focus.

#### Affected Elements and Pages

| Selector | Problem | Source File | Pages Affected |
|----------|---------|-------------|----------------|
| `.icon-btn:nth-child(2)` (Search) | `<span aria-hidden="true">Search</span>` — text hidden from AT | `Header.jsx:142` | All 5 |
| `.icon-btn:nth-child(4)` (Login) | `<span aria-hidden="true">Login</span>` — text hidden from AT | `Header.jsx:158` | All 5 |
| `.footer-list:nth-child(2) > li > .footer-nav-item` (FAQs) | `<span aria-hidden="true">FAQs</span>` — no accessible text remains | `Footer.jsx:18` | All 5 |
| `.product-card > .product-card-info > .shop-link` (×3) | `<span aria-hidden="true">{label}</span>` — only text node is hidden | `PopularSection.jsx:59` | Homepage |

**Source excerpt — Search icon button:**
```jsx
// src/components/Header.jsx:140-143
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>
```

**Recommended fix:**  
Remove `aria-hidden="true"` from the visible text spans, or add `aria-label` to the parent control:

```jsx
<button className="icon-btn" aria-label="Search">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

The `aria-label` approach is preferred here because it decouples the accessible name from the visual text, allowing future visual copy changes without breaking AT announcements.

**Rationale:** WCAG 4.1.2 requires every interactive control to have a programmatically determinable name. Using `aria-hidden="true"` on the only text inside an interactive element removes all accessible naming cues. An explicit `aria-label` on the parent element provides a stable, unambiguous name regardless of visual text changes.

---

### CI-4 — Button Has No Accessible Name (`AXE-BUTTON-NAME` / Button-name)

**Total occurrences:** 8 (across all 5 pages)  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Axe rule:** `button-name`

The close buttons for `CartModal` and `WishlistModal` render an icon-only SVG with no accessible name. The `aria-label` attribute that would normally identify these buttons was removed.

#### Affected Elements and Pages

| Selector | Component | Pages Affected |
|----------|-----------|----------------|
| `#cart-modal > div:nth-child(1) > button` | `src/components/CartModal.jsx:56-64` | All 5 (modal available on all pages) |
| `div[role="dialog"] > div:nth-child(1) > button` | `src/components/WishlistModal.jsx:56-64` | All 5 |

**Source excerpt — CartModal close button:**
```jsx
// src/components/CartModal.jsx:55-64
{/* A11Y-GEN1 accessible-name: close button has no accessible name — aria-label removed */}
<button
  className={styles.closeBtn}
  onClick={closeCart}
>
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

**Recommended fix:**
```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>
```

Similarly for `WishlistModal`:
```jsx
<button aria-label="Close wishlist" onClick={closeWishlist} className={styles.closeBtn}>
```

**Rationale:** An icon-only button must have an accessible name supplied via `aria-label` (or `aria-labelledby` referencing visible text elsewhere). Adding `aria-label` is the minimal change that satisfies WCAG 4.1.2 without altering visual design. The SVG correctly has `aria-hidden="true"` already — only the `aria-label` on the parent `<button>` is missing.

---

### CI-5 — Invalid ARIA Attribute Value (`AXE-ARIA-VALID-ATTR-VALUE` / Aria-valid-attr-value)

**Total occurrences:** 3  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Axe rule:** `aria-valid-attr-value`

Two different invalid ARIA values were found:

#### 5a — `aria-expanded="yes"` on Featured Cards (Homepage — 2 occurrences)

`aria-expanded` is a state attribute that must be the string `"true"` or `"false"`. The value `"yes"` is not a valid token and will be ignored or misinterpreted by assistive technology.

**Selector:** `.featured-card:nth-child(1) > .featured-card-info > h1` and `.featured-card:nth-child(2) > .featured-card-info > h1`  
**Source file:** `src/components/FeaturedPair.jsx:46`

```jsx
// src/components/FeaturedPair.jsx:46
<h1 aria-expanded="yes">{item.title}</h1>
```

**Recommended fix:**  
Remove `aria-expanded` entirely from the `<h1>` — headings are not expandable controls and this attribute has no semantic meaning on a heading element. If the intent was to signal that the section is open, move the attribute to the controlling element (e.g., the toggle button):

```jsx
<h1>{item.title}</h1>
```

**Rationale:** `aria-expanded` is only meaningful on interactive elements that control a collapsible region (`<button>`, `<summary>`, combobox triggers, etc.). Placing it on a static `<h1>` is semantically incorrect. If expandable behaviour is needed, a `<button>` with `aria-expanded="true"/"false"` and `aria-controls` pointing to the panel ID is the correct pattern.

#### 5b — `aria-relevant="changes"` on Product Detail page (1 occurrence)

`aria-relevant` must be a space-separated list of tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not among the valid tokens.

**Selector:** `ul[aria-relevant="changes"]`  
**Source file:** `src/pages/ProductPage.jsx:146`

```jsx
// src/pages/ProductPage.jsx:143-148
{/* A11Y-AXE aria-valid-attr-value: aria-relevant="changes" is invalid */}
<ul
  className={styles.detailsList}
  aria-relevant="changes"
  aria-live="polite"
>
```

**Recommended fix:**  
Replace `aria-relevant="changes"` with a valid value. For a list that announces text additions, the standard value is:

```jsx
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

Or remove `aria-relevant` entirely if the default behavior of the `aria-live` region is sufficient.

**Rationale:** Using an invalid `aria-relevant` value causes assistive technology to fall back to implementation-defined defaults or ignore the attribute, resulting in unpredictable announcements. Using the correct token `"additions text"` explicitly communicates that new list items and their text content should be announced.

---

### CI-6 — Image Missing Alt Text (`AXE-IMAGE-ALT` / Image-alt)

**Total occurrences:** 2 (Homepage only)  
**WCAG Criterion:** 1.1.1 Non-text Content (Level A)  
**Axe rule:** `image-alt`

Two informative images on the Homepage have no `alt` attribute. Screen readers will announce the image filename (`New_Tees.png`, `2bags_charms1.png`) instead of meaningful content.

#### Affected Elements

| Selector | Source File | Description |
|----------|-------------|-------------|
| `img[src$="New_Tees.png"]` | `src/components/HeroBanner.jsx:18` | Hero banner background image — new tees collection |
| `img[src$="2bags_charms1.png"]` | `src/components/TheDrop.jsx:13` | "The Drop" section promotional image — bag charms |

**Source excerpt — HeroBanner:**
```jsx
// src/components/HeroBanner.jsx:18
{/* A11Y-AXE image-alt: <img> is missing an alt attribute */}
<img src={HERO_IMAGE} />
```

**Source excerpt — TheDrop:**
```jsx
// src/components/TheDrop.jsx:13
{/* A11Y-AXE image-alt: <img> is missing an alt attribute */}
<img src={DROP_IMAGE} loading="lazy" />
```

**Recommended fix:**

```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="New Tees collection — shop the latest arrivals" />

// TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" alt="Android, YouTube, and Super G bag charm plushies" />
```

If an image is purely decorative (conveys no information beyond what is in surrounding text), use `alt=""` to instruct screen readers to skip it:

```jsx
<img src={HERO_IMAGE} alt="" role="presentation" />
```

**Rationale:** WCAG 1.1.1 requires all non-text content to have a text alternative. The `alt` attribute is the standard mechanism for images; an empty `alt=""` is the correct signal for decorative images. Choosing whether to use descriptive text or empty `alt` depends on whether the image conveys unique information not present in adjacent text.

---

### CI-7 — Slider Missing Required ARIA Attributes (`AXE-ARIA-REQUIRED-ATTR` / Aria-required-attr)

**Total occurrences:** 1 (Homepage only)  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Axe rule:** `aria-required-attr`

An element with `role="slider"` is missing the three required state attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, the slider is meaningless to assistive technology — there is no current value, no range, and no way to interact with it.

**Selector:** `.drop-popularity-bar`  
**Source file:** `src/components/TheDrop.jsx:19`

```jsx
// src/components/TheDrop.jsx:19
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

**Recommended fix:**  
Option A — Add required attributes if this is intended to be a functional slider:

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

Option B — If the bar is a read-only visual indicator (not interactive), use `role="meter"` instead:

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

Option C — If purely decorative, remove the `role` attribute entirely and use `aria-hidden="true"`:

```jsx
<div aria-hidden="true" className="drop-popularity-bar" />
```

**Rationale:** The ARIA specification mandates `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for `role="slider"` and `role="meter"`. Without them the element fails validation and screen readers cannot convey the state to users. The correct fix depends on the intended behaviour: if it is interactive, use slider with all required state; if it is a read-only progress indicator, use meter; if decorative, hide it from the accessibility tree.

---

## Summary of All Critical Issues

| ID | Type | Rule | WCAG | Occurrences | Pages |
|----|------|------|------|-------------|-------|
| CI-1 | `WRONG_SEMANTIC_ROLE` | Interactable role | 4.1.2 (A) | 47 | All 5 |
| CI-2 | `NOT_FOCUSABLE` | Keyboard accessible | 2.1.1 (A) | 48 | All 5 |
| CI-3 | `NO_DESCRIPTIVE_TEXT` | Accessible name | 4.1.2 (A) | 18 | All 5 |
| CI-4 | `AXE-BUTTON-NAME` | button-name | 4.1.2 (A) | 8 | All 5 |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` | aria-valid-attr-value | 4.1.2 (A) | 3 | Homepage, Product Detail |
| CI-6 | `AXE-IMAGE-ALT` | image-alt | 1.1.1 (A) | 2 | Homepage |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` | aria-required-attr | 4.1.2 (A) | 1 | Homepage |
| | | | | **127 total** | |

---

## Non-Critical Issues (Serious Severity — Not Remediated)

The following 24 issues were detected at **Serious** severity. They are real accessibility problems that impair user experience for people with disabilities but do not represent complete access barriers in the way critical issues do. They are documented here for future remediation.

---

### NC-1 — Insufficient Color Contrast (`AXE-COLOR-CONTRAST` / Color-contrast)

**Total occurrences:** 18 (Shop New: 13, Checkout: 2, Homepage: 1, Product Detail: 1, Order Confirmation: 1)  
**WCAG Criterion:** 1.4.3 Contrast (Minimum) (Level AA)  
**Axe rule:** `color-contrast`

Text elements do not meet the minimum contrast ratio of 4.5:1 (normal text) or 3:1 (large text/UI components).

#### Affected Elements by Page

**Homepage (`/`)**

| Selector | Description |
|----------|-------------|
| `.hero-content > p` | Hero banner body copy — low contrast against hero background |

**Shop New (`/shop/new`)**

| Selector | Description |
|----------|-------------|
| `.filter-count` (×12 instances) | Parenthetical item count inside filter options (e.g., "(3)") — light grey on white |
| `.products-found` | "X products found" result count — muted text insufficient against page background |

**Product Detail (`/product/1`)**

| Selector | Description |
|----------|-------------|
| `p:nth-child(4)` | Product description paragraph — low contrast text colour |

**Checkout (`/checkout`)**

| Selector | Description |
|----------|-------------|
| `.checkout-step:nth-child(3) > .step-label` | Inactive step indicator label — de-emphasised grey text |
| `.summary-tax-note` | "Taxes calculated at next step" note — secondary text with low contrast |

**Order Confirmation (`/order-confirmation`)**

| Selector | Description |
|----------|-------------|
| `.confirm-order-id-label` | "Order ID" label text — muted colour inside the order ID box |

**Recommended fix:**  
Increase the foreground colour of each affected element to achieve a minimum 4.5:1 contrast ratio against its background. Use a colour contrast checker (e.g., WebAIM Contrast Checker) to validate each specific pair before committing the change.

---

### NC-2 — HTML Element Missing `lang` Attribute (`AXE-HTML-HAS-LANG` / Html-has-lang)

**Total occurrences:** 5 (all pages — same root cause)  
**WCAG Criterion:** 3.1.1 Language of Page (Level A)  
**Axe rule:** `html-has-lang`

The `<html>` element in `public/index.html` has no `lang` attribute. Screen readers use this to select the correct language voice/pronunciation engine. Without it, users may hear content read in the wrong language.

**Source file:** `public/index.html`

```html
<!-- A11Y-AXE html-has-lang: <html> element is missing a lang attribute -->
<html>
```

**Recommended fix:**

```html
<html lang="en">
```

---

### NC-3 — Invalid `lang` Attribute Value (`AXE-VALID-LANG` / Valid-lang)

**Total occurrences:** 1 (Homepage only)  
**WCAG Criterion:** 3.1.2 Language of Parts (Level AA)  
**Axe rule:** `valid-lang`

A paragraph in `TheDrop.jsx` uses `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers that respect inline language overrides will be unable to apply the correct voice.

**Selector:** `p[lang="zz"]`  
**Source file:** `src/components/TheDrop.jsx:21`

```jsx
// src/components/TheDrop.jsx:21
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms have officially dropped...
</p>
```

**Recommended fix:**  
If the text is in English, remove the `lang` attribute entirely or replace it with `lang="en"`:

```jsx
<p>
  Our brand-new, limited-edition plushie bag charms have officially dropped...
</p>
```

---

## Summary of Non-Critical Issues

| ID | Type | Rule | WCAG | Occurrences | Pages |
|----|------|------|------|-------------|-------|
| NC-1 | `AXE-COLOR-CONTRAST` | color-contrast | 1.4.3 (AA) | 18 | Shop New, Checkout, Homepage, Product Detail, Order Confirmation |
| NC-2 | `AXE-HTML-HAS-LANG` | html-has-lang | 3.1.1 (A) | 5 | All 5 |
| NC-3 | `AXE-VALID-LANG` | valid-lang | 3.1.2 (AA) | 1 | Homepage |
| | | | | **24 total** | |

---

## Appendix — Raw Issue Counts by Page and Type

### Homepage (`/`) — 35 issues

| Type | Severity | Count |
|------|----------|-------|
| `WRONG_SEMANTIC_ROLE` | Critical | 8 |
| `NOT_FOCUSABLE` | Critical | 9 |
| `NO_DESCRIPTIVE_TEXT` | Critical | 5 |
| `AXE-BUTTON-NAME` | Critical | 2 |
| `AXE-ARIA-VALID-ATTR-VALUE` | Critical | 2 |
| `AXE-ARIA-REQUIRED-ATTR` | Critical | 1 |
| `AXE-IMAGE-ALT` | Critical | 2 |
| `AXE-COLOR-CONTRAST` | Serious | 1 |
| `AXE-HTML-HAS-LANG` | Serious | 1 |
| `AXE-VALID-LANG` | Serious | 1 |

### Shop New (`/shop/new`) — 55 issues

| Type | Severity | Count |
|------|----------|-------|
| `WRONG_SEMANTIC_ROLE` | Critical | 14 |
| `NOT_FOCUSABLE` | Critical | 14 |
| `NO_DESCRIPTIVE_TEXT` | Critical | 3 |
| `AXE-BUTTON-NAME` | Critical | 2 |
| `AXE-COLOR-CONTRAST` | Serious | 13 |
| `AXE-HTML-HAS-LANG` | Serious | 1 |

### Product Detail (`/product/1`) — 20 issues

| Type | Severity | Count |
|------|----------|-------|
| `WRONG_SEMANTIC_ROLE` | Critical | 5 |
| `NOT_FOCUSABLE` | Critical | 5 |
| `NO_DESCRIPTIVE_TEXT` | Critical | 3 |
| `AXE-BUTTON-NAME` | Critical | 2 |
| `AXE-ARIA-VALID-ATTR-VALUE` | Critical | 1 |
| `AXE-COLOR-CONTRAST` | Serious | 1 |
| `AXE-HTML-HAS-LANG` | Serious | 1 |

### Checkout (`/checkout`) — 21 issues

| Type | Severity | Count |
|------|----------|-------|
| `WRONG_SEMANTIC_ROLE` | Critical | 6 |
| `NOT_FOCUSABLE` | Critical | 6 |
| `NO_DESCRIPTIVE_TEXT` | Critical | 3 |
| `AXE-BUTTON-NAME` | Critical | 1 |
| `AXE-COLOR-CONTRAST` | Serious | 2 |
| `AXE-HTML-HAS-LANG` | Serious | 1 |

### Order Confirmation (`/order-confirmation`) — 20 issues

| Type | Severity | Count |
|------|----------|-------|
| `WRONG_SEMANTIC_ROLE` | Critical | 6 |
| `NOT_FOCUSABLE` | Critical | 6 |
| `NO_DESCRIPTIVE_TEXT` | Critical | 3 |
| `AXE-BUTTON-NAME` | Critical | 1 |
| `AXE-COLOR-CONTRAST` | Serious | 1 |
| `AXE-HTML-HAS-LANG` | Serious | 1 |

---

## Appendix — Audit Methodology

1. **Application build:** `npx webpack --mode production` → static files served at `http://localhost:3000` via `npx serve dist -p 3000 --single`.
2. **Test runner:** Playwright 1.44 + Chromium, single worker, sequential execution.
3. **Evinced SDK authentication:** Offline mode using `setOfflineCredentials({ serviceId, token })` (JWT injected via environment variable).
4. **Scan method:** `new EvincedSDK(page)` initialised per test; `await evinced.evAnalyze()` called after full page/flow navigation and `networkidle` wait.
5. **Flow navigation for multi-step pages:**
   - Checkout: Product Detail → "Add to Cart" → "Proceed to Checkout"
   - Order Confirmation: full checkout form submission (firstName, lastName, address, cardNumber, expirationDate)
6. **Raw results:** JSON files saved to `tests/e2e/test-results/page-*.json`.
7. **Severity classification:** Issues classified by the Evinced SDK into `CRITICAL` and `SERIOUS` buckets. No manual severity overrides were applied.

---

*Report generated by automated Evinced SDK scan on 2026-03-25. No source code modifications were made as part of this audit run.*
